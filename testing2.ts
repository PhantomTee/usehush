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

  try {
    const ix = await program.methods
      .initializeOrganization(Array.from(orgId), mxeAddress, Array.from(clusterIdBytes))
      .instruction();
    console.log("Success instruction");
  } catch (e) {
    console.error("Failed to build instruction:", e);
  }
}

run();
