import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import schema from './schema';
// Import the models you just created
import Doctor from './model/doctor';
import Patient from './model/patient';
import Visit from './model/visit';

// 1. Set up the browser adapter
const adapter = new LokiJSAdapter({
  schema,
  // We don't have migrations yet, so we can omit them or pass an empty object
  // migrations, 
  useWebWorker: false, // Keep false for standard Next.js setups initially
  useIncrementalIndexedDB: true, // This makes local storage extremely fast
  
  // Optional: This triggers when the database fails to load
  onSetUpError: (error) => {
    console.error('Database failed to load:', error);
  },
});

// 2. Instantiate the database
export const database = new Database({
  adapter,
  modelClasses: [
    Doctor,
    Patient,
    Visit,
  ],
});