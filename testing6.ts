import * as anchor from "@coral-xyz/anchor";
import fs from "fs";
import { PublicKey, Keypair } from "@solana/web3.js";

async function run() {
  const idl = JSON.parse(fs.readFileSync('./src/idl.json', 'utf8'));
  const programId = new PublicKey("5NKPWTom5xmn9f45ryyyuid6KaQRnQFba7AyY7RCWXFL");
  const program = new anchor.Program(idl as any, programId, {
    connection: new anchor.web3.Connection("http://127.0.0.1:8899"),
  } as any);

  const orgId = new Uint8Array(16);
  crypto.getRandomValues(orgId);
  const mxeAddress = Keypair.generate().publicKey;
  const clusterIdBytes = new Uint8Array(32); 

  const employer = Keypair.generate().publicKey;
  const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

  try {
    const ix = await program.methods
      .initializeOrganization(Array.from(orgId), mxeAddress, Array.from(clusterIdBytes))
      .accounts({
        employer: employer,
        payrollMaster: employer, // Just testing keys
        vaultAuthority: employer,
        usdcMint: USDC_MINT,
        vault: employer,
        tokenProgram: employer,
        associatedTokenProgram: employer,
        systemProgram: employer,
        rent: employer,
      } as any)
      .instruction();
    console.log("Success instruction with camelCase");
  } catch (e) {
    console.error("Failed to build instruction with camelCase:", e);
  }
}
run();
