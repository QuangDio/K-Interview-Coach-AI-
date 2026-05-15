@echo off
cd /d "%~dp0"
echo Starting AI Interview Prep Coach at http://localhost:5173/
echo Keep this window open while using the app.
start "" "http://localhost:5173/"
python -m http.server 5173 --bind 127.0.0.1
pause
