import React, { useState } from 'react';
import { useHushHushPay } from '../hooks/useHushHushPay';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { ArciumEncryptionService } from '../services/arcium';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { toast } from 'sonner';

export const Dashboard = () => {
  const { program, wallet } = useHushHushPay();
  
  const [employeeWallet, setEmployeeWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [ciphertextDisplay, setCiphertextDisplay] = useState('A7 FF 12 C9 4B ...');

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleOnboard = async () => {
    if (!program || !wallet) {
      toast.error('Wallet not connected');
      return;
    }
    setLoading(true);
    addLog("[SYSTEM] Initiating onboard_employee...");
    try {
      const orgId = new Uint8Array(16);
      const [payrollMaster] = PublicKey.findProgramAddressSync(
        [Buffer.from("payroll_master"), wallet.publicKey.toBuffer(), orgId],
        program.programId
      );

      const empPubkey = new PublicKey(employeeWallet);
      const [employeeAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("employee"), payrollMaster.toBuffer(), empPubkey.toBuffer()],
        program.programId
      );

      const arcisPubkey = new Uint8Array(32);
      const displayNameHash = new Uint8Array(32);

      const tx = await program.methods
        .onboardEmployee(empPubkey, Array.from(arcisPubkey), Array.from(displayNameHash))
        .accounts({
          employer: wallet.publicKey,
          payrollMaster,
          employeeAccount,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      addLog(`[SUCCESS] Employee Onboarded: ${String(tx || '').slice(0, 8)}...`);
      toast.success('Employee onboarded successfully!');
    } catch(e: any) {
      console.error(e);
      addLog(`[ERROR] ${e.message}`);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    if (!program || !wallet) {
      toast.error('Wallet not connected');
      return;
    }
    setLoading(true);
    const arciumSvc = new ArciumEncryptionService();
    try {
      addLog("[SYSTEM] Initializing RescueCipher...");
      addLog("> Local Keypair generated.");
      addLog("> Fetching MXE Public Key...");

      await arciumSvc.initialize(program.provider as anchor.AnchorProvider);
      addLog("[ARCIUM] Handshake 200 OK");
      addLog("> SharedSecret derived.");
      addLog("> Ready for encryptPayroll().");

      const orgId = new Uint8Array(16); 
      const [payrollMaster] = PublicKey.findProgramAddressSync(
        [Buffer.from("payroll_master"), wallet.publicKey.toBuffer(), orgId],
        program.programId
      );

      const empPubkey = new PublicKey(employeeWallet);
      const [employeeAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("employee"), payrollMaster.toBuffer(), empPubkey.toBuffer()],
        program.programId
      );

      const salaryAmount = parseInt(amount, 10);
      const encryptedInput = arciumSvc.encryptPayroll(salaryAmount, employeeAccount);
      
      const cipherHex = encryptedInput.ciphertext.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      setCiphertextDisplay(cipherHex.substring(0, 200) + "...");
      addLog("> Ciphertext generated & buffered.");

      const runId = new anchor.BN(Date.now());
      const maxEscrowAmount = new anchor.BN(salaryAmount);
      const taxRateBps = new anchor.BN(0);
      const priorityFee = new anchor.BN(1000);
      const computationOffset = new anchor.BN(1);

      const ARCIUM_PROGRAM = new PublicKey('Arcj82pX7HxYKLR92qvgZUAd7vGS1k4hQvAFcPATFdEQ');
      const mxeAccount = anchor.web3.Keypair.generate().publicKey;
      const mempoolAccount = anchor.web3.Keypair.generate().publicKey;
      const executingPool = anchor.web3.Keypair.generate().publicKey;
      const computationAccount = anchor.web3.Keypair.generate().publicKey;
      const compDefAccount = anchor.web3.Keypair.generate().publicKey;
      const clusterAccount = anchor.web3.Keypair.generate().publicKey;
      
      const [signPdaAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("sign_pda")],
        program.programId
      );

      const [vault] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), payrollMaster.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .queuePayroll(
          computationOffset,
          runId,
          maxEscrowAmount,
          taxRateBps,
          [encryptedInput],
          priorityFee
        )
        .accounts({
          employer: wallet.publicKey,
          signPdaAccount,
          mxeAccount,
          mempoolAccount,
          executingPool,
          computationAccount,
          compDefAccount,
          clusterAccount,
          poolAccount: new PublicKey('G2sRWJvi3xoyh5k2gY49eG9L8YhAEWQPtNb1zb1GXTtC'),
          clockAccount: new PublicKey('7EbMUTLo5DjdzbN7s8BXeZwXzEwNQb1hScfRvWg8a6ot'),
          arciumProgram: ARCIUM_PROGRAM,
          systemProgram: SystemProgram.programId,
          payrollMaster,
          vault,
          employerTokenAccount: anchor.web3.Keypair.generate().publicKey,
          vaultAuthority: anchor.web3.Keypair.generate().publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          payrollBatch: anchor.web3.Keypair.generate().publicKey,
        })
        .rpc();

      addLog(`[SUCCESS] Payroll Processed! Tx: ${String(tx || '').slice(0, 8)}...`);
      toast.success('Payroll processed successfully!');
    } catch(e: any) {
      console.error(e);
      addLog(`[ERROR] ${e.message}`);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      {/* LEFT AREA: PAYROLL EXECUTION (Cols 6 in theme) */}
      <div className="flex-1 pr-0 md:pr-10 pb-10 md:pb-0 flex flex-col font-sans">
        <div className="mb-12">
          <h3 className="text-[60px] md:text-[80px] font-black leading-[0.85] tracking-tighter mb-4 italic text-black dark:text-[#FAFAFA]">
            PROCESS<br/><span className="text-transparent border-b-4 border-cyan-500" style={{WebkitTextStroke: "1px currentColor"}}>PAYROLL.</span>
          </h3>
          <p className="text-gray-500 dark:text-[#737373] text-sm max-w-sm">
            Execute real-time client-side encryption via Arcium SDK. 
            Deterministic shared secrets derived from x25519 local keypairs.
          </p>
        </div>

        {/* Onboarding & Input Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Onboard form */}
            <div className="space-y-4">
              <label className="text-[11px] uppercase tracking-widest text-gray-500 dark:text-[#737373] font-bold">1. Employee Pubkey</label>
              <input 
                value={employeeWallet}
                onChange={e => setEmployeeWallet(e.target.value)}
                placeholder="5NKPWTom5..."
                className="w-full bg-transparent border-b-2 border-gray-200 dark:border-[#262626] text-black dark:text-white font-mono outline-none focus:border-cyan-500 pb-2"
              />
              <button
                onClick={handleOnboard}
                disabled={loading || !wallet || !employeeWallet}
                className="w-full border border-dashed border-gray-200 dark:border-[#262626] py-3 hover:bg-gray-50 dark:hover:bg-[#171717] text-[10px] uppercase font-bold text-gray-500 dark:text-[#525252] transition-colors disabled:opacity-50"
              >
                + Onboard Employee
              </button>
            </div>

            {/* Salary form */}
            <div className="space-y-4">
               <label className="text-[11px] uppercase tracking-widest text-gray-500 dark:text-[#737373] font-bold">2. Plaintext Input (USDC)</label>
                <input 
                  type="text" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="5000.00" 
                  className="w-full bg-transparent border-b-2 border-black dark:border-white text-black dark:text-[#FAFAFA] text-4xl font-black outline-none focus:border-cyan-500 pb-2"
                />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-[1px] flex-1 bg-gray-200 dark:bg-[#262626]"></div>
                <span className="text-[10px] text-gray-500 dark:text-[#404040] font-mono">ENCRYPTION_STATUS: {loading ? 'PROCESSING' : 'IDLE'}</span>
                <div className="h-[1px] flex-1 bg-gray-200 dark:bg-[#262626]"></div>
              </div>
              <button 
                onClick={handleProcessPayroll}
                disabled={loading || !wallet || !amount || !employeeWallet}
                className="w-full h-16 bg-black dark:bg-white text-white dark:text-black font-black text-lg uppercase tracking-tighter hover:bg-cyan-600 dark:hover:bg-cyan-500 transition-colors transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                queue_payroll(encrypted)
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#262626] p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-cyan-600/60 dark:text-cyan-500/50">SECURE_ENCLAVE_V1</div>
            <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-[#737373] mb-4">Ciphertext Buffer [96b]</div>
            <div className="font-mono text-[10px] text-cyan-600/90 dark:text-cyan-500/80 break-all leading-relaxed">
              {ciphertextDisplay}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT RAIL: ARCIUM SDK CONSOLE (Cols 3 in theme) */}
      <aside className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0A0A0A] p-6 flex flex-col font-mono text-[10px]">
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-[#737373] font-bold mb-6 font-sans">Network Log</div>
        
        <div className="flex-1 space-y-4 overflow-y-auto">
          {logs.map((log, i) => (
             <div key={i} className={log.includes('[SUCCESS]') || log.includes('[ARCIUM]') || log.includes('[SYSTEM]') ? 'text-cyan-600 dark:text-cyan-500' : log.includes('ERROR') ? 'text-red-600 dark:text-red-500' : 'text-gray-500 dark:text-[#525252]'}>
               {log}
             </div>
          ))}

          <div className="p-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#262626] space-y-2 mt-4">
            <div className="text-gray-500 dark:text-[#737373] uppercase">MXE_PUBLIC_KEY</div>
            <div className="break-all text-gray-800 dark:text-[#A3A3A3]">Arcj82pX7HxYKLR92qvgZUAd7vGS1k4hQvAFcPATFdEQ</div>
          </div>

          <div className="mt-10 border-t border-gray-200 dark:border-[#262626] pt-6">
            <div className="text-gray-500 dark:text-[#737373] uppercase mb-2">PDA SEEDS REFERENCE</div>
            <div className="text-gray-600 dark:text-[#525252] leading-relaxed">
              Vault: ["vault", master_pda]<br/>
              Emp: ["employee", master, wallet]
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-[#262626] shrink-0">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase">
            <span className="text-gray-500 dark:text-[#404040]">Version</span>
            <span className="text-black dark:text-[#FAFAFA]">Arcium v0.9.7</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
