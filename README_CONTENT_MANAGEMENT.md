# Hassaniya Content Management System

## Overview
This comprehensive content management system supports all the content types requested for the Hassaniya platform:

- **التغطيات (Coverage)** - Media coverage and event reporting
- **الأخبار (News)** - News articles and breaking news
- **المقالات (Articles)** - Opinion articles and analysis
- **البودكاست (Podcasts)** - Audio content and podcast episodes
- **برنامج خطوة (Khutwa Program)** - Step-by-step educational programs
- **برنامج المقال (Maqal Program)** - Article-based programs
- **برنامج أعيان (Ayan Program)** - Notable figures programs

## Features

### ✅ Complete CRUD Operations
- **Create**: Add new content with rich forms and validation
- **Read**: View and browse all content with pagination and filtering
- **Update**: Edit existing content with pre-populated forms
- **Delete**: Remove content with confirmation dialogs

### ✅ Production-Ready Features
- **Security**: Row-level security (RLS) policies in Supabase
- **Performance**: Optimized database queries with proper indexing
- **Validation**: Comprehensive form validation using Zod schemas
- **Error Handling**: User-friendly error messages and loading states
- **File Upload**: Secure media upload to Hostinger CDN
- **Responsive Design**: Mobile-first responsive UI

### ✅ Content Types

#### 1. News (الأخبار)
- Title, content, excerpt
- Category (breaking, politics, culture, sports, economy)
- Priority levels (high, medium, low)
- Location and reporter information
- Image upload support

#### 2. Coverage (التغطيات)
- Event coverage with location and date
- Coverage types (live, event, conference, interview, report, cultural)
- Reporter assignment
- Both image and video support

#### 3. Podcasts (البودكاست)
- Episode management with numbers and seasons
- Host and guest information
- Audio file upload
- Duration tracking
- Episode thumbnails

#### 4. Programs (البرامج)
- Multiple program types (Khutwa, Maqal, Ayan, interviews, documentaries)
- Episode and season management
- Host and guest tracking
- Video file upload
- Air date scheduling

#### 5. Articles (المقالات) - Enhanced
- Full CRUD operations (previously only had create)
- Category management
- Author tracking
- Image support

## Database Schema

### Tables Created
```sql
-- News table
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium',
    location VARCHAR(200),
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(200),
    image_url TEXT,
    publish_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published',
    page_slug VARCHAR(500) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coverage table
CREATE TABLE coverage (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    coverage_type VARCHAR(100) NOT NULL,
    event_location VARCHAR(300) NOT NULL,
    event_date DATE NOT NULL,
    reporter_name VARCHAR(200) NOT NULL,
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(200),
    image_url TEXT,
    video_url TEXT,
    publish_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published',
    page_slug VARCHAR(500) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Podcasts table
CREATE TABLE podcasts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    episode_number INTEGER,
    season VARCHAR(50) DEFAULT '1',
    duration VARCHAR(20),
    host_name VARCHAR(200) NOT NULL,
    guest_name VARCHAR(200),
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(200),
    audio_url TEXT,
    image_url TEXT,
    publish_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published',
    page_slug VARCHAR(500) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    program_type VARCHAR(100) NOT NULL,
    episode_number INTEGER,
    season VARCHAR(50) DEFAULT '1',
    duration VARCHAR(20),
    host_name VARCHAR(200) NOT NULL,
    guest_name VARCHAR(200),
    air_date DATE,
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(200),
    video_url TEXT,
    image_url TEXT,
    publish_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published',
    page_slug VARCHAR(500) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Security Policies
- Row-level security enabled on all tables
- Users can only modify their own content
- Public read access for published content
- Authenticated read access for all content

## Admin Interface

### Navigation
The admin sidebar now includes all content management sections:
- لوحة التحكم (Dashboard)
- إدارة المقالات (Articles Management)
- إدارة الأخبار (News Management)
- إدارة التغطيات (Coverage Management)
- إدارة البودكاست (Podcast Management)
- إدارة البرامج (Programs Management)
- إدارة الوسائط (Media Management)

### Routes
- `/admin/articles` - Article management
- `/admin/news` - News management
- `/admin/coverage` - Coverage management
- `/admin/podcasts` - Podcast management
- `/admin/programs` - Program management
- `/admin/media` - Media management

## Components Architecture

### Reusable Components
- `ContentManagement.jsx` - Generic content management component
- `ArticleForm.jsx` - Article creation/editing form
- `NewsForm.jsx` - News creation/editing form
- `CoverageForm.jsx` - Coverage creation/editing form
- `PodcastForm.jsx` - Podcast creation/editing form
- `ProgramForm.jsx` - Program creation/editing form

### Management Pages
- `ArticleManagementPage.jsx` - Enhanced with full CRUD
- `NewsManagementPage.jsx` - Complete news management
- `CoverageManagementPage.jsx` - Coverage management
- `PodcastManagementPage.jsx` - Podcast management with audio playback
- `ProgramManagementPage.jsx` - Program management with video playback

## Internationalization

### Arabic Translations Added
All new content types have complete Arabic translations including:
- Form labels and placeholders
- Success/error messages
- Navigation items
- Content type names
- Status indicators

## File Upload Support

### Media Types Supported
- **Images**: JPG, PNG, GIF, WebP for thumbnails and covers
- **Audio**: MP3, WAV, OGG for podcast episodes
- **Video**: MP4, WebM, MOV for program content

### Upload Destinations
- `thumbnails/` - Article and general thumbnails
- `news/` - News images
- `coverage/images/` - Coverage images
- `coverage/videos/` - Coverage videos
- `podcasts/audio/` - Podcast audio files
- `podcasts/thumbnails/` - Podcast thumbnails
- `programs/videos/` - Program videos
- `programs/thumbnails/` - Program thumbnails

## Usage Instructions

### 1. Database Setup
Run the SQL schema from `database_schema.sql` in your Supabase dashboard.

### 2. Environment Variables
Ensure your `.env` file includes:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HOSTINGER_UPLOAD_ENDPOINT=your_upload_endpoint
```

### 3. Admin Access
1. Sign in to the admin panel at `/auth`
2. Navigate to the desired content management section
3. Use the "إضافة جديد" button to create new content
4. Click edit icons to modify existing content
5. Use delete buttons with confirmation to remove content

### 4. Content Creation Workflow
1. **Fill required fields** - Title, content, and type-specific fields
2. **Upload media files** - Images, audio, or video as appropriate
3. **Set metadata** - Categories, priorities, dates, etc.
4. **Save or update** - Content is automatically published

## Performance Optimizations

### Database Indexes
- Status indexes for filtering published content
- Date indexes for chronological sorting
- Category/type indexes for filtering
- Full-text search ready structure

### Frontend Optimizations
- Lazy loading of management pages
- Optimized re-renders with proper state management
- Efficient form validation
- Loading states for better UX

## Security Features

### Authentication & Authorization
- Supabase Auth integration
- Protected admin routes
- User-based content ownership
- Role-based access control ready

### Data Validation
- Client-side validation with Zod schemas
- Server-side validation through Supabase RLS
- File type and size validation
- SQL injection prevention

## Deployment Ready

### Production Checklist
- ✅ Database schema with proper constraints
- ✅ Security policies implemented
- ✅ Error handling and validation
- ✅ Responsive design
- ✅ Internationalization support
- ✅ File upload functionality
- ✅ Performance optimizations
- ✅ Clean code architecture

The system is now production-ready and can handle all the requested content types with full CRUD operations, proper security, and a professional admin interface.
