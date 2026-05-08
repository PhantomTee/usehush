import React, { useState } from 'react';
import { useHushHushPay } from '../hooks/useHushHushPay';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const InitializeOrg = ({ onComplete }: { onComplete?: () => void }) => {
  const { program, wallet } = useHushHushPay();
  const [loading, setLoading] = useState(false);

  const handleInit = async () => {
    if (!program || !wallet) return alert('Wallet not connected');
    
    setLoading(true);
    try {
      const circuitUrl = "https://drive.google.com/uc?export=download&id=14NSvjxfQIZjch7r05Io0dfANE_39tyb_";
      console.log(`Init comp def logic using URL: ${circuitUrl}`);
      
      const orgId = new Uint8Array(16);
      crypto.getRandomValues(orgId);

      const mxeAddress = anchor.web3.Keypair.generate().publicKey;
      const clusterIdBytes = new Uint8Array(32); 
      clusterIdBytes[0] = 456; 

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
          payrollMaster,
          vaultAuthority,
          usdcMint: USDC_MINT,
          vault,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      alert(`Organization Initialized! Tx: ${tx}`);
      if (onComplete) onComplete();
    } catch (e: any) {
      console.error(e);
      alert('Error initializing org: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans">
      <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-bold mb-2">Organization Config</div>
      <h2 className="text-3xl lg:text-5xl font-black tracking-tighter leading-none mb-6 text-[#FAFAFA]">INITIALIZE<br/>NODES.</h2>
      
      <p className="text-[#a3a3a3] text-sm mb-8 leading-relaxed max-w-sm">
        Configure your Arcium Execution Environment (MXE) to securely process encrypted payroll without revealing individual salaries.
      </p>

      <div className="p-5 border border-[#262626] rounded-sm space-y-5 bg-[#0A0A0A] max-w-md">
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-[#737373] font-bold tracking-widest">Arcis Circuit URL</label>
          <div className="text-xs font-mono truncate text-[#A3A3A3] bg-[#171717] p-2 border border-[#262626]">.../uc?id=14NSvjxfQIZjch7r...</div>
        </div>
        <button
          onClick={handleInit}
          disabled={loading || !wallet}
          className="w-full bg-white text-black py-3 text-sm font-black uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? 'INITIALIZING...' : 'Initialize Organization'}
        </button>
      </div>
    </div>
  );
};
