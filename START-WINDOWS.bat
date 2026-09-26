@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo Paradise ESS - Windows Startup
echo ==========================================

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not available in PATH.
  echo Install Node.js 20+ and run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not installed or not available in PATH.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [ERROR] package.json was not found in the project root.
  pause
  exit /b 1
)

if not exist "node_modules\." (
  echo [INFO] node_modules not found. Installing dependencies...
  call npm ci
  if errorlevel 1 (
    echo [WARN] npm ci failed. Retrying with npm install...
    call npm install
    if errorlevel 1 (
      echo [ERROR] Dependency installation failed.
      pause
      exit /b 1
    )
  )
) else (
  echo [INFO] Dependencies already installed.
)

echo [INFO] Starting Paradise ESS...
call npm run dev

if errorlevel 1 (
  echo.
  echo [ERROR] Application failed to start.
  echo Try deleting node_modules and running START-WINDOWS.bat again.
  pause
  exit /b 1
)

endlocal
