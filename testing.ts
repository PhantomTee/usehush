import { Idl } from '@coral-xyz/anchor';
import { BorshCoder } from '@coral-xyz/anchor';
import fs from 'fs';

const idl = JSON.parse(fs.readFileSync('./src/idl.json', 'utf8')) as Idl;
try {
  new BorshCoder(idl);
  console.log("Success");
} catch (e) {
  console.error("Error from BorshCoder:", e);
}
