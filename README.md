# Tic Track

**Tic Track** is a React Native mobile application for tracking Tourette's syndrome events (tics, emotional episodes, and combined events) with Azure Cosmos DB cloud storage and offline SQLite support.

## Features

- ✅ **Offline-first**: Events are saved locally immediately
- ☁️ **Cloud sync**: Automatic background sync to Azure Cosmos DB when online
- 📱 **Cross-platform**: Works on iOS, Android, and Web
- 🔒 **Secure**: Azure credentials stored in encrypted secure storage
- ⚡ **Fast**: Instant event capture with real-time duration tracking
- 📊 **Complete history**: View all your tracked events with sync status

## Screenshots

[Screenshots will be added here]

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Expo CLI** - Install globally with `npm install -g expo-cli`
- **iOS Simulator** (Mac only) or **Android Emulator** for testing
- **Expo Go** app on your physical device (optional)

## Azure Cosmos DB Setup

Tic Track uses Azure Cosmos DB for cloud storage. Follow these steps to set up your database:

### 1. Create Azure Account

1. Go to [Azure Portal](https://portal.azure.com/)
2. Sign up for a free account (includes free tier for Cosmos DB)
3. Verify your email and complete registration

### 2. Create Cosmos DB Account

1. In Azure Portal, search for "Azure Cosmos DB"
2. Click **Create**
3. Choose **Azure Cosmos DB for NoSQL**
4. Fill in the details:
   - **Subscription**: Choose your subscription
   - **Resource Group**: Create new or use existing
   - **Account Name**: Choose a unique name (e.g., `tic-track-db`)
   - **Location**: Choose closest region to you
   - **Capacity mode**: Select **Serverless** (free tier)
5. Click **Review + Create**, then **Create**
6. Wait 5-10 minutes for deployment to complete

### 3. Create Database and Container

1. Navigate to your Cosmos DB account
2. In the left menu, click **Data Explorer**
3. Click **New Container**
4. Fill in:
   - **Database id**: `tic-track` (create new)
   - **Container id**: `events`
   - **Partition key**: `/event_type`
5. Click **OK**

### 4. Get Connection Credentials

1. In your Cosmos DB account, go to **Keys** (left menu)
2. Copy the following values:
   - **URI** (this is your endpoint)
   - **PRIMARY KEY** (this is your key)
3. Keep these secure - you'll need them for configuration

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/tourettesadvocacy/tic-track.git
cd tic-track
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your Azure Cosmos DB credentials:

```dotenv
AZURE_COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
AZURE_COSMOS_KEY=your-primary-key-here
AZURE_COSMOS_DATABASE=tic-track
AZURE_COSMOS_CONTAINER=events
APP_SCHEME=tictrack
```

⚠️ **Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

### 4. Start the Development Server

```bash
npx expo start
```

This will start the Metro bundler and show a QR code.

### 5. Run on Device/Simulator

**Option A: Physical Device**
1. Install **Expo Go** app from App Store (iOS) or Google Play (Android)
2. Scan the QR code with your camera (iOS) or Expo Go app (Android)

**Option B: iOS Simulator** (Mac only)
```bash
npx expo start --ios
```

**Option C: Android Emulator**
```bash
npx expo start --android
```

**Option D: Web Browser**
```bash
npx expo start --web
```

## Usage

### First Time Setup

When you first launch the app:

1. The app will initialize local SQLite database
2. If you have Azure credentials configured, it will connect to cloud storage
3. If not, you can tap **Configure Cloud Sync** to enter your Azure key
4. The app will work offline-first, syncing to cloud when available

### Logging an Event

1. Tap **"I'm Having an Event!"**
2. Select event type:
   - **Tic**: Physical or vocal tics
   - **Emotional**: Emotional episodes
   - **Combined**: Combined tic and emotional episodes
3. The start time is auto-populated (you can edit it)
4. Watch the live duration counter
5. Optionally add:
   - Description
   - Triggers (what caused the event)
   - Notes
6. Tap **"End Event"** when finished (optional)
7. Tap **"Save Event"** to save locally

Events are saved to local SQLite immediately and queued for cloud sync.

### Viewing History

1. Tap **"View History"** from home screen
2. See all your events sorted by most recent
3. Each event shows:
   - Event type badge (Tic/Emotional/Combined)
   - Timestamp
   - Duration (if recorded)
   - Description and triggers
   - Sync status (Local/Synced/Error)
4. Pull down to refresh
5. Tap **"Sync Now"** to manually sync pending events

### Sync Status

The home screen shows sync status:
- **Up to date**: All events synced
- **X events pending sync**: Events waiting to sync
- **Syncing...**: Sync in progress
- **X events failed to sync**: Sync errors (will retry)

Sync happens automatically every 30 seconds when online.

## Project Structure

```
tic-track/
├── App.tsx                      # Main app component
├── app.config.ts                # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
└── src/
    ├── components/
    │   ├── EventLogger.tsx      # Event capture form
    │   ├── EventViewer.tsx      # Event history list
    │   └── SyncPanel.tsx        # Sync status display
    ├── config/
    │   └── azure.ts             # Azure configuration
    ├── services/
    │   ├── localStorage.ts      # SQLite database
    │   ├── cosmosClient.ts      # Azure Cosmos DB client
    │   └── eventSync.ts         # Sync logic
    ├── types/
    │   └── events.ts            # TypeScript types
    └── utils/
        └── datetime.ts          # Date/time helpers
```

## Data Model

### Event Schema

```typescript
interface Event {
  id: string;                    // UUID
  event_type: 'tic' | 'emotional' | 'combined';
  description?: string | null;
  triggers?: string | null;
  notes?: string | null;
  started_at: string;            // ISO 8601 datetime
  ended_at?: string | null;
  duration_seconds?: number | null;
  created_at: string;
  updated_at: string;
  synced_at?: string | null;
  sync_status: 'pending' | 'synced' | 'error';
}
```

## Offline Support

Tic Track is **offline-first**:

- ✅ All events saved locally in SQLite immediately
- ✅ Works completely offline
- ✅ Automatic sync when connection restored
- ✅ Queue-based sync with retry logic
- ✅ Visual sync status indicators

## Azure Cosmos DB Implementation

Tic Track uses the **Azure Cosmos DB REST API** directly instead of the `@azure/cosmos` SDK for React Native compatibility:

- **Why REST API?** The Azure Cosmos DB SDK requires Node.js-specific modules (like `node:crypto`) that aren't available in React Native/Expo environments
- **Authentication:** Uses HMAC-SHA256 signatures generated with `crypto-js` for secure API authentication
- **API Version:** Implements Azure Cosmos DB REST API version `2018-12-31`
- **Compatibility:** Works seamlessly across iOS, Android, and Web platforms

### Key Features:
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ SQL query support with cross-partition queries
- ✅ Automatic request signing with master key authentication
- ✅ Comprehensive error handling (401/403/404/429 status codes)
- ✅ Partition key support for optimal performance

### Limitations vs SDK:
- No automatic retry logic (handled at application layer)
- Manual request construction and signing
- No connection pooling (uses standard `fetch()`)

For more details on the Azure Cosmos DB REST API, see:
- [Azure Cosmos DB REST API Documentation](https://docs.microsoft.com/en-us/rest/api/cosmos-db/)
- [Authorization and Authentication](https://docs.microsoft.com/en-us/rest/api/cosmos-db/access-control-on-cosmosdb-resources)

## Troubleshooting

### "Database not initialized" error

Try restarting the app. If problem persists:
```bash
npm install --force
npx expo start --clear
```

### Sync not working

1. Check internet connection
2. Verify Azure credentials in `.env`
3. Ensure Cosmos DB database and container exist
4. Check app console for detailed error messages

### Events not appearing

1. Pull down in Event Viewer to refresh
2. Tap "Sync Now" to force sync
3. Check sync status on home screen

### Build errors

Clear cache and reinstall:
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

## Deployment

### Build for Production

Use **EAS Build** (Expo Application Services):

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure EAS:
```bash
eas build:configure
```

3. Build for iOS:
```bash
eas build --platform ios
```

4. Build for Android:
```bash
eas build --platform android
```

5. Submit to App Stores:
```bash
eas submit --platform ios
eas submit --platform android
```

See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for details.

## Security Notes

- 🔒 Azure Cosmos DB key stored in **Expo Secure Store** (encrypted)
- 🔒 Never commit `.env` file
- 🔒 Use environment variables for all secrets
- 🔒 Consider read-only tokens for multi-user support (future)

## Future Enhancements

Planned features for future versions:

- [ ] User authentication with Azure AD OAuth
- [ ] Role-based access control (RBAC)
- [ ] Data visualization (charts, trends, heatmaps)
- [ ] Export to PDF/CSV
- [ ] Reminder notifications
- [ ] Apple Health/Google Fit integration
- [ ] Family/caregiver sharing
- [ ] Analytics dashboard
- [ ] Dark mode support
- [ ] Customizable event types
- [ ] Search and filter events

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions:

- Open an issue on [GitHub Issues](https://github.com/tourettesadvocacy/tic-track/issues)
- Contact: [support email]

## Acknowledgments

- Built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/)
- Cloud storage powered by [Azure Cosmos DB](https://azure.microsoft.com/en-us/services/cosmos-db/)
- Icons from [Material Icons](https://fonts.google.com/icons)
- Font: [Manrope](https://fonts.google.com/specimen/Manrope)

---

**Tic Track** - Track your events with confidence 💙
