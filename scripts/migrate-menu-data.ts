/**
 * DATA MIGRATION SCRIPT
 * Migrates hardcoded menu data from menu-data.ts to Supabase
 *
 * Usage:
 *   npm install --save-dev ts-node
 *   npx ts-node scripts/migrate-menu-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import { menuData } from '../src/lib/menu-data';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Supabase credentials (from environment or .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin access

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Main migration function
 */
async function migrateMenuData() {
  console.log('🚀 Starting menu data migration...\n');

  try {
    // Step 1: Migrate Categories
    console.log('📁 Migrating categories...');
    const categoryIdMap: Record<string, string> = {};

    for (let i = 0; i < menuData.length; i++) {
      const category = menuData[i];

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          icon: category.icon,
          position: i,
          is_active: true,
        })
        .select('id')
        .single();

      if (categoryError) {
        console.error(`❌ Error inserting category "${category.name}":`, categoryError);
        throw categoryError;
      }

      if (categoryData) {
        categoryIdMap[category.id] = categoryData.id;
        console.log(`✅ Migrated category: ${category.name} (${category.id} -> ${categoryData.id})`);
      }
    }

    console.log(`\n✅ Successfully migrated ${Object.keys(categoryIdMap).length} categories\n`);

    // Step 2: Migrate Menu Items
    console.log('🍽️  Migrating menu items...');
    let totalItems = 0;

    for (const category of menuData) {
      const categoryUuid = categoryIdMap[category.id];

      if (!categoryUuid) {
        console.error(`❌ Category UUID not found for: ${category.id}`);
        continue;
      }

      for (let i = 0; i < category.items.length; i++) {
        const item = category.items[i];

        // Determine pricing structure
        let price: number | null = null;
        let price_medium: number | null = null;
        let price_grande: number | null = null;

        if (item.sizes) {
          price_medium = parseFloat(item.sizes.medium);
          price_grande = parseFloat(item.sizes.grande);
        } else {
          price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        }

        // Insert menu item
        const { data: menuItemData, error: menuItemError } = await supabase
          .from('menu_items')
          .insert({
            category_id: categoryUuid,
            name: item.name,
            description: item.description,
            price: price,
            price_medium: price_medium,
            price_grande: price_grande,
            image_url: item.image?.url || null,
            tags: item.tags || [],
            portion: item.portion || null,
            position: i,
            is_available: true,
          })
          .select('id')
          .single();

        if (menuItemError) {
          console.error(`❌ Error inserting menu item "${item.name}":`, menuItemError);
          throw menuItemError;
        }

        // Step 3: Link modifier groups to menu item
        if (menuItemData && item.modifierGroups && item.modifierGroups.length > 0) {
          for (let j = 0; j < item.modifierGroups.length; j++) {
            const modifierGroupId = item.modifierGroups[j];

            const { error: linkError } = await supabase
              .from('menu_item_modifiers')
              .insert({
                menu_item_id: menuItemData.id,
                modifier_group_id: modifierGroupId,
                position: j,
              });

            if (linkError) {
              console.error(`❌ Error linking modifier "${modifierGroupId}" to "${item.name}":`, linkError);
              throw linkError;
            }
          }
        }

        totalItems++;
        console.log(`✅ Migrated: ${item.name} (${category.name})`);
      }
    }

    console.log(`\n✅ Successfully migrated ${totalItems} menu items\n`);

    // Summary
    console.log('🎉 Migration completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`   Categories: ${Object.keys(categoryIdMap).length}`);
    console.log(`   Menu Items: ${totalItems}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Rollback function (optional - for cleaning up test migrations)
 */
async function rollbackMigration() {
  console.log('🔄 Rolling back migration...\n');

  try {
    // Delete all menu item modifiers
    const { error: modError } = await supabase
      .from('menu_item_modifiers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (modError) throw modError;
    console.log('✅ Deleted all menu item modifiers');

    // Delete all menu items
    const { error: itemError } = await supabase
      .from('menu_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (itemError) throw itemError;
    console.log('✅ Deleted all menu items');

    // Delete all categories
    const { error: catError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (catError) throw catError;
    console.log('✅ Deleted all categories');

    console.log('\n✅ Rollback completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Rollback failed:', error);
    process.exit(1);
  }
}

// Execute migration
const command = process.argv[2];

if (command === '--rollback') {
  rollbackMigration();
} else {
  migrateMenuData();
}
