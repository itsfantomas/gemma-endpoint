@echo off
chcp 65001 >nul 2>&1
title Gemma Endpoint

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║        ✨ Gemma Endpoint Launcher        ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ─── Step 1: Check Node.js ──────────────────────────────────────
echo  [1/4] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ❌ ERROR: Node.js is not installed or not in PATH.
    echo     Download it from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo        Node.js %%v found ✔

:: ─── Step 2: Check npm ──────────────────────────────────────────
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ❌ ERROR: npm is not installed or not in PATH.
    echo     It should come with Node.js. Try reinstalling from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm -v') do echo        npm v%%v found ✔
echo.

:: ─── Step 3: Install dependencies ───────────────────────────────
echo  [2/4] Installing dependencies...
if not exist "node_modules" (
    echo        Running npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo  ❌ ERROR: npm install failed.
        echo     Check the error messages above and try again.
        echo.
        pause
        exit /b 1
    )
    echo        ✔ Dependencies installed
) else (
    echo        ✔ Dependencies already installed
)

if not exist "client\node_modules" (
    echo        Running npm install in client...
    pushd client
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo  ❌ ERROR: Client npm install failed.
        popd
        pause
        exit /b 1
    )
    popd
    echo        ✔ Client dependencies installed
) else (
    echo        ✔ Client dependencies already installed
)
echo.

:: ─── Step 4: Build ──────────────────────────────────────────────
echo  [3/4] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo  ❌ ERROR: Build failed.
    echo     Check the TypeScript/Vite errors above and fix them.
    echo.
    pause
    exit /b 1
)
echo        ✔ Build complete
echo.

:: ─── Step 5: Start server ───────────────────────────────────────
echo  [4/4] Starting server...
echo.
echo  🚀 The server is running. Open the interface at:
echo     http://localhost:3001
echo.
echo  Press Ctrl+C to stop the server.
echo  ──────────────────────────────────────────
echo.
node dist/server.js
if %errorlevel% neq 0 (
    echo.
    echo  ❌ ERROR: Server crashed unexpectedly.
    echo.
    pause
    exit /b 1
)

pause
