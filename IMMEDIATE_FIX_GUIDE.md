# 🚨 IMMEDIATE ACTION REQUIRED - Fix Login Issue

## The Problem
Your backend server is **CRASHING ON STARTUP** because environment variables are missing in Render.

## Quick Fix (5 minutes)

### Step 1: Get Your Supabase Credentials
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `vkqswulxmuuganmjqumb`
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL**: `https://vkqswulxmuuganmjqumb.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcXN3dWx4bXV1Z2FubWpxdW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODc3OTQsImV4cCI6MjA4MjM2Mzc5NH0.LsZKX2aThok0APCNXr9yQ8FnuJnIw6v8RsTIxVLFB4U`

### Step 2: Add Environment Variables in Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your service: `blockchain-evidence`
3. Click **Environment** tab
4. Add these **EXACT** variables:

```
SUPABASE_URL = https://vkqswulxmuuganmjqumb.supabase.co
SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcXN3dWx4bXV1Z2FubWpxdW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODc3OTQsImV4cCI6MjA4MjM2Mzc5NH0.LsZKX2aThok0APCNXr9yQ8FnuJnIw6v8RsTIxVLFB4U
NODE_ENV = production
PORT = 10000
ALLOWED_ORIGINS = https://blockchain-evidence.onrender.com
```

### Step 3: Deploy
1. Click **"Save and Redeploy"**
2. Wait 3-5 minutes for deployment

### Step 4: Test
Open your production site and try login - it should work!

## Verify Backend is Running
Open browser console and run:
```javascript
fetch('/api/health').then(r => r.json()).then(console.log)
// Should return: {status: "OK", timestamp: "..."}
```

## If Still Not Working
Check Render logs:
1. Go to your service in Render
2. Click **Logs** tab
3. Look for startup errors

**The login will work immediately after environment variables are set!** 🎉