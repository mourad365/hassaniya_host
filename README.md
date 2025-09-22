# Hassaniya Host - Cultural Heritage Platform

[![Production Ready](https://img.shields.io/badge/Production-Ready-green.svg)](./PRODUCTION_CHECKLIST.md)
[![Security Hardened](https://img.shields.io/badge/Security-Hardened-blue.svg)](./SECURITY.md)
[![Arabic RTL](https://img.shields.io/badge/Arabic-RTL%20Support-orange.svg)](#features)

A modern, secure web platform for preserving and sharing Hassaniya cultural heritage through articles, videos, podcasts, and media content.

## 🚀 Quick Start

### Development Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure your environment variables in .env.local
# Start development server
npm run dev
```

### Production Deployment (Vercel + hassaniya.info)
```bash
# Quick deployment to hassaniya.info
npm run deploy:hassaniya

# Or step by step:
npm run audit:security
npm run build:prod
npm run vercel:deploy:prod

# Local development with Vercel
npm run vercel:dev
```

## ✨ Features

### 🎯 Core Functionality
- **Content Management**: Articles, news, podcasts, programs, and media
- **Video Streaming**: Bunny CDN integration with HLS.js support
- **User Authentication**: Secure role-based access control
- **Admin Panel**: Comprehensive content management interface
- **Arabic RTL**: Full right-to-left language support

### 🔒 Security Features
- **Input Validation**: Comprehensive form validation and sanitization
- **XSS Protection**: Content Security Policy and input filtering
- **Authentication**: Secure login with session management
- **File Security**: Upload restrictions and type validation
- **HTTPS Enforcement**: SSL/TLS encryption in production

### 📱 User Experience
- **Responsive Design**: Mobile-first responsive layout
- **Performance Optimized**: Code splitting and lazy loading
- **Error Handling**: Graceful error recovery and user feedback
- **SEO Optimized**: Proper meta tags and structured data

## 🏗️ Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast build tool with HMR
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Hook Form**: Form management with validation
- **Framer Motion**: Smooth animations and transitions

### Backend & Services
- **Supabase**: Database, authentication, and real-time features
- **Bunny CDN**: Image storage and optimization
- **Bunny Stream**: Video hosting and streaming (Library ID: 493708)
- **Facebook Graph API**: Social media integration

### Security & Performance
- **Zod**: Runtime type validation
- **HLS.js**: Adaptive video streaming
- **Content Security Policy**: XSS protection
- **Error Boundaries**: Production error handling

## 📂 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin panel components
│   ├── auth/            # Authentication components
│   ├── home/            # Homepage sections
│   └── ui/              # Base UI components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── admin/           # Admin pages
│   └── ...              # Public pages
├── utils/               # Utility functions
│   ├── security.js      # Security utilities
│   ├── formValidation.js # Form validation
│   ├── errorHandler.js  # Error handling
│   └── config.js        # Configuration management
└── i18n/               # Internationalization
```

## 🔧 Configuration

### Required Environment Variables
```bash
# Supabase (Required)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Bunny CDN (Required)
VITE_BUNNY_STORAGE_API_KEY=your-storage-key
VITE_BUNNY_STORAGE_ZONE=your-zone-name
VITE_BUNNY_CDN_URL=https://your-zone.b-cdn.net

# Bunny Video (Pre-configured)
VITE_BUNNY_VIDEO_LIBRARY_ID=493708
VITE_BUNNY_VIDEO_CDN_HOSTNAME=vz-a9578edc-805.b-cdn.net
VITE_BUNNY_VIDEO_API_KEY=4e19874d-4ee6-4f16-a29864485e6d-7a39-481e
```

### Optional Configuration
```bash
# Social Media
VITE_FACEBOOK_PAGE_ID=101470072189930
VITE_FACEBOOK_PAGE_TOKEN=your-page-token

# Application Settings
VITE_ENABLE_FILE_UPLOAD=true
VITE_MAX_FILE_SIZE=200000000
```

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run preview          # Preview production build

# Production
npm run build:prod       # Production build
npm run preview:prod     # Build and preview production

# Quality Assurance
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run audit:security   # Security audit
npm run analyze          # Bundle size analysis

# Maintenance
npm run clean            # Clean build cache
```

## 🛡️ Security

This application implements comprehensive security measures:

- **Authentication**: Supabase Auth with role-based access
- **Input Validation**: XSS prevention and data sanitization
- **File Security**: Upload restrictions and content validation
- **Network Security**: CSP headers and HTTPS enforcement
- **Error Handling**: Secure error reporting without data leaks

See [SECURITY.md](./SECURITY.md) for detailed security information.

## 🚀 Deployment

### Supported Platforms
- **Netlify** (Recommended)
- **Vercel**
- **Custom VPS/Server**

### Pre-Deployment Checklist
1. Configure production environment variables
2. Run security audit: `npm run audit:security`
3. Test production build: `npm run preview:prod`
4. Verify all integrations are working

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for detailed deployment instructions.

## 🎨 Customization

### Theming
The application uses Tailwind CSS with custom color scheme:
- **Heritage Gold**: `#D4AF37`
- **Sand Light**: `#F5F5DC`
- **Desert Brown**: `#8B4513`

### Content Types
- **News**: Breaking news and updates
- **Articles**: In-depth cultural articles
- **Podcasts**: Audio content with video support
- **Programs**: TV/Radio program archives
- **Media**: Photos and video galleries

## 🌐 Internationalization

- **Primary Language**: Arabic (RTL)
- **Secondary Language**: English (LTR)
- **Framework**: react-i18next
- **Fallback**: English translations for missing Arabic text

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add appropriate validation for user inputs
- Include error handling for all operations
- Test with both Arabic and English content
- Ensure mobile responsiveness

## 📝 License

This project is proprietary software for Hassaniya cultural heritage preservation.

## 📞 Support

- **Technical Issues**: Check [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)
- **Security Concerns**: Review [SECURITY.md](./SECURITY.md)
- **Configuration Help**: See [.env.example](./.env.example)

---

## 🏆 Production Status

✅ **Security Hardened** - Comprehensive security implementation
✅ **Performance Optimized** - Bundle splitting and lazy loading  
✅ **Production Ready** - Full deployment documentation
✅ **Error Handling** - Graceful error recovery
✅ **Mobile Responsive** - Optimized for all devices
✅ **SEO Optimized** - Search engine friendly

**Ready for Production Deployment** 🚀
