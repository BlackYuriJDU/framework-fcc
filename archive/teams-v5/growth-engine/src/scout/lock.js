import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { getConfig } from "./config.js";

const LOCK_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Check if PID is running on Windows or Linux/WSL.
 */
function isProcessAlive(pid) {
  try {
    if (process.platform === "win32") {
      const result = spawnSync("tasklist", ["/FI", `PID eq ${pid}`, "/NH"], {
        stdio: "pipe",
        encoding: "utf-8",
      });
      return result.status === 0 && result.stdout.includes(String(pid));
    }
    // Linux / WSL
    try {
      fs.accessSync(`/proc/${pid}`);
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Acquire a lock file. Returns true if lock acquired.
 * Exits with code 3 if another instance is running.
 */
export function acquireLock() {
  const config = getConfig();
  const lockPath = config.LOCK_FILE;
  const dir = path.dirname(lockPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const now = Date.now();

  try {
    const existing = fs.readFileSync(lockPath, "utf-8").trim();
    if (existing) {
      let lockData;
      try {
        lockData = JSON.parse(existing);
      } catch {
        fs.unlinkSync(lockPath);
        return writeLock(lockPath);
      }

      const age = now - (lockData.createdAt || 0);

      if (lockData.pid && age < LOCK_TTL_MS && isProcessAlive(lockData.pid)) {
        console.error(
          `[LOCK] Scout já está em execução (PID ${lockData.pid}, execução ${lockData.runId})`
        );
        process.exit(3);
      }

      // Stale lock — remove and reacquire
      console.warn(
        `[LOCK] Lock expirado (idade: ${Math.round(age / 1000)}s). Reassumindo.`
      );
      fs.unlinkSync(lockPath);
    }
  } catch {
    // File doesn't exist — no lock
  }

  return writeLock(lockPath);
}

function writeLock(lockPath) {
  const lockData = {
    pid: process.pid,
    runId: process.env.RUN_ID || "unknown",
    createdAt: Date.now(),
    hostname: process.env.HOSTNAME || "unknown",
  };

  fs.writeFileSync(lockPath, JSON.stringify(lockData, null, 2), "utf-8");
  return true;
}

/**
 * Release the lock file.
 */
export function releaseLock() {
  const config = getConfig();
  try {
    if (fs.existsSync(config.LOCK_FILE)) {
      fs.unlinkSync(config.LOCK_FILE);
    }
  } catch (error) {
    console.warn("[LOCK] Erro ao liberar lock:", error.message);
  }
}

/**
 * Set up handlers to release lock on exit/signal.
 */
export function setupLockCleanup() {
  const cleanup = () => releaseLock();

  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    console.log("\n[LOCK] Interrompido pelo usuário. Liberando lock...");
    releaseLock();
    process.exit(9);
  });
  process.on("SIGTERM", () => {
    console.log("\n[LOCK] Encerrado. Liberando lock...");
    releaseLock();
    process.exit(9);
  });
}

export default { acquireLock, releaseLock, setupLockCleanup };
