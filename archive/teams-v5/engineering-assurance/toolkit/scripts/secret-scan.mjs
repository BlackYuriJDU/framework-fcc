#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function runGit(args, { allowFailure = false } = {}) {
  const result = spawnSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (!allowFailure && result.status !== 0) {
    throw new Error((result.stderr || result.stdout || '').trim() || `git ${args.join(' ')} falhou`);
  }
  return result;
}

function git(args) {
  return runGit(args).stdout;
}

function splitZero(value) {
  return value.split('\0').filter(Boolean);
}

const trackedSecretNames = [
  /(^|\/)\.env$/i,
  /(^|\/)\.env\.(local|development|development\.local|staging|staging\.local|preview|preview\.local|production|production\.local|test|test\.local)$/i,
  /(^|\/)secrets?\//i,
  /service-account.*\.json$/i,
  /credentials.*\.json$/i,
  /id_(rsa|ed25519)$/i,
];

const valuePatterns = [
  ['private-key', /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['generic-api-key', /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["']?[A-Za-z0-9_\-]{20,}/i],
  ['jwt-like', /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['openai-like', /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ['telegram-bot-like', /\b\d{7,12}:[A-Za-z0-9_-]{30,}\b/],
];

function isPlaceholder(line) {
  return /example|placeholder|your[_-]|changeme|dummy|fake|test[_-]?key|<[^>]+>|\*{4,}/i.test(line);
}

function inspectLine(findings, file, lineNumber, line) {
  if (isPlaceholder(line)) return;
  for (const [type, pattern] of valuePatterns) {
    if (pattern.test(line)) {
      findings.push({ type, file, line: lineNumber });
      return;
    }
  }
}

try {
  git(['rev-parse', '--is-inside-work-tree']);
  const hasHead = runGit(['rev-parse', '--verify', 'HEAD'], { allowFailure: true }).status === 0;
  const tracked = git(['ls-files']).split(/\r?\n/).filter(Boolean);
  const findings = [];

  for (const path of tracked) {
    if (trackedSecretNames.some(pattern => pattern.test(path))) {
      findings.push({ type: 'tracked-sensitive-file', file: path, line: null });
    }
  }

  const diff = hasHead
    ? git(['diff', '--unified=0', 'HEAD'])
    : `${git(['diff', '--unified=0', '--cached'])}\n${git(['diff', '--unified=0'])}`;

  let currentFile = null;
  let newLine = 0;
  for (const raw of diff.split(/\r?\n/)) {
    if (raw.startsWith('+++ b/')) {
      currentFile = raw.slice(6);
      continue;
    }
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (!currentFile) continue;
    if (raw.startsWith('+') && !raw.startsWith('+++')) {
      inspectLine(findings, currentFile, newLine, raw.slice(1));
      newLine += 1;
    } else if (!raw.startsWith('-')) {
      newLine += 1;
    }
  }

  const untracked = splitZero(git(['ls-files', '--others', '--exclude-standard', '-z']));
  for (const path of untracked) {
    if (trackedSecretNames.some(pattern => pattern.test(path))) {
      findings.push({ type: 'untracked-sensitive-file', file: path, line: null });
      continue;
    }
    try {
      const stat = statSync(path);
      if (!stat.isFile() || stat.size > 2 * 1024 * 1024) continue;
      const buffer = readFileSync(path);
      if (buffer.includes(0)) continue;
      const text = buffer.toString('utf8');
      text.split(/\r?\n/).forEach((line, index) => inspectLine(findings, path, index + 1, line));
    } catch {
      // Arquivo pode ter sido removido durante o scan; ignore sem revelar conteúdo.
    }
  }

  const unique = [...new Map(findings.map(item => [`${item.type}:${item.file}:${item.line}`, item])).values()];
  process.stdout.write(`${JSON.stringify({
    status: unique.length ? 'FAIL' : 'PASS',
    findings: unique,
    note: 'Valores suspeitos são sempre omitidos do relatório.',
  }, null, 2)}\n`);
  process.exit(unique.length ? 2 : 0);
} catch (error) {
  process.stderr.write(`${JSON.stringify({ error: error.message }, null, 2)}\n`);
  process.exit(1);
}
