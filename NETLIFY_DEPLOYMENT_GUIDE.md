# Netlify Deployment Guide

## Issue Resolution

The "Base directory does not exist: /opt/build" error has been resolved by:

1. ✅ **Moved `netlify.toml` to project root** - Netlify expects this file in the repository root
2. ✅ **Added `_redirects` to `app/public`** - Required for SPA routing and API redirects
3. ✅ **Verified build scripts work locally** - Both build script and npm build command execute successfully
4. ✅ **Confirmed all required files exist** - Static files, serverless functions, and assets are in place

## Deployment Configuration

### Netlify Dashboard Settings

**Build Settings:**
- Build command: `node deployment/scripts/build-netlify.js && npm run build`
- Publish directory: `app/public`
- Base directory: `.` (project root)

**Environment Variables (Required):**
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_VERSION=18
NPM_VERSION=9
```

### File Structure Verification

```
project-root/
├── netlify.toml                    # ✅ Netlify configuration (moved to root)
├── app/
│   └── public/
│       ├── _redirects              # ✅ SPA routing rules
│       ├── index.html              # ✅ Main HTML file
│       ├── css/style.css           # ✅ Styles
│       ├── js/app.js               # ✅ Frontend JavaScript
│       ├── favicon.ico             # ✅ Favicon
│       └── assets/
│           └── icon.svg            # ✅ App icon
└── deployment/
    ├── scripts/
    │   └── build-netlify.js         # ✅ Build script
    └── netlify/
        └── functions/
            └── api.js               # ✅ Serverless function
```

## Build Process

The build process now:
1. Runs the pre-build script to verify all files exist
2. Executes `npm install` to ensure dependencies are available
3. Confirms the build completion
4. Netlify will then deploy the `app/public` directory
5. Serverless functions from `deployment/netlify/functions/` will be deployed automatically

## Testing Locally

Before deploying, you can test the build process:

```bash
# Test the build script
node deployment/scripts/build-netlify.js

# Test the npm build command
npm run build
```

Both commands should complete successfully without errors.

## Deployment Steps

1. **Push changes to your repository** (ensure `netlify.toml` is in the root)
2. **Connect repository to Netlify**
3. **Configure build settings** as specified above
4. **Set environment variables** in Netlify dashboard
5. **Deploy**

## Troubleshooting

If you encounter issues:

1. **Verify file locations** - Ensure `netlify.toml` is in project root
2. **Check build logs** - Look for missing files or dependency issues
3. **Test locally** - Run build commands locally first
4. **Environment variables** - Ensure all required variables are set in Netlify

## API Endpoints

Once deployed, your API will be available at:
- `https://your-site.netlify.app/api/health` - Health check
- `https://your-site.netlify.app/api/auth/*` - Authentication endpoints
- `https://your-site.netlify.app/api/tasks/*` - Task management endpoints

The serverless function handles all API routes and includes proper CORS, security headers, and rate limiting.