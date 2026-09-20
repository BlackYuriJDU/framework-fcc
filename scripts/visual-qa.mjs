#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path';
const dir=process.argv[2]; if(!dir){console.error('Usage: visual-qa.mjs <capture-dir>');process.exit(2)}
const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(x=>/\.(png|jpe?g|webp)$/i.test(x)):[];
const report={mode:'visual-qa',captureDir:path.resolve(dir),screenshots:files,viewportCoverage:files.length>0,status:files.length?'READY_FOR_REVIEW':'MISSING_CAPTURES',criteria:['responsive','accessibility','reduced-motion','interaction','visual-consistency']};
console.log(JSON.stringify(report,null,2)); process.exit(files.length?0:1);
