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
          payroll_master: payrollMaster,
          employee_account: employeeAccount,
          system_program: SystemProgram.programId,
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
          sign_pda_account: signPdaAccount,
          mxe_account: mxeAccount,
          mempool_account: mempoolAccount,
          executing_pool: executingPool,
          computation_account: computationAccount,
          comp_def_account: compDefAccount,
          cluster_account: clusterAccount,
          pool_account: new PublicKey('G2sRWJvi3xoyh5k2gY49eG9L8YhAEWQPtNb1zb1GXTtC'),
          clock_account: new PublicKey('7EbMUTLo5DjdzbN7s8BXeZwXzEwNQb1hScfRvWg8a6ot'),
          arcium_program: ARCIUM_PROGRAM,
          system_program: SystemProgram.programId,
          payroll_master: payrollMaster,
          vault: vault,
          employer_token_account: anchor.web3.Keypair.generate().publicKey,
          vault_authority: anchor.web3.Keypair.generate().publicKey,
          token_program: TOKEN_PROGRAM_ID,
          payroll_batch: anchor.web3.Keypair.generate().publicKey,
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
      {/* LEFT AREA: PAYROLL EXECUTION */}
      <div className="flex-1 pr-0 md:pr-10 pb-10 md:pb-0 flex flex-col font-sans">
        <div className="mb-12">
          <h3 className="text-[60px] md:text-[80px] font-black leading-[0.85] tracking-tighter mb-4 text-black dark:text-[#FAFAFA]">
            PROCESS<br/>PAYROLL.
          </h3>
          <p className="text-gray-500 dark:text-[#737373] text-sm max-w-sm font-mono">
            Execute real-time client-side encryption via Arcium SDK. 
            Deterministic shared secrets derived from x25519 local keypairs.
          </p>
        </div>

        {/* Onboarding & Input Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Onboard form */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-black dark:text-white font-bold">1. Employee Pubkey</label>
              <input 
                value={employeeWallet}
                onChange={e => setEmployeeWallet(e.target.value)}
                placeholder="5NKPWTom5..."
                className="w-full bg-transparent border-b-2 border-black dark:border-white text-black dark:text-white font-mono outline-none focus:opacity-50 pb-2 transition-opacity"
              />
              <button
                onClick={handleOnboard}
                disabled={loading || !wallet || !employeeWallet}
                className="w-full border border-black dark:border-white py-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] uppercase font-bold text-black dark:text-white transition-colors disabled:opacity-50"
              >
                + Onboard Employee
              </button>
            </div>

            {/* Salary form */}
            <div className="space-y-4">
               <label className="text-[10px] uppercase tracking-widest text-black dark:text-white font-bold">2. Plaintext Input (USDC)</label>
                <input 
                  type="text" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="5000.00" 
                  className="w-full bg-transparent border-b-2 border-black dark:border-white text-black dark:text-white text-4xl font-black outline-none focus:opacity-50 pb-2 transition-opacity"
                />
            </div>

            <div className="space-y-4 pt-4">
              <button 
                onClick={handleProcessPayroll}
                disabled={loading || !wallet || !amount || !employeeWallet}
                className="w-full h-16 bg-black dark:bg-white text-white dark:text-black font-black text-lg uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                queue_payroll()
              </button>
            </div>
          </div>

          <div className="border border-black dark:border-white p-6 relative overflow-hidden flex flex-col justify-between bg-transparent">
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-black dark:text-white opacity-50">SECURE_ENCLAVE_V1</div>
            <div className="text-[10px] uppercase font-bold text-black dark:text-white mb-4 tracking-widest">Ciphertext Buffer [96b]</div>
            <div className="font-mono text-[10px] text-gray-500 break-all leading-relaxed h-full">
              {ciphertextDisplay}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT RAIL: ARCIUM SDK CONSOLE */}
      <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-black dark:border-white p-6 flex flex-col font-mono text-[10px] space-y-6">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold font-sans">Network Log</div>
        
        <div className="flex-1 overflow-y-auto space-y-2 text-gray-500">
          {logs.length === 0 && <div>NO LOGS...</div>}
          {logs.map((log, i) => (
             <div key={i} className={log.includes('[SUCCESS]') || log.includes('[ARCIUM]') || log.includes('[SYSTEM]') ? 'text-black dark:text-white' : log.includes('[ERROR]') ? 'text-red-500' : 'text-gray-500'}>
               {log}
             </div>
          ))}
        </div>

        <div className="space-y-4 pt-6 border-t border-black dark:border-white">
          <div className="space-y-2">
            <div className="uppercase tracking-widest">MXE_PUBLIC_KEY</div>
            <div className="break-all opacity-50">Arcj82pX7HxYKLR92qvgZUAd7vGS...</div>
          </div>

          <div className="space-y-2">
            <div className="uppercase tracking-widest">PDA SEEDS REFERENCE</div>
            <div className="opacity-50 leading-relaxed">
              Vault: ["vault", master_pda]<br/>
              Emp: ["employee", master, pubkey]
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-black dark:border-white shrink-0">
          <div className="flex items-center justify-between uppercase">
            <span className="opacity-50">Version</span>
            <span>Arcium v0.9.7</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
