# Wavelength Online Web Application

Wavelength is a social party game of telepathy, empathy, and perspective. It prioritizes communication, debate, and laughter over complex strategy. This project is a fully playable, interactive digital version of Wavelength built for modern browsers.

---

## 🎮 Game Modes

### 1. Host a Party (Kahoot-Style / Multi-Device)
Designed for social settings with one central "Host Screen" (TV/laptop) and player smartphones as controllers.
* **Lobby & Room System:** Host screen displays a unique Room Code and QR Code.
* **Frictionless Entry:** Scan QR or enter URL/code to join, choose a username, and pick a team.
* **Real-time Synchronization:** Game state syncs in real-time between the phone controllers and the central TV screen.

### 2. Pass & Play (Local / Same Device)
Designed for groups sharing a single physical device.
* **Single-Screen Layout:** UI adapts to show/hide sensitive info.
* **Privacy Guard:** Prompts players to pass the device to the Psychic while others look away.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Database & Realtime Sync:** [Supabase](https://supabase.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* npm, yarn, pnpm, or bun

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd wavelength-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root of the project with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the game.
