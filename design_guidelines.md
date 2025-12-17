# Kids Timer App - Design Guidelines

## Architecture Decisions

### Authentication
**No authentication required.** This is a local-first utility app for kids.
- Include a **Settings screen** accessible from header with:
  - Parent controls toggle (requires simple PIN to access advanced settings)
  - Sound on/off toggle
  - Haptics on/off toggle
  - Theme selector (if implementing color variants)
  - App info (version, privacy policy placeholder)

### Navigation
**Tab Navigation (3 tabs)**
- **Timers** (Home): Active and preset timers
- **Add Timer** (Center, primary action): Large, prominent tab with "+" icon
- **History**: Recently used timers and activity completion stats

### Information Architecture

#### Screen 1: Timers (Home)
- **Purpose**: View active timers and quick-start preset timers
- **Layout**:
  - Header: Transparent, settings gear icon (right)
  - Scrollable content with safe area: top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl
  - Two sections:
    - "Running Timers" (if any active): Large card-based list showing progress rings
    - "Quick Start": Grid of preset timer cards (2 columns on phone, 3-4 on tablet)
- **Components**: Progress ring cards, preset activity buttons, empty state illustration when no active timers

#### Screen 2: Add Timer (Modal from Center Tab)
- **Purpose**: Create custom timer or select preset
- **Layout**:
  - Native modal presentation
  - Header: "New Timer" title, X close button (left)
  - Scrollable form with safe area: bottom: insets.bottom + Spacing.xl
  - Activity selector (large icons in grid)
  - Large minute picker (wheel or stepper, 1-60 minutes)
  - Big "Start Timer" button at bottom
- **Components**: Activity icon grid, minute picker, primary action button

#### Screen 3: Timer Detail (Stack Screen)
- **Purpose**: Full-screen focus view when timer is running
- **Layout**:
  - Header: Transparent, back arrow (left), delete icon (right)
  - Centered content (not scrollable)
  - Large circular progress ring (70% of screen width)
  - Time remaining in huge, easy-to-read numbers inside ring
  - Activity name and icon above ring
  - Floating control buttons at bottom with safe area: bottom: tabBarHeight + Spacing.xl
- **Components**: Progress ring, time display, pause/resume/reset buttons
- **Shadow for floating buttons**:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2

#### Screen 4: History
- **Purpose**: See completed activities and celebrate achievements
- **Layout**:
  - Header: Default, "History" title
  - Scrollable list with safe area: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl
  - Cards showing completed timers with celebration stickers/badges
- **Components**: Completion cards, achievement badges, weekly summary

#### Screen 5: Settings
- **Purpose**: Parent controls and app configuration
- **Layout**:
  - Header: Default, "Settings" title, back button (left)
  - Scrollable form with toggles and options
  - Safe area: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl
- **Components**: Toggle switches, selection lists

## Design System

### Color Palette
**Primary Colors (bright, playful):**
- Primary: `#FF6B6B` (Coral Red) - main actions, active states
- Secondary: `#4ECDC4` (Turquoise) - timers, progress
- Accent: `#FFD93D` (Sunny Yellow) - celebrations, highlights
- Success: `#95E1D3` (Mint Green) - completed timers

**Background:**
- Background: `#FFF9F0` (Warm Cream) - main background
- Card Background: `#FFFFFF` (White) - cards, timers
- Surface: `#F8F8F8` (Light Gray) - secondary surfaces

**Text:**
- Primary Text: `#2D3436` (Charcoal) - headings, time displays
- Secondary Text: `#636E72` (Gray) - labels, descriptions

### Typography
- **Display (Time)**: System Bold, 72-96pt (huge numbers kids can see from distance)
- **Heading**: System Bold, 24-32pt (activity names)
- **Body**: System Medium, 16-18pt (descriptions, labels)
- **Caption**: System Regular, 14pt (secondary info)

### Visual Design
- **Icons**: Use Feather icons from @expo/vector-icons for UI controls
- **Activity Icons**: Generate 8 custom playful illustrations for common activities:
  1. Homework (book with pencil)
  2. Screen Time (tablet with stars)
  3. Brush Teeth (toothbrush with sparkles)
  4. Bedtime (moon and stars)
  5. Playtime (toys and blocks)
  6. Cleanup (broom with dust)
  7. Snack Time (apple and cookie)
  8. Reading Time (open book with bookmark)
- **Progress Rings**: Thick stroke (12-16pt), animated, colorful gradients
- **Touch Targets**: Minimum 60x60pt (larger than standard 44pt for small fingers)
- **Corner Radius**: 
  - Cards: 20pt (very rounded, friendly)
  - Buttons: 16pt
  - Progress rings: circular
- **No drop shadows** except on floating action buttons (specified above)

### Interaction Design
- **All buttons**: Scale down to 0.95 on press with haptic feedback
- **Timer start**: Celebratory animation (confetti or sparkle effect)
- **Timer complete**: 
  - Cheerful chime sound
  - Screen celebration animation (stars, confetti burst)
  - Haptic success pattern
  - Show completion badge
- **Swipe gestures**: Swipe timer cards left to delete (with colorful confirmation)
- **Preset timers**: Single tap to instantly start (no confirmation needed for speed)

### Accessibility
- **Large text support**: All text scales appropriately
- **VoiceOver labels**: Descriptive labels for all interactive elements ("Start homework timer, 30 minutes")
- **Color contrast**: All text meets WCAG AA standards despite playful colors
- **Reduce motion**: Respect system settings, use simple fades instead of complex animations