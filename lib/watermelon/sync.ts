import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './index'; 

// A definitive ping check to ensure actual outbound internet access (solves "Lie-Fi")
const checkInternet = async () => {
  if (!navigator.onLine) return false;
  try {
    // We fetch the root page with a cache-busting query
    // Using HEAD method because it doesn't download the body, saving bandwidth
    const res = await fetch(`/?_ping=${new Date().getTime()}`, { 
      method: 'HEAD',
      // Using AbortSignal to time out quickly (e.g. 3 seconds)
      signal: AbortSignal.timeout(3000) 
    });
    return res.ok;
  } catch {
    return false;
  }
};

export async function sync() {
  try {
    // Prevent sync from starting if we are in "Lie-Fi" or offline
    const hasInternet = await checkInternet();
    if (!hasInternet) {
      console.warn("No actual internet connection detected. Skipping sync.");
      return;
    }

    await synchronize({
      database,
      
      // Phase 1: Ask the server for anything new
      pullChanges: async ({ lastPulledAt }) => {
        // We pass lastPulledAt so the server knows exactly where we left off
        const response = await fetch(`/api/sync?lastPulledAt=${lastPulledAt || 0}`);
        
        if (!response.ok) {
          throw new Error('Failed to pull data from server');
        }

        const { changes, timestamp } = await response.json();
        
        // WatermelonDB needs the server's current time to set the next 'lastPulledAt'
        return { changes, timestamp }; 
      },

      // Phase 2: Send our offline work to the server
      pushChanges: async ({ changes, lastPulledAt }) => {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ changes, lastPulledAt }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to push data to server: ${errorData.details || errorData.error || response.statusText}`);
        }
      },

      // Set to 1 because we don't have schema migrations yet
    //   migrationsEnabledAtVersion: 1, 
    });
    
    console.log('Sync completed successfully!');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}