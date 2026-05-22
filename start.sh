#!/bin/bash
# SereneMind — Start all services
# Usage: ./start.sh

echo ""
echo "[Start] Starting SereneMind..."
echo ""

# Add PostgreSQL to PATH
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

# Ensure PostgreSQL is running
echo "[DB] Checking PostgreSQL..."
brew services start postgresql@16 2>/dev/null || true
sleep 1

# Ensure database exists
createdb serenemind 2>/dev/null || true

# Start the backend API server
echo "[API] Starting backend API (port 3001)..."
cd "$(dirname "$0")/server" && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start the frontend
echo "[UI] Starting Next.js frontend (port 3000)..."
cd "$(dirname "$0")/client" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "[Success] SereneMind is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all services."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Stopped.'; exit 0" INT
wait
