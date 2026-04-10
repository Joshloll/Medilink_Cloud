# 📌 QUICK REFERENCE CARD - MediLink Security Setup

**Print this or keep it open while you work!**

---

## 🔴 DO THIS RIGHT NOW (10 min)

```powershell
# Step 1: Create credentials file
.\setup-credentials.ps1

# Step 2: Start dev server
npm run dev

# Step 3: Check browser console
# Press F12 → Look for: ✓ Supabase client initialized successfully
```

---

## 🟢 THEN DO THIS (5 min)

Copy & paste each into browser console (F12 → Console tab):

```javascript
// Test 1: Client exists?
console.log(supabaseClient)
// Shows: Object { project_id: "nikaxyvnuzjegajlvzjt", ... }

// Test 2: Auth works?
supabaseClient.auth.getSession().then(d => console.log("Session:", d?.data?.session))

// Test 3: Database reachable?
supabaseClient.from('users').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) console.log("Database ready (RLS error expected):", error.message)
    else console.log("Database OK, count:", count)
  })
```

---

## 🔵 IMPORTANT FILES (Bookmark these)

| File | What It Does | When to Use |
|------|-------------|-----------|
| ROADMAP.md | Master overview | Start here |
| IMPLEMENTATION_CHECKLIST.md | Today's tasks | First time setup |
| VERIFICATION_GUIDE.md | 7 automated tests | Verify everything works |
| SECURE_SETUP.md | Your credentials (pre-filled) | Local & production setup |
| SECURITY_GUIDE.md | Full reference (600+ lines) | When you have questions |
| COMPLETION_SUMMARY.md | What was created | Overview document |

---

## 🟡 YOUR CREDENTIALS

**Pre-filled in SECURE_SETUP.md:**

```
URL: https://nikaxyvnuzjegajlvzjt.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Use .env template:**
```
VITE_SUPABASE_URL=https://nikaxyvnuzjegajlvzjt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci... (fill in from SECURE_SETUP.md)
```

---

## ⚠️ CRITICAL: DO NOT

- ❌ Commit .env to git
- ❌ Share .env file
- ❌ Paste credentials in code
- ❌ Use anyone else's .env
- ❌ Expose in console logs
- ❌ Store in public repos

---

## ✅ DO THIS

- ✅ Use environment variables
- ✅ Use .env template
- ✅ Add .env to .gitignore (already done)
- ✅ Rotate credentials every 90 days (July 10, 2026)
- ✅ Never commit .env file

---

## 🚨 IF ERRORS APPEAR

| Error | Fix |
|-------|-----|
| "Configuration missing" | Run setup script again, verify .env exists |
| "VITE_SUPABASE_URL undefined" | Check .env file has exact key names |
| "Fetch failed" | Check internet, verify Supabase is online |
| "Port already in use" | Kill other processes with `npm run dev` |
| "Cannot find module" | Run `npm install` |

**Still stuck?** → See IMPLEMENTATION_CHECKLIST.md → Troubleshooting

---

## 👉 NEXT STEPS AFTER TODAY

1. **Phase 2** (This week) → Set up Row Level Security
   - SECURITY_GUIDE.md → Row Level Security section
   - Takes ~30 minutes

2. **Phase 3** (This week) → Configure CORS
   - SECURITY_GUIDE.md → CORS Configuration section
   - Takes ~20 minutes

3. **Phase 4** (This week) → Deploy to production
   - SECURE_SETUP.md → Deployment sections
   - Takes ~30 minutes

---

## 📞 COMMAND CHEAT SHEET

```powershell
# Setup (Windows)
.\setup-credentials.ps1

# Setup (macOS/Linux)
./setup-credentials.sh

# Develop
npm run dev

# Check internet (debug)
Test-NetConnection -ComputerName supabase.co

# Check ports
Get-NetTCPConnection -State LISTEN | Where-Object {$_.LocalPort -eq 5173}

# Clear cache & hard refresh
# In browser: Ctrl+Shift+Delete → Select all → Clear now
# Then: Ctrl+Shift+R (hard refresh)
```

---

## 🎯 TODAY'S TIMELINE

| Time | Task | Status |
|------|------|--------|
| **NOW** | Run setup script | 2 min |
| **+2 min** | Start dev server (npm run dev) | 2 min ✅ |
| **+4 min** | Check browser console | 1 min ✅ |
| **+5 min** | Run Test 1 (client exists) | 1 min ✅ |
| **+6 min** | Run Test 2 (auth works) | 1 min ✅ |
| **+7 min** | Run Test 3 (db reachable) | 1 min ✅ |
| **+8 min** | Run VERIFICATION_GUIDE.md checks | 2-5 min ✅ |
| **~15 min** | **DONE** - Proceed to Phase 2 | ✅ |

---

## 📊 QUICK STATUS CHECK

### Verify these are in place:

```powershell
# Check .env exists
Test-Path .env  # Should show: True

# Check .gitignore protects .env
Select-String -Path .gitignore -Pattern "\.env"  # Should show: .env

# Check supabase-client.js has env vars (not hardcoded)
Select-String -Path js/supabase-client.js -Pattern "import.meta.env"  # Should find results

# Verify dev server responds
curl http://localhost:5173  # Should work
```

---

## 🎓 KEY CONCEPTS

**Environment Variables:**
- Store secrets outside code
- Vite reads from: VITE_* prefix
- Never hardcoded
- Different for each environment

**4-Method Fallback:**
1. `import.meta.env.VITE_SUPABASE_URL` (Vite)
2. `process.env.VITE_SUPABASE_URL` (Node.js)
3. `window.__CONFIG__.supabaseUrl` (Runtime injection)
4. Secure endpoint placeholder (Future)

**Security Layers:**
1. Environment variables (never in code)
2. .gitignore (prevents commits)
3. .env file (local only, never shared)
4. Validation (errors caught early)
5. Error messages (clear guidance)

---

## 📱 MOBILE-FRIENDLY VERSION

**Just need the essentials?**

```
SETUP:
1. .\setup-credentials.ps1
2. npm run dev
3. Check console: F12

TEST:
1. Browser console: typeof supabaseClient
2. Browser console: supabaseClient.auth.getSession()

VERIFY:
1. No errors in console
2. Supabase client object visible
3. Auth query works
4. Database test completes

RESULT:
✅ Ready for Phase 2
```

---

## 🆘 EMERGENCY RESET

If everything breaks:

```powershell
# Step 1: Stop dev server (Ctrl+C)

# Step 2: Delete .env and recreate
Remove-Item .env
cp .env.example .env
# Edit .env and fill in credentials from SECURE_SETUP.md

# Step 3: Clear npm cache
npm cache clean --force

# Step 4: Reinstall dependencies
rm node_modules -r
npm install

# Step 5: Start fresh
npm run dev

# Step 6: Hard refresh browser
# Ctrl+Shift+Delete → Clear all cache
# Then reload page

# Step 7: Check console again
# F12 → Console tab
```

---

## 📍 DOCUMENT LOCATIONS

```
workspace/
├── ROADMAP.md (master overview)
├── COMPLETION_SUMMARY.md (this session's work)
├── IMPLEMENTATION_CHECKLIST.md ← TODAY'S TASKS
├── VERIFICATION_GUIDE.md ← TEST EVERYTHING
├── SECURE_SETUP.md (has YOUR credentials)
├── SECURITY_GUIDE.md (full reference)
├── .env (YOUR credentials, never commit)
├── .env.example (template, safe to commit)
├── .gitignore (protects secrets)
├── setup-credentials.ps1 (windows automation)
├── setup-credentials.sh (unix automation)
└── js/supabase-client.js (refactored code)
```

---

## ⏰ TIME REMAINING

- **Minutes to setup:** ~10 min
- **Minutes to verify:** ~5 min
- **Hours to Phase 2:** ~1 hour (Row Level Security)
- **Hours to Phase 3:** +0.5 hours (CORS)
- **Hours to Phase 4:** +0.5 hours (Deploy)

**Total to production:** ~2 hours

---

**🚀 READY? START HERE:**

```powershell
.\setup-credentials.ps1
```

**Then:** `npm run dev` and check console

**Questions?** Open ROADMAP.md or IMPLEMENTATION_CHECKLIST.md

---

**Bookmark this file! You'll reference it multiple times today.** 📌
