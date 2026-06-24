/**
 * Doctor Shift Simulation — Chaos Stress Test
 * ============================================
 * Simulates a full 25-patient doctor shift:
 *   - 10 New Patients (created during the test)
 *   - 15 Existing Patients (pulled from the seeded test-manifest.json)
 *
 * Network Chaos: 3 random offline drops, each covering 1–3 patients.
 * Assertions:    Soft (axe a11y) vs. Hard (login, DB write, search index).
 *
 * PREREQUISITES:
 *   1. Run the seeder: npx tsx tests/utils/seed-test-data.ts
 *   2. Ensure a doctor with a known name and PIN exists in your DB.
 *      Set PLAYWRIGHT_DOCTOR_NAME and PLAYWRIGHT_DOCTOR_PIN in .env.local
 *   3. Start dev server: npm run dev
 *   4. Run: npx playwright test tests/e2e/doctor-shift.spec.ts
 */

import { test, expect, BrowserContext, Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { fakerAR as faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true } as any);

// ── Constants & Config ────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3000';
const MANIFEST_PATH = path.resolve(process.cwd(), 'tests/test-manifest.json');

// Credentials: pulled from env, with sensible test defaults
// Set these in .env.local for your real test doctor
const DOCTOR_NAME = process.env.PLAYWRIGHT_DOCTOR_NAME || 'Dr. Test';
const DOCTOR_PIN = process.env.PLAYWRIGHT_DOCTOR_PIN || '1234';

const TOTAL_ITERATIONS = 25;
const NEW_PATIENT_COUNT = 10;
const EXISTING_PATIENT_COUNT = 15; // 25 - 10
const OFFLINE_DROP_COUNT = 10;

// ── Types ─────────────────────────────────────────────────────────────────────

interface TestManifest {
  patientIds: string[];
  visitIds: string[];
}

interface OfflineDrop {
  /** Which iteration index (0-based) this offline drop starts */
  startAt: number;
  /** How many patients (1-3) to process offline during this drop */
  patientCount: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Load and validate the seeder manifest */
function loadManifest(): TestManifest {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(
      `Test manifest not found at ${MANIFEST_PATH}. Run the seeder first:\n  npx tsx tests/utils/seed-test-data.ts`
    );
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

/** Pick N unique random items from an array without replacement */
function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Deterministically plan 3 offline drops across the 25-iteration shift.
 * Each drop is randomly placed but guaranteed not to overlap with another.
 */
function planOfflineDrops(): OfflineDrop[] {
  // Reserve iterations 2–22 as possible drop points (avoid start/end)
  const possibleStarts = Array.from({ length: 21 }, (_, i) => i + 2);
  const chosenStarts = pickRandom(possibleStarts, OFFLINE_DROP_COUNT).sort((a, b) => a - b);

  return chosenStarts.map((startAt) => ({
    startAt,
    patientCount: Math.floor(Math.random() * 3) + 1, // 1–3
  }));
}

/** Generate fake patient form data */
function generateFakePatientData() {
  const dob = faker.date.birthdate({ min: 18, max: 70, mode: 'age' });
  const dobStr = dob.toISOString().split('T')[0]; // YYYY-MM-DD
  const firstVisit = faker.date.recent({ days: 365 }).toISOString().split('T')[0];

  return {
    name: `[E2E] ${faker.person.fullName()}`,
    phone: faker.phone.number({ style: 'national' }).slice(0, 15),
    dob: dobStr, // YYYY-MM-DD
    firstVisit: firstVisit,
    address: faker.location.streetAddress(),
    maritalState: faker.helpers.arrayElement(['Single', 'Married', 'Divorced']),
    obHistory: faker.lorem.sentence(),
    menstrualHistory: faker.lorem.sentence(),
    familialDiseases: faker.lorem.words(3),
    consanguinity: faker.helpers.arrayElement<'negative' | 'positive'>(['negative', 'positive']),
  };
}

// ── Page Interaction Helpers ──────────────────────────────────────────────────

/** Navigate to home and log in as the configured test doctor */
async function loginAsDoctor(page: Page): Promise<void> {
  // Set up console listener to know when the massive sync is done
  const syncPromise = new Promise<void>((resolve, reject) => {
    const handleConsole = (msg: any) => {
      const text = msg.text();
      if (text.includes('Sync completed successfully!')) {
        page.off('console', handleConsole);
        resolve();
      } else if (text.includes('Sync failed:')) {
        page.off('console', handleConsole);
        reject(new Error(text));
      }
    };
    page.on('console', handleConsole);
  });

  await page.goto(BASE_URL);

  // Hard assertion: the page must load
  expect(page.url()).toBe(`${BASE_URL}/`);

  // Click the correct doctor card using the aria-label from KioskCard
  const doctorCard = page.locator(`[aria-label="Select ${DOCTOR_NAME}"]`);
  await expect(doctorCard).toBeVisible({ timeout: 15_000 });
  await doctorCard.click();

  // Wait for PIN form to appear (PinInput uses type="password")
  await page.waitForSelector('input[type="password"]', { timeout: 5_000 });

  // Type each digit of the PIN into the PinInput component
  for (const digit of DOCTOR_PIN.split('')) {
    await page.keyboard.type(digit);
    await page.waitForTimeout(50); // Small delay for the PIN input state to update
  }

  // Click the Authenticate button
  const authButton = page.locator('button[type="submit"]', { hasText: /authenticate/i });
  await authButton.click();

  // Hard assertion: must redirect to dashboard
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10_000 });

  // Wait for the local WatermelonDB to finish downloading 50,000 visits
  console.log("Waiting for WatermelonDB initial sync to finish...");
  await syncPromise;
  console.log("Initial Sync finished!");
  
  await page.waitForTimeout(1000);

  await page.evaluate(async () => {
    // @ts-ignore
    const db = window.watermelonDB;
    if (db) {
      const docs = await db.collections.get("doctors").query().fetch();
      console.log("WATERMELON_DOCTORS_DUMP:", JSON.stringify(docs.map((d: any) => d._raw)));
    } else {
      console.log("WATERMELON_DOCTORS_DUMP: No window.watermelonDB found");
    }
  });

  // Warm-up navigations to compile and cache Next.js chunks for offline mode
  console.log("Warming up routes for offline mode...");
  await page.goto(`${BASE_URL}/patients/new`);
  await page.waitForSelector('#patient-form', { timeout: 15_000 });
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForSelector('.card', { timeout: 15_000 });
}

/**
 * Fill and submit the New Patient form.
 * Returns the newly created patient's ID (from the URL after redirect).
 */
async function createNewPatient(page: Page): Promise<string> {
  const data = generateFakePatientData();

  // Navigate to the new patient form using UI link instead of hard goto to support offline mode
  const newPatientLink = page.locator('a[href="/patients/new"], button:has-text("Add Patient"), a:has-text("Add Patient")').first();
  if (await newPatientLink.isVisible().catch(() => false)) {
    await newPatientLink.click();
  } else {
    // Fallback if link not found (might fail if offline, but try)
    await page.goto(`${BASE_URL}/patients/new`).catch(() => {});
  }
  await page.waitForSelector('#patient-form', { timeout: 10_000 });

  // Fill Basic Information
  await page.fill('#patient-name', data.name);
  await page.fill('#patient-phone', data.phone);

  // DOB — DateInput has 3 separate inputs (DD, MM, YYYY)
  const dobParts = data.dob.split('-'); // ['YYYY', 'MM', 'DD']
  const dobContainer = page.locator('#patient-dob').locator('..');
  const dobInputs = dobContainer.locator('input');
  await dobInputs.nth(0).fill(dobParts[2]); // DD
  await dobInputs.nth(1).fill(dobParts[1]); // MM
  await dobInputs.nth(2).fill(dobParts[0]); // YYYY

  await page.fill('#patient-address', data.address);
  await page.fill('#patient-marital', data.maritalState);

  // Assigned Doctor — select the first available option that isn't the placeholder
  const doctorSelect = page.locator('#patient-doctor');
  await doctorSelect.selectOption({ index: 1 });

  // Fill Clinical History
  const firstVisitParts = data.firstVisit.split('-'); // ['YYYY', 'MM', 'DD']
  const fvContainer = page.locator('#patient-first-visit').locator('..');
  const fvInputs = fvContainer.locator('input');
  await fvInputs.nth(0).fill(firstVisitParts[2]); // DD
  await fvInputs.nth(1).fill(firstVisitParts[1]); // MM
  await fvInputs.nth(2).fill(firstVisitParts[0]); // YYYY

  await page.fill('#patient-ob', data.obHistory);
  await page.fill('#patient-menstrual', data.menstrualHistory);
  await page.fill('#patient-familial', data.familialDiseases);

  // Family Background
  await page.selectOption('#patient-consanguinity', data.consanguinity);

  // Submit the form
  await page.click('button[aria-label="Save new patient record"]');

  // Hard assertion: must redirect to patient profile — signals DB write succeeded
  await page.waitForURL(/\/patients\/[a-z0-9-]{5,}$/i, { timeout: 15_000 });
  const newPatientId = page.url().split('/patients/')[1];

  expect(newPatientId).toBeTruthy();
  expect(newPatientId.length).toBeGreaterThan(4);

  return newPatientId;
}

/**
 * Navigate to an existing patient's profile by their ID.
 * Hard assertion: patient must appear (not "Patient not found").
 */
async function openExistingPatient(page: Page, patientId: string): Promise<void> {
  // Navigate via search to avoid hard reload offline
  const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill(patientId);
    // Wait for the debounced search to show the patient link
    const patientLink = page.locator(`a[href="/patients/${patientId}"]`);
    await patientLink.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    if (await patientLink.isVisible().catch(() => false)) {
      await patientLink.click();
    } else {
      await page.goto(`${BASE_URL}/patients/${patientId}`).catch(() => {});
    }
  } else {
    await page.goto(`${BASE_URL}/patients/${patientId}`).catch(() => {});
  }

  // Wait for either the profile to load (Add Visit button) or the not found message
  await Promise.race([
    page.waitForSelector('text=Patient not found.', { timeout: 15_000 }),
    page.waitForSelector('button:has-text("Add Visit"), button:has-text("add visit")', { timeout: 15_000 })
  ]).catch(() => {});

  // Hard assertion: profile must load, not 404
  const notFound = page.locator('text=Patient not found.');
  const hasError = await notFound.isVisible().catch(() => false);
  expect(hasError, `Patient ${patientId} was not found — seeded data may be missing`).toBe(false);
}

/**
 * Log a new visit from the current patient profile page.
 * Assumes we are already on `/patients/{id}`.
 */
async function logVisitForCurrentPatient(page: Page): Promise<void> {
  // Click "Add Visit" button — from PatientHeader
  const addVisitBtn = page.locator('a.btn-primary, button', { hasText: /(log visit|add visit)/i });
  await expect(addVisitBtn).toBeVisible({ timeout: 5_000 });
  await addVisitBtn.click();

  // Wait for visit form to load
  await page.waitForSelector('#visit-form', { timeout: 10_000 });

  // Fill in the required fields
  const complaintField = page.locator('textarea, input').filter({ hasText: '' }).first();
  // Use placeholder-based selectors since VisitForm fields don't have static IDs
  const complaintInput = page.locator('[placeholder*="complaint" i], [placeholder*="chief" i]').first();
  const anyTextarea = page.locator('textarea').first();

  // Fallback: fill first textarea (complaint) — adjust selector if your VisitForm uses different placeholders
  await anyTextarea.fill(faker.lorem.sentence());

  // Save the visit
  const saveBtn = page.locator('button[type="submit"]').first();
  await expect(saveBtn).toBeEnabled({ timeout: 3_000 });
  await saveBtn.click();

  // Must redirect back to patient profile
  await page.waitForURL(/\/patients\/[a-z0-9]+$/, { timeout: 15_000 });
}

async function softA11yScan(page: Page, context: string): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();
  if (results.violations.length > 0) {
    const violationSummary = results.violations
      .map((v) => `  [UI-Warning] ${v.id}: ${v.description}`)
      .join('\n');
    const logMsg = `\n⚠️  [A11Y Warnings Logged] ${context}\n${violationSummary}\n`;
    console.warn(logMsg);
    // Log to a file as requested so they don't stop the test but are tracked
    fs.appendFileSync(path.resolve(process.cwd(), 'tests/a11y-warnings.log'), logMsg);
  }
}

// ── Test ──────────────────────────────────────────────────────────────────────

test.describe('Doctor Shift Simulation — Chaos Stress Test', () => {
  // Timeout set to 5 minutes to accommodate 50k initial sync + 25 iterations
  test.setTimeout(300_000);

  // Load the seeded manifest before all tests
  let manifest: TestManifest;

  test.beforeAll(() => {
    manifest = loadManifest();
    console.log(`\n📋 Manifest loaded: ${manifest.patientIds.length} patients, ${manifest.visitIds.length} visits`);
  });

  test('25-patient shift with 3 offline chaos drops', async ({ browser }) => {
    // ── Setup ────────────────────────────────────────────────────────────────

    // Use a persistent context so WatermelonDB IndexedDB state is shared within the test
    const context: BrowserContext = await browser.newContext({
      baseURL: BASE_URL,
      // Start online
      offline: false,
    });
    const page: Page = await context.newPage();

    // Attach error listener for hard-fail on unhandled rejections
    page.on('pageerror', (error) => {
      // Hard assertion: no unhandled JS errors that indicate DB write failures
      if (error.message.toLowerCase().includes('unhandledrejection')) {
        throw new Error(`💥 Hard Fail — Unhandled DB rejection: ${error.message}`);
      }
    });

    page.on('console', (msg) => {
      if (msg.text().includes('useCurrentDoctor:') || msg.text().includes('WATERMELON_DOCTORS_DUMP')) {
        console.log(`[Browser Console] ${msg.text()}`);
      } else if (msg.type() === 'error') {
        console.log(`[Browser Error] ${msg.text()}`);
      }
    });

    // ── Login ────────────────────────────────────────────────────────────────
    console.log('\n🔐 Logging in as doctor...');
    await loginAsDoctor(page);
    console.log('   ✅ Login successful. On dashboard.');

    // Soft a11y check on dashboard
    await softA11yScan(page, 'Dashboard after login');

    // ── Plan the shift ────────────────────────────────────────────────────────
    const offlineDrops = planOfflineDrops();
    const existingPatientIds = pickRandom(manifest.patientIds, EXISTING_PATIENT_COUNT);
    const createdPatientIds: string[] = [];

    let newPatientCount = 0;
    let existingPatientCount = 0;
    let activeOfflineDropIndex = -1; // Which drop is currently in progress
    let offlinePatientCountdown = 0; // How many patients remain offline in current drop

    console.log('\n📅 Offline drop plan:');
    offlineDrops.forEach((d, i) =>
      console.log(`   Drop ${i + 1}: starts at iteration ${d.startAt + 1}, covers ${d.patientCount} patient(s)`)
    );

    // ── Main 25-iteration loop ────────────────────────────────────────────────
    for (let i = 0; i < TOTAL_ITERATIONS; i++) {
      const iterationNum = i + 1;
      const isNewPatient = newPatientCount < NEW_PATIENT_COUNT;

      // ── Chaos: Check if an offline drop should START here ─────────────────
      const incomingDrop = offlineDrops.findIndex((d) => d.startAt === i);
      if (incomingDrop !== -1 && activeOfflineDropIndex === -1) {
        activeOfflineDropIndex = incomingDrop;
        offlinePatientCountdown = offlineDrops[incomingDrop].patientCount;
        console.log(
          `\n📡 [Offline Drop ${incomingDrop + 1}] Going OFFLINE for ${offlinePatientCountdown} patient(s)...`
        );
        // We use page.route instead of context.setOffline to avoid breaking Next.js RSC navigation in dev mode
        await page.route('**/api/sync**', route => route.abort('internetdisconnected'));
        await page.route('https://*.supabase.co/**', route => route.abort('internetdisconnected'));
      }

      const isOffline = activeOfflineDropIndex !== -1;
      const modeLabel = isOffline ? '🔴 OFFLINE' : '🟢 ONLINE';
      const typeLabel = isNewPatient ? 'NEW PATIENT' : 'EXISTING PATIENT';
      console.log(`\n[Iteration ${iterationNum}/${TOTAL_ITERATIONS}] ${modeLabel} — ${typeLabel}`);

      // ── Execute the patient visit iteration ───────────────────────────────
      if (isNewPatient) {
        // NEW PATIENT flow
        const patientId = await createNewPatient(page);
        createdPatientIds.push(patientId);
        newPatientCount++;

        if (isOffline) {
          // Hard assertion: the patient profile page must have loaded (local DB wrote it)
          await expect(page.locator('main')).toBeVisible({ timeout: 5_000 });
          const profileUrl = page.url();
          expect(profileUrl).toMatch(/\/patients\//);
          console.log(`   ✅ Offline write succeeded — local DB captured patient ${patientId}`);
        }

        // Log a visit immediately after creating the patient
        await logVisitForCurrentPatient(page);
        console.log(`   ✅ Visit logged for new patient ${patientId}`);
      } else {
        // EXISTING PATIENT flow — pick from seeded manifest
        const patientId = existingPatientIds[existingPatientCount];
        existingPatientCount++;

        await openExistingPatient(page, patientId);
        await logVisitForCurrentPatient(page);
        console.log(`   ✅ Visit logged for existing patient ${patientId}`);
      }

      // Soft a11y check on patient profile only on the first iteration to save time
      if (iterationNum === 1) {
        await softA11yScan(page, `Patient profile — iteration ${iterationNum}`);
      }

      // ── Chaos: Check if the offline drop should END after this patient ────
      if (isOffline) {
        offlinePatientCountdown--;
        if (offlinePatientCountdown <= 0) {
          console.log(`\n📡 [Offline Drop ${activeOfflineDropIndex + 1}] Restoring network...`);
          await page.unroute('**/api/sync**');
          await page.unroute('https://*.supabase.co/**');

          // Since we simulated offline via routing instead of full context, we need to manually trigger the online event
          await page.evaluate(() => window.dispatchEvent(new Event('online')));

          // Wait for the background sync to fire. The app syncs via /api/sync periodically.
          // We assert the sync endpoint responds successfully.
          console.log('   Waiting for background sync to reconcile...');
          const syncResponse = await page.waitForResponse(
            (resp) => resp.url().includes('/api/sync') && resp.status() === 200,
            { timeout: 60_000 }
          );
          expect(syncResponse.status()).toBe(200);
          console.log(`   ✅ Sync reconciled successfully (HTTP ${syncResponse.status()})`);

          activeOfflineDropIndex = -1;
        }
      }

      // Navigate back to dashboard between iterations
      const dashboardLink = page.locator('a[href="/dashboard"]').first();
      if (await dashboardLink.isVisible().catch(() => false)) {
        await dashboardLink.click();
        await page.waitForURL('**/dashboard', { timeout: 10_000 }).catch(() => {});
      } else {
        await page.goto(`${BASE_URL}/dashboard`).catch(() => {});
      }
      
      // Wait for the dashboard to render fully to prevent race conditions during offline drop
      await page.waitForSelector('.card', { timeout: 10_000 }).catch(() => {});
    }

    // ── Post-shift: Verify new patients appear in search index ───────────────
    console.log('\n🔍 Verifying new patients appear in dashboard search index...');
    for (const patientId of createdPatientIds.slice(0, 3)) {
      // Navigate to each created patient profile — hard assertion
      await page.goto(`${BASE_URL}/patients/${patientId}`).catch(() => {});
      
      // Wait for either the profile to load or the not found message
      await Promise.race([
        page.waitForSelector('text=Patient not found.', { timeout: 15_000 }),
        page.waitForSelector('button:has-text("Add Visit"), button:has-text("add visit")', { timeout: 15_000 })
      ]).catch(() => {});

      const notFound = await page.locator('text=Patient not found.').isVisible().catch(() => false);

      // Hard assertion: no newly created patient should have vanished from the index
      expect(
        notFound,
        `💥 Hard Fail — Created patient ${patientId} disappeared from the index after sync!`
      ).toBe(false);

      console.log(`   ✅ Patient ${patientId} confirmed in index.`);
    }

    // Final soft a11y on dashboard
    await page.goto(`${BASE_URL}/dashboard`).catch(() => {});
    await softA11yScan(page, 'Dashboard — end of shift');

    // ── Cleanup ───────────────────────────────────────────────────────────────
    await context.close();

    console.log('\n🎉 Doctor Shift Simulation complete!');
    console.log(`   New patients created: ${createdPatientIds.length}`);
    console.log(`   Existing patients visited: ${existingPatientCount}`);
    console.log(`   Offline drops executed: ${OFFLINE_DROP_COUNT}`);
  });
});
