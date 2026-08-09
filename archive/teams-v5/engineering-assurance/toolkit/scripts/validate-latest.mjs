#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function fail(reason, extra = {}) {
  process.stdout.write(`${JSON.stringify({ valid: false, reason, ...extra }, null, 2)}\n`);
  process.exit(2);
}

let latest;
try {
  latest = JSON.parse(readFileSync('reports/pipeline/latest.json', 'utf8'));
} catch (error) {
  fail('Relatório de validação ausente ou inválido.', { error: error.message });
}

const stateRun = spawnSync(process.execPath, ['.claude/scripts/pipeline-state.mjs'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024,
});
if (stateRun.status !== 0) {
  fail('Não foi possível calcular o estado atual do repositório.', { error: stateRun.stderr || stateRun.stdout });
}

const state = JSON.parse(stateRun.stdout);
const accepted = new Set(['APPROVED', 'APPROVED_WITH_WARNINGS']);
if (latest.validationLevel !== 'full') fail('O estado atual ainda não passou por /validar.', { latest });
if (!accepted.has(latest.status)) fail('A última validação não aprovou o código.', { status: latest.status });
if (latest.fingerprint !== state.fingerprint) {
  fail('O código mudou depois da última validação.', {
    validatedFingerprint: latest.fingerprint,
    currentFingerprint: state.fingerprint,
    changedFiles: state.changedFiles,
  });
}

process.stdout.write(`${JSON.stringify({ valid: true, latest, state }, null, 2)}\n`);
