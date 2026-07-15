import fs from "node:fs";
import path from "node:path";

const SECRET_PATTERNS = [
  /(?:api[_-]?key|secret|token|password)[=:]\s*['"]?([^'"&\s]{8,})/gi,
  /(?:Bearer\s+)([A-Za-z0-9._\-~+/=]{10,})/g,
  /(?:bot[_-]?token)[=:]\s*['"]?([^'"&\s]{8,})/gi,
  /tvly-[A-Za-z0-9_-]{20,}/g,
  /gsk_[A-Za-z0-9_-]{20,}/g,
  /sb-[A-Za-z0-9_-]{20,}/g,
];

/**
 * Mask secrets in a string for safe logging.
 */
function maskSecrets(text) {
  if (typeof text !== "string") return text;

  let masked = text;
  for (const pattern of SECRET_PATTERNS) {
    masked = masked.replace(pattern, (match, group) => {
      if (group) {
        return match.replace(group, group.slice(0, 4) + "****" + group.slice(-2));
      }
      // Token-only match (no label prefix)
      const visible = match.length > 12
        ? match.slice(0, 6) + "****" + match.slice(-4)
        : "****";
      return visible;
    });
  }
  return masked;
}

/**
 * Create a logger instance for a specific run.
 */
export function createLogger(runId) {
  const logDir = process.env.LOG_DIR || "logs";

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, `scout-${runId}.log`);

  const stream = fs.createWriteStream(logFile, { flags: "a", encoding: "utf-8" });

  function formatMessage(level, args) {
    const timestamp = new Date().toISOString();
    const message = args
      .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 0) : String(a)))
      .join(" ");
    return `[${timestamp}] [${level}] ${message}`;
  }

  const logger = {
    info(...args) {
      const line = formatMessage("INFO", args);
      const masked = maskSecrets(line);
      stream.write(masked + "\n");
      console.log(...args);
    },

    warn(...args) {
      const line = formatMessage("WARN", args);
      const masked = maskSecrets(line);
      stream.write(masked + "\n");
      console.warn(...args);
    },

    error(...args) {
      const line = formatMessage("ERROR", args);
      const masked = maskSecrets(line);
      stream.write(masked + "\n");
      console.error(...args);
    },

    debug(...args) {
      const line = formatMessage("DEBUG", args);
      const masked = maskSecrets(line);
      stream.write(masked + "\n");
    },

    raw(text) {
      stream.write(text + "\n");
    },

    close() {
      return new Promise((resolve) => {
        stream.end(resolve);
      });
    },

    get logFile() {
      return logFile;
    },
  };

  return logger;
}

export default createLogger;
