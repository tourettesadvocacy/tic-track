# Tic Track

Mobile app to track tics and emotions with local storage and Azure cloud sync.

## Features

- **Track Tics**: Record different types of tics (motor, vocal) with severity ratings
- **Track Emotions**: Log emotional states with intensity levels
- **Local Storage**: All data is stored locally using WatermelonDB (SQLite-based)
- **Azure Cloud Sync**: Optional upload of data to Azure Blob Storage for backup and analysis
- **Cross-Platform**: Built with React Native for iOS and Android

## Architecture

### Local Database
- **Database**: WatermelonDB with SQLite adapter
- **Models**: 
  - `Tic`: Records tic events with type, severity, description, and timestamp
  - `Emotion`: Records emotional states with type, intensity, notes, and timestamp
- **Schema**: Defined in `src/database/schema.ts`

### Cloud Storage
- **Service**: Azure Blob Storage
- **Upload Format**: JSON files with timestamped data
- **Sync Status**: Each record tracks whether it has been synced to the cloud

## Setup

### Prerequisites
- Node.js >= 16
- React Native development environment
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and JDK

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/tourettesadvocacy/tic-track.git
cd tic-track
```

2. **Install dependencies**
```bash
npm install
```

3. **iOS Setup**
```bash
cd ios
pod install
cd ..
```

4. **Configure Azure (Optional)**

To enable cloud sync, configure your Azure Storage connection string:

- Copy `.env.example` to `.env`
- Add your Azure Storage connection string
- The connection string can also be configured in the app settings

### Running the App

**iOS**
```bash
npm run ios
```

**Android**
```bash
npm run android
```

**Start Metro Bundler**
```bash
npm start
```

## Project Structure

```
tic-track/
├── src/
│   ├── database/
│   │   ├── models/
│   │   │   ├── Tic.ts
│   │   │   └── Emotion.ts
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── AzureStorageService.ts
│   │   └── SyncService.ts
│   └── screens/
│       ├── HomeScreen.tsx
│       ├── AddTicScreen.tsx
│       └── AddEmotionScreen.tsx
├── App.tsx
├── index.js
└── package.json
```

## Usage

### Recording a Tic

1. Open the app
2. Tap "Add Tic"
3. Select the tic type (Motor Simple/Complex, Vocal Simple/Complex, Other)
4. Set severity (1-10)
5. Optionally add a description
6. Tap "Save Tic"

### Recording an Emotion

1. Open the app
2. Tap "Add Emotion"
3. Select the emotion type (Happy, Sad, Anxious, etc.)
4. Set intensity (1-10)
5. Optionally add notes
6. Tap "Save Emotion"

### Syncing to Azure

1. Configure Azure Storage connection string (one-time setup)
2. Tap "Sync to Azure" on the home screen
3. All unsynced data will be uploaded to Azure Blob Storage

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Technologies Used

- **React Native**: Cross-platform mobile framework
- **TypeScript**: Type-safe JavaScript
- **WatermelonDB**: Reactive local database
- **Azure Blob Storage**: Cloud storage service
- **React Navigation**: Navigation library

## Data Privacy

- All data is stored locally on the device by default
- Azure sync is optional and requires user configuration
- No data is shared without explicit user action

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues or questions, please open an issue on GitHub.
