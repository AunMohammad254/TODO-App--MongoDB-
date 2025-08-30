# 🚨 CRITICAL: Netlify Environment Variables Setup Guide

## ⚠️ URGENT: 500 Internal Server Error Fix

If you're getting **500 Internal Server Error** on `/api/auth/login`, this is **MOST LIKELY** due to missing environment variables in your Netlify deployment.

## 🔧 Required Environment Variables

Your serverless function **REQUIRES** these environment variables to function:

### 1. MONGO_URI (CRITICAL)
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxothym.mongodb.net/todoapp?retryWrites=true&w=majority
```

### 2. JWT_SECRET (CRITICAL)
```
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-64-characters-long
```

### 3. Additional Variables (Recommended)
```
NODE_ENV=production
NODE_VERSION=18
NPM_VERSION=9
```

## 📋 Step-by-Step Netlify Setup

### Step 1: Access Netlify Dashboard
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your deployed site
3. Navigate to **Site settings** → **Environment variables**

### Step 2: Add Environment Variables

**For MONGO_URI:**
1. Click **Add a variable**
2. **Key:** `MONGO_URI`
3. **Value:** Your MongoDB connection string
4. **✅ IMPORTANT:** Check **"Contains secret values"**
5. Click **Create variable**

**For JWT_SECRET:**
1. Click **Add a variable**
2. **Key:** `JWT_SECRET`
3. **Value:** Your JWT secret (64+ characters)
4. **✅ IMPORTANT:** Check **"Contains secret values"**
5. Click **Create variable**

**For NODE_ENV:**
1. Click **Add a variable**
2. **Key:** `NODE_ENV`
3. **Value:** `production`
4. Leave **"Contains secret values"** unchecked
5. Click **Create variable**

### Step 3: Redeploy
After adding environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

## 🔍 How to Verify Environment Variables

### Method 1: Check Function Logs
1. Go to **Functions** tab in Netlify dashboard
2. Click on **api** function
3. Check the logs for:
   - ✅ "Database initialized for serverless function"
   - ❌ "MONGO_URI environment variable is required"
   - ❌ "JWT_SECRET environment variable is required"

### Method 2: Test Health Endpoint
Visit: `https://your-site.netlify.app/api/health`

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-20T...",
  "environment": "production"
}
```

## 🚨 Common Mistakes

### ❌ Mistake 1: Not Checking "Contains secret values"
- **Problem:** Sensitive values visible in build logs
- **Solution:** Always check this for `MONGO_URI` and `JWT_SECRET`

### ❌ Mistake 2: Wrong MongoDB Connection String
- **Problem:** Database connection fails
- **Solution:** Ensure your MongoDB Atlas cluster allows Netlify IPs (0.0.0.0/0)

### ❌ Mistake 3: Forgetting to Redeploy
- **Problem:** Environment variables not applied
- **Solution:** Always trigger a new deployment after adding variables

### ❌ Mistake 4: Using Development Values
- **Problem:** Wrong database or insecure secrets
- **Solution:** Use production MongoDB cluster and secure JWT secret

## 🔐 Security Best Practices

### MongoDB Atlas Setup
1. **Network Access:** Add `0.0.0.0/0` to IP whitelist for Netlify
2. **Database User:** Create dedicated user with minimal permissions
3. **Connection String:** Use SRV format with SSL enabled

### JWT Secret Generation
```bash
# Generate secure JWT secret (64 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🧪 Testing After Setup

### 1. Test Health Endpoint
```bash
curl https://your-site.netlify.app/api/health
```

### 2. Test Authentication (Should Return Validation Error, Not 500)
```bash
curl -X POST https://your-site.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response (NOT 500 error):**
```json
{
  "error": "Validation failed",
  "details": [...]
}
```

### 3. Test with Valid Credentials
```bash
curl -X POST https://your-site.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

## 🆘 Still Getting 500 Errors?

### Check Function Logs
1. Netlify Dashboard → Functions → api → View logs
2. Look for specific error messages:
   - `MONGO_URI environment variable is required`
   - `JWT_SECRET environment variable is required`
   - `Database connection failed`
   - MongoDB connection errors

### Common Error Messages

**"MONGO_URI environment variable is required"**
- ✅ **Fix:** Add `MONGO_URI` environment variable in Netlify

**"JWT_SECRET environment variable is required"**
- ✅ **Fix:** Add `JWT_SECRET` environment variable in Netlify

**"Database connection failed"**
- ✅ **Fix:** Check MongoDB Atlas network access and connection string

**"MongoNetworkError"**
- ✅ **Fix:** Add `0.0.0.0/0` to MongoDB Atlas IP whitelist

## 📞 Emergency Checklist

If authentication is completely broken:

- [ ] ✅ Environment variables added to Netlify
- [ ] ✅ "Contains secret values" checked for secrets
- [ ] ✅ Site redeployed after adding variables
- [ ] ✅ MongoDB Atlas allows Netlify connections (0.0.0.0/0)
- [ ] ✅ Health endpoint returns 200 OK
- [ ] ✅ Function logs show "Database initialized"
- [ ] ✅ No CSP violations in browser console

---

**Last Updated:** January 2025  
**Priority:** 🚨 CRITICAL - Required for authentication to work