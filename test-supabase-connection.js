// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔄 Testing connection to Supabase...\n');

    // Test 1: Check if we can query categories table
    console.log('📊 Test 1: Querying categories table...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);

    if (catError) {
      console.log('⚠️  Categories query error:', catError.message);
      console.log('   (This is expected if table doesn\'t exist yet)\n');
    } else {
      console.log('✅ Categories query successful!');
      console.log(`   Found ${categories?.length || 0} categories`);
      if (categories && categories.length > 0) {
        console.log('   Sample:', categories[0]);
      }
      console.log('');
    }

    // Test 2: Check if we can query menu_items table
    console.log('📊 Test 2: Querying menu_items table...');
    const { data: menuItems, error: itemError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(5);

    if (itemError) {
      console.log('⚠️  Menu items query error:', itemError.message);
      console.log('   (This is expected if table doesn\'t exist yet)\n');
    } else {
      console.log('✅ Menu items query successful!');
      console.log(`   Found ${menuItems?.length || 0} menu items`);
      if (menuItems && menuItems.length > 0) {
        console.log('   Sample:', menuItems[0]);
      }
      console.log('');
    }

    // Test 3: Check connection health
    console.log('🏥 Test 3: Checking connection health...');
    const { data: healthData, error: healthError } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      console.log('⚠️  Health check failed:', healthError.message);
    } else {
      console.log('✅ Connection is healthy!\n');
    }

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📋 SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log('Connection URL:', supabaseUrl);
    console.log('Connection Status:', (!catError || !itemError) ? '✅ CONNECTED' : '⚠️  CONNECTED (no tables)');
    console.log('Categories Table:', catError ? '❌ Not found' : '✅ Available');
    console.log('Menu Items Table:', itemError ? '❌ Not found' : '✅ Available');
    console.log('═══════════════════════════════════════\n');

    if (catError || itemError) {
      console.log('💡 TIP: If tables are missing, run the migrations:');
      console.log('   Check: supabase/migrations/ folder');
      console.log('   Or run migrations via Supabase dashboard\n');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testConnection();
