#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const systemHome = process.env.VERTEXION_SYSTEM_HOME || path.join(os.homedir(), '.claude', 'vertexion-agent-system');
const year = process.argv[2] || String(new Date().getFullYear());
const month = process.argv[3] || String(new Date().getMonth() + 1).padStart(2, '0');
const dir = path.join(systemHome, 'state', 'time-capsules', year);
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${year}-${month}.md`);
if (!fs.existsSync(file)) {
  const content = `# Cápsula do tempo — ${year}-${month}\n\n## Resumo\n\n- Alterações positivas: pendente\n- Alterações negativas: pendente\n- Ideias: pendente\n- Leads: pendente\n- Receita e custos: pendente\n- Bugs e regressões: pendente\n- Decisões importantes: pendente\n\n## Comparação\n\n- Mês atual vs anterior: pendente\n- Início vs fim do mês: pendente\n\n## Aprendizados\n\n- pendente\n`;
  fs.writeFileSync(file, content);
  console.log(JSON.stringify({ ok: true, file, action: 'created' }));
} else {
  console.log(JSON.stringify({ ok: true, file, action: 'exists' }));
}
