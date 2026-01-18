@echo off
echo ================================================
echo    Professional Music Visualizer
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
echo Checking dependencies...
python -c "import pygame, librosa, cv2, PyQt5" >nul 2>&1
if errorlevel 1 (
    echo.
    echo Dependencies not found. Installing...
    echo.
    pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting Music Visualizer...
echo.

REM Run the application
python main.py

if errorlevel 1 (
    echo.
    echo ERROR: Application exited with an error
    pause
)
