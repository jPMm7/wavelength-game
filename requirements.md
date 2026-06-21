# Product Requirements: Wavelength Online Web Application

## 1. Game Overview & Core Loop
At its core, Wavelength is a social guessing game about telepathy, empathy, and perspective. It prioritizes communication, debate, and laughter over complex strategy.

**The Core Loop**: A rotating dial on a semi-circle hides a secret target on a spectrum. One player (the Psychic) knows the target. They draw a card with two opposing concepts (e.g., Hot / Cold). The Psychic thinks of a clue occupying the exact relative position of the target. The Psychic's teammates then debate and rotate a physical dial to match the clue. The closer they get, the more points they score. The opposing team guesses Left or Right of the dial.

**Genre**: Social Party Game, Cooperative and Competitive.
**Theme**: "Psychic" Telepathy, Spectrum-Based Communication.
**Target Audience**: Casual Gamers, Large Groups, Families.

---

## 2. Primary Goal of the Website
To provide a fully playable, interactive digital version of Wavelength. It is a high-engagement gameplay portal requiring no downloads or mandatory accounts to start, utilizing a clean, responsive web interface for both desktop and mobile.

---

## 3. Core Gameplay Modes

### A. Local Mode ("Pass & Play" / Same Device)
Designed for groups around a single physical device.
- **Single-Screen Layout**: UI adapts to show/hide sensitive info.
- **Privacy Guard**: Displays "Pass the device to the Psychic. Everyone else, look away!"
- **Physical-Style Dial**: Large, touch-friendly interactive dial.

### B. Party Mode ("Kahoot-Style" / Multi-Device)
Designed for social settings with one central "Host Screen" (TV/laptop) and player smartphones as controllers.
- **Lobby & Room System**: Host screen displays a 4-to-6 character Room Code and QR Code.
- **Frictionless Entry**: Scan QR or enter URL/code to join, choose username, and pick a team.
- **State Syncing**: Real-time sync between phone controllers and the central TV screen.

---

## 4. Game Phases & Interaction Flow

`[ Setup ] ──> [ The Clue ] ──> [ The Guess ] ──> [ Reveal & Score ]`

**Phase 1: Setup & Role Assignment**
- Lobby assembly and team splitting.
- Role selection (1 Psychic, rest are Guessers).

**Phase 2: The Secret Target & The Clue (Psychic's Turn)**
- Random opposing concept pair drawn.
- Target wheel appears (Psychic can random spin or manually set).
- Psychic inputs optional text clue and submits. Target disappears.

**Phase 3: The Guess (Guessers' Turn)**
- Screen displays concepts and the clue.
- In Multi-Device, one "Driver" controls the dial while teammates discuss. In Local, everyone discusses.
- Lock in the guess.

**Phase 4: The Reveal, Scoring & Leaderboard**
- Shutter slides open revealing the target and guess.
- Score is calculated based on proximity.
- The opposing team guesses Left/Right for 1 bonus point.
- Leaderboard updates and turn passes.

---

## 5. Site Map & Feature Architecture

### A. General Pages (Publicly Accessible)
- **Homepage (`/` or `/home`)**: Hero section, Quick Join Module (Room Code), Game Mode Selector (Host a Party, Pass & Play).
- **About / How to Play (`/how-to-play`)**: Interactive tutorial dial, rule breakdown, card gallery carousel.

### B. Local Mode View Architecture (`/local/...`)
- **Local Setup Screen (`/local/setup`)**: Team/player input, target score selector, deck customization.
- **Local Gameplay Hub (`/local/play`)**: Manages Phase transitions (Intermission shield, Psychic View, Guesser View, Reveal Screen).

### C. Party Mode View Architecture (Kahoot-Style)
- **Host Screens (`/host/[room-id]`)**: Host lobby (QR code), Phase 2 (Psychic thinking), Phase 3 (Guessing debate, live dial updates), Phase 4 (Big reveal, points), Host Leaderboard.
- **Player Controller Screens (`/play/[room-id]`)**: Mobile Join Screen, Lobby View, Psychic View (write clue), Driver View (rotate dial), Audience View (spectating/suggesting), Reveal View (haptic feedback).
