import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Tic extends Model {
  static table = 'tics';

  @field('type') type!: string;
  @field('severity') severity!: number;
  @field('description') description?: string;
  @field('timestamp') timestamp!: number;
  @field('synced') synced!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
