import fs from "fs";
const content = fs.readFileSync('node_modules/@coral-xyz/anchor/dist/cjs/program/accounts-resolver.js', 'utf8');
console.log(content.split('toBufferValue(')[1].substring(0, 1000));
