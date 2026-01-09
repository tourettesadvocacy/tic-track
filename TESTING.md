# Testing Tic Track

This document explains how to test the Tic Track application.

## Testing Without Azure Cosmos DB

The app is designed to work **offline-first**, so you can test all core functionality without configuring Azure Cosmos DB:

1. Leave the Azure credentials empty in `.env`:
   ```dotenv
   AZURE_COSMOS_ENDPOINT=
   AZURE_COSMOS_KEY=
   ```

2. Start the app:
   ```bash
   npx expo start
   ```

3. All features will work using local SQLite storage:
   - ✅ Create events
   - ✅ View event history
   - ✅ Edit event details
   - ✅ Real-time duration tracking
   - ❌ Cloud sync (requires Azure configuration)

## Testing With Azure Cosmos DB

To test cloud sync functionality:

1. Set up Azure Cosmos DB (see README.md)

2. Add credentials to `.env`:
   ```dotenv
   AZURE_COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
   AZURE_COSMOS_KEY=your-primary-key-here
   AZURE_COSMOS_DATABASE=tic-track
   AZURE_COSMOS_CONTAINER=events
   ```

3. Restart the app

4. Test sync features:
   - ✅ Manual sync
   - ✅ Automatic background sync
   - ✅ Sync status indicators
   - ✅ Offline queue with retry

## Running Tests

### Start Development Server

```bash
npx expo start
```

Options:
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your device

### TypeScript Type Checking

```bash
npx tsc --noEmit
```

### Build for Production

iOS:
```bash
eas build --platform ios
```

Android:
```bash
eas build --platform android
```

## Manual Testing Checklist

### Event Creation
- [ ] Create tic event
- [ ] Create emotional event
- [ ] Create combined event
- [ ] Live duration counter updates
- [ ] End event button works
- [ ] Save event without description
- [ ] Save event with all fields filled

### Event Viewing
- [ ] Events display in list
- [ ] Events sorted by most recent first
- [ ] Event type badges show correct colors
- [ ] Sync status badges display correctly
- [ ] Pull to refresh works
- [ ] Empty state shows when no events

### Sync (with Azure configured)
- [ ] Manual sync button works
- [ ] Pending events sync to cloud
- [ ] Sync status updates correctly
- [ ] Failed syncs show error message
- [ ] Auto-sync runs in background
- [ ] Works after coming back online

### Offline Mode
- [ ] Events save locally without internet
- [ ] App works in airplane mode
- [ ] Sync queues events for later
- [ ] Events sync when connection restored

### Edge Cases
- [ ] Very long event descriptions
- [ ] Events with special characters
- [ ] Multiple events created quickly
- [ ] App restart preserves data
- [ ] Large number of events (100+)

## Known Limitations

- Web platform has limited SQLite support (uses WebSQL fallback)
- Date picker UI differs between iOS and Android
- Push notifications not yet implemented
- No data export functionality yet

## Troubleshooting

### "Database not initialized"
- Restart the app
- Clear cache: `npx expo start --clear`

### "Cosmos DB not configured"
- Check `.env` file exists and has correct values
- Restart app after changing `.env`
- Verify Azure credentials are correct

### Events not appearing
- Pull down to refresh
- Check console for errors
- Verify SQLite database initialized

## Performance Testing

Test with increasing numbers of events:
- 10 events
- 100 events
- 1000 events

Monitor:
- Load time
- Scroll performance
- Sync duration
- Memory usage

## Security Testing

- [ ] Azure key stored securely (not in logs)
- [ ] No sensitive data in error messages
- [ ] HTTPS used for all API calls
- [ ] Input validation on all fields
- [ ] SQL injection protection (parameterized queries)

## Reporting Issues

When reporting issues, include:
1. Device/platform (iOS/Android/Web)
2. OS version
3. Expo Go version or built app version
4. Steps to reproduce
5. Error messages from console
6. Screenshots if applicable
