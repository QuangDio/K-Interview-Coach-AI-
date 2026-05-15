@echo off
cd /d "%~dp0backend"
echo Starting AI Interview Prep Coach API at http://127.0.0.1:8000/
echo Install dependencies first if needed: python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
