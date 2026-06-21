# Architecture Blueprint & Tech Stack

## 1. Core Technology Stack
- **Framework**: Next.js (App Router, React 19) for SSR, secure room APIs, and fast client-side routing.
- **Language**: TypeScript for strict typing and preventing logical errors in the game loop.
- **Styling**: Tailwind CSS + Tailwind Merge for predictable utility classes.
- **Animation**: Framer Motion for handling the physics of the dial, sliding transitions, and tactile feedback.
- **State Management**: Zustand for lightweight, hook-based state isolation of the active game.
- **Icons**: Lucide React for sleek, vector-based SVG icons.

## 2. Real-Time Sync & Networking (Party Mode)
- **Real-Time Engine**: Firebase Firestore (or Supabase Realtime).
- **Strategy**: Treat a "Room" as a single document. Whenever the Host or a Player changes something, the document updates, and the entire room reacts in real-time via `onSnapshot` listeners.

## 3. Key Background & Utility Features
- **Real-Time State Synchronization Engine**: Keeps all clients in Party Mode strictly synced.
- **Device Orientation Guard**: Prompts phone users to use portrait mode, and host users to use landscape mode to ensure UI consistency.
- **Custom Prompt Card Creator**: Allows users to write custom spectrum pairs dynamically.

## 4. Agentic Coding Blueprint (Folder Structure)
We enforce a Modular Component Architecture to keep components clean and predictable:
```text
wavelength-game/
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── page.tsx            # Main Landing / Lobby Page
│   │   ├── local/              # Same-Device Mode Screen
│   │   └── play/[roomId]/      # Multi-Device Host & Controller Routing
│   ├── components/
│   │   ├── ui/                 # Atomic UI primitives (Buttons, Modals, Cards)
│   │   ├── wheel/              # Wavelength Dial & Pointer components
│   │   └── game/               # Phase-specific screens (Clue, Guess, Scoring)
│   ├── hooks/
│   │   ├── useWavelengthMath.ts # Angle, distance, and score calculation engine
│   │   └── useRoomSync.ts      # Firebase/Realtime listener state management
│   ├── store/
│   │   └── gameStore.ts        # Zustand local game state slice
│   ├── types/
│   │   └── game.types.ts       # Unified TypeScript interface definitions
│   └── utils/
│       └── prompts.ts          # Central database of wavelength card clues
```

## 5. Critical Mathematical & Logic Contracts

**The Coordinate Wheel Contract:**
The physical dial is a semicircle (180°). The secret target value is mapped to a center angle ($\theta_T$) where:
$$\theta_T \in [0^\circ, 180^\circ]$$

**Scoring Mechanics Formula:**
The pointer angle ($\theta_P$) is set by the guessers. The score awarded is based on the absolute deviation ($d = |\theta_T - \theta_P|$):
- **5 Points (Bullseye)**: $d \le 2^\circ$
- **4 Points (Inner Ring)**: $2^\circ < d \le 6^\circ$
- **3 Points (Outer Ring)**: $6^\circ < d \le 12^\circ$
- **0 Points**: $d > 12^\circ$
