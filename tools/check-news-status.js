import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNewsStatus() {
  try {
    console.log('🔍 Checking all news items in database...\n');
    
    // Get all news items regardless of status
    const { data: allNews, error } = await supabase
      .from('news')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching news:', error);
      return;
    }

    console.log(`📊 Total news items in database: ${allNews?.length || 0}\n`);

    if (!allNews || allNews.length === 0) {
      console.log('❌ No news items found in database');
      return;
    }

    // Group by status
    const statusGroups = allNews.reduce((acc, item) => {
      const status = item.status || 'null';
      if (!acc[status]) acc[status] = [];
      acc[status].push(item);
      return acc;
    }, {});

    console.log('📈 News items by status:');
    Object.entries(statusGroups).forEach(([status, items]) => {
      console.log(`  ${status}: ${items.length} items`);
    });

    console.log('\n📝 All news items:');
    allNews.forEach((item, index) => {
      console.log(`${index + 1}. [${item.status || 'null'}] ${item.title} (ID: ${item.id})`);
    });

    // Show suggestions
    const draftCount = statusGroups.draft?.length || 0;
    const unpublishedCount = (allNews.length - (statusGroups.published?.length || 0));
    
    console.log('\n💡 Suggestions:');
    if (draftCount > 0) {
      console.log(`- You have ${draftCount} draft news items that could be published`);
    }
    if (unpublishedCount > 0) {
      console.log(`- Consider updating ${unpublishedCount} items to 'published' status to show more content`);
    }
    if (allNews.length < 10) {
      console.log('- Consider adding more news content through the admin panel at /admin/news');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkNewsStatus();
