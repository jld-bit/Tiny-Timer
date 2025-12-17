# Kids Timer App

## Overview

A child-friendly timer application built with React Native and Expo that helps kids manage activities like homework, screen time, and bedtime routines. The app features colorful activity-based timers with visual progress rings, preset quick-start options, achievement badges, and parent controls. This is a local-first utility app requiring no authentication, with data persisted via AsyncStorage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation with a hybrid pattern:
  - Bottom tab navigator (3 tabs: Timers, Badges, History)
  - Native stack navigator for modals and detail screens (AddTimer, TimerDetail, Settings, ParentDashboard)
- **State Management**: React Context API (TimerContext) for timer state, settings, and progress tracking
- **Data Fetching**: TanStack React Query configured for API calls, though currently local-first
- **Animations**: React Native Reanimated for smooth micro-interactions and progress animations
- **Styling**: StyleSheet-based with a centralized theme system (Colors, Spacing, BorderRadius, Typography)

### Backend Architecture
- **Server**: Express.js with TypeScript, configured for CORS across Replit domains
- **API Routes**: Placeholder structure at `/api` prefix (currently minimal, app is local-first)
- **Database Schema**: Drizzle ORM with PostgreSQL schema defined (users table) but app primarily uses client-side storage
- **Storage Layer**: Abstracted interface (IStorage) with in-memory implementation, ready for database migration

### Data Storage
- **Primary Storage**: AsyncStorage for local persistence of timers, history, settings, progress, and custom activities
- **Data Models**: Timer, HistoryEntry, AppSettings, UserProgress, Activity, Badge types
- **Schema**: PostgreSQL schema via Drizzle (for future sync capabilities)

### Key Design Patterns
- **Path Aliases**: `@/` maps to `./client`, `@shared/` maps to `./shared`
- **Component Structure**: Themed components (ThemedView, ThemedText) that respect color scheme
- **Error Handling**: ErrorBoundary with dev-mode error details
- **Platform Handling**: Web-compatible keyboard handling, platform-specific UI adjustments

### Timer System
- Timers track remaining seconds with pause/resume capability
- Background state handling via AppState listeners
- Haptic feedback on timer events (configurable)
- History logging on completion with badge progression

## External Dependencies

### Core Libraries
- **expo**: SDK 54 with new architecture enabled
- **react-native**: 0.81.5
- **react**: 19.1.0
- **@react-navigation/native**: Navigation container and routing
- **@tanstack/react-query**: Server state management

### UI & Animation
- **react-native-reanimated**: Complex animations and gestures
- **react-native-svg**: Progress ring visualization
- **expo-blur**: Glass-effect headers on iOS
- **expo-haptics**: Tactile feedback
- **@expo/vector-icons**: Feather icon set

### Storage & Data
- **@react-native-async-storage/async-storage**: Local persistence
- **drizzle-orm**: Database ORM (PostgreSQL)
- **drizzle-zod**: Schema validation
- **pg**: PostgreSQL client

### Development
- **tsx**: TypeScript execution for server
- **express**: HTTP server framework
- **http-proxy-middleware**: Dev server proxy