import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Emotion extends Model {
  static table = 'emotions';

  @field('emotion_type') emotionType!: string;
  @field('intensity') intensity!: number;
  @field('notes') notes?: string;
  @field('timestamp') timestamp!: number;
  @field('synced') synced!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
