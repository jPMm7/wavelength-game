# Design System & Aesthetics

## 1. Visual Vibe and Aesthetic
- **Modern Mid-Century / "Retro-Future" Vibe**: The art style features a beautiful, clean, retro-futuristic aesthetic combining vibrant, trippy pastel colors, surreal landscapes, and minimalist graphic design.
- **Tactile Appeal**: The UI should feel like a physical device (old-school radio or retro sci-fi console).
- **Atmosphere**: Conversational, warm, and highly engaging.

## 2. Interactive Design Elements
- **Tactile Dial physics**: Dragging the wheel should feel smooth, with subtle clicking sounds.
- **The "Reveal" Animation**: The sliding cover mechanism animated with a satisfying mechanical "cluck" or "shutter" sound effect.
- **Audio Feedback**: Synthesizer clicks for dial rotation, shutter slide for reveal, victory/defeat tunes.

## 3. Visual Identity: Kahoot-Style Playful Tactility
To capture the high-stakes, energetic vibe, the design language uses bold, high-contrast, chunky physical elements.

### A. Custom Color Palette
```javascript
// tailwind.config.js snippet
module.exports = {
  theme: {
    extend: {
      colors: {
        imperial_blue: {
          DEFAULT: '#03256c',
          100: '#010716', 200: '#010f2c', 300: '#021642',
          400: '#021d58', 500: '#03256c', 600: '#053ebb',
          700: '#165ef9', 800: '#6494fb', 900: '#b1c9fd',
        },
        bright_ocean: {
          DEFAULT: '#1a8fe3',
          100: '#051d2e', 200: '#0b3a5b', 300: '#105789',
          400: '#1573b7', 500: '#1a8fe3', 600: '#48a6ea',
          700: '#76bdef', 800: '#a4d3f4', 900: '#d1e9fa',
        },
        cream: {
          DEFAULT: '#ebefbf',
          100: '#404511', 200: '#818922', 300: '#c0cc35',
          400: '#d5de79', 500: '#ebefbf', 600: '#eff2cb',
          700: '#f3f5d8', 800: '#f7f8e5', 900: '#fbfcf2',
        },
        frosted_mint: {
          DEFAULT: '#eaf7cf',
          100: '#384e0d', 200: '#709b1a', 300: '#a4dd34',
          400: '#c7ea81', 500: '#eaf7cf', 600: '#eef8d9',
          700: '#f2fae2', 800: '#f6fcec', 900: '#fbfdf5',
        },
      }
    }
  }
}
```

### B. Functional UI Color Mapping
- **Primary Backgrounds**: Rich, deep `imperial_blue-500` or `imperial_blue-400` layers create a dark, premium digital arena.
- **High-Contrast Action Cards**: Warm, striking `cream-500` blocks highlight crucial game controls, and spectrum clues.
- **Secondary Interactive Elements**: Bright, energetic `bright_ocean-500` details give a modern, neon-like accent to the controls.
- **Success Alerts & Score Indicators**: Electric `frosted_mint-500` zones signify correct actions, perfect guesses, and active-ready states.

### C. Aesthetic Principles (The Kahoot Feel)
- **Chunky 3D Buttons (No Flat UI)**: Every button should have a physical thickness. We achieve this with deep offset bottom-borders and translate animations:
  ```html
  <button class="bg-bright_ocean border-b-8 border-bright_ocean-300 hover:border-b-4 hover:translate-y-[4px] active:border-b-0 active:translate-y-[8px] transition-all rounded-2xl text-white font-extrabold px-6 py-4 text-xl">
    LOCK GUESS!
  </button>
  ```
- **Ultra-Rounded Corners**: Avoid sharp edges. Standardize layouts to use extreme rounding (`rounded-2xl` to `rounded-3xl`).
- **Heavy Drop Shadows**: Use solid black or extra-saturated deep blue drop shadows (`shadow-[4px_4px_0px_0px_#010f2c]`) instead of fuzzy radial shadows. This makes elements pop out off the page like real cards.
