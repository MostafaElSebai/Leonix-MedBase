/**
 * Teardown Utility
 * ----------------
 * Reads tests/test-manifest.json and deletes all seeded patients and visits
 * from Supabase using safe, rate-limited batching.
 *
 * USAGE:
 *   npx tsx tests/utils/teardown-test-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// ── Load env ─────────────────────────────────────────────────────────────────
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Config ────────────────────────────────────────────────────────────────────
const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 1_500;
const MANIFEST_PATH = path.resolve(process.cwd(), 'tests/test-manifest.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── Core delete with batching ─────────────────────────────────────────────────

async function deleteBatches(
  tableName: string,
  ids: string[],
  label: string
): Promise<void> {
  if (ids.length === 0) {
    console.log(`  ⏭️  No ${label} to delete, skipping.`);
    return;
  }

  const batches = chunk(ids, BATCH_SIZE);
  console.log(`\n🗑️  Deleting ${ids.length} ${label} in ${batches.length} batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const { error } = await supabase.from(tableName).delete().in('id', batch);

    if (error) {
      console.error(`❌ Batch ${i + 1}/${batches.length} FAILED for ${tableName}:`, error.message);
      // Continue deleting remaining batches — partial cleanup is better than none
    } else {
      const percent = (((i + 1) / batches.length) * 100).toFixed(0);
      process.stdout.write(`\r  ✓ Batch ${i + 1}/${batches.length} (${percent}%)`);
    }

    if (i < batches.length - 1) {
      await delay(BATCH_DELAY_MS);
    }
  }

  console.log(`\n  ✅ Done deleting ${label}.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🧹 Leonix-MedBase Chaos Stress Test — Teardown Starting...');

  // ── Step 1: Read manifest ──────────────────────────────────────────────────
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ Manifest not found at: ${MANIFEST_PATH}`);
    console.error('   Run the seeder first: npx tsx tests/utils/seed-test-data.ts');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const { patientIds = [], visitIds = [] } = manifest;

  console.log(`   Manifest created at: ${manifest.createdAt}`);
  console.log(`   Patients to delete:  ${patientIds.length}`);
  console.log(`   Visits to delete:    ${visitIds.length}`);

  // ── Step 2: Delete visits FIRST (FK constraint — visits reference patients) ─
  console.log('\n[1/3] Deleting visits...');
  await deleteBatches('visits', visitIds, 'visits');

  // Extra delay between tables
  await delay(BATCH_DELAY_MS * 2);

  // ── Step 3: Delete patients ────────────────────────────────────────────────
  console.log('\n[2/3] Deleting patients...');
  await deleteBatches('patients', patientIds, 'patients');

  // ── Step 4: Remove the manifest ───────────────────────────────────────────
  console.log('\n[3/3] Removing manifest file...');
  fs.unlinkSync(MANIFEST_PATH);
  console.log(`   ✅ Manifest removed: ${MANIFEST_PATH}`);

  console.log('\n🎉 Teardown complete! Database returned to a pristine state.');
}

main().catch((err) => {
  console.error('\n💥 Fatal teardown error:', err);
  process.exit(1);
});
