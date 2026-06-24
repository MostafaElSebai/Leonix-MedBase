/**
 * Seed Test Data Utility
 * ----------------------
 * Generates 1,000 fake patients and 50 visits per patient (50,000 total)
 * into Supabase using the service role key to bypass RLS.
 *
 * All generated IDs are saved to tests/test-manifest.json for later cleanup.
 *
 * USAGE:
 *   npx tsx tests/utils/seed-test-data.ts
 *
 * PREREQUISITES:
 *   - SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 *   - Run: npm install dotenv @supabase/supabase-js @faker-js/faker
 */

import { createClient } from '@supabase/supabase-js';
import { fakerAR as faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// ── Load env ─────────────────────────────────────────────────────────────────
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DOCTOR_IDS = [
  process.env.TEST_DOCTOR_1_ID,
  process.env.TEST_DOCTOR_2_ID,
].filter(Boolean) as string[];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
  process.exit(1);
}

if (DOCTOR_IDS.length === 0) {
  console.error(
    '❌ Missing TEST_DOCTOR_1_ID and/or TEST_DOCTOR_2_ID in .env.local.\n' +
    '   At least one doctor UUID is required so patients can be assigned.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Config ────────────────────────────────────────────────────────────────────
const PATIENT_COUNT = 1_000;
const VISITS_PER_PATIENT = 50;
const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 1_500;
const MANIFEST_PATH = path.resolve(process.cwd(), 'tests/test-manifest.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Wait `ms` milliseconds before continuing */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Generate a random date string in YYYY-MM-DD format within the past N years */
function randomDateString(yearsBack = 5): string {
  const date = faker.date.past({ years: yearsBack });
  return date.toISOString().split('T')[0];
}

/** Chunk an array into subarrays of size `size` */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── Data generators ───────────────────────────────────────────────────────────

interface PatientRow {
  id: string;
  name: string;
  phone: string;
  dob: string;
  historical_first_visit: string;
  address: string;
  marital_state: string;
  ob_history: string;
  menstrual_history: string;
  familial_diseases: string;
  consanguinity: 'positive' | 'negative';
  notes: string;
  doctor_id: string;
  created_at: string;
  updated_at: string;
}

function generatePatient(): PatientRow {
  const now = new Date().toISOString();
  return {
    id: faker.string.alphanumeric(16).toLowerCase(),
    name: `[TEST] ${faker.person.fullName()}`,
    phone: faker.phone.number({ style: 'international' }).slice(0, 20),
    dob: randomDateString(50),
    historical_first_visit: randomDateString(5),
    address: faker.location.streetAddress(),
    marital_state: faker.helpers.arrayElement(['Single', 'Married', 'Divorced', 'Widowed']),
    ob_history: faker.lorem.sentence(),
    menstrual_history: faker.lorem.sentence(),
    familial_diseases: faker.helpers.arrayElement(['None', 'Hypertension', 'Diabetes', 'None']),
    consanguinity: faker.helpers.arrayElement(['positive', 'negative']),
    notes: faker.lorem.sentence(),
    // 75% assigned to doctor 1, 25% to doctor 2 (falls back to doctor 1 if only one is set)
    doctor_id: Math.random() < 0.75 ? DOCTOR_IDS[0] : (DOCTOR_IDS[1] ?? DOCTOR_IDS[0]),
    created_at: now,
    updated_at: now,
  };
}

interface VisitRow {
  id: string;
  patient_id: string;
  complaint: string;
  examination: string;
  labs: string;
  investigations: string;
  treatment: string;
  drugs: string;
  next_visit_date: string;
  next_visit_type: string;
  notes: string;
  doctor_id: string;
  created_at: string;
  updated_at: string;
}

function generateVisit(patientId: string, doctorId: string): VisitRow {
  const now = faker.date.recent({ days: 365 }).toISOString();
  return {
    id: faker.string.alphanumeric(16).toLowerCase(),
    patient_id: patientId,
    complaint: faker.lorem.sentence(),
    examination: faker.lorem.sentence(),
    labs: faker.lorem.sentence(),
    investigations: faker.lorem.sentence(),
    treatment: faker.lorem.sentence(),
    drugs: faker.lorem.words(3),
    next_visit_date: randomDateString(1),
    next_visit_type: faker.helpers.arrayElement(['Follow-up', 'Check-up', 'Emergency', '']),
    notes: faker.lorem.sentence(),
    doctor_id: doctorId,
    created_at: now,
    updated_at: now,
  };
}

// ── Core insert with batching ─────────────────────────────────────────────────

async function insertBatches<T extends object>(
  tableName: string,
  rows: T[],
  label: string
): Promise<void> {
  const batches = chunk(rows, BATCH_SIZE);
  console.log(`\n📦 Inserting ${rows.length} ${label} in ${batches.length} batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const { error } = await supabase.from(tableName).insert(batch as any);

    if (error) {
      console.error(`❌ Batch ${i + 1}/${batches.length} FAILED for ${tableName}:`, error.message);
      throw error;
    }

    const percent = (((i + 1) / batches.length) * 100).toFixed(0);
    process.stdout.write(`\r  ✓ Batch ${i + 1}/${batches.length} (${percent}%)`);

    if (i < batches.length - 1) {
      await delay(BATCH_DELAY_MS);
    }
  }

  console.log(`\n  ✅ Done inserting ${label}.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Leonix-MedBase Chaos Stress Test — Seeder Starting...');
  console.log(`   Patients: ${PATIENT_COUNT}`);
  console.log(`   Visits per patient: ${VISITS_PER_PATIENT}`);
  console.log(`   Total visits: ${PATIENT_COUNT * VISITS_PER_PATIENT}`);
  console.log(`   Batch size: ${BATCH_SIZE} | Delay between batches: ${BATCH_DELAY_MS}ms`);

  // ── Step 1: Generate all patients ─────────────────────────────────────────
  console.log('\n[1/3] Generating patient data...');
  const patients = Array.from({ length: PATIENT_COUNT }, generatePatient);
  const patientIds = patients.map((p) => p.id);

  // ── Step 2: Insert patients ────────────────────────────────────────────────
  console.log('\n[2/3] Inserting patients into Supabase...');
  await insertBatches('patients', patients, 'patients');

  // ── Step 3: Generate and insert visits ────────────────────────────────────
  console.log('\n[3/3] Generating and inserting visits...');
  const allVisitIds: string[] = [];

  // Process visits in groups of patients to avoid creating 50,000 rows in memory at once
  const PATIENTS_PER_VISIT_GROUP = 20; // 20 patients × 50 visits = 1,000 visits per group
  const patientGroups = chunk(patients, PATIENTS_PER_VISIT_GROUP);

  for (let gi = 0; gi < patientGroups.length; gi++) {
    const group = patientGroups[gi];
    const visits: VisitRow[] = [];

    for (const patient of group) {
      for (let v = 0; v < VISITS_PER_PATIENT; v++) {
        visits.push(generateVisit(patient.id, patient.doctor_id));
      }
    }

    const visitIds = visits.map((v) => v.id);
    allVisitIds.push(...visitIds);

    const groupLabel = `visits (patient group ${gi + 1}/${patientGroups.length})`;
    await insertBatches('visits', visits, groupLabel);

    // Extra delay between groups to be kind to the Supabase API
    if (gi < patientGroups.length - 1) {
      await delay(BATCH_DELAY_MS * 2);
    }
  }

  // ── Step 4: Write manifest ─────────────────────────────────────────────────
  console.log('\n📝 Writing test manifest...');
  const manifest = {
    createdAt: new Date().toISOString(),
    patientCount: patientIds.length,
    visitCount: allVisitIds.length,
    patientIds,
    visitIds: allVisitIds,
  };

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   Patients inserted: ${patientIds.length}`);
  console.log(`   Visits inserted:   ${allVisitIds.length}`);
  console.log(`   Manifest saved to: ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error('\n💥 Fatal seeder error:', err);
  process.exit(1);
});
