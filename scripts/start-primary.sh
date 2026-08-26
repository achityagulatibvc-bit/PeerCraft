#!/usr/bin/env bash
# ==============================================================================
# PeerCraft Primary Node Startup Script (Heavy Compute: Overworld)
# ==============================================================================
# Role: Primary Node (Hosts Overworld on Port 25565)
# Recommended Allocation: 6–8 GB RAM | High Single-Thread Performance
# ==============================================================================

set -euo pipefail

SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../servers/overworld" && pwd)"
BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../bin" && pwd)"
JAVA_BIN="${JAVA_HOME:-$BIN_DIR/jre21}/bin/java"

if [ ! -f "$JAVA_BIN" ]; then
    JAVA_BIN="java"
fi

echo "========================================================"
echo " [PeerCraft] Starting PRIMARY NODE (Overworld Instance) "
echo "========================================================"
echo " Working Directory : $SERVER_DIR"
echo " Java Binary       : $JAVA_BIN"
echo " Port Binding      : 25565 (Backend Paper Instance)"
echo " Memory Allocation : Min 6GB / Max 8GB"
echo "========================================================"

mkdir -p "$SERVER_DIR"
cd "$SERVER_DIR"

# Accept EULA automatically
echo "eula=true" > eula.txt

# Execute PaperMC with Aikar-tuned G1GC parameters optimized for heavy Overworld workloads
exec "$JAVA_BIN" \
  -Xms6G \
  -Xmx8G \
  -XX:+UseG1GC \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UnlockExperimentalVMOptions \
  -XX:+DisableExplicitGC \
  -XX:+AlwaysPreTouch \
  -XX:G1NewSizePercent=30 \
  -XX:G1MaxNewSizePercent=40 \
  -XX:G1ReservePercent=20 \
  -XX:InitiatingHeapOccupancyPercent=15 \
  -XX:G1MixedGCLiveThresholdPercent=90 \
  -XX:G1RSetUpdatingPauseTimePercent=5 \
  -XX:SurvivorRatio=32 \
  -XX:+PerfDisableSharedMem \
  -XX:MaxTenuringThreshold=1 \
  -Dusing.aikars.flags=https://mcflags.emc.gs \
  -Daikars.new.flags=true \
  -Dterminal.jline=false \
  -Dterminal.ansi=true \
  -jar "$BIN_DIR/paper.jar" \
  --nogui \
  --port 25565
