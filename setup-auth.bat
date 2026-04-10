@echo off
REM ============================================================================
REM MEDILINK - QUICK SETUP SCRIPT (Windows PowerShell)
REM ============================================================================
REM This script sets up the authentication system
REM Run: setup-auth.ps1 or double-click this file
REM ============================================================================

echo.
echo ==============================================================
echo   Hospital MediLink Authentication Setup
echo ==============================================================
echo.

REM Step 1: Check files exist
echo Checking authentication files...
echo.

setlocal enabledelayedexpansion
set "files=Login_Register\Login.html;Login_Register\Register.html;Login_Register\auth-utils.js;CREATE_TABLES.sql;ADMIN_ONLY.sql"

for %%F in (%files%) do (
    if exist "%%F" (
        echo   [OK] %%F
    ) else (
        echo   [ERROR] %%F is MISSING
        exit /b 1
    )
)

echo.
echo All files are ready!
echo.

REM Step 2: Display setup instructions
echo.
echo ==============================================================
echo   QUICK START GUIDE (5 minutes to get started)
echo ==============================================================
echo.

echo STEP 1: Create Database Tables
echo --------------------------------
echo 1. Go to: https://app.supabase.com
echo 2. Select: Your MediLink project
echo 3. Click: SQL Editor ^> New Query
echo 4. Copy content from: CREATE_TABLES.sql
echo 5. Paste into SQL Editor and click: Run
echo Time Required: ~30 seconds
echo.

echo STEP 2: Create Admin Account
echo ----------------------------
echo 1. Same SQL Editor, click: New Query
echo 2. Copy content from: ADMIN_ONLY.sql
echo 3. Paste and click: Run
echo Admin Email: admin@medilink.com
echo Time Required: ~10 seconds
echo.

echo STEP 3: Test Login
echo -----------------
echo 1. Open file: Login_Register\Login.html in browser
echo    OR run: npm run dev
echo 2. Admin Email: admin@medilink.com
echo 3. Password: You'll need to set this via:
echo    - Supabase dashboard password reset, OR
echo    - First login (Supabase will guide you)
echo.

echo STEP 4: Create Patient/Doctor Accounts
echo ----------------------------------------
echo 1. Use: Login_Register\Register.html
echo 2. Fill form with role (Patient/Doctor)
echo 3. Account will be pending admin approval
echo 4. Admin approves in Admin Dashboard
echo.

echo.
echo ==============================================================
echo   DOCUMENTATION
echo ==============================================================
echo.
echo Full Guide: AUTHENTICATION_SYSTEM.md
echo Functions Reference: Login_Register/auth-utils.js
echo SQL Tables: CREATE_TABLES.sql
echo Admin Account: ADMIN_ONLY.sql
echo.

echo ==============================================================
echo   Setup Complete!
echo ==============================================================
echo.
echo Next: Go to https://app.supabase.com and run SQL queries
echo.

pause
