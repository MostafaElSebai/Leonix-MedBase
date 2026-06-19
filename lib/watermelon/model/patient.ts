import { Model } from '@nozbe/watermelondb';
import { text, readonly, date, children } from '@nozbe/watermelondb/decorators';

export default class Patient extends Model {
  static table = 'patients';

  @text('sync_status') dbSyncStatus!: string;
  @text('name') name!: string;
  @text('phone') phone!: string;
  @text('dob') dob!: string;
  @text('historical_first_visit') historicalFirstVisit!: string;
  @text('address') address!: string;
  @text('marital_state') maritalState!: string;
  @text('ob_history') obHistory!: string;
  @text('menstrual_history') menstrualHistory!: string;
  @text('familial_diseases') familialDiseases!: string;
  @text('consanguinity') consanguinity!: string;
  @text('notes') notes?: string;
  @text('doctor_id') doctorId!: string;

  @readonly @date('created_at') createdAt!: number;
  @readonly @date('updated_at') updatedAt!: number;
  @readonly @date('deleted_at') deletedAt?: number;

  // A Patient has many Visits
  @children('visits') visits!: any;
}