import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tics',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'severity', type: 'number' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'timestamp', type: 'number' },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'emotions',
      columns: [
        { name: 'emotion_type', type: 'string' },
        { name: 'intensity', type: 'number' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'timestamp', type: 'number' },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
