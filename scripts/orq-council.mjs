#!/usr/bin/env node
const domains=[['tesla','engineering/reliability'],['einstein','business/growth'],['da-vinci','product-experience']];
const question=process.argv.slice(2).join(' ')||'decision required';
console.log(JSON.stringify({mode:'council',question,participants:domains.map(([orchestrator,domain])=>({orchestrator,domain,status:'REQUESTED'})),requiredArtifact:'DECISION.md',rules:['independent opinions','explicit disagreement','evidence for material claims','confidence and unresolved risks']},null,2));
