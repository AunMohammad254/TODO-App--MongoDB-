# Netlify Deployment Guide

This guide will help you deploy the Personal Task Manager application to Netlify.

## Prerequisites

1. **MongoDB Atlas Account**: Set up a MongoDB Atlas cluster and get your connection string
2. **Netlify Account**: Sign up for a free Netlify account
3. **GitHub Repository**: Push your code to a GitHub repository

## Deployment Steps

### 1. Prepare Your Repository

Ensure all the following files are committed to your repository:
- `netlify.toml` - Netlify configuration
- `_redirects` - URL redirect rules
- `netlify/functions/api.js` - Serverless function for API
- `build-netlify.js` - Build script
- `.env.example` - Environment variables template

### 2. Connect to Netlify

1. Log in to your Netlify dashboard
2. Click "New site from Git"
3. Choose GitHub and authorize Netlify
4. Select your repository

### 3. Configure Build Settings

Netlify should automatically detect the settings from `netlify.toml`, but verify:

- **Build command**: `node build-netlify.js && npm run build`
- **Publish directory**: `public`
- **Base directory**: (leave empty or set to root)

### 4. Set Environment Variables

In your Netlify site dashboard, go to Site settings > Environment variables and add:

```
NODE_ENV=production
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-jwt-secret-64-characters-long
JWT_EXPIRATION=7d
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000
CORS_ORIGIN=https://your-site-name.netlify.app
```

### 5. Deploy

1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be available at `https://your-site-name.netlify.app`

## Troubleshooting

### Common Issues

1. **Build fails with "Base directory does not exist"**
   - Ensure `netlify.toml` is in the root of your repository
   - Check that the base directory is set correctly (should be "." or empty)

2. **API calls fail**
   - Verify environment variables are set correctly
   - Check that MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
   - Ensure CORS_ORIGIN matches your Netlify domain

3. **Functions not working**
   - Check that `netlify/functions/api.js` exists
   - Verify all dependencies are listed in `package.json`
   - Check function logs in Netlify dashboard

### MongoDB Atlas Setup

1. Create a cluster in MongoDB Atlas
2. Create a database user with read/write permissions
3. Add your connection string to environment variables
4. Whitelist all IP addresses (0.0.0.0/0) for Netlify functions

### Security Considerations

- Use strong, unique JWT secrets
- Regularly rotate your MongoDB credentials
- Monitor your application logs for suspicious activity
- Keep dependencies updated

## Custom Domain (Optional)

1. In Netlify dashboard, go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Update CORS_ORIGIN environment variable with your custom domain

## Monitoring

- Use Netlify Analytics to monitor site performance
- Check function logs for API errors
- Monitor MongoDB Atlas for database performance

## Support

If you encounter issues:
1. Check Netlify build logs
2. Review function logs in Netlify dashboard
3. Verify environment variables are set correctly
4. Test API endpoints using the health check: `/api/health`