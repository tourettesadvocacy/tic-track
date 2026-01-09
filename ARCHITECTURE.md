# Architecture Documentation

## Overview

Tic Track is a cross-platform mobile application built with React Native that allows users to track tics and emotions. The app features local-first data storage with optional cloud synchronization to Azure Blob Storage.

## Technology Stack

### Frontend
- **React Native 0.72.6**: Cross-platform mobile framework
- **TypeScript 4.8.4**: Type-safe JavaScript
- **React Navigation 6.x**: Navigation and routing

### Data Layer
- **WatermelonDB 0.27.1**: High-performance reactive database built on SQLite
- **AsyncStorage**: For storing configuration and preferences

### Cloud Integration
- **Azure Blob Storage**: Cloud storage for data backup and sync
- **Azure Storage Blob SDK**: JavaScript client for Azure

## Architecture Patterns

### Local-First Architecture
The app follows a local-first architecture where all data is stored locally on the device first. Cloud sync is an optional feature that requires explicit user configuration.

### Database Schema

#### Tics Table
- `id` (string, primary key)
- `type` (string): Type of tic (Motor Simple/Complex, Vocal Simple/Complex, Other)
- `severity` (number): 1-10 scale
- `description` (string, optional): Additional details
- `timestamp` (number): Unix timestamp
- `synced` (boolean): Whether data has been synced to cloud
- `created_at` (number): Record creation time
- `updated_at` (number): Last update time

#### Emotions Table
- `id` (string, primary key)
- `emotion_type` (string): Type of emotion (Happy, Sad, Anxious, etc.)
- `intensity` (number): 1-10 scale
- `notes` (string, optional): Additional notes
- `timestamp` (number): Unix timestamp
- `synced` (boolean): Whether data has been synced to cloud
- `created_at` (number): Record creation time
- `updated_at` (number): Last update time

## Key Components

### Screens

#### HomeScreen
- Displays statistics (total tics, emotions, unsynced items)
- Shows recent tics list
- Provides navigation to add new entries
- Offers manual sync button

#### AddTicScreen
- Form to record new tic entries
- Selection of tic types
- Severity slider (1-10)
- Optional description field

#### AddEmotionScreen
- Form to record new emotion entries
- Selection of emotion types
- Intensity slider (1-10)
- Optional notes field

#### SettingsScreen
- Configure Azure Storage connection string
- View configuration status
- Clear configuration option

### Services

#### AzureStorageService
Handles all interactions with Azure Blob Storage:
- Initialize connection from stored credentials
- Upload data as JSON blobs
- Manage container creation
- Handle authentication and errors

Key Methods:
- `initialize()`: Load connection string from AsyncStorage
- `setConnectionString(string)`: Configure Azure credentials
- `uploadTics(array)`: Upload tic data to Azure
- `uploadEmotions(array)`: Upload emotion data to Azure

#### SyncService
Manages synchronization between local database and cloud:
- Query unsynced records
- Batch upload to Azure
- Mark records as synced
- Handle sync errors

Key Methods:
- `syncTics()`: Sync all unsynced tics
- `syncEmotions()`: Sync all unsynced emotions
- `syncAll()`: Sync both tics and emotions

### Database Models

#### Tic Model
WatermelonDB model for tic records with decorators for fields and timestamps.

#### Emotion Model
WatermelonDB model for emotion records with decorators for fields and timestamps.

## Data Flow

### Recording Data
1. User navigates to Add Tic/Emotion screen
2. User fills in required fields
3. Data is validated
4. Record is created in local database with `synced: false`
5. User returns to home screen
6. Statistics and lists are updated

### Syncing Data
1. User taps "Sync to Azure" button
2. SyncService queries for unsynced records
3. Records are serialized to JSON
4. AzureStorageService uploads to Azure Blob Storage
5. On success, records are marked as `synced: true`
6. UI updates to reflect sync status

## Security Considerations

### Local Data
- All data stored locally in SQLite database
- Database files protected by OS-level app sandboxing
- No data leaves device without explicit user action

### Cloud Credentials
- Azure connection string stored in AsyncStorage
- Connection string input field uses `secureTextEntry`
- Users must explicitly configure cloud sync

### Data Privacy
- No automatic data collection
- No third-party analytics
- User has full control over cloud sync

## Performance Optimizations

### WatermelonDB Benefits
- Lazy loading of records
- Reactive updates only when data changes
- SQLite provides efficient queries
- Background thread for database operations

### Data Upload
- Batch uploads to minimize network requests
- Only upload unsynced records
- Continue tracking locally if upload fails

## Future Enhancements

Potential features for future versions:
- Data visualization (charts, graphs)
- Export data to CSV/PDF
- Scheduled automatic sync
- Pattern analysis and insights
- Reminder notifications
- Multiple user profiles
- Offline-first conflict resolution
- End-to-end encryption for cloud data
