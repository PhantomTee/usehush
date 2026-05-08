import { useMemo } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import idl from '../idl.json';

const PROGRAM_ID = new PublicKey('3uJQvCdUrdXNtVvnL1jp7ZtiFDUJqUWNjBF7Z3pe3FD6');

export function useHushHushPay() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    return new anchor.Program(idl as unknown as anchor.Idl, provider);
  }, [connection, wallet]);

  return { program, wallet, connection };
}
