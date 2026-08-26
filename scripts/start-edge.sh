#!/usr/bin/env bash
# ==============================================================================
# PeerCraft Edge Node Startup Script (Velocity Proxy + Voice UDP + Offloader)
# ==============================================================================
# Role: Edge / Aux Node (Hosts Velocity Proxy on Port 25577, Voice on 24454)
# Recommended Allocation: 512MB–1GB RAM | Low-latency packet throughput
# ==============================================================================

set -euo pipefail

PROXY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../servers/velocity" && pwd)"
BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../bin" && pwd)"
JAVA_BIN="${JAVA_HOME:-$BIN_DIR/jre21}/bin/java"

if [ ! -f "$JAVA_BIN" ]; then
    JAVA_BIN="java"
fi

echo "=========================================================="
echo " [PeerCraft] Starting EDGE NODE (Velocity Proxy & Ingress) "
echo "=========================================================="
echo " Working Directory : $PROXY_DIR"
echo " Java Binary       : $JAVA_BIN"
echo " Ingress Port      : 25577 (Minecraft Velocity Ingress)"
echo " Voice UDP Port    : 24454 (Simple Voice Chat Relay)"
echo " Memory Allocation : Min 512MB / Max 1GB"
echo "=========================================================="

mkdir -p "$PROXY_DIR"
cd "$PROXY_DIR"

# Launch Playit.gg Tunnel in background if playit binary exists
if [ -f "$BIN_DIR/playit" ]; then
    echo "[PeerCraft] Starting Playit.gg Anycast Tunnel Daemon..."
    "$BIN_DIR/playit" --secret "$PLAYIT_SECRET_KEY" run &
    PLAYIT_PID=$!
    trap "kill $PLAYIT_PID 2>/dev/null || true" EXIT
fi

# Execute Velocity with ultra-low latency GC profile
exec "$JAVA_BIN" \
  -Xms512M \
  -Xmx1024M \
  -XX:+UseG1GC \
  -XX:G1HeapRegionSize=4M \
  -XX:+UnlockExperimentalVMOptions \
  -XX:+ParallelRefProcEnabled \
  -XX:+AlwaysPreTouch \
  -XX:MaxGCPauseMillis=50 \
  -XX:+DisableExplicitGC \
  -Dvelocity.packet-decode-logging=false \
  -jar "$BIN_DIR/velocity.jar"
