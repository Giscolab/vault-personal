@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
color 0A

REM ======== CONFIG PAR DEFAUT ========
set "PORT=8000"
set "PAGE=index.html"
set "BIND=127.0.0.1"

REM ======== DETECTION PYTHON ========
set "PYTHON="
for %%P in (python python3) do (
    %%P --version >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON=%%P"
        goto :pyok
    )
)
:pyok
if not defined PYTHON (
    echo [ERREUR] Python introuvable dans le PATH.
    pause
    exit /b 1
)

REM ======== MENU PRINCIPAL ========
:menu
cls
call :Banner
echo ================== MENU ==================
echo 1. Démarrer le serveur local
echo 2. Exporter les logs en HTML (export-log.html)
echo 3. Quitter
echo ==========================================
set /p "choix=Votre choix [1-3] : "

if "!choix!"=="1" goto :start_server
if "!choix!"=="2" goto :export_logs
if "!choix!"=="3" goto :quitter

goto :menu
:quitter
cls
echo Merci d'avoir utilisé Vault Personal.
echo Fermeture en cours...
timeout /t 1 >nul
exit

REM ======== DEMARRAGE SERVEUR ========
:start_server
cls
call :Banner

REM ======== ARGUMENTS UTILISATEUR ========
echo.
echo === Démarrage du serveur local avec les paramètres par défaut ===
echo.
echo -^> Port : %PORT%
echo -^> Page : %PAGE%
echo.
pause

REM ======== VERIF FICHIERS ========
if not exist "!PAGE!" (
    echo [ERREUR] Fichier "!PAGE!" introuvable.
    pause
    goto :menu
)

REM ======== LANCEMENT SERVEUR ========
title Vault Personal – Serveur Local

REM Démarrage du serveur Python en arrière-plan (CONCATÈNE les logs !)
start /b "" "!PYTHON!" -m http.server !PORT! --bind !BIND! >>"%~dp0vault_local.log" 2>&1


REM Attendre que le serveur HTTP réponde
set /a try=0
echo.
echo En attente du démarrage du serveur...
:wait_server
set /a try+=1
timeout /t 1 >nul
powershell -Command "$response = $null; try { $response = Invoke-WebRequest -Uri 'http://!BIND!:!PORT!' -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue } catch {}; if ($response -ne $null) { exit 0 } else { exit 1 }"
if !errorlevel! equ 0 (
    echo.
    goto :server_ok
)
if !try! geq 20 (
    echo.
    echo [ERREUR] Le serveur ne répond pas après 20 secondes
    pause
    goto :menu
)
<nul set /p ".=."
goto :wait_server

:server_ok
echo [OK] Serveur opérationnel
echo Lancement de "!PAGE!" dans le navigateur...
start "" "msedge.exe" --app="http://%BIND%:%PORT%/%PAGE%" --disable-cache --incognito

pause
goto :menu

REM ======== EXPORT LOGS HTML ========
:export_logs
cls
call :Banner

"%PYTHON%" "%~dp0export_log.py"
if errorlevel 1 (
  echo.
  echo [ERREUR] Impossible d'exporter les logs.
  pause
  goto :menu
)

start "" "%~dp0export-log.html"
pause
goto :menu

REM ======== BANNIÈRE ASCII ========
:Banner
echo ╔════════════════════════════════════════════════════╗
echo              VAULT PERSONAL – LOCAL LAUNCH
echo ╠════════════════════════════════════════════════════╣
echo        Encrypted password vault (100%% LOCAL)
echo      Static HTML front-end + Python local server
echo        Launching: http://!BIND!:!PORT!/!PAGE!
echo ╚════════════════════════════════════════════════════╝
echo.
echo Initialisation du système...
goto :eof