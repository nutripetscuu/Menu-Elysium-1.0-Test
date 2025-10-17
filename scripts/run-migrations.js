/**
 * AUTOMATED MIGRATION EXECUTOR
 * Runs all SQL migrations against your Supabase database
 *
 * Usage: node scripts/run-migrations.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Extract project reference from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

console.log('🚀 Supabase Migration Executor');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📍 Project: ${projectRef}`);
console.log(`🔗 URL: ${SUPABASE_URL}\n`);

// Read migration files
const migrations = [
  'supabase/migrations/001_initial_schema.sql',
  'supabase/migrations/002_row_level_security.sql',
  'supabase/migrations/003_seed_modifier_groups.sql'
];

async function executeSql(sql, migrationName) {
  const endpoint = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to execute ${migrationName}: ${error.message}`);
  }
}

async function runMigrations() {
  console.log('📂 Reading migration files...\n');

  for (let i = 0; i < migrations.length; i++) {
    const migrationPath = migrations[i];
    const migrationName = path.basename(migrationPath);

    console.log(`[${i + 1}/${migrations.length}] ${migrationName}`);

    try {
      // Read SQL file
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Execute SQL (Note: Supabase REST API doesn't support direct SQL execution)
      // We need to use the Supabase Management API or manual execution
      console.log('⚠️  SQL file ready for manual execution');
      console.log(`   File: ${migrationPath}`);
      console.log(`   Lines: ${sql.split('\n').length}\n`);

    } catch (error) {
      console.error(`❌ Error reading ${migrationName}:`, error.message);
      process.exit(1);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚠️  IMPORTANT: Automatic SQL execution via REST API is not supported.');
  console.log('📝 Please execute these migrations manually:\n');
  console.log('Option 1: Supabase Dashboard (Recommended)');
  console.log('   1. Go to https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('   2. Copy contents of each migration file');
  console.log('   3. Paste and click "Run"\n');
  console.log('Option 2: Supabase CLI');
  console.log('   1. npm install -g supabase');
  console.log('   2. supabase login');
  console.log('   3. supabase link --project-ref ' + projectRef);
  console.log('   4. supabase db push\n');
  console.log('📁 Migration files located at:');
  migrations.forEach(m => console.log(`   - ${m}`));
  console.log('\n');
}

runMigrations();
