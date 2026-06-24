import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    }
  );
}

// Helper to convert DB timestamps to ms for WatermelonDB
function mapRowToWatermelon(row: any) {
  const result = { ...row };
  if (result.created_at) result.created_at = new Date(result.created_at).getTime();
  if (result.updated_at) result.updated_at = new Date(result.updated_at).getTime();
  if (result.deleted_at) result.deleted_at = new Date(result.deleted_at).getTime();
  return result;
}

// Helper to convert WatermelonDB timestamps (ms) to ISO strings for Supabase
function mapWatermelonToRow(row: any) {
  const result = { ...row };
  if (result.created_at) result.created_at = new Date(result.created_at).toISOString();
  if (result.updated_at) result.updated_at = new Date(result.updated_at).toISOString();
  if (result.deleted_at) result.deleted_at = new Date(result.deleted_at).toISOString();
  
  // PostgreSQL throws "invalid input syntax for type date" if we send "" instead of null
  if (result.dob === "") result.dob = null;
  if (result.historical_first_visit === "") result.historical_first_visit = null;
  if (result.next_visit_date === "") result.next_visit_date = null;
  
  // Clean up WatermelonDB specific fields that shouldn't go to Supabase
  delete result.sync_status;
  delete result._status;
  delete result._changed;

  return result;
}

async function pullTable(supabase: any, tableName: string, lastPulledAt: number) {
  let allData: any[] = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    // Add explicit ordering to ensure stable pagination
    let query = supabase.from(tableName).select("*").order('id');
    
    if (lastPulledAt > 0) {
      const dateIso = new Date(lastPulledAt).toISOString();
      // Only get rows updated or deleted since last pull
      query = query.or(`updated_at.gt.${dateIso},deleted_at.gt.${dateIso}`);
    }

    // Fetch in pages of 1000 to bypass Supabase's max_rows restriction
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      allData = allData.concat(data);
    }

    // If we received less than a full page, we're done
    if (!data || data.length < pageSize) {
      break;
    }
    page++;
  }

  const created: any[] = [];
  const updated: any[] = [];
  const deleted: string[] = [];

  if (allData.length > 0) {
    allData.forEach((row: any) => {
      if (row.deleted_at) {
        deleted.push(row.id);
      } else if (lastPulledAt > 0 && new Date(row.created_at).getTime() <= lastPulledAt) {
        updated.push(mapRowToWatermelon(row));
      } else {
        created.push(mapRowToWatermelon(row));
      }
    });
  }

  return { created, updated, deleted };
}

// ---------------------------------------------------------
// PULL
// ---------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lastPulledAtParam = searchParams.get('lastPulledAt');
  const lastPulledAt = lastPulledAtParam && lastPulledAtParam !== 'null' ? parseInt(lastPulledAtParam, 10) : 0;

  try {
    const supabase = await getServerClient();
    
    const changes = {
      doctors: await pullTable(supabase, 'doctors', lastPulledAt),
      patients: await pullTable(supabase, 'patients', lastPulledAt),
      visits: await pullTable(supabase, 'visits', lastPulledAt),
    };

    return NextResponse.json({ 
      changes, 
      timestamp: Date.now() // The server's current time in milliseconds
    });
  } catch (error: any) {
    console.error("Pull failed:", error);
    return NextResponse.json({ error: 'Pull failed', details: error.message }, { status: 500 });
  }
}

async function pushTable(supabase: any, tableName: string, changes: any) {
  const { created, updated, deleted } = changes;

  // Insert created (using upsert for idempotency against network retries)
  if (created && created.length > 0) {
    const rows = created.map(mapWatermelonToRow);
    const { error } = await supabase.from(tableName).upsert(rows);
    if (error) throw error;
  }

  // Update updated
  if (updated && updated.length > 0) {
    const rows = updated.map(mapWatermelonToRow);
    const { error } = await supabase.from(tableName).upsert(rows);
    if (error) throw error;
  }

  // Soft-delete deleted (WatermelonDB sends an array of IDs)
  if (deleted && deleted.length > 0) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from(tableName)
      .update({ deleted_at: now, updated_at: now })
      .in('id', deleted);
    if (error) throw error;
  }
}

// ---------------------------------------------------------
// PUSH:
// ---------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { changes } = body;
    const supabase = await getServerClient();

    await pushTable(supabase, 'patients', changes.patients || { created: [], updated: [], deleted: [] });
    await pushTable(supabase, 'visits', changes.visits || { created: [], updated: [], deleted: [] });
    await pushTable(supabase, 'doctors', changes.doctors || { created: [], updated: [], deleted: [] });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Push failed:", error);
    return NextResponse.json({ error: 'Push failed', details: error.message }, { status: 500 });
  }
}