import React, { useState } from 'react';
import { useHushHushPay } from '../hooks/useHushHushPay';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { toast } from 'sonner';

export const InitializeOrg = ({ onComplete }: { onComplete?: () => void }) => {
  const { program, wallet } = useHushHushPay();
  const [loading, setLoading] = useState(false);

  const handleInit = async () => {
    if (!program || !wallet) {
      toast.error('Wallet not connected');
      return;
    }
    
    setLoading(true);
    try {
      const circuitUrl = "https://drive.google.com/uc?export=download&id=14NSvjxfQIZjch7r05Io0dfANE_39tyb_";
      console.log(`Init comp def logic using URL: ${circuitUrl}`);
      
      const orgId = new Uint8Array(16);
      crypto.getRandomValues(orgId);

      const mxeAddress = anchor.web3.Keypair.generate().publicKey;
      const clusterIdBytes = new Uint8Array(32); 
      crypto.getRandomValues(clusterIdBytes);

      const [payrollMaster] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("payroll_master"),
          wallet.publicKey.toBuffer(),
          Buffer.from(orgId)
        ],
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

      const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

      const tx = await program.methods
        .initializeOrganization(Array.from(orgId), mxeAddress, Array.from(clusterIdBytes))
        .accounts({
          employer: wallet.publicKey,
          payrollMaster: payrollMaster,
          vaultAuthority: vaultAuthority,
          usdcMint: USDC_MINT,
          vault: vault,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      toast.success(`Organization Initialized! Tx: ${tx.slice(0, 8)}...`);
      if (onComplete) onComplete();
    } catch (e: any) {
      console.error(e);
      toast.error('Error initializing org: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4 font-sans w-full">
      <div className="max-w-xl w-full">
        <h2 className="text-[40px] md:text-[60px] font-black tracking-tighter leading-none mb-6 text-black dark:text-[#FAFAFA] text-center uppercase">
          INIT<br/>NETWORK
        </h2>
        
        <p className="text-gray-500 dark:text-[#737373] text-sm mb-12 text-center max-w-sm mx-auto font-mono">
          Configure Arcium Execution Environment (MXE) to securely process encrypted payroll.
        </p>

        <div className="border border-black dark:border-white p-8 bg-transparent space-y-6">
          <div className="space-y-2 text-center">
            <label className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">Arcis Circuit URL</label>
            <div className="text-xs font-mono truncate text-gray-500 bg-gray-100 dark:bg-gray-900 p-3">.../uc?export=download&id=14NSvjX...</div>
          </div>
          
          <button
            onClick={handleInit}
            disabled={loading || !wallet}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 text-sm font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'INITIALIZING...' : 'INITIALIZE'}
          </button>
        </div>
      </div>
    </div>
  );
};
