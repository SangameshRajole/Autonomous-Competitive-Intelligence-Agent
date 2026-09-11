@echo off
echo ========================================
echo   Starting Price Tracker Application
echo ========================================
echo.

echo [1/3] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd server && node index.js"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Python Scraper (Port 5001)...
start "Python Scraper" cmd /k "cd scraper && python scraper_service.py"
timeout /t 3 /nobreak >nul

echo [3/3] Starting React Frontend (Port 3000)...
start "React Frontend" cmd /k "cd client && npm start"

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo   Backend:  http://localhost:5000
echo   Scraper:  http://localhost:5001
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
