# Development Guide

This guide is for developers who want to contribute to or modify Tic Track.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/tourettesadvocacy/tic-track.git
cd tic-track

# Install dependencies
npm install

# Start development server
npx expo start
```

## Project Structure

```
tic-track/
├── App.tsx                          # Main app entry point
├── app.config.ts                    # Expo configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── .env.example                     # Environment variable template
├── .env                            # Your local environment (git-ignored)
├── README.md                        # User documentation
├── TESTING.md                       # Testing guide
├── DEVELOPMENT.md                   # This file
└── src/
    ├── components/                  # React components
    │   ├── EventLogger.tsx         # Event creation form
    │   ├── EventViewer.tsx         # Event list view
    │   └── SyncPanel.tsx           # Sync status display
    ├── config/                     # Configuration
    │   └── azure.ts                # Azure Cosmos DB config
    ├── services/                   # Business logic
    │   ├── localStorage.ts         # SQLite operations
    │   ├── cosmosClient.ts         # Azure Cosmos DB client
    │   └── eventSync.ts            # Sync orchestration
    ├── types/                      # TypeScript definitions
    │   └── events.ts               # Event data types
    └── utils/                      # Utility functions
        └── datetime.ts             # Date/time helpers
```

## Architecture

### Data Flow

```
User Input → EventLogger → localStorage (SQLite) → eventSync → cosmosClient → Azure Cosmos DB
                                ↓
                          EventViewer ← getMergedEvents ← [Local + Cloud]
```

### Offline-First Design

1. **Write**: Events are immediately saved to local SQLite
2. **Queue**: Events marked as `sync_status: 'pending'`
3. **Sync**: Background process syncs pending events to cloud
4. **Read**: UI displays merged view of local + cloud data

### Sync Process

```typescript
// Every 30 seconds (when online)
1. Query local events where sync_status = 'pending'
2. For each pending event:
   - Upload to Cosmos DB
   - On success: Update sync_status = 'synced'
   - On error: Update sync_status = 'error'
3. Update UI with sync state
```

## Key Components

### App.tsx
- Main application shell
- Navigation between screens
- App initialization
- Sync state management

### EventLogger.tsx
- Event creation form
- Real-time duration tracking
- Date/time pickers
- Form validation

### EventViewer.tsx
- Event list display
- Pull-to-refresh
- Sync controls
- Empty states

### SyncPanel.tsx
- Sync status indicator
- Manual sync trigger
- Last sync timestamp

## Services

### localStorage.ts
- SQLite database initialization
- CRUD operations for events
- Sync status management
- Query helpers

### cosmosClient.ts
- Azure Cosmos DB connection
- Event upload/download
- Error handling
- Connection testing

### eventSync.ts
- Background sync orchestration
- Merge local + cloud events
- Retry logic for failed syncs
- Sync state tracking

## Database Schema

### SQLite (Local)

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  description TEXT,
  triggers TEXT,
  notes TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  sync_status TEXT DEFAULT 'pending'
);

CREATE INDEX idx_events_sync_status ON events(sync_status);
CREATE INDEX idx_events_started_at ON events(started_at DESC);
```

### Cosmos DB (Cloud)

- **Database**: `tic-track`
- **Container**: `events`
- **Partition Key**: `/event_type`
- **Schema**: Same as SQLite (stored as JSON documents)

## Adding New Features

### 1. Add a New Event Field

**Step 1**: Update type definition
```typescript
// src/types/events.ts
export interface Event {
  // ... existing fields
  new_field?: string | null;  // Add new field
}
```

**Step 2**: Update SQLite schema
```typescript
// src/services/localStorage.ts
// Add column to CREATE TABLE statement
// Update INSERT and SELECT queries
```

**Step 3**: Update UI
```typescript
// src/components/EventLogger.tsx
// Add input field for new_field
```

**Step 4**: Test sync
- Verify uploads to Cosmos DB
- Verify downloads from Cosmos DB

### 2. Add a New Screen

**Step 1**: Create component
```typescript
// src/components/NewScreen.tsx
export const NewScreen: React.FC = () => {
  return <View>...</View>;
};
```

**Step 2**: Add to App.tsx
```typescript
// App.tsx
type Screen = 'home' | 'logger' | 'viewer' | 'newScreen';

{currentScreen === 'newScreen' && <NewScreen />}
```

### 3. Add a New Event Type

**Step 1**: Update type definition
```typescript
// src/types/events.ts
export type EventType = 'tic' | 'emotional' | 'combined' | 'newType';
```

**Step 2**: Update UI labels
```typescript
// src/components/EventViewer.tsx
const EVENT_TYPE_LABELS: Record<EventType, string> = {
  // ... existing types
  newType: 'New Type',
};
```

## Code Style

### TypeScript
- **Strict mode enabled**: No `any` types
- **Explicit types**: Always specify return types for functions
- **Null safety**: Use `| null` for nullable fields

### React
- **Functional components**: Use hooks, not classes
- **TypeScript**: Always type props with interfaces
- **Async/await**: Prefer over `.then()` chains

### Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

## Common Tasks

### Add a Dependency
```bash
npm install package-name
npm install -D @types/package-name  # If needed
```

### Run TypeScript Check
```bash
npx tsc --noEmit
```

### Clear Cache
```bash
npx expo start --clear
```

### View Bundle Size
```bash
npx expo export --platform web
ls -lh dist/
```

## Debugging

### Enable Debug Logging

Add to App.tsx:
```typescript
if (__DEV__) {
  console.log('Debug mode enabled');
  // Enable more verbose logging
}
```

### Inspect SQLite Database

Use a SQLite viewer to inspect local database:
- iOS Simulator: `~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/...`
- Android Emulator: Use `adb pull`

### Monitor Network Requests

Check Cosmos DB calls in console:
```typescript
// src/services/cosmosClient.ts
console.log('Uploading event:', event.id);
```

## Performance Optimization

### Large Event Lists
- Implement pagination (currently loads all events)
- Use `FlatList` virtualization (already implemented)
- Consider caching cloud events locally

### Sync Performance
- Batch uploads (currently uploads one-by-one)
- Implement exponential backoff for errors
- Add network condition detection

### Database Performance
- Ensure indexes are created (already done)
- Use transactions for bulk operations
- Avoid N+1 queries

## Testing

### Unit Tests (Future)
```bash
npm test
```

### E2E Tests (Future)
```bash
npm run e2e
```

### Manual Testing
See TESTING.md for comprehensive test checklist

## Deployment

### Web
```bash
npx expo export --platform web
# Deploy dist/ to static hosting
```

### iOS (via EAS)
```bash
eas build --platform ios
eas submit --platform ios
```

### Android (via EAS)
```bash
eas build --platform android
eas submit --platform android
```

## Troubleshooting

### Metro bundler errors
```bash
npx expo start --clear
rm -rf node_modules && npm install
```

### TypeScript errors
```bash
npx tsc --noEmit
```

### Expo Go connection issues
- Ensure device and computer on same network
- Check firewall settings
- Try tunnel mode: `npx expo start --tunnel`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npx tsc --noEmit` to check types
5. Test thoroughly
6. Submit a pull request

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Azure Cosmos DB Docs](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

- Open an issue on GitHub
- Check existing issues for solutions
- Review documentation in README.md and TESTING.md
