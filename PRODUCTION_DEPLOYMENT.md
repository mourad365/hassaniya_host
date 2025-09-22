# Production Deployment Guide - Hassaniya Host

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.production` and configure with actual production values
- [ ] Verify all required environment variables are set
- [ ] Test Supabase connection with production database
- [ ] Verify Bunny CDN credentials and test file uploads
- [ ] Test Facebook integration (if used)

### 2. Security Verification
- [ ] Run `npm run audit:security` to check for vulnerabilities
- [ ] Verify all sensitive data is properly sanitized
- [ ] Test authentication flows and admin access controls
- [ ] Verify CORS settings are correctly configured
- [ ] Check CSP headers are working properly

### 3. Performance Optimization
- [ ] Run `npm run build:prod` to create optimized production build
- [ ] Test bundle size with `npm run analyze`
- [ ] Verify code splitting is working correctly
- [ ] Test loading performance with production build
- [ ] Optimize images and media assets

### 4. Database Configuration
- [ ] Run final database migration if needed
- [ ] Verify RLS (Row Level Security) policies are active
- [ ] Test admin user creation and permissions
- [ ] Backup production database
- [ ] Set up database monitoring

## Deployment Steps

### Option 1: Netlify Deployment

1. **Setup Netlify Account**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Configure Build Settings**
   - Build command: `npm run build:prod`
   - Publish directory: `dist`
   - Node version: `18` or higher

3. **Set Environment Variables**
   Go to Site Settings > Environment Variables and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BUNNY_CDN_URL`
   - `VITE_BUNNY_STORAGE_API_KEY`
   - `VITE_BUNNY_STORAGE_ZONE`
   - `VITE_BUNNY_VIDEO_LIBRARY_ID`
   - `VITE_BUNNY_VIDEO_CDN_HOSTNAME`
   - `VITE_BUNNY_VIDEO_API_KEY`
   - `NODE_ENV=production`

4. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Option 2: Vercel Deployment

1. **Setup Vercel Account**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Configure Project**
   ```bash
   vercel
   # Follow prompts to configure project
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   # Add all other environment variables
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 3: Custom Server/VPS

1. **Install Dependencies**
   ```bash
   # On server
   npm install
   ```

2. **Build Production Assets**
   ```bash
   npm run build:prod
   ```

3. **Setup Web Server (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       # SSL Configuration
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       # Security Headers
       add_header X-Frame-Options DENY always;
       add_header X-Content-Type-Options nosniff always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
       
       # Serve static files
       location / {
           root /path/to/dist;
           try_files $uri $uri/ /index.html;
           
           # Cache static assets
           location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
               expires 1y;
               add_header Cache-Control "public, immutable";
           }
       }
   }
   ```

## Post-Deployment Verification

### 1. Functionality Tests
- [ ] Test user registration and login
- [ ] Verify admin panel access and functionality
- [ ] Test content upload and management
- [ ] Verify video playback with Bunny CDN
- [ ] Test image loading and optimization
- [ ] Check social media integration

### 2. Security Tests
- [ ] Verify HTTPS is enforced
- [ ] Check security headers are present
- [ ] Test CSP is not blocking legitimate resources
- [ ] Verify authentication redirects work correctly
- [ ] Test file upload restrictions

### 3. Performance Tests
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Test loading speed on mobile and desktop
- [ ] Verify lazy loading is working
- [ ] Check bundle sizes are optimized
- [ ] Test CDN asset delivery

### 4. SEO and Accessibility
- [ ] Verify meta tags are correct
- [ ] Test Arabic text rendering
- [ ] Check keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Test on multiple browsers and devices

## Monitoring and Maintenance

### 1. Setup Monitoring
- [ ] Configure uptime monitoring
- [ ] Set up error tracking (consider Sentry)
- [ ] Monitor database performance
- [ ] Track CDN usage and costs
- [ ] Set up backup procedures

### 2. Regular Maintenance
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Database cleanup and optimization
- [ ] CDN cache management
- [ ] Performance monitoring reviews

## Emergency Procedures

### Database Issues
1. Check Supabase dashboard for service status
2. Verify connection strings and API keys
3. Check RLS policies if data access issues
4. Contact Supabase support if needed

### CDN Issues
1. Check Bunny CDN dashboard for service status
2. Verify API keys and zone configurations
3. Test file upload endpoints
4. Check CORS settings if browser errors

### Authentication Problems
1. Verify Supabase auth configuration
2. Check environment variables
3. Test auth flows in incognito mode
4. Review error logs for specific issues

## Security Incident Response

1. **Immediate Actions**
   - Change all API keys and passwords
   - Review recent admin panel activity
   - Check for suspicious database queries
   - Monitor error logs for attack patterns

2. **Investigation**
   - Analyze access logs
   - Check for data breaches
   - Verify user account security
   - Review file uploads for malicious content

3. **Recovery**
   - Restore from clean backups if needed
   - Update security measures
   - Notify users if personal data affected
   - Document incident and lessons learned

## Support Contacts

- **Hosting Provider**: [Contact Information]
- **Supabase Support**: [Dashboard > Support]
- **Bunny CDN Support**: [Dashboard > Support]
- **Domain Registrar**: [Contact Information]
- **SSL Certificate Provider**: [Contact Information]

---

## Quick Commands Reference

```bash
# Development
npm run dev

# Production build
npm run build:prod

# Preview production build locally
npm run preview:prod

# Security audit
npm run audit:security

# Bundle analysis
npm run analyze

# Linting
npm run lint:fix

# Clean build cache
npm run clean
```
