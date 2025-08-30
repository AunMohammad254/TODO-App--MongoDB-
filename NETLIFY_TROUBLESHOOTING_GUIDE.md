# Netlify Deployment Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue 1: API Endpoints Return 404 Not Found

**Symptoms:**
- `/api/auth/login` returns 404 error
- `/api/auth/register` returns 404 error
- Authentication fails on deployed site

**Root Cause:**
Incorrect redirect configuration in `_redirects` file and `netlify.toml` using `:splat` pattern instead of specific function name.

**✅ Solution Applied:**

1. **Updated `app/public/_redirects`:**
   ```
   # Before (INCORRECT)
   /api/*  /.netlify/functions/:splat  200
   
   # After (CORRECT)
   /api/*  /.netlify/functions/api  200
   ```

2. **Updated `netlify.toml`:**
   ```toml
   # Before (INCORRECT)
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   
   # After (CORRECT)
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/api"
     status = 200
   ```

**Why This Works:**
- The serverless function is named `api.js` in `deployment/netlify/functions/`
- Netlify creates the function endpoint as `/.netlify/functions/api`
- The `:splat` pattern was not correctly mapping to the function name

---

### Issue 2: Content Security Policy Violations

**Symptoms:**
- Stylesheets fail to load with CSP errors
- Console shows: `Refused to load the stylesheet because it violates CSP directive`
- Missing `style-src-elem` directive causes fallback to restrictive `style-src`

**Root Cause:**
Missing `style-src-elem` directive in Content Security Policy configuration.

**✅ Solution Applied:**

1. **Updated CSP in `netlify.toml`:**
   ```toml
   # Added style-src-elem directive
   Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src-elem 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self' https://cluster0.xxothym.mongodb.net;"
   ```

2. **Updated CSP in serverless function (`deployment/netlify/functions/api.js`):**
   ```javascript
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
         styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
         styleSrcElem: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"], // Added this line
         fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
         imgSrc: ["'self'", "data:"],
         connectSrc: ["'self'", "https://cluster0.xxothym.mongodb.net"]
       }
     }
   }));
   ```

**Why This Works:**
- `style-src-elem` specifically controls `<link>` and `<style>` elements
- Without it, browsers fall back to the more restrictive `style-src` directive
- Adding explicit `style-src-elem` allows proper stylesheet loading

---

## 🔧 Deployment Checklist

### Pre-Deployment Verification

- [ ] **Environment Variables Set:**
  - `MONGO_URI` (with "Contains secret values" checked)
  - `JWT_SECRET` (with "Contains secret values" checked)
  - `NODE_ENV=production`
  - `NODE_VERSION=18`
  - `NPM_VERSION=9`

- [ ] **Build Configuration:**
  - Build command: `node deployment/scripts/build-netlify.js && npm run build`
  - Publish directory: `app/public`
  - Base directory: `.`
  - Functions directory: `deployment/netlify/functions`

- [ ] **File Structure Verification:**
  ```
  ✓ netlify.toml (in project root)
  ✓ app/public/_redirects
  ✓ deployment/netlify/functions/api.js
  ✓ app/public/index.html
  ✓ app/public/js/app.js
  ✓ app/public/css/style.css
  ```

### Post-Deployment Testing

1. **API Endpoints Test:**
   ```bash
   # Test health endpoint
   curl https://your-site.netlify.app/api/health
   
   # Test auth endpoints (should return validation errors, not 404)
   curl -X POST https://your-site.netlify.app/api/auth/register
   curl -X POST https://your-site.netlify.app/api/auth/login
   ```

2. **Frontend Test:**
   - Open browser developer tools
   - Navigate to your deployed site
   - Check Console for CSP errors (should be none)
   - Verify stylesheets load correctly
   - Test login/register functionality

---

## 🐛 Additional Troubleshooting

### Function Logs

To debug serverless function issues:

1. **Access Netlify Dashboard** → Your Site → Functions
2. **Click on `api` function** to view logs
3. **Check for errors** in function execution
4. **Look for environment variable issues**

### Common Error Patterns

**Error:** `Function not found`
- **Cause:** Incorrect function name in redirects
- **Solution:** Ensure redirects point to `/.netlify/functions/api`

**Error:** `Database connection failed`
- **Cause:** Missing or incorrect `MONGO_URI`
- **Solution:** Verify environment variable is set correctly

**Error:** `Invalid token`
- **Cause:** Missing or incorrect `JWT_SECRET`
- **Solution:** Verify environment variable is set correctly

**Error:** CSP violations
- **Cause:** Missing CSP directives
- **Solution:** Ensure both `style-src` and `style-src-elem` are configured

### Build Failures

**Error:** `Base directory does not exist`
- **Cause:** `netlify.toml` not in project root
- **Solution:** Ensure `netlify.toml` is in the repository root directory

**Error:** `Command failed with exit code 1`
- **Cause:** Build script errors or missing dependencies
- **Solution:** Test build locally with `node deployment/scripts/build-netlify.js`

---

## 📋 Quick Reference

### Correct File Configurations

**`app/public/_redirects`:**
```
/api/*  /.netlify/functions/api  200
/*    /index.html   200
```

**`netlify.toml` (key sections):**
```toml
[build]
  command = "node deployment/scripts/build-netlify.js && npm run build"
  publish = "app/public"
  base = "."

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200

[functions]
  directory = "deployment/netlify/functions"
```

### Environment Variables Template
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secure-jwt-secret-key-64-characters-minimum
NODE_ENV=production
NODE_VERSION=18
NPM_VERSION=9
```

---

## 🎯 Success Indicators

✅ **Deployment Successful When:**
- Build completes without errors
- API health endpoint returns 200 OK
- Authentication endpoints return validation errors (not 404)
- Stylesheets load without CSP violations
- Frontend can communicate with backend
- Database connections work properly

---

**Last Updated:** January 2025  
**Status:** Issues Resolved ✅