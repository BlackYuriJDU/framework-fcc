#!/usr/bin/env node
/**
 * 🦾 Edge Controller — conecta no Edge (Windows) via CDP do WSL.
 * Se o Edge CDP não estiver rodando, INICIA automaticamente.
 *
 * Uso: node edge-cdp.mjs <comando> [args...]
 *
 * Comandos:
 *   start              — inicia Edge + mantém controle contínuo
 *   navigate <url>     — navega pra URL (cria aba nova)
 *   click <selector>   — clica no elemento
 *   type <sel> <text>  — preenche campo
 *   scroll [px]        — rola (padrão: 600)
 *   screenshot [path]  — captura tela
 *   evaluate <code>    — executa JS na página ativa
 *   snap               — accessibility snapshot
 *   tabs               — lista abas
 *   html               — mostra HTML da página
 *   stop               — fecha Edge CDP e limpa perfil
 *   help               — ajuda
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

const CDP_HOST = '192.168.144.1';
const CDP_PORT = 9222;
const CDP_URL = `http://${CDP_HOST}:${CDP_PORT}`;
const SCRIPTS_DIR = new URL('.', import.meta.url).pathname;
const LAUNCH_SCRIPT = `${SCRIPTS_DIR}edge-launch.sh`;

// ─── Helpers ──────────────────────────────────────────────────────────

function isEdgeRunning() {
  try {
    const ver = execSync(
      `curl -s --max-time 3 ${CDP_URL}/json/version 2>/dev/null`,
      { encoding: 'utf8', timeout: 5000, shell: '/bin/bash' }
    );
    return ver.includes('Edg/') || ver.includes('Browser');
  } catch {
    return false;
  }
}

function psCmd(script) {
  // Escreve script em temp file e executa (evita problemas de escaping)
  const tmpFile = '/tmp/ps-cmd.ps1';
  require('fs').writeFileSync(tmpFile, script, 'utf8');
  const result = execSync(
    `powershell.exe -NoProfile -NonInteractive -File "${tmpFile}"`,
    { encoding: 'utf8', timeout: 15000 }
  ).trim();
  require('fs').unlinkSync(tmpFile);
  return result;
}

// ─── Gerenciamento do Edge ───────────────────────────────────────────

function launchEdge() {
  console.log('⚡ Iniciando Edge com CDP...');
  const result = execSync(`bash ${LAUNCH_SCRIPT}`, {
    encoding: 'utf8', timeout: 45000, shell: '/bin/bash'
  }).trim();
  if (result.includes('CDP_READY')) {
    console.log('  ✅ CDP pronto!');
    return true;
  }
  console.error('  ❌ Edge CDP não respondeu');
  return false;
}

// ─── Comandos ─────────────────────────────────────────────────────────

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === 'help') {
    console.log(`
🦾 Edge CDP Controller
Uso: node edge-cdp.mjs <comando> [args...]

Comandos:
  start                          Inicia Edge e mantém controle
  navigate <url>                 Navega (cria aba nova)
  click <selector>               Clica no elemento
  type <selector> <texto>        Preenche campo
  scroll [px]                    Rola página (padrão 600)
  screenshot [path]              Captura tela
  evaluate <codigo-js>           Executa JS
  tabs                           Lista abas abertas
  html                           Mostra HTML da página
  stop                           Fecha Edge CDP
  help                           Mostra esta ajuda
    `);
    return;
  }

  // Comandos que não precisam do Edge
  if (command === 'stop') {
    psCmd(
      'Get-Process msedge | Where-Object { try { $_.CommandLine -match "remote-debugging-port=9222" } catch { $false } } | Stop-Process -Force -ErrorAction SilentlyContinue'
    );
    psCmd("Remove-Item 'C:\\edge-cdp-profile' -Recurse -Force -ErrorAction SilentlyContinue");
    console.log('Edge CDP fechado e perfil limpo.');
    return;
  }

  // Garante Edge rodando
  if (!isEdgeRunning()) {
    const ok = launchEdge();
    if (!ok) process.exit(1);
  }

  // Conecta ao Edge via CDP
  const browser = await chromium.connectOverCDP(CDP_URL);

  let keepAlive = false;

  try {
    // ── Comandos sem página específica ──
    if (command === 'tabs') {
      const contexts = browser.contexts();
      let count = 0;
      for (const ctx of contexts) {
        for (const p of ctx.pages()) {
          console.log(`  [${++count}] ${p.url()} — "${await p.title()}"`);
        }
      }
      if (count === 0) console.log('  Nenhuma aba aberta.');
      return;
    }

    if (command === 'navigate') {
      const url = args[0] || 'https://zapmenu.org';
      const existingPages = browser.contexts()[0]?.pages() || [];
      const page = existingPages[0] || await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      console.log(`✅ Navegado para: ${page.url()}`);
      console.log('   Edge permanece aberto.');
      keepAlive = true;
      return;
    }

    // ── Pega primeira página ativa ──
    const allPages = browser.contexts()[0]?.pages() || [];
    const page = allPages[0];
    if (!page) {
      console.error('Nenhuma página ativa. Use "navigate <url>" primeiro.');
      return;
    }
    await page.bringToFront();

    switch (command) {
      case 'click': {
        const sel = args[0];
        if (!sel) throw new Error('Uso: click <selector>');
        await page.waitForSelector(sel, { timeout: 10000 });
        await page.click(sel);
        console.log(`✅ Clicou em: ${sel}`);
        break;
      }
      case 'type': {
        const [sel, ...textParts] = args;
        const text = textParts.join(' ');
        if (!sel || !text) throw new Error('Uso: type <selector> <texto>');
        await page.waitForSelector(sel, { timeout: 10000 });
        await page.fill(sel, text);
        console.log(`✅ Preencheu ${sel}`);
        break;
      }
      case 'scroll': {
        const px = parseInt(args[0]) || 600;
        await page.evaluate(y => window.scrollTo({ top: y, behavior: 'smooth' }), px);
        console.log(`✅ Rolou para ${px}px`);
        break;
      }
      case 'screenshot': {
        const path = args[0] || '/tmp/edge-screenshot.png';
        await page.screenshot({ path, fullPage: true });
        console.log(`✅ Screenshot: ${path}`);
        break;
      }
      case 'evaluate': {
        const code = args.join(' ');
        const result = await page.evaluate(c => eval(c), code);
        console.log('Resultado:', JSON.stringify(result, null, 2));
        break;
      }
      case 'snap': {
        const snap = await page.accessibility.snapshot();
        console.log(JSON.stringify(snap, null, 2));
        break;
      }
      case 'html': {
        const html = await page.content();
        console.log(html.substring(0, 5000));
        if (html.length > 5000) console.log(`... (${html.length - 5000} caracteres a mais)`);
        break;
      }
      case 'start': {
        const currentUrl = page.url() || '(about:blank)';
        console.log(`✅ Conectado ao Edge — ${currentUrl}`);
        console.log('   Pressione Ctrl+C para desconectar.');
        keepAlive = true;
        await new Promise(() => {});
        break;
      }
      default:
        console.log(`❌ Comando desconhecido: ${command}`);
        console.log('   Use: navigate, click, type, scroll, screenshot, evaluate, snap, html, tabs, start, stop');
    }
  } catch (err) {
    console.error(`❌ Erro: ${err.message}`);
  } finally {
    if (!keepAlive) {
      await browser.close();
    }
  }
}

main().catch(err => {
  console.error(`❌ Erro fatal: ${err.message}`);
  process.exit(1);
});
