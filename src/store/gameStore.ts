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
  winnerId: null,
  
  currentCard: null,
  targetAngle: 90,
  clue: '',
  guessAngle: 90,
  individualGuesses: {},
  teamGuesses: {},

  setGameConfig: (mode, teams, targetScore) => {
    set({
      mode,
      teams: teams.map(t => ({ ...t, score: 0 })),
      targetScore,
      currentTeamId: teams[0]?.id || null,
    });
    get().startRound();
  },
  
  syncTeams: (newTeams) => set((state) => {
    const updatedTeams = [...state.teams];
    let changed = false;
    newTeams.forEach(nt => {
      if (!updatedTeams.find(t => t.id === nt.id)) {
        updatedTeams.push({
          ...nt,
          score: 0,
          psychicIndex: 0
        });
        changed = true;
      }
    });
    return changed ? { teams: updatedTeams } : {};
  }),
  
  startRound: () => {
    // Generate random target angle between 20 and 160 degrees
    const targetAngle = Math.floor(Math.random() * 140) + 20;
    const currentCard = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
    
    set({ 
      phase: 'clue', 
      targetAngle,
      currentCard,
      clue: '', 
      guessAngle: 90,
      individualGuesses: {},
      teamGuesses: {}
    });
  },

  setPhase: (phase) => set({ phase }),
  
  submitClue: (clue, customTarget, nextPhase = 'guess') => set((state) => ({ 
    clue, 
    targetAngle: customTarget !== undefined ? customTarget : state.targetAngle,
    phase: nextPhase 
  })),

  submitIndividualGuess: (guess) => set((state) => ({
    individualGuesses: {
      ...state.individualGuesses,
      [guess.id]: guess
    }
  })),

  setGuessDebatePhase: () => set({ phase: 'guess_debate' }),

  submitTeamGuess: (guess) => set((state) => ({
    teamGuesses: {
      ...state.teamGuesses,
      [guess.id]: guess
    }
  })),
  
  submitGuess: (guessAngle) => set((state) => {
    const calculatePoints = (target: number, guess: number) => {
      const diff = Math.abs(target - guess);
      if (diff <= 5) return 4;
      if (diff <= 15) return 3;
      if (diff <= 25) return 2;
      return 0;
    };

    const newState: Partial<GameState> = { guessAngle, phase: 'reveal' };
    const newTeams = [...state.teams];
    let psychicPoints = 0;
    
    const guessesToScore = state.mode === 'solo' ? state.individualGuesses : state.teamGuesses;
    
    Object.values(guessesToScore).forEach(guess => {
      const points = calculatePoints(state.targetAngle, guess.angle);
      if (points > 0) {
        const teamIndex = newTeams.findIndex(t => t.id === guess.id);
        if (teamIndex !== -1) {
          newTeams[teamIndex] = { ...newTeams[teamIndex], score: newTeams[teamIndex].score + points };
        }
        psychicPoints += 1;
      }
    });

    // In Team mode, the Psychic team gets 1 point per guessing team that scored points
    if (state.mode === 'team' && psychicPoints > 0) {
      const psychicTeamIndex = newTeams.findIndex(t => t.id === state.currentTeamId);
      if (psychicTeamIndex !== -1) {
        newTeams[psychicTeamIndex] = { ...newTeams[psychicTeamIndex], score: newTeams[psychicTeamIndex].score + psychicPoints };
      }
    }
    
    newState.teams = newTeams;
    return newState;
  }),
  
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
    
    const newTeams = [...state.teams];
    if (currentTeamIndex !== -1) {
      newTeams[currentTeamIndex] = {
        ...newTeams[currentTeamIndex],
        psychicIndex: (newTeams[currentTeamIndex].psychicIndex || 0) + 1
      };
    }

    set({ 
      currentTeamId: state.teams[nextTeamIndex]?.id || null,
      teams: newTeams
    });
    get().startRound();
  },

  resetGame: () => set({
    phase: 'setup',
    teams: [],
    currentTeamId: null,
    winnerId: null,
    currentCard: null,
    clue: '',
    guessAngle: 90,
    individualGuesses: {}
  }),
  
  setTeamPsychicIndex: (teamId, index) => set((state) => ({
    teams: state.teams.map(t => t.id === teamId ? { ...t, psychicIndex: index } : t)
  })),

  setGameOver: (teamId) => set({ phase: 'game_over', winnerId: teamId })
}));
