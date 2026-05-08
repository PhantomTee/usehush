import { PublicKey } from "@solana/web3.js";
import { getMempoolAccAddress, getExecutingPoolAccAddress, getComputationAccAddress, getClusterAccAddress, getMXEAccAddress, getCompDefAccAddress } from "@arcium-hq/client";
import BN from 'bn.js';

const clusterOffset = 1234;
console.log("mempool:", getMempoolAccAddress(clusterOffset).toBase58());
console.log("executingPool:", getExecutingPoolAccAddress(clusterOffset).toBase58());
console.log("computation:", getComputationAccAddress(clusterOffset, new BN(1)).toBase58());
console.log("cluster:", getClusterAccAddress(clusterOffset).toBase58());

