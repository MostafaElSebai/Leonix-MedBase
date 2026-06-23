"use client";

import  { createContext, useContext, useEffect } from 'react';
import { database } from '@/lib/watermelon/index';
import { Database } from '@nozbe/watermelondb';

// Database Context
const DatabaseContext = createContext<Database | null>(null);

// Provider Component
export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let syncInterval: NodeJS.Timeout;
    let handleOnline: () => void;

    import('@/lib/watermelon/sync').then(({ sync }) => {
      const runSync = async () => {
        // sync() now handles checking for Lie-Fi internally!
        sync().catch(err => console.error("Background sync failed", err));
      };

      // 1. Sync on initial load
      runSync();

      // 2. Sync periodically (every 5 minutes)
      syncInterval = setInterval(runSync, 5 * 60 * 1000);

      // 3. Sync immediately when network reconnects
      handleOnline = runSync;
      window.addEventListener('online', handleOnline);
    });

    return () => {
      if (syncInterval) clearInterval(syncInterval);
      if (handleOnline) window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Custom hook for easy access in components
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}