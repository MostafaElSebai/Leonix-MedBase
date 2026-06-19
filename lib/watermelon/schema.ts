import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'doctors',
      columns: [
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'pin', type: 'string' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'patients',
      columns: [
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string', isIndexed: true },
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'phone', type: 'string', isIndexed: true },
        // Dates like DOB are kept as strings (YYYY-MM-DD) to prevent timezone shifts
        { name: 'dob', type: 'string' }, 
        { name: 'historical_first_visit', type: 'string', isIndexed: true},
        { name: 'address', type: 'string'},
        { name: 'marital_state', type: 'string'},
        { name: 'ob_history', type: 'string'},
        { name: 'menstrual_history', type: 'string'},
        { name: 'familial_diseases', type: 'string'},
        { name: 'consanguinity', type: 'string'},
        { name: 'notes', type: 'string', isOptional: true},
        { name: 'doctor_id', type: 'string', isIndexed: true},
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'visits',
      columns: [
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string', isIndexed: true },
        // isIndexed: true is critical here so you can quickly load all visits for a specific patient/doctor
        { name: 'patient_id', type: 'string', isIndexed: true },
        { name: 'doctor_id', type: 'string', isIndexed: true },
        { name: 'complaint', type: 'string', isOptional: true },
        { name: 'drugs', type: 'string', isOptional: true },
        { name: 'examination', type: 'string', isOptional: true },
        { name: 'labs', type: 'string', isOptional: true },
        { name: 'investigations', type: 'string', isOptional: true },
        { name: 'treatment', type: 'string', isOptional: true },
        { name: 'next_visit_date', type: 'string', isOptional: true },
        { name: 'next_visit_type', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
  ],
});
