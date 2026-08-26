@echo off
rem ==============================================================================
rem PeerCraft Edge Node Startup Script (Velocity Proxy + Voice UDP + Offloader)
rem ==============================================================================
rem Role: Edge / Aux Node (Hosts Velocity Proxy on Port 25577, Voice on 24454)
rem Recommended Allocation: 512MB–1GB RAM | Windows Batch Launcher
rem ==============================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "PROXY_DIR=%SCRIPT_DIR%..\servers\velocity"
set "BIN_DIR=%SCRIPT_DIR%..\bin"
set "JAVA_BIN=java"

if exist "%BIN_DIR%\jre21\bin\java.exe" (
    set "JAVA_BIN=%BIN_DIR%\jre21\bin\java.exe"
)

echo ==========================================================
echo  [PeerCraft] Starting EDGE NODE (Velocity Proxy & Ingress)
echo ==========================================================
echo  Working Directory : %PROXY_DIR%
echo  Java Binary       : %JAVA_BIN%
echo  Ingress Port      : 25577
echo  Voice UDP Port    : 24454
echo  Memory Allocation : Min 512MB / Max 1GB
echo ==========================================================

if not exist "%PROXY_DIR%" mkdir "%PROXY_DIR%"
cd /d "%PROXY_DIR%"

if exist "%BIN_DIR%\playit.exe" (
    echo [PeerCraft] Starting Playit.gg Anycast Tunnel Daemon in background...
    start "" /B "%BIN_DIR%\playit.exe" --secret "%PLAYIT_SECRET_KEY%" run
)

"%JAVA_BIN%" ^
  -Xms512M ^
  -Xmx1024M ^
  -XX:+UseG1GC ^
  -XX:G1HeapRegionSize=4M ^
  -XX:+UnlockExperimentalVMOptions ^
  -XX:+ParallelRefProcEnabled ^
  -XX:+AlwaysPreTouch ^
  -XX:MaxGCPauseMillis=50 ^
  -XX:+DisableExplicitGC ^
  -Dvelocity.packet-decode-logging=false ^
  -jar "%BIN_DIR%\velocity.jar"

pause
