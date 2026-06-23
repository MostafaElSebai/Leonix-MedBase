import { Model } from '@nozbe/watermelondb';
import { text, readonly, date, children } from '@nozbe/watermelondb/decorators';

export default class Doctor extends Model {
  static table = 'doctors';
  static associations = {
    visits: { type: 'has_many', foreignKey: 'doctor_id' },
    patients: { type: 'has_many', foreignKey: 'doctor_id' },
  } as const;

  // @text decorator maps the database column to a class property
  @text('name') name!: string;
  @text('email') email!: string;
  @text('pin') pin!: string;

  // WatermelonDB automatically manages these timestamps
  @readonly @date('created_at') createdAt!: number;
  @readonly @date('updated_at') updatedAt!: number;
  @readonly @date('deleted_at') deletedAt?: number;

  // A Doctor has many Visits and Patients
  @children('visits') visits!: any; 
  @children('patients') patients!: any; 
}