import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getMXEPublicKey, RescueCipher } from '@arcium-hq/client';
import nacl from 'tweetnacl';

const arciumProgramId = new PublicKey('Arcj82pX7HxYKLR92qvgZUAd7vGS1k4hQvAFcPATFdEQ');

export class ArciumEncryptionService {
  private localKeypair: nacl.BoxKeyPair;
  private sharedSecret: Uint8Array | null = null;
  private mxePublicKey: Uint8Array | null = null;

  constructor() {
    this.localKeypair = nacl.box.keyPair();
  }

  get publicKey(): Uint8Array {
    return this.localKeypair.publicKey;
  }

  get isInitialized(): boolean {
    return this.sharedSecret !== null;
  }

  async initialize(provider: anchor.AnchorProvider, programId: PublicKey = arciumProgramId) {
    const mxePubKey = await getMXEPublicKey(provider, programId);
    if (!mxePubKey) throw new Error("Could not fetch MXE Public Key");
    
    this.mxePublicKey = mxePubKey;
    this.sharedSecret = nacl.box.before(this.mxePublicKey, this.localKeypair.secretKey);
  }

  encryptPayroll(amount: number, employeePda: PublicKey): { employeePda: PublicKey; ciphertext: number[] } {
    if (!this.sharedSecret) {
      throw new Error("Service not initialized. Call initialize() first.");
    }

    const cipher = new RescueCipher(this.sharedSecret);
    const nonce = nacl.randomBytes(16);
    // Plaintext needs to be a bigint[] according to Arcium. 
    // We convert the amount number to a big integer array
    const plaintext = [BigInt(amount)];
    
    const ciphertextChunks = cipher.encrypt(plaintext, nonce);
    
    // Construct 96-byte array: localKeypair (32 bytes), nonce (16 bytes), padded ciphertext (rest)
    const outBuffer = new Uint8Array(96);
    
    // Copy ephemeral public key
    outBuffer.set(this.localKeypair.publicKey, 0);
    // Copy nonce
    outBuffer.set(nonce, 32);
    
    // Copy the first chunk of ciphertext (32 bytes)
    if (ciphertextChunks.length > 0 && ciphertextChunks[0]) {
      const chunk = new Uint8Array(ciphertextChunks[0]);
      outBuffer.set(chunk, 48);
    }
    
    return {
      employeePda,
      ciphertext: Array.from(outBuffer),
    };
  }
}
