@echo off
setlocal enabledelayedexpansion

REM ===== CONFIGURATION SIMPLIFIEE =====
set "PORT=8000"
set "HTML_MAIN=index.html"
set "PYTHON=python"

title Serveur Local Simple
cls

echo [INIT] Vérification de Python...
where !PYTHON! >nul 2>&1 || (
    echo [ERREUR] Python non installé ou non dans le PATH
    pause
    exit /b 1
)

echo [STATUS] Démarrage du serveur sur http://localhost:%PORT%
echo Appuyez sur Ctrl+C pour arrêter

start "" "http://localhost:%PORT%/%HTML_MAIN%"

!PYTHON! -m http.server %PORT% --bind 127.0.0.1

pause