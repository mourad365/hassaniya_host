# Vercel Deployment Guide - hassaniya.info

## 🚀 Quick Deployment Steps

### 1. Prepare for Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Test production build locally
npm run build:prod
npm run preview:prod
```

### 2. Deploy to Vercel
```bash
# Initial deployment (from project root)
vercel

# Follow the prompts:
# ? Set up and deploy "~/hassaniy_host"? Y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? N
# ? What's your project's name? hassaniya-host
# ? In which directory is your code located? ./
```

### 3. Configure Custom Domain
```bash
# Add your custom domain
vercel domains add hassaniya.info

# Link domain to project
vercel domains link hassaniya.info hassaniya-host
```

### 4. Set Environment Variables
```bash
# Set required environment variables
vercel env add VITE_SUPABASE_URL production
# Enter: your-production-supabase-url

vercel env add VITE_SUPABASE_ANON_KEY production
# Enter: your-production-anon-key

vercel env add VITE_BUNNY_STORAGE_API_KEY production
# Enter: your-bunny-storage-key

vercel env add VITE_BUNNY_STORAGE_ZONE production
# Enter: your-storage-zone

vercel env add VITE_BUNNY_CDN_URL production
# Enter: https://your-zone.b-cdn.net

# Pre-configured Bunny Video (already set in code)
vercel env add VITE_BUNNY_VIDEO_LIBRARY_ID production
# Enter: 493708

vercel env add VITE_BUNNY_VIDEO_CDN_HOSTNAME production
# Enter: vz-a9578edc-805.b-cdn.net

vercel env add VITE_BUNNY_VIDEO_API_KEY production
# Enter: 4e19874d-4ee6-4f16-a29864485e6d-7a39-481e

# Optional: Social media integration
vercel env add VITE_FACEBOOK_PAGE_ID production
# Enter: 101470072189930

vercel env add VITE_FACEBOOK_PAGE_TOKEN production
# Enter: your-facebook-page-token
```

### 5. Production Deployment
```bash
# Deploy to production with custom domain
vercel --prod
```

## 🔧 Domain Configuration

### DNS Setup for hassaniya.info
Configure your domain registrar with these DNS records:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A (or ALIAS/ANAME for root domain)
Name: @
Value: 76.76.19.19
```

### SSL/TLS Certificate
Vercel automatically provisions SSL certificates for custom domains. The certificate will be issued within minutes after DNS propagation.

## 🛡️ Security Configuration

### Environment Variables Security
All environment variables are automatically encrypted by Vercel and only available during build time for `VITE_` prefixed variables.

### Headers Configuration
Security headers are configured in `vercel.json`:
- Content Security Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Strict Transport Security (HSTS)
- Referrer Policy

### Domain Security
```bash
# Enable domain protection (optional)
vercel domains protect hassaniya.info
```

## 📊 Performance Optimization

### Vercel Analytics (Optional)
```bash
# Enable Vercel Analytics
npm install @vercel/analytics

# Add to your App.jsx:
import { Analytics } from '@vercel/analytics/react';

// In your App component:
<Analytics />
```

### Edge Functions (If needed)
For any API routes, Vercel automatically optimizes them as Edge Functions for global performance.

## 🔍 Monitoring & Debugging

### View Deployment Status
```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

### Custom Monitoring
- **Vercel Dashboard**: Monitor performance and errors
- **Real User Monitoring**: Available in Vercel Pro plans
- **Function Logs**: Monitor any API routes

## 🚀 Continuous Deployment

### Git Integration
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect repository in Vercel dashboard
3. Enable automatic deployments for production branch

### Deployment Commands
```bash
# Preview deployment (for testing)
vercel

# Production deployment
vercel --prod

# Deploy specific branch
vercel --target production --branch main
```

## ✅ Post-Deployment Checklist

### Functionality Tests
- [ ] Visit https://hassaniya.info and verify site loads
- [ ] Test user authentication and registration
- [ ] Verify admin panel access at https://hassaniya.info/admin
- [ ] Test video playback functionality
- [ ] Check image loading from Bunny CDN
- [ ] Verify responsive design on mobile devices

### Performance Tests
- [ ] Run Lighthouse audit (target: 90+ scores)
- [ ] Test loading speed from different geographical locations
- [ ] Verify CDN asset delivery is working
- [ ] Check that bundle sizes are optimized

### Security Tests
- [ ] Verify HTTPS is enforced (http redirects to https)
- [ ] Check security headers using securityheaders.com
- [ ] Test CSP is not blocking legitimate resources
- [ ] Verify authentication flows work correctly

### SEO Verification
- [ ] Check meta tags are properly rendered
- [ ] Verify sitemap.xml is accessible (if implemented)
- [ ] Test social media sharing (Open Graph tags)
- [ ] Confirm Arabic text is properly indexed

## 🎯 Domain-Specific Features

### Arabic Content Optimization
- Right-to-left (RTL) text rendering
- Arabic font optimization
- Proper meta tags for Arabic content
- Cultural date/time formatting

### Bunny CDN Integration
- Images: `https://hassaniya.b-cdn.net/`
- Videos: `https://vz-a9578edc-805.b-cdn.net/`
- Optimized delivery for MENA region

## 🆘 Troubleshooting

### Common Issues

#### Domain Not Working
```bash
# Check domain status
vercel domains ls

# Verify DNS propagation
nslookup hassaniya.info
```

#### Build Failures
```bash
# Check build logs
vercel logs

# Test build locally
npm run build:prod
```

#### Environment Variables Not Working
```bash
# List all environment variables
vercel env ls

# Update environment variable
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

### Support Resources
- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Discord**: https://vercel.com/discord
- **Vercel Support**: https://vercel.com/support

## 🎉 Success!

Once deployed, your Hassaniya cultural heritage platform will be live at:
- **Primary**: https://hassaniya.info
- **WWW**: https://www.hassaniya.info
- **Vercel URL**: https://hassaniya-host.vercel.app (fallback)

**Your platform is now ready to preserve and share Hassaniya cultural heritage with the world! 🌍**
