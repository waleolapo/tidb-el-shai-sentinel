@echo off

REM This script helps to set up and run the Micro-Farm AI Monitor application.
REM It will start both the Flask backend and the React frontend.

echo Starting Micro-Farm AI Monitor...

REM --- Backend Setup and Start ---
echo.
echo Setting up and starting backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python dependencies
if exist requirements.txt (
    echo Installing Python dependencies...
    pip install -r requirements.txt
)

REM Start Flask backend in the background
start /B python app.py
REM Note: Getting PID in Windows batch is complex and unreliable for background processes.
REM User will need to manually close the cmd window or use taskkill.
echo Flask backend started on http://127.0.0.1:5001

cd ..

REM --- Frontend Setup and Start ---
echo.
echo Setting up and starting frontend...
cd frontend

REM Install Node.js dependencies
if not exist node_modules (
    echo Installing Node.js dependencies...
    npm install
)

REM Start React frontend in the background
start /B npm start
REM Note: Getting PID in Windows batch is complex and unreliable for background processes.
REM User will need to manually close the cmd window or use taskkill.
echo React frontend started on http://localhost:3000

cd ..

echo.
echo Application started successfully!
echo Access the dashboard at: http://localhost:3000
echo Backend API is available at: http://127.0.0.1:5001
echo.
echo To stop the application, you will need to manually close the command prompt windows
echo that opened for the backend and frontend, or use Task Manager/taskkill to end the processes.
