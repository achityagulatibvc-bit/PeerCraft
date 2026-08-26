@echo off
rem ==============================================================================
rem PeerCraft Secondary Node Startup Script (Medium Compute: Nether & End)
rem ==============================================================================
rem Role: Secondary Node (Hosts Nether & The End on Port 25566)
rem Recommended Allocation: 3–4 GB RAM | Windows Batch Launcher
rem ==============================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "SERVER_DIR=%SCRIPT_DIR%..\servers\nether_end"
set "BIN_DIR=%SCRIPT_DIR%..\bin"
set "JAVA_BIN=java"

if exist "%BIN_DIR%\jre21\bin\java.exe" (
    set "JAVA_BIN=%BIN_DIR%\jre21\bin\java.exe"
)

echo ==========================================================
echo  [PeerCraft] Starting SECONDARY NODE (Nether & End Hosts)
echo ==========================================================
echo  Working Directory : %SERVER_DIR%
echo  Java Binary       : %JAVA_BIN%
echo  Port Binding      : 25566
echo  Memory Allocation : Min 3GB / Max 4GB
echo ==========================================================

if not exist "%SERVER_DIR%" mkdir "%SERVER_DIR%"
cd /d "%SERVER_DIR%"

echo eula=true > eula.txt

"%JAVA_BIN%" ^
  -Xms3G ^
  -Xmx4G ^
  -XX:+UseG1GC ^
  -XX:+ParallelRefProcEnabled ^
  -XX:MaxGCPauseMillis=150 ^
  -XX:+UnlockExperimentalVMOptions ^
  -XX:+DisableExplicitGC ^
  -XX:+AlwaysPreTouch ^
  -XX:G1NewSizePercent=25 ^
  -XX:G1MaxNewSizePercent=35 ^
  -XX:G1ReservePercent=15 ^
  -XX:InitiatingHeapOccupancyPercent=20 ^
  -XX:G1MixedGCLiveThresholdPercent=90 ^
  -XX:G1RSetUpdatingPauseTimePercent=5 ^
  -XX:SurvivorRatio=32 ^
  -XX:+PerfDisableSharedMem ^
  -XX:MaxTenuringThreshold=1 ^
  -Dusing.aikars.flags=https://mcflags.emc.gs ^
  -Daikars.new.flags=true ^
  -jar "%BIN_DIR%\paper.jar" ^
  --nogui ^
  --port 25566

pause
