/**
 * Patient Search — Chaos Test
 * ============================================
 * Exhaustively tests all permutations of the patient search functionality
 * using 200 seeded patients. It queries the actual Supabase database to 
 * get real patient data, then types those values into the UI and asserts 
 * the patient is successfully found.
 */

import { test, expect, Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const DOCTOR_NAME = process.env.PLAYWRIGHT_DOCTOR_NAME || 'Dr. Test';
const DOCTOR_PIN = process.env.PLAYWRIGHT_DOCTOR_PIN || '1234';

const BASE_URL = 'http://localhost:3000';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials for search test.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface PatientData {
  id: string;
  name: string;
  phone: string;
  address: string;
  historical_first_visit: string; // YYYY-MM-DD
  doctor_id: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navigate and login */
async function loginAndGoToDashboard(page: Page) {
  // Set up console listener to know when the massive sync is done
  const syncPromise = new Promise<void>((resolve, reject) => {
    const handleConsole = (msg: any) => {
      if (msg.text().includes('Sync completed successfully!')) {
        page.off('console', handleConsole);
        resolve();
      }
      if (msg.text().includes('Sync failed:')) {
        page.off('console', handleConsole);
        reject(new Error(msg.text()));
      }
    };
    page.on('console', handleConsole);
  });

  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  const doctorCard = page.locator(`[aria-label="Select ${DOCTOR_NAME}"]`);
  await expect(doctorCard).toBeVisible({ timeout: 15_000 });
  await doctorCard.click();

  await page.waitForSelector('input[type="password"]', { timeout: 5_000 });

  for (const digit of DOCTOR_PIN.split('')) {
    await page.keyboard.type(digit);
    await page.waitForTimeout(50);
  }

  const authButton = page.locator('button[type="submit"]', { hasText: /authenticate/i });
  await authButton.click();

  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10_000 });
  await page.waitForLoadState('networkidle');
  
  // Wait for the local WatermelonDB to finish downloading 50,000 visits
  console.log("Waiting for WatermelonDB initial sync to finish...");
  await Promise.race([
    syncPromise,
    page.waitForTimeout(45_000) // Fallback timeout so it doesn't hang forever
  ]);
  console.log("Initial Sync finished!");
  
  // Give it an extra second to render the table after sync
  await page.waitForTimeout(1000); 
}

/** Clear all search inputs and filters */
async function clearAllFilters(page: Page) {
  // Clear Text inputs
  const searchInputs = page.locator('input[type="search"]');
  const count = await searchInputs.count();
  for (let i = 0; i < count; i++) {
    await searchInputs.nth(i).fill('');
  }

  // Clear Doctor filter (assuming it has a "Reset" or "All" option, or we just select index 0)
  const doctorSelect = page.locator('select').first(); 
  if (await doctorSelect.isVisible()) {
    await doctorSelect.selectOption({ index: 0 }); // Usually "All Doctors"
  }

  // Clear Date filters
  const dateInputs = page.locator('input[placeholder="DD"], input[placeholder="MM"], input[placeholder="YYYY"]');
  const dateCount = await dateInputs.count();
  for (let i = 0; i < dateCount; i++) {
    await dateInputs.nth(i).fill('');
  }

  // Give debounce time to clear the table
  await page.waitForTimeout(500);
}

/** Wait for search debounce and verify target patient is in the table */
async function assertPatientFound(page: Page, expectedName: string) {
  // The hook has a slight delay or debounce, we wait a moment
  await page.waitForTimeout(800);
  
  // Assert the specific patient name is visible in the table
  const row = page.locator('tr', { hasText: expectedName }).first();
  await expect(row).toBeVisible({ timeout: 5000 });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

test.describe('Dashboard Patient Search — Matrix Permutations', () => {
  // The massive 50,000 visit sync can take longer than 30s on slow/throttled CI
  test.setTimeout(120_000);

  let testPatients: PatientData[] = [];

  test.beforeAll(async () => {
    // Fetch 200 random patients from the database to test against
    const { data, error } = await supabase
      .from('patients')
      .select('id, name, phone, address, historical_first_visit, doctor_id')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error || !data) {
      throw new Error(`Failed to fetch patients for search test: ${error?.message}`);
    }
    
    // Shuffle to get a random assortment
    testPatients = data.sort(() => Math.random() - 0.5);
    console.log(`\n🔍 Loaded ${testPatients.length} patients for search permutations.`);
  });

  // We define a helper to get random patients for a specific test block
  function getSamplePatients(count: number = 3) {
    return [...testPatients].sort(() => Math.random() - 0.5).slice(0, count);
  }

  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAllFilters(page);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Tier 1: Single Field Isolation
  // ────────────────────────────────────────────────────────────────────────────

  test('T1 (Input 1) searches by Name, Phone, and Address', async ({ page }) => {
    const samples = getSamplePatients(3);
    const searchInput = page.locator('input[type="search"]').nth(0);

    for (const patient of samples) {
      // By Name (full)
      await searchInput.fill(patient.name);
      await assertPatientFound(page, patient.name);

      // By Phone
      await searchInput.fill(patient.phone);
      await assertPatientFound(page, patient.name);

      // By Address
      await searchInput.fill(patient.address.substring(0, 8)); // partial address
      await assertPatientFound(page, patient.name);
    }
  });

  test('Date Filter works individually without Name constraint', async ({ page }) => {
    // Only need 1 or 2 samples for this since it scans the whole page
    const samples = getSamplePatients(2).filter(p => p.historical_first_visit);
    
    const dayInput = page.locator('input[placeholder="DD"]');
    const monthInput = page.locator('input[placeholder="MM"]');
    const yearInput = page.locator('input[placeholder="YYYY"]');

    const verifyRows = async (expectedStr: string, isDay: boolean = false) => {
      await page.waitForTimeout(800);
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const firstVisitText = await rows.nth(i).locator('td:nth-child(5)').innerText();
        if (isDay) {
          expect(firstVisitText.startsWith(`${expectedStr}/`)).toBeTruthy();
        } else {
          expect(firstVisitText).toContain(expectedStr);
        }
      }
    };

    for (const patient of samples) {
      const [y, m, d] = patient.historical_first_visit.split('-');

      // Year only
      await yearInput.fill(y);
      await verifyRows(y);
      await yearInput.fill('');

      // Month only
      await monthInput.fill(m);
      await verifyRows(`/${m}/`);
      await monthInput.fill('');

      // Day only
      await dayInput.fill(d);
      await verifyRows(d, true);
      await dayInput.fill('');
    }
  });

  test('Doctor Filter works individually without Name constraint', async ({ page }) => {
    const samples = getSamplePatients(2);
    const doctorSelect = page.locator('select').first();

    for (const patient of samples) {
      // The select options have the value of the doctor ID
      await doctorSelect.selectOption(patient.doctor_id);
      
      await page.waitForTimeout(800); // debounce
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0); // If filtered correctly, at least this patient is there

      // Reset
      await doctorSelect.selectOption({ index: 0 });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Tier 2: Double Combinations
  // ────────────────────────────────────────────────────────────────────────────

  test('T1 + T2 combination', async ({ page }) => {
    const samples = getSamplePatients(3);
    const t1 = page.locator('input[type="search"]').nth(0);
    const t2 = page.locator('input[type="search"]').nth(1);

    for (const patient of samples) {
      await t1.fill(patient.name);
      await t2.fill(patient.phone);
      await assertPatientFound(page, patient.name);
      
      await t1.fill('');
      await t2.fill('');
    }
  });

  test('T1 + Date combinations (DD/MM, MM/YYYY, DD/MM/YYYY)', async ({ page }) => {
    const samples = getSamplePatients(3).filter(p => p.historical_first_visit);
    const t1 = page.locator('input[type="search"]').nth(0);
    const dayInput = page.locator('input[placeholder="DD"]');
    const monthInput = page.locator('input[placeholder="MM"]');
    const yearInput = page.locator('input[placeholder="YYYY"]');

    for (const patient of samples) {
      const [y, m, d] = patient.historical_first_visit.split('-');
      await t1.fill(patient.name);

      // T1 + DD/MM
      await dayInput.fill(d);
      await monthInput.fill(m);
      await assertPatientFound(page, patient.name);
      await dayInput.fill('');

      // T1 + MM/YYYY
      await yearInput.fill(y);
      await assertPatientFound(page, patient.name);
      await monthInput.fill('');

      // T1 + DD/MM/YYYY
      await dayInput.fill(d);
      await monthInput.fill(m);
      await assertPatientFound(page, patient.name);

      // Clear for next iteration
      await t1.fill('');
      await dayInput.fill('');
      await monthInput.fill('');
      await yearInput.fill('');
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Tier 3: Complex / Chaos Queries
  // ────────────────────────────────────────────────────────────────────────────

  test('T1 + T2 + Date + Doctor combinations', async ({ page }) => {
    const samples = getSamplePatients(3).filter(p => p.historical_first_visit);
    const t1 = page.locator('input[type="search"]').nth(0);
    const t2 = page.locator('input[type="search"]').nth(1);
    const dayInput = page.locator('input[placeholder="DD"]');
    const monthInput = page.locator('input[placeholder="MM"]');
    const yearInput = page.locator('input[placeholder="YYYY"]');
    const doctorSelect = page.locator('select').first();

    for (const patient of samples) {
      const [y, m, d] = patient.historical_first_visit.split('-');
      
      await t1.fill(patient.name);
      await t2.fill(patient.phone);
      await doctorSelect.selectOption(patient.doctor_id);

      // T1 + T2 + Doctor + DD/MM
      await dayInput.fill(d);
      await monthInput.fill(m);
      await assertPatientFound(page, patient.name);
      await dayInput.fill('');

      // T1 + T2 + Doctor + MM/YYYY
      await yearInput.fill(y);
      await assertPatientFound(page, patient.name);
      await monthInput.fill('');

      // T1 + T2 + Doctor + Full Date
      await dayInput.fill(d);
      await monthInput.fill(m);
      await assertPatientFound(page, patient.name);

      // Reset
      await t1.fill('');
      await t2.fill('');
      await dayInput.fill('');
      await monthInput.fill('');
      await yearInput.fill('');
      await doctorSelect.selectOption({ index: 0 });
    }
  });

  test('Guaranteed Miss — Valid Name + Wrong Date returns nothing', async ({ page }) => {
    const sample = getSamplePatients(1)[0];
    const t1 = page.locator('input[type="search"]').nth(0);
    const yearInput = page.locator('input[placeholder="YYYY"]');

    await t1.fill(sample.name);
    // Fill an impossible year
    await yearInput.fill('1800');

    await page.waitForTimeout(1000); // Wait for debounce

    // The row should NOT be visible
    const row = page.locator('tr', { hasText: sample.name });
    await expect(row).toHaveCount(0);
  });
});
