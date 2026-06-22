export type GameMode = 'team' | 'coop' | 'solo';
export type GamePhase = 'setup' | 'clue' | 'guess' | 'guess_blind' | 'guess_debate' | 'reveal' | 'score' | 'game_over';

export interface IndividualGuess {
  id: string;
  name: string;
  angle: number;
  color?: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  color?: string;
  psychicIndex?: number;
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
  winnerId: string | null;
  
  // Current Round State
  currentCard: Card | null;
  targetAngle: number; // 0 to 180
  clue: string;
  guessAngle: number; // 0 to 180
  individualGuesses: Record<string, IndividualGuess>;
  teamGuesses: Record<string, IndividualGuess>;
  
  // Actions
  setGameConfig: (mode: GameMode, teams: Team[], targetScore: number) => void;
  syncTeams: (teams: any[]) => void;
  setPhase: (phase: GamePhase) => void;
  startRound: () => void;
  submitClue: (clue: string, customTarget?: number, nextPhase?: GamePhase) => void;
  submitIndividualGuess: (guess: IndividualGuess) => void;
  setGuessDebatePhase: () => void;
  submitTeamGuess: (guess: IndividualGuess) => void;
  submitGuess: (angle: number) => void;
  addScore: (teamId: string, points: number) => void;
  nextTurn: () => void;
  resetGame: () => void;
  setTeamPsychicIndex: (teamId: string, index: number) => void;
  setGameOver: (teamId: string) => void;
}
