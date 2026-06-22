import { create } from 'zustand';
import { GameState, GameMode, Team, GamePhase, Card } from '@/types/game.types';

const MOCK_CARDS: Card[] = [
  { id: '1', leftConcept: 'Hot', rightConcept: 'Cold' },
  { id: '2', leftConcept: 'Ugly', rightConcept: 'Beautiful' },
  { id: '3', leftConcept: 'Soft', rightConcept: 'Hard' },
  { id: '4', leftConcept: 'Bad Movie', rightConcept: 'Good Movie' },
  { id: '5', leftConcept: 'Smells Bad', rightConcept: 'Smells Good' },
  { id: '6', leftConcept: 'Useless', rightConcept: 'Useful' },
  { id: '7', leftConcept: 'Boring', rightConcept: 'Exciting' },
  { id: '8', leftConcept: 'Under-rated', rightConcept: 'Over-rated' }
];

export const useGameStore = create<GameState>((set, get) => ({
  mode: 'team',
  phase: 'setup',
  teams: [],
  currentTeamId: null,
  targetScore: 10,
  
  currentCard: null,
  targetAngle: 90,
  clue: '',
  guessAngle: 90,

  setGameConfig: (mode, teams, targetScore) => {
    set({
      mode,
      teams: teams.map(t => ({ ...t, score: 0 })),
      targetScore,
      currentTeamId: teams[0]?.id || null,
    });
    get().startRound();
  },
  
  startRound: () => {
    // Generate random target angle between 20 and 160 degrees
    const targetAngle = Math.floor(Math.random() * 140) + 20;
    const currentCard = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
    
    set({
      targetAngle,
      currentCard,
      clue: '',
      guessAngle: 90,
      phase: 'clue'
    });
  },

  setPhase: (phase) => set({ phase }),
  
  submitClue: (clue, customTarget) => set((state) => ({ 
    clue, 
    targetAngle: customTarget !== undefined ? customTarget : state.targetAngle,
    phase: 'guess' 
  })),
  
  submitGuess: (guessAngle) => set({ guessAngle, phase: 'reveal' }),
  
  addScore: (teamId, points) => set((state) => ({
    teams: state.teams.map(t => t.id === teamId ? { ...t, score: t.score + points } : t)
  })),

  nextTurn: () => {
    const state = get();
    // Determine next team
    const currentTeamIndex = state.teams.findIndex(t => t.id === state.currentTeamId);
    let nextTeamIndex = 0;
    if (currentTeamIndex !== -1 && currentTeamIndex < state.teams.length - 1) {
      nextTeamIndex = currentTeamIndex + 1;
    }
    set({ currentTeamId: state.teams[nextTeamIndex]?.id || null });
    get().startRound();
  },

  resetGame: () => set({
    phase: 'setup',
    teams: [],
    currentTeamId: null,
    currentCard: null,
    clue: '',
    guessAngle: 90
  })
}));
