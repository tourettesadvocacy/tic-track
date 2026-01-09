# Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **Git**
- **Watchman** (for macOS users): `brew install watchman`

### For iOS Development
- **macOS** (required for iOS development)
- **Xcode** (latest version recommended)
- **CocoaPods**: `sudo gem install cocoapods`
- **Xcode Command Line Tools**: `xcode-select --install`

### For Android Development
- **Java Development Kit (JDK)** 11 or newer
- **Android Studio** with:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (AVD)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/tourettesadvocacy/tic-track.git
cd tic-track
```

### 2. Install Dependencies

```bash
npm install
```

### 3. iOS-Specific Setup

Install iOS dependencies with CocoaPods:

```bash
cd ios
pod install
cd ..
```

### 4. Android-Specific Setup

Ensure Android SDK is properly configured:

```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Add these to your `~/.zshrc` or `~/.bash_profile` for persistence.

## Running the App

### Start Metro Bundler

In one terminal window:

```bash
npm start
```

### Run on iOS

In another terminal window:

```bash
npm run ios
```

Or for a specific simulator:

```bash
npm run ios -- --simulator="iPhone 14 Pro"
```

### Run on Android

Make sure you have an Android emulator running or a physical device connected:

```bash
npm run android
```

## Development Workflow

### Hot Reloading

React Native supports hot reloading. Make changes to your code and see them reflected immediately in the app.

- **iOS**: `Cmd + D` → Enable Hot Reloading
- **Android**: `Cmd + M` → Enable Hot Reloading

### Debugging

#### React Native Debugger

1. Enable Debug JS Remotely from the dev menu
2. Open React Native Debugger
3. Connect to localhost:8081

#### Chrome DevTools

1. Enable Debug JS Remotely from the dev menu
2. Navigate to `chrome://inspect`
3. Click "Open dedicated DevTools for Node"

### Inspecting Elements

- **iOS**: `Cmd + D` → Show Inspector
- **Android**: `Cmd + M` → Show Inspector

## Testing

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

## Linting

### Check Code Style

```bash
npm run lint
```

### Auto-fix Issues

```bash
npm run lint -- --fix
```

## Building for Production

### iOS

1. Open `ios/TicTrack.xcworkspace` in Xcode
2. Select your device or simulator
3. Choose Product > Archive
4. Follow the App Store submission process

### Android

Generate a signed APK:

```bash
cd android
./gradlew assembleRelease
```

The APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

## Common Issues

### iOS Build Failures

**Issue**: CocoaPods dependencies not found
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Issue**: Xcode build error
```bash
cd ios
xcodebuild clean
cd ..
```

### Android Build Failures

**Issue**: Gradle build failed
```bash
cd android
./gradlew clean
cd ..
```

**Issue**: SDK location not found
- Ensure `ANDROID_HOME` is set correctly
- Create `android/local.properties`:
  ```
  sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
  ```

### Metro Bundler Issues

**Issue**: Port 8081 already in use
```bash
lsof -ti:8081 | xargs kill -9
npm start
```

**Issue**: Cache issues
```bash
npm start -- --reset-cache
```

## Azure Configuration

### Setting Up Azure Storage

1. Create an Azure Storage Account
2. Navigate to Access Keys
3. Copy the Connection String
4. In the app, go to Settings
5. Paste the connection string
6. Save configuration

### Connection String Format

```
DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net
```

## Environment Variables

Create a `.env` file (optional):

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
AZURE_CONNECTION_STRING=your_connection_string_here
```

## Code Structure

```
src/
├── database/          # WatermelonDB models and schema
│   ├── models/        # Database models (Tic, Emotion)
│   ├── schema.ts      # Database schema definition
│   └── index.ts       # Database initialization
├── services/          # Business logic services
│   ├── AzureStorageService.ts  # Azure integration
│   └── SyncService.ts          # Data synchronization
└── screens/           # React Native screens
    ├── HomeScreen.tsx
    ├── AddTicScreen.tsx
    ├── AddEmotionScreen.tsx
    └── SettingsScreen.tsx
```

## Tips for Development

1. **Use TypeScript**: The project is fully typed, leverage TypeScript for better development experience
2. **React DevTools**: Install React DevTools for component inspection
3. **Flipper**: Consider using Flipper for advanced debugging
4. **Reactotron**: Great tool for Redux/state inspection and API monitoring
5. **ESLint**: Fix linting issues as you code to maintain code quality

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [WatermelonDB Documentation](https://nozbe.github.io/WatermelonDB/)
- [Azure Storage SDK](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/storage/storage-blob)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

## Getting Help

If you encounter issues:

1. Check the [Issues](https://github.com/tourettesadvocacy/tic-track/issues) page
2. Search for similar problems
3. Create a new issue with:
   - Environment details
   - Steps to reproduce
   - Error messages
   - Screenshots (if applicable)
