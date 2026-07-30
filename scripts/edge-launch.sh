#!/bin/bash
# edge-launch.sh — Inicia Edge com CDP via PowerShell
WSL_INTEROP=$(ls -t /run/WSL/*_interop 2>/dev/null | grep -v 1_interop | head -1)
export WSL_INTEROP

# Mata processos Edge CDP antigos
powershell.exe -NoProfile -NonInteractive -Command '
Get-Process msedge | Where-Object { try { $_.CommandLine -match "remote-debugging-port=9222" } catch { $false } } | Stop-Process -Force -ErrorAction SilentlyContinue
' 2>/dev/null

sleep 2

# Lança Edge CDP
powershell.exe -NoProfile -NonInteractive -Command '
Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList @(
  "--remote-debugging-port=9222",
  "--user-data-dir=C:\edge-cdp-profile",
  "--no-first-run",
  "--disable-default-apps",
  "about:blank"
) -PassThru | Select-Object -ExpandProperty Id
' 2>/dev/null

# Aguarda CDP responder
for i in $(seq 1 20); do
  RESP=$(curl -s --max-time 2 http://192.168.144.1:9222/json/version 2>/dev/null)
  if echo "$RESP" | grep -q "Browser"; then
    echo "CDP_READY"
    exit 0
  fi
  sleep 1
done

echo "CDP_TIMEOUT"
exit 1
