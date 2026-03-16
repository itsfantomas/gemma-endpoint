#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# Gemma Endpoint — Launcher for Linux, macOS, and Termux (Android)
# ─────────────────────────────────────────────────────────────────

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No color
BOLD='\033[1m'

# Detect Termux
IS_TERMUX=false
if [ -d "/data/data/com.termux" ]; then
  IS_TERMUX=true
fi

echo ""
echo -e "${CYAN}${BOLD} ╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD} ║        ✨ Gemma Endpoint Launcher        ║${NC}"
echo -e "${CYAN}${BOLD} ╚══════════════════════════════════════════╝${NC}"
echo ""

if [ "$IS_TERMUX" = true ]; then
  echo -e " ${YELLOW}📱 Termux environment detected${NC}"
  echo ""
fi

# ─── Step 1: Check Node.js ──────────────────────────────────────
echo -e " ${BOLD}[1/4] Checking Node.js...${NC}"

if ! command -v node &> /dev/null; then
  echo ""
  if [ "$IS_TERMUX" = true ]; then
    echo -e " ${RED}❌ Node.js is not installed.${NC}"
    echo -e "    Install it with: ${BOLD}pkg install nodejs${NC}"
  else
    echo -e " ${RED}❌ Node.js is not installed or not in PATH.${NC}"
    echo -e "    Download it from: ${BOLD}https://nodejs.org/${NC}"
  fi
  echo ""
  exit 1
fi

NODE_VERSION=$(node -v)
echo -e "       Node.js ${GREEN}${NODE_VERSION}${NC} found ✔"

# ─── Step 2: Check npm ──────────────────────────────────────────
if ! command -v npm &> /dev/null; then
  echo ""
  echo -e " ${RED}❌ npm is not installed.${NC}"
  echo -e "    It should come with Node.js. Try reinstalling."
  echo ""
  exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "       npm ${GREEN}v${NPM_VERSION}${NC} found ✔"
echo ""

# ─── Step 3: Install dependencies ───────────────────────────────
echo -e " ${BOLD}[2/4] Installing dependencies...${NC}"

if [ ! -d "node_modules" ]; then
  echo "       Running npm install..."
  npm install || {
    echo ""
    echo -e " ${RED}❌ npm install failed.${NC}"
    echo "    Check the error messages above and try again."
    exit 1
  }
  echo -e "       ${GREEN}✔ Dependencies installed${NC}"
else
  echo -e "       ${GREEN}✔ Dependencies already installed${NC}"
fi

if [ ! -d "client/node_modules" ]; then
  echo "       Running npm install in client..."
  (cd client && npm install) || {
    echo ""
    echo -e " ${RED}❌ Client npm install failed.${NC}"
    exit 1
  }
  echo -e "       ${GREEN}✔ Client dependencies installed${NC}"
else
  echo -e "       ${GREEN}✔ Client dependencies already installed${NC}"
fi
echo ""

# ─── Step 4: Build ──────────────────────────────────────────────
echo -e " ${BOLD}[3/4] Building project...${NC}"

npm run build || {
  echo ""
  echo -e " ${RED}❌ Build failed.${NC}"
  echo "    Check the TypeScript/Vite errors above and fix them."
  exit 1
}

echo -e "       ${GREEN}✔ Build complete${NC}"
echo ""

# ─── Step 5: Start server ───────────────────────────────────────
echo -e " ${BOLD}[4/4] Starting server...${NC}"
echo ""
echo -e " ${GREEN}🚀 The server is running. Open the interface at:${NC}"
echo -e "    ${BOLD}${CYAN}http://localhost:3001${NC}"
echo ""

if [ "$IS_TERMUX" = false ]; then
  # Try to open browser (non-Termux only)
  if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3001" &> /dev/null &
  elif command -v open &> /dev/null; then
    open "http://localhost:3001" &> /dev/null &
  fi
fi

echo " Press Ctrl+C to stop the server."
echo " ──────────────────────────────────────────"
echo ""

exec node dist/server.js
