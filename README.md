# IdeaForge – Startup Idea Evaluator 🚀

A complete, premium, crash-free Expo (React Native + TypeScript) mobile application designed to evaluate, rank, and showcase startup concepts with a simulated AI investor scoring engine, real-time community upvoting, and a Hall of Fame leaderboard. Runs seamlessly across **Android**, **iOS**, and **Web**.

---

## 🛠️ Tech Stack

- **Framework:** Expo SDK 52 (React Native 0.76, TypeScript)
- **Navigation & Routing:** Expo Router (3-tab layout: Ideas Feed, Submit Idea, Leaderboard)
- **State Management & Persistence:** Zustand + `@react-native-async-storage/async-storage` (persists theme, submitted ideas, and single-vote state with safe default fallbacks and pre-render hydration)
- **Animations:** React Native Reanimated (worklets only, 60fps transitions)
- **Gestures:** React Native Gesture Handler + PanResponder (swipe right to upvote, swipe left to share)
- **Visuals & Gradients:** `expo-linear-gradient`, `expo-blur`
- **Typography & Icons:** `@expo-google-fonts/inter` (Inter font family), `@expo/vector-icons` (Feather icons)
- **System Utilities:** Safe wrappers for `expo-haptics` and `expo-clipboard` guarded for Web compatibility

---

## 🎨 Themes & Design System

- **Dark Mode:** Deep navy/black (`#0A0618`) with violet-to-cyan neon gradients (`#8B5CF6` to `#06B6D4`), dark cards (`#161033`), and electric glow shadows.
- **Light Mode ("Soft Pastel Glass"):** Off-white lavender background (`#F6F4FF`), pure white frosted cards with soft colored shadows, violet/cyan accents, and high-contrast dark navy text (`#0F172A`).
- **Responsive Web & Mobile Architecture:** Seamless responsive adaptation across mobile phones and desktop web browsers. On mobile devices, renders a native mobile app with a floating pill bottom tab bar. On desktop/tablet displays (`width >= 768px`), automatically transforms into a full-width responsive web application dashboard featuring top header navigation (`Ideas Feed`, `Submit Startup`, `Leaderboard`, `+ Evaluate Startup` CTA), 3 summary analytics metrics cards, a 2-column startup cards grid, side-by-side evaluation methodology and input form, and an expanded Hall of Fame podium.

---

## 📱 Features Implemented

### 1. Submit Screen (`/submit`)
- **Inputs:** Startup Name (with `briefcase` icon), Tagline (with `zap` icon), Description (with `file-text` icon).
- **Interactive UI:** Glass style, live character count counters, focus glow borders, and inline validation with a shake animation on errors.
- **Press-Scale Button:** Gradient "Evaluate Idea with AI" button with spring press feedback.
- **1.5s AI Analysis:** Rotating radar animation with cycling fun messages (*"Scanning addressable market…"*, *"Calling imaginary VCs…"*, *"Crunching TAM calculations…"*) and shimmer progress bar.
- **Evaluation Modal:** Animated rating ring counting up from 0 to score, 3 animated metric bars (*Market*, *Innovation*, *Feasibility*), verdict badge (*"Unicorn potential 🦄"*, *"Shark Tank ready 🦈"*, *"Needs more coffee ☕"*), and particle confetti burst for scores > 85.
- **Storage:** Persisted locally with an instant success toast and seamless navigation to the feed.

### 2. Ideas Screen (`/`)
- **Feed List:** Staggered `FadeInDown` card entrance animations, pull-to-refresh with haptics, and animated empty-state illustration.
- **Stats Strip:** Live count-up numbers for *Total Ideas*, *Total Votes*, and *Average AI Score*.
- **Search & Filter:** Instant search bar filtering by startup name, tagline, or keyword.
- **Segmented Sort:** Sliding indicator toggle between **Top Rating** and **Most Votes**.
- **Interactive Cards:** 24px rounded cards with layered soft shadows, rating ring, verdict chip, vote counter pill, and expandable *"Read more"* description toggle.
- **Gestures:** Swipe right to upvote, swipe left to share formatted pitch.
- **Single-Vote Locking:** Strictly 1 vote per idea per user with Reanimated spring pop animation, safe haptics, and notification toast.
- **Share:** Copies `Name – Tagline (AI score X/100)` to clipboard with instant toast alert.
- **Initial Seed:** 5 realistic sample tech startups preloaded on first launch.

### 3. Leaderboard Screen (`/leaderboard`)
- **Top 5 Hall of Fame:** Displays top startups with an instant toggle between **By Most Votes** and **By AI Score**.
- **Podium Layout:** Top 3 winners featured on gold, silver, and bronze gradient pillars with 🥇🥈🥉 badges, animated shine sweep, and gentle floating oscillation for the #1 winner.
- **Contenders List:** Ranks #4 and #5 rendered as clean list cards with quick upvote and share actions.

### 4. Extras & Platform Guards
- **Floating Pill Tab Bar:** Centered floating pill with sliding active indicator and bottom safe area insets.
- **Toast System:** Spring slide-down banner supporting `success`, `error`, and `info` variants with automatic 2.8s dismissal.
- **Crash Prevention:** `utils/haptics.ts` returns early on Web with `try/catch`. Clipboard and LayoutAnimation are fully guarded.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

### 3. Launching on Platforms
- **Web:** Press `w` in the terminal (or run `npx expo start --web`). Opens at `http://localhost:8081`.
- **Android:** Press `a` in the terminal to launch in an Android Emulator.
- **iOS:** Press `i` in the terminal to launch in an iOS Simulator.
- **Expo Go (Physical Device):**
  1. Install the **Expo Go** app from Google Play Store or Apple App Store.
  2. Scan the QR code displayed in your terminal using the Expo Go camera (Android) or default Camera app (iOS).
  3. The app will bundle and load directly on your phone.

---

## 📦 How to Build Standalone Android APK with EAS

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Initialize build configuration (if not already set):
   ```bash
   eas build:configure
   ```
4. Build the standalone preview APK (no Android Studio required):
   ```bash
   eas build -p android --profile preview
   ```
5. Once EAS Cloud completes the build, download and install the generated `.apk` directly on your Android device.

---

## 📋 Quality & Verification Checklist

- [x] **Haptics:** Safe wrapper returns early on Web with `try/catch`; native haptic feedback triggers cleanly on iOS/Android without throwing.
- [x] **Theme Toggle:** Complete light and dark token sets, system theme auto-detection, fluid sun/moon icon transition, zero crashes.
- [x] **Voting System:** Strictly 1 vote per idea enforced via persisted IDs, spring pop scale animation, and duplicate-vote prevention toasts.
- [x] **Persistence:** Zustand store hydrates before first render with safe defaults for ideas, votes, and theme state in AsyncStorage.
- [x] **Web Mode:** Full responsive desktop shell with centered 480px phone frame, gradient background, zero console errors or warnings.
