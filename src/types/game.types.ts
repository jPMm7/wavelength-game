export type GameMode = 'team' | 'coop';
export type GamePhase = 'setup' | 'clue' | 'guess' | 'reveal' | 'score';

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface Card {
  id: string;
  leftConcept: string;
  rightConcept: string;
}

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  teams: Team[];
  currentTeamId: string | null;
  targetScore: number;
  
  // Current Round State
  currentCard: Card | null;
  targetAngle: number; // 0 to 180
  clue: string;
  guessAngle: number; // 0 to 180
  
  // Actions
  setGameConfig: (mode: GameMode, teams: Team[], targetScore: number) => void;
  setPhase: (phase: GamePhase) => void;
  startRound: () => void;
  submitClue: (clue: string) => void;
  submitGuess: (angle: number) => void;
  addScore: (teamId: string, points: number) => void;
  nextTurn: () => void;
  resetGame: () => void;
}
