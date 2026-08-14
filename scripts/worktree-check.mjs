#!/usr/bin/env node
import { execSync } from 'node:child_process';
try { const out=execSync('git worktree list --porcelain',{encoding:'utf8'}); const paths=out.split(/\n(?=worktree )/).filter(Boolean).map(x=>x.split('\n')[0].replace(/^worktree /,'')); console.log(JSON.stringify({count:paths.length,paths,policy:'one Task Contract per worktree; integrate only after evaluation'},null,2)); } catch(e){ console.error(e.message); process.exit(1); }
