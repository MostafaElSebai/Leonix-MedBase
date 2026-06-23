import { Model } from '@nozbe/watermelondb';
import { text, readonly, date, relation } from '@nozbe/watermelondb/decorators';

export default class Visit extends Model {
  static table = 'visits';
  static associations = {
    patients: { type: 'belongs_to', key: 'patient_id' },
    doctors: { type: 'belongs_to', key: 'doctor_id' },
  } as const;

  @text('sync_status') dbSyncStatus!: string;
  @text('complaint') complaint!: string;
  @text('drugs') drugs?: string;
  @text('examination') examination?: string;
  @text('labs') labs?: string;
  @text('investigations') investigations?: string;
  @text('treatment') treatment?: string;
  @text('next_visit_date') nextVisitDate?: string;
  @text('next_visit_type') nextVisitType?: string;
  @text('notes') notes?: string;

  @readonly @date('created_at') createdAt!: number;
  @readonly @date('updated_at') updatedAt!: number;
  @readonly @date('deleted_at') deletedAt?: number;

  // @relation connects the 'patient_id' column to the Patient Model
  @relation('patients', 'patient_id') patient!: any;
  @relation('doctors', 'doctor_id') doctor!: any;
}