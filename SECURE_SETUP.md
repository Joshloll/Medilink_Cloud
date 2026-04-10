# MediLink Secure Setup - YOUR PROJECT

**Project Name**: Medilink_CloudComputing  
**Status**: ✅ Ready for Secure Configuration  

---

## 🚀 QUICK START (Replace hardcoded credentials with env vars)

### STEP 1: Create Local .env File

In your project root (`c:\Users\lawre\Medilink_Cloud\`), create a file named `.env`:

```bash
# Windows PowerShell:
Copy-Item .env.example .env

# Or manual: Create new file .env in root directory
```

### STEP 2: Add Your Credentials

Open `.env` and fill in your actual values:

```env
# Your Supabase Project URL
VITE_SUPABASE_URL=https://nikaxyvnuzjegajlvzjt.supabase.co

# Your Supabase Anon Key (PUBLIC key only - safe to expose)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pa2F4eXZudXpqZWdhamx2emp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDI5ODYsImV4cCI6MjA5MTMxODk4Nn0.g2gmieL5K3pCdVDRUeKuEX76zdQZhUj_FymFjcwvtdY
```

### STEP 3: Verify .gitignore

Check that `.gitignore` contains `.env`:

```bash
# In PowerShell:
Get-Content .gitignore | Select-String "\.env"

# Should output: .env
```

### STEP 4: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev

# Or if using plain HTML:
# Just refresh browser (hard refresh: Ctrl+Shift+R)
```

### ✅ STEP 5: Verify Success

Check browser console (F12 → Console tab):

```
✓ Supabase client initialized successfully
✓ Project: nikaxyvnutjegajlvzjt
```

**If you see errors:**
- Check .env file exists in project root
- Verify no extra space in keys
- Restart browser completely
- Try hard refresh: Ctrl+Shift+R

---

## 📝 YOUR CREDENTIALS SUMMARY

| Value | Your Entry |
|-------|-----------|
| **Project URL** | https://nikaxyvnuzjegajlvzjt.supabase.co |
| **Anon Key** | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pa2F4eXZudXpqZWdhamx2emp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDI5ODYsImV4cCI6MjA5MTMxODk4Nn0.g2gmieL5K3pCdVDRUeKuEX76zdQZhUj_FymFjcwvtdY |
| **Environment** | development (your .env file) |

---

## 🔒 SECURITY CHECKLIST - LOCAL SETUP

- [ ] `.env` file created in project root
- [ ] `.env` added to `.gitignore` (already done)
- [ ] Credentials filled into `.env`
- [ ] `.env.example` has NO real secrets (already correct)
- [ ] `.env` is NOT committed to git
- [ ] Dev server restarted after creating `.env`
- [ ] Browser console shows "✓ Supabase client initialized"
- [ ] No credentials visible in source code
- [ ] No credentials visible in browser console
- [ ] LocalStorage has no credentials

---

## 🚀 DEPLOYING TO PRODUCTION

### For Vercel (Recommended)

**Step 1: Push Code to GitHub**
```bash
git add .
git commit -m "Secure Supabase credentials config"
git push origin main
```
⚠️ Make sure `.env` is NOT in the commit

**Step 2: Add Environment Variables to Vercel**
1. Go: https://vercel.com → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Add these **two** variables:

```
Name: VITE_SUPABASE_URL
Value: https://nikaxyvnuzjegajlvzjt.supabase.co
Environments: Production, Preview, Development
✓ Add to .env.local when downloading

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pa2F4eXZudXpqZWdhamx2emp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDI5ODYsImV4cCI6MjA5MTMxODk4Nn0.g2gmieL5K3pCdVDRUeKuEX76zdQZhUj_FymFjcwvtdY
Environments: Production, Preview, Development
✓ Add to .env.local when downloading
```

**Step 3: Redeploy**
```bash
# In Vercel Dashboard, click "Redeploy"
# Or push new commit to trigger auto-deploy
```

### For Netlify

**Step 1: Push Code to GitHub**
```bash
git add .
git commit -m "Secure Supabase credentials config"
git push origin main
```

**Step 2: Add Environment Variables to Netlify**
1. Go: https://app.netlify.com → Your Site → Site Settings → Build & Deploy
2. Scroll to "Environment" → Click "Edit variables"
3. Add these **two** variables:

```
VITE_SUPABASE_URL = https://nikaxyvnuzjegajlvzjt.supabase.co

VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pa2F4eXZudXpqZWdhamx2emp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDI5ODYsImV4cCI6MjA5MTMxODk4Nn0.g2gmieL5K3pCdVDRUeKuEX76zdQZhUj_FymFjcwvtdY
```

**Step 3: Trigger Redeploy**
- Push new commit or manually trigger in Netlify

---

## 🔐 VERIFY IT WORKED

### Check 1: Credentials Not in Code
```bash
# PowerShell
@("*.js", "*.html", "*.ts") | % {
  Get-ChildItem -r -Filter $_ | Select-String "nikaxyvnuzjegajlvzjt|eyJhbGciOiJ" | 
    Where-Object { $_ -notmatch ".env.example" }
}

# Output should be EMPTY (no results)
```

### Check 2: .env Not in Git
```bash
# PowerShell
git ls-files | Select-String ".env"

# Output should be EMPTY (no results)
```

### Check 3: Supabase Connected
```javascript
// Open browser console (F12)
// Type:
window.supabaseClient

// Should show client object, not undefined
```

---

## ⚠️ IMPORTANT SECURITY NOTES

### What is the ANON KEY?
- **Public** - Safe to expose in frontend code
- **Limited** - Row Level Security (RLS) controls access
- **Project-specific** - Only accesses your Supabase project

### What about the Service Role Key?
- **Secret** - Never put in frontend
- **Full access** - Bypasses all RLS policies
- **Backend only** - Use in Node.js/Python backends
- **Rotate** - If accidentally exposed

### Credential Exposure Timeline
If anon key exposed:
1. Minutes: Automated scanners find it
2. Hours: Unauthorized access begins (limited by RLS)
3. Days: Data exfiltration (if RLS misconfigured)
4. Weeks: Business impact if not discovered

**Therefore:**
- ✅ Always use RLS on all tables
- ✅ Rotate credentials every 90 days
- ✅ Monitor Supabase access logs
- ✅ Set up alerts for unusual activity

---

## 🛠️ FILE LOCATIONS

```
c:\Users\lawre\Medilink_Cloud\
├─ .env                          ← YOUR CREDENTIALS (NOT COMMITTED)
├─ .env.example                  ← TEMPLATE (in git)
├─ .gitignore                    ← INCLUDES .env (in git)
├─ js/
│  └─ supabase-client.js         ← READS FROM .env (in git)
├─ SECURITY_GUIDE.md             ← THIS GUIDE
└─ ...
```

---

## ✅ SUCCESS INDICATORS

### Local Development
```
✓ .env file created
✓ Credentials filled in
✓ Dev server running
✓ Browser console shows initialization success
✓ HTML pages load normally
✓ No errors about missing credentials
```

### After Deployment
```
✓ Code pushed without .env
✓ Environment variables set in platform
✓ Application deployed successfully
✓ Application initializes correctly
✓ Database queries work
✓ No credentials visible in network requests
```

---

## 🆘 TROUBLESHOOTING

### Issue: "Supabase configuration is missing"

**Cause**: .env file not found or credentials not filled

**Fix**:
```bash
# Check .env exists
Test-Path .env

# If False, create it:
Copy-Item .env.example .env

# Edit with your values
notepad .env

# Restart dev server
```

### Issue: "Supabase library not loaded"

**Cause**: CDN script not in HTML

**Fix**: Add to your HTML `<head>`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Issue: Environment variables not loading in production

**Cause**: Variables not set in hosting platform

**Fix**:
1. Go to hosting platform settings
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Use exact names with `VITE_` prefix
4. Redeploy application

### Issue: CORS errors from browser

**Cause**: Domain not in Supabase CORS whitelist

**Fix**:
1. Go: Supabase → Settings → API → CORS
2. Add your domain: `https://yourdomain.com` or `http://localhost:3000`
3. Save and redeploy

---

## 📞 SUPPORT

For issues:
1. Check [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) for detailed documentation
2. Review browser console (F12 → Console tab) for errors
3. Check Supabase dashboard for project status
4. Verify credentials format (no extra spaces/quotes)

---

## ✨ NEXT STEPS

1. ✅ Follow "QUICK START" above
2. ✅ Verify credentials are working (check success indicators)
3. ✅ Proceed with [SUPABASE_INTEGRATION_GUIDE.md](./SUPABASE_INTEGRATION_GUIDE.md)
4. ✅ Set up Row Level Security in Supabase
5. ✅ Deploy to production with environment variables
6. ✅ Monitor access logs regularly
7. ✅ Rotate credentials every 90 days

---

**Status**: 🟢 Ready for Secure Configuration  
**Last Updated**: April 10, 2026  
**Next Credential Rotation**: July 10, 2026
