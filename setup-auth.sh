#!/bin/bash
# ============================================================================
# MEDILINK - QUICK SETUP SCRIPT (macOS / Linux)
# ============================================================================
# This script sets up the authentication system
# Run: bash setup-auth.sh
# ============================================================================

echo "🏥 MediLink Authentication Setup"
echo "=================================="
echo ""

# Step 1: Check files exist
echo "✓ Checking files..."

files=(
  "Login_Register/Login.html"
  "Login_Register/Register.html"
  "Login_Register/auth-utils.js"
  "CREATE_TABLES.sql"
  "ADMIN_ONLY.sql"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file exists"
  else
    echo "  ✗ $file MISSING - Please create it first"
    exit 1
  fi
done

echo ""
echo "✓ All authentication files are ready!"
echo ""

# Step 2: Display next steps
echo "🚀 QUICK START GUIDE"
echo "===================="
echo ""
echo "Step 1: Create Database Tables"
echo "  1. Go to: https://app.supabase.com"
echo "  2. Select: Your MediLink project"
echo "  3. Click: SQL Editor → New Query"
echo "  4. Copy & paste: CREATE_TABLES.sql"
echo "  5. Click: Run"
echo "  Time: ~30 seconds"
echo ""

echo "Step 2: Create Admin Account"
echo "  1. Same SQL Editor"
echo "  2. New Query"
echo "  3. Copy & paste: ADMIN_ONLY.sql"
echo "  4. Click: Run"
echo "  Admin Email: admin@medilink.com"
echo "  Time: ~10 seconds"
echo ""

echo "Step 3: Test Login"
echo "  1. Open: file://$(pwd)/Login_Register/Login.html"
echo "  2. OR: Start dev server with 'npm run dev'"
echo "  3. Email: admin@medilink.com"
echo "  4. Password: Set via Supabase password reset"
echo ""

echo "Step 4: Create More Accounts"
echo "  1. Use: file://$(pwd)/Login_Register/Register.html"
echo "  2. OR: Admin dashboard (coming soon)"
echo ""

echo "📚 For more details, see: AUTHENTICATION_SYSTEM.md"
echo ""
echo "✓ Setup guide complete!"
