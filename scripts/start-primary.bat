@echo off
rem ==============================================================================
rem PeerCraft Primary Node Startup Script (Heavy Compute: Overworld)
rem ==============================================================================
rem Role: Primary Node (Hosts Overworld on Port 25565)
rem Recommended Allocation: 6–8 GB RAM | Windows Batch Launcher
rem ==============================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "SERVER_DIR=%SCRIPT_DIR%..\servers\overworld"
set "BIN_DIR=%SCRIPT_DIR%..\bin"
set "JAVA_BIN=java"

if exist "%BIN_DIR%\jre21\bin\java.exe" (
    set "JAVA_BIN=%BIN_DIR%\jre21\bin\java.exe"
)

echo ========================================================
echo  [PeerCraft] Starting PRIMARY NODE (Overworld Instance)
echo ========================================================
echo  Working Directory : %SERVER_DIR%
echo  Java Binary       : %JAVA_BIN%
echo  Port Binding      : 25565
echo  Memory Allocation : Min 6GB / Max 8GB
echo ========================================================

if not exist "%SERVER_DIR%" mkdir "%SERVER_DIR%"
cd /d "%SERVER_DIR%"

echo eula=true > eula.txt

"%JAVA_BIN%" ^
  -Xms6G ^
  -Xmx8G ^
  -XX:+UseG1GC ^
  -XX:+ParallelRefProcEnabled ^
  -XX:MaxGCPauseMillis=200 ^
  -XX:+UnlockExperimentalVMOptions ^
  -XX:+DisableExplicitGC ^
  -XX:+AlwaysPreTouch ^
  -XX:G1NewSizePercent=30 ^
  -XX:G1MaxNewSizePercent=40 ^
  -XX:G1ReservePercent=20 ^
  -XX:InitiatingHeapOccupancyPercent=15 ^
  -XX:G1MixedGCLiveThresholdPercent=90 ^
  -XX:G1RSetUpdatingPauseTimePercent=5 ^
  -XX:SurvivorRatio=32 ^
  -XX:+PerfDisableSharedMem ^
  -XX:MaxTenuringThreshold=1 ^
  -Dusing.aikars.flags=https://mcflags.emc.gs ^
  -Daikars.new.flags=true ^
  -jar "%BIN_DIR%\paper.jar" ^
  --nogui ^
  --port 25565

pause
