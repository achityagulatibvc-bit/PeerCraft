#!/usr/bin/env bash
# ==============================================================================
# PeerCraft Secondary Node Startup Script (Medium Compute: Nether & End)
# ==============================================================================
# Role: Secondary Node (Hosts Nether & The End on Port 25566)
# Recommended Allocation: 3–4 GB RAM | Fast Pause Target for Portal Transit
# ==============================================================================

set -euo pipefail

SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../servers/nether_end" && pwd)"
BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../bin" && pwd)"
JAVA_BIN="${JAVA_HOME:-$BIN_DIR/jre21}/bin/java"

if [ ! -f "$JAVA_BIN" ]; then
    JAVA_BIN="java"
fi

echo "=========================================================="
echo " [PeerCraft] Starting SECONDARY NODE (Nether & End Hosts) "
echo "=========================================================="
echo " Working Directory : $SERVER_DIR"
echo " Java Binary       : $JAVA_BIN"
echo " Port Binding      : 25566 (Backend Paper Instance)"
echo " Memory Allocation : Min 3GB / Max 4GB"
echo "=========================================================="

mkdir -p "$SERVER_DIR"
cd "$SERVER_DIR"

# Accept EULA automatically
echo "eula=true" > eula.txt

# Execute PaperMC with tuned G1GC parameters optimized for secondary dimension hosting
exec "$JAVA_BIN" \
  -Xms3G \
  -Xmx4G \
  -XX:+UseG1GC \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=150 \
  -XX:+UnlockExperimentalVMOptions \
  -XX:+DisableExplicitGC \
  -XX:+AlwaysPreTouch \
  -XX:G1NewSizePercent=25 \
  -XX:G1MaxNewSizePercent=35 \
  -XX:G1ReservePercent=15 \
  -XX:InitiatingHeapOccupancyPercent=20 \
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
  --port 25566
