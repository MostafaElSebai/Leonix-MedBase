import { database } from './index';
import { sync } from './sync';
import Patient from './model/patient';
import Visit from './model/visit';
import { Q } from '@nozbe/watermelondb';

// The data types matching the forms
import { NewPatientFormData } from '@/components/ui/patients/NewPatientForm';
import { VisitFormData } from '@/components/ui/visits/VisitForm';

/**
 * Generates a unique 16-character string ID for local creation
 * matching WatermelonDB's randomId generator.
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

// ── Patient Actions ─────────────────────────────────────────────────────────

export async function createPatient(data: NewPatientFormData): Promise<Patient> {
  const result = await database.write(async () => {
    const patientsCollection = database.collections.get<Patient>('patients');
    return await patientsCollection.create((patient) => {
      patient._raw.id = generateId(); // Ensure ID is generated for local sync
      patient.dbSyncStatus = 'created'; // Mark for push
      
      patient.name = data.name;
      patient.phone = data.phone;
      patient.dob = data.dob;
      patient.historicalFirstVisit = data.firstVisitDate;
      patient.address = data.address;
      patient.maritalState = data.maritalState;
      patient.obHistory = data.obHistory;
      patient.menstrualHistory = data.menstrualHistory;
      patient.familialDiseases = data.familialDiseases;
      patient.consanguinity = data.consanguinity;
      patient.notes = data.notes;
      patient.doctorId = data.doctorId;
    });
  });
  
  // Trigger background sync
  sync().catch(console.error);
  return result;
}

export async function updatePatient(patientId: string, data: Partial<NewPatientFormData>): Promise<Patient> {
  const result = await database.write(async () => {
    const patientsCollection = database.collections.get<Patient>('patients');
    const patient = await patientsCollection.find(patientId);
    
    return await patient.update((p) => {
      if (p.dbSyncStatus !== 'created') {
        p.dbSyncStatus = 'updated';
      }
      
      if (data.name !== undefined) p.name = data.name;
      if (data.phone !== undefined) p.phone = data.phone;
      if (data.dob !== undefined) p.dob = data.dob;
      if (data.firstVisitDate !== undefined) p.historicalFirstVisit = data.firstVisitDate;
      if (data.address !== undefined) p.address = data.address;
      if (data.maritalState !== undefined) p.maritalState = data.maritalState;
      if (data.obHistory !== undefined) p.obHistory = data.obHistory;
      if (data.menstrualHistory !== undefined) p.menstrualHistory = data.menstrualHistory;
      if (data.familialDiseases !== undefined) p.familialDiseases = data.familialDiseases;
      if (data.consanguinity !== undefined) p.consanguinity = data.consanguinity;
      if (data.notes !== undefined) p.notes = data.notes;
      if (data.doctorId !== undefined) p.doctorId = data.doctorId;
    });
  });

  // Trigger background sync
  sync().catch(console.error);
  return result;
}

export async function deletePatient(patientId: string): Promise<void> {
  await database.write(async () => {
    const patientsCollection = database.collections.get<Patient>('patients');
    const visitsCollection = database.collections.get<Visit>('visits');
    
    const patient = await patientsCollection.find(patientId);
    // Find all visits associated with the patient to delete them too
    const visits = await visitsCollection.query(Q.where('patient_id', patientId)).fetch();
    
    // WatermelonDB batch operations
    const operations = [
      patient.prepareMarkAsDeleted(),
      ...visits.map(v => v.prepareMarkAsDeleted())
    ];
    
    await database.batch(...operations);
  });

  // Trigger background sync
  sync().catch(console.error);
}

// ── Visit Actions ─────────────────────────────────────────────────────────

export async function createVisit(patientId: string, doctorId: string, data: VisitFormData): Promise<Visit> {
  const result = await database.write(async () => {
    const visitsCollection = database.collections.get<Visit>('visits');
    
    return await visitsCollection.create((visit) => {
      visit._raw.id = generateId();
      visit.dbSyncStatus = 'created';
      
      visit.patient.id = patientId;
      visit.doctor.id = doctorId;
      
      visit.complaint = data.complain;
      visit.drugs = data.drugs;
      visit.examination = data.examination;
      visit.labs = data.labs;
      visit.investigations = data.investigation;
      visit.treatment = data.treatment;
      visit.nextVisitDate = data.nextVisitDate;
      visit.nextVisitType = data.nextVisitType;
      visit.notes = data.notes;
    });
  });

  // Trigger background sync
  sync().catch(console.error);
  return result;
}

export async function updateVisit(visitId: string, data: Partial<VisitFormData>): Promise<Visit> {
  const result = await database.write(async () => {
    const visitsCollection = database.collections.get<Visit>('visits');
    const visit = await visitsCollection.find(visitId);
    
    return await visit.update((v) => {
      if (v.dbSyncStatus !== 'created') {
        v.dbSyncStatus = 'updated';
      }
      
      if (data.complain !== undefined) v.complaint = data.complain;
      if (data.drugs !== undefined) v.drugs = data.drugs;
      if (data.examination !== undefined) v.examination = data.examination;
      if (data.labs !== undefined) v.labs = data.labs;
      if (data.investigation !== undefined) v.investigations = data.investigation;
      if (data.treatment !== undefined) v.treatment = data.treatment;
      if (data.nextVisitDate !== undefined) v.nextVisitDate = data.nextVisitDate;
      if (data.nextVisitType !== undefined) v.nextVisitType = data.nextVisitType;
      if (data.notes !== undefined) v.notes = data.notes;
    });
  });

  // Trigger background sync
  sync().catch(console.error);
  return result;
}

export async function deleteVisit(visitId: string): Promise<void> {
  await database.write(async () => {
    const visitsCollection = database.collections.get<Visit>('visits');
    const visit = await visitsCollection.find(visitId);
    await visit.markAsDeleted();
  });

  // Trigger background sync
  sync().catch(console.error);
}
