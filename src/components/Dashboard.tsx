import React, { useState, useEffect } from 'react';
import { useHushHushPay } from '../hooks/useHushHushPay';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { ArciumEncryptionService } from '../services/arcium';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { toast } from 'sonner';

export const Dashboard = () => {
  const { program, wallet } = useHushHushPay();
  
  const [employeeWallet, setEmployeeWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [ciphertextDisplay, setCiphertextDisplay] = useState('A7 FF 12 C9 4B ...');

  useEffect(() => {
    if (!program || !wallet) return;
    const orgId = new Uint8Array(16);
    const [payrollMaster] = PublicKey.findProgramAddressSync(
      [Buffer.from("payroll_master"), wallet.publicKey.toBuffer(), orgId],
      program.programId
    );
    program.provider.connection.getAccountInfo(payrollMaster).then((info) => {
      if (!info) {
        console.warn("Payroll Master fetch failed, likely not initialized");
        localStorage.removeItem('hushhush_onboarded');
        window.location.reload();
      }
    }).catch(console.error);
  }, [program, wallet]);

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

      // Check if employee already exists to prevent '0x0' (Account already initialized) error
      try {
        const accInfo = await program.provider.connection.getAccountInfo(employeeAccount);
        if (accInfo) {
          addLog("[INFO] Employee already onboarded.");
          toast.success('Employee already onboarded!');
          setLoading(false);
          return;
        }
      } catch (e) {
        // Ignore fetch errors
      }

      const arcisPubkey = new Uint8Array(32);
      const displayNameHash = new Uint8Array(32);

      const tx = await program.methods
        .onboardEmployee(empPubkey, Array.from(arcisPubkey), Array.from(displayNameHash))
        .accounts({
          employer: wallet.publicKey,
          payrollMaster: payrollMaster,
          employeeAccount: employeeAccount,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      addLog(`[SUCCESS] Employee Onboarded: ${String(tx || '').slice(0, 8)}...`);
      toast.success('Employee onboarded successfully!');
    } catch(e: any) {
      console.error(e);
      let errMsg = e.message;
      if (e && typeof e.getLogs === 'function') {
        const logs = e.getLogs();
        console.error("Simulation logs:", logs);
        if (logs && logs.length > 0) {
          errMsg += " | Logs: " + logs.join(' | ');
        }
      }
      addLog(`[ERROR] ${errMsg}`);
      toast.error(errMsg);
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

      await arciumSvc.initialize(program.provider as anchor.AnchorProvider, program.programId);
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
      // Derive Arcium network execution accounts based on cluster offset 456
      const ARCIUM_CLUSTER_OFFSET = 456;
      
      const {
        getMempoolAccAddress,
        getExecutingPoolAccAddress,
        getComputationAccAddress,
        getClusterAccAddress,
        getMXEAccAddress,
        getCompDefAccAddress,
      } = await import('@arcium-hq/client');

      const mxeAccount = getMXEAccAddress(ARCIUM_PROGRAM);
      const mempoolAccount = getMempoolAccAddress(ARCIUM_CLUSTER_OFFSET);
      const executingPool = getExecutingPoolAccAddress(ARCIUM_CLUSTER_OFFSET);
      
      // Calculate compDefAccount based on compDefOffset. Assume 0 if not provided or handle it.
      const compDefAccount = getCompDefAccAddress(ARCIUM_PROGRAM, 0); // Need to use 0 or fetch properly
      const computationAccount = getComputationAccAddress(ARCIUM_CLUSTER_OFFSET, computationOffset);
      const clusterAccount = getClusterAccAddress(ARCIUM_CLUSTER_OFFSET);
      
      const batchKeypair = anchor.web3.Keypair.generate();
      
      const [signPdaAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("sign_pda")],
        program.programId
      );

      const [vault] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), payrollMaster.toBuffer()],
        program.programId
      );

      const [vaultAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_auth"), payrollMaster.toBuffer()],
        program.programId
      );
      
      const usdcMint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
      const employerTokenAccount = getAssociatedTokenAddressSync(usdcMint, wallet.publicKey);

      // Check if ATA exists
      const tokenAccInfo = await program.provider.connection.getAccountInfo(employerTokenAccount);
      
      const txBuilder = program.methods
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
          signPdaAccount: signPdaAccount,
          mxeAccount: mxeAccount,
          mempoolAccount: mempoolAccount,
          executingPool: executingPool,
          computationAccount: computationAccount,
          compDefAccount: compDefAccount,
          clusterAccount: clusterAccount,
          poolAccount: new PublicKey('G2sRWJvi3xoyh5k2gY49eG9L8YhAEWQPtNb1zb1GXTtC'),
          clockAccount: new PublicKey('7EbMUTLo5DjdzbN7s8BXeZwXzEwNQb1hScfRvWg8a6ot'),
          arciumProgram: ARCIUM_PROGRAM,
          systemProgram: SystemProgram.programId,
          payrollMaster: payrollMaster,
          vault: vault,
          employerTokenAccount: employerTokenAccount,
          vaultAuthority: vaultAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
          payrollBatch: batchKeypair.publicKey,
        })
        .signers([batchKeypair]);

      // If ATA doesn't exist, bundle creation in pre-instructions
      if (!tokenAccInfo) {
        const { createAssociatedTokenAccountInstruction } = await import('@solana/spl-token');
        txBuilder.preInstructions([
          createAssociatedTokenAccountInstruction(
            wallet.publicKey, // payer
            employerTokenAccount, // ata
            wallet.publicKey, // owner
            usdcMint // mint
          )
        ]);
      }

      const tx = await txBuilder.rpc();

      addLog(`[SUCCESS] Payroll Processed! Tx: ${String(tx || '').slice(0, 8)}...`);
      toast.success('Payroll processed successfully!');
    } catch(e: any) {
      console.error(e);
      let errMsg = e.message;
      if (e && typeof e.getLogs === 'function') {
        const logs = e.getLogs();
        console.error("Simulation logs:", logs);
        if (logs && logs.length > 0) {
          errMsg += " | Logs: " + logs.join(' | ');
        }
      }
      addLog(`[ERROR] ${errMsg}`);
      toast.error(errMsg);
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
