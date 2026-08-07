#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const EXCLUDED_ARTIFACTS = [
  'PIPELINE_REPORT.md',
  'reports/pipeline/',
];

function isExcluded(path) {
  const normalized = path.replaceAll('\\', '/');
  return EXCLUDED_ARTIFACTS.some(entry => entry.endsWith('/')
    ? normalized.startsWith(entry)
    : normalized === entry);
}

function runGit(args, { allowFailure = false } = {}) {
  const result = spawnSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (!allowFailure && result.status !== 0) {
    const message = (result.stderr || result.stdout || '').toString().trim();
    throw new Error(message || `git ${args.join(' ')} falhou`);
  }
  return result;
}

function git(args) {
  return runGit(args).stdout;
}

function splitZero(value) {
  return value.split('\0').filter(Boolean);
}

function diffArgs(baseArgs) {
  return [...baseArgs, '--', '.', ':(exclude)PIPELINE_REPORT.md', ':(exclude)reports/pipeline/**'];
}

async function hashFile(hash, path) {
  hash.update(`\nUNTRACKED:${path}\n`);
  if (!existsSync(path)) {
    hash.update('MISSING');
    return;
  }
  await new Promise((resolve, reject) => {
    const stream = createReadStream(path);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

async function main() {
  try {
    git(['rev-parse', '--is-inside-work-tree']);
    const hasHead = runGit(['rev-parse', '--verify', 'HEAD'], { allowFailure: true }).status === 0;
    const gitHead = hasHead ? git(['rev-parse', 'HEAD']).trim() : null;
    const branch = git(['branch', '--show-current']).trim() || '(detached-or-unborn)';

    let trackedChanged;
    let diff;
    if (hasHead) {
      trackedChanged = splitZero(git(diffArgs(['diff', '--name-only', '-z', 'HEAD'])));
      diff = git(diffArgs(['diff', '--binary', 'HEAD']));
    } else {
      const staged = splitZero(git(diffArgs(['diff', '--cached', '--name-only', '-z'])));
      const modified = splitZero(git(['ls-files', '--modified', '-z'])).filter(path => !isExcluded(path));
      trackedChanged = [...new Set([...staged, ...modified])].sort();
      diff = `${git(diffArgs(['diff', '--binary', '--cached']))}\n${git(diffArgs(['diff', '--binary']))}`;
    }

    const allUntracked = splitZero(git(['ls-files', '--others', '--exclude-standard', '-z']));
    const untracked = allUntracked.filter(path => !isExcluded(path));
    const changedFiles = [...new Set([...trackedChanged, ...untracked])].sort();

    const hash = createHash('sha256');
    hash.update(`HEAD:${gitHead ?? 'UNBORN'}\n`);
    hash.update(diff);
    for (const path of untracked.sort()) {
      await hashFile(hash, path);
    }

    const result = {
      schemaVersion: 1,
      gitHead,
      branch,
      dirty: changedFiles.length > 0,
      changedFiles,
      trackedChanged,
      untracked,
      excludedArtifacts: EXCLUDED_ARTIFACTS,
      fingerprint: hash.digest('hex'),
    };
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ error: error.message }, null, 2)}\n`);
    process.exit(1);
  }
}

await main();
