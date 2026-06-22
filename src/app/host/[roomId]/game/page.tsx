'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { GameDial } from '@/components/wheel/GameDial';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ArrowRight, X, Clock, EyeOff, Users, FastForward, Settings, Minus, Plus, SkipForward, Crown, Home, Trophy, RefreshCcw } from 'lucide-react';
import { Confetti } from '@/components/ui/Confetti';

function HostGameContent() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  
  const store = useGameStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEndGameModalOpen, setIsEndGameModalOpen] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);

  // Initialization from Lobby
  useEffect(() => {
    if (isInitialized) return;
    
    const storedTeams = localStorage.getItem(`wave_room_teams_${roomId}`);
    const storedPlayers = localStorage.getItem(`wave_room_${roomId}`);
    const config = localStorage.getItem(`wave_room_config_${roomId}`);
    
    if (storedTeams && storedPlayers) {
      const t = JSON.parse(storedTeams);
      const p = JSON.parse(storedPlayers);
      const c = config ? JSON.parse(config) : { mode: 'team' };
      
      const gameTeams = t.map((team: any) => ({
        ...team,
        score: 0,
        psychicIndex: 0
      }));
      
      setPlayers(p);
      store.setGameConfig(c.mode, gameTeams, 10);
      store.startRound();
      setIsInitialized(true);
    } else {
      router.push(`/host/${roomId}`);
    }
  }, [roomId, isInitialized, store, router]);

  // Broadcast Master State
  useEffect(() => {
    if (!isInitialized) return;
    
    const masterState = {
      mode: store.mode,
      phase: store.phase,
      teams: store.teams,
      currentTeamId: store.currentTeamId,
      currentCard: store.currentCard,
      targetAngle: store.targetAngle,
      clue: store.clue,
      guessAngle: store.guessAngle,
      targetScore: store.targetScore,
      individualGuesses: store.individualGuesses,
      winnerId: store.winnerId
    };
    
    localStorage.setItem(`wave_room_state_${roomId}`, JSON.stringify(masterState));
  }, [
    isInitialized, roomId, 
    store.phase, store.teams, store.currentTeamId, 
    store.currentCard, store.targetAngle, store.clue, 
    store.guessAngle, store.targetScore, store.individualGuesses, store.winnerId
  ]);

  // Listen for actions from Player Phones
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      
      try {
        if (e.key === `wave_room_clue_${roomId}` && store.phase === 'clue') {
          const payload = JSON.parse(e.newValue);
          store.submitClue(payload.clue, payload.targetAngle, 'guess_blind');
        }
        
        if (e.key === `wave_room_secret_guess_${roomId}` && store.phase === 'guess_blind') {
          const payload = JSON.parse(e.newValue);
          store.submitIndividualGuess(payload);
        }
        
        if (e.key === `wave_room_guess_${roomId}` && store.phase === 'guess_debate') {
          const payload = JSON.parse(e.newValue);
          store.setGuessAngle(payload.angle);
        }
        
        if (e.key === `wave_room_action_${roomId}`) {
          const action = JSON.parse(e.newValue);
          if (action.type === 'LOCK_GUESS' && store.phase === 'guess_debate') {
            store.submitGuess(store.guessAngle);
          }
        }
      } catch (err) {
        console.error('Failed to parse incoming action', err);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isInitialized, roomId, store]);

  // Auto-advance logic for guess_blind
  useEffect(() => {
    if (store.phase === 'guess_blind') {
      const currentTeam = store.teams.find(t => t.id === store.currentTeamId);
      const guessingPlayers = store.mode === 'solo' 
        ? players.filter(p => p.id !== currentTeam?.id)
        : players.filter(p => p.teamId !== currentTeam?.id);
      
      const numGuessers = Math.max(1, guessingPlayers.length);
      
      if (Object.keys(store.individualGuesses).length >= numGuessers) {
        if (store.mode === 'solo') {
          store.submitGuess(90); // Dummy guess to trigger reveal
        } else {
          store.setGuessDebatePhase();
        }
      }
    }
  }, [store.phase, store.individualGuesses, store.teams, store.currentTeamId, players, store]);


  if (!isInitialized || !store.currentCard || !store.teams.length) {
    return <div className="min-h-screen bg-imperial_blue-500 flex items-center justify-center text-white text-2xl font-bold uppercase tracking-widest">Loading Engine...</div>;
  }

  const currentTeam = store.teams.find(t => t.id === store.currentTeamId);
  const guessingPlayers = store.mode === 'solo' 
    ? players.filter(p => p.id !== currentTeam?.id)
    : players.filter(p => p.teamId !== currentTeam?.id);
  const numGuessers = Math.max(1, guessingPlayers.length);
  const submittedCount = Object.keys(store.individualGuesses).length;
  const individualGuessesArray = Object.values(store.individualGuesses);

  const handleMakeLeader = (teamId: string, playerId: string) => {
    const teamPlayers = players.filter(p => p.teamId === teamId);
    const index = teamPlayers.findIndex(p => p.id === playerId);
    if (index !== -1) {
      store.setTeamPsychicIndex(teamId, index);
    }
  };

  const handleKickPlayer = (id: string) => {
    const updatedPlayers = players.filter(p => p.id !== id);
    setPlayers(updatedPlayers);
    localStorage.setItem(`wave_room_${roomId}`, JSON.stringify(updatedPlayers));
  };

  const handleSkipTurn = () => {
    store.nextTurn();
    store.startRound();
  };

  const handleAdjustScore = (teamId: string, delta: number) => {
    store.addScore(teamId, delta);
    const team = store.teams.find(t => t.id === teamId);
    if (team && (team.score + delta) >= store.targetScore) {
      store.setGameOver(teamId);
    }
  };

  const handleForcePhase = (phase: any) => {
    store.setPhase(phase);
  };

  const calculatePoints = (target: number, guess: number) => {
    const diff = Math.abs(target - guess);
    if (diff <= 5) return 4;
    if (diff <= 15) return 3;
    if (diff <= 25) return 2;
    return 0;
  };

  const handleNextRound = () => {
    let highestScoreTeamId: string | null = null;
    let maxScore = -1;

    // Find the winner
    store.teams.forEach(t => {
      if (t.score >= store.targetScore && t.score > maxScore) {
        highestScoreTeamId = t.id;
        maxScore = t.score;
      }
    });
    
    if (highestScoreTeamId) {
      store.setGameOver(highestScoreTeamId);
      return;
    }
    
    store.nextTurn();
    store.startRound();
  };

  return (
    <div className="min-h-screen lg:h-screen flex p-4 lg:p-6 bg-gradient-to-b from-imperial_blue-500 to-imperial_blue-600 overflow-hidden relative">
      
      {/* Game Content */}
      <div className={`flex-1 flex flex-col w-full h-full overflow-y-auto lg:overflow-hidden transition-transform duration-500 ease-in-out ${isControlPanelOpen ? 'lg:-translate-x-[200px]' : ''}`}>
        
        {/* Header: Scores */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 bg-imperial_blue-400 p-3 md:p-4 rounded-2xl md:rounded-3xl border-4 border-imperial_blue-300 shadow-[0_4px_0_0_#010f2c] gap-4 shrink-0">
        <div className="flex gap-4">
          {store.teams.map(team => (
            <div key={team.id} className={`px-6 py-2 rounded-xl font-bold text-xl uppercase tracking-widest border-2 border-transparent transition-all ${team.id === store.currentTeamId ? 'bg-cream-500 text-imperial_blue-800 shadow-[0_4px_0_0_#010f2c] -translate-y-1' : 'text-white bg-imperial_blue-500 border-imperial_blue-300'}`}>
              {team.name}: {team.score}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-bright_ocean-500 font-bold uppercase tracking-widest hidden md:block">
            Playing to {store.targetScore}
          </div>
          <button 
            onClick={() => setIsControlPanelOpen(true)}
            className="text-white hover:text-bright_ocean-500 bg-black/20 hover:bg-black/40 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-bold shadow-[0_2px_0_0_#010f2c] active:shadow-none active:translate-y-[2px]"
          >
            <Settings className="w-5 h-5" /> CONTROLS
          </button>
          <button 
            onClick={() => setIsEndGameModalOpen(true)}
            className="text-red-400 hover:text-white bg-black/20 hover:bg-red-500 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-bold shadow-[0_2px_0_0_#010f2c] active:shadow-none active:translate-y-[2px]"
          >
            <X className="w-5 h-5" /> END GAME
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full space-y-4 md:space-y-6 min-h-0">
        
        {/* The Card */}
        <div className="w-full flex justify-between items-center bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-4 md:border-8 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] shrink-0">
          <div className="text-lg md:text-3xl lg:text-4xl font-black text-imperial_blue-800 uppercase text-center flex-1 break-words leading-tight">
            {store.currentCard.leftConcept}
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-bright_ocean-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0 mx-4 border-4 border-white shadow-inner">
            VS
          </div>
          <div className="text-xl md:text-4xl font-black text-imperial_blue-800 uppercase text-center flex-1 break-words">
            {store.currentCard.rightConcept}
          </div>
        </div>

        {/* Phase: Clue */}
        {store.phase === 'clue' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in zoom-in duration-500">
            <EyeOff className="w-24 h-24 md:w-32 md:h-32 text-frosted_mint-500 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] animate-pulse" />
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-[0_4px_0_#010f2c]">
                Psychic Phase
              </h1>
              <p className="text-xl md:text-3xl font-bold text-cream-500 uppercase tracking-widest bg-black/20 p-6 rounded-2xl border border-black/10 shadow-inner">
                Waiting for the {currentTeam?.name} Psychic to provide a clue...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-bright_ocean-500 font-bold uppercase tracking-widest animate-pulse">
              <Clock className="w-6 h-6" />
              Check your device
            </div>
          </div>
        )}

        {/* Phase: Guess Blind (Individual Secret Guesses) */}
        {store.phase === 'guess_blind' && (
          <div className="w-full flex-1 flex flex-col min-h-0 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-4 md:border-8 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] text-center shrink-0">
              <h2 className="text-sm md:text-lg font-bold text-bright_ocean-500 uppercase tracking-widest mb-1 md:mb-2">The Clue Is:</h2>
              <p className="text-3xl md:text-5xl font-black text-imperial_blue-800 uppercase leading-tight">"{store.clue}"</p>
            </div>

            <div className="flex-1 min-h-0 bg-imperial_blue-400 p-4 md:p-8 rounded-2xl md:rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] flex flex-col items-center justify-center">
              <Users className="w-24 h-24 text-bright_ocean-500 mb-6 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] animate-pulse" />
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest text-center mb-4">
                Secret Input
              </h2>
              <p className="text-xl md:text-2xl font-bold text-cream-500 text-center max-w-lg mb-8">
                {currentTeam?.name}, check your devices and lock in your individual guesses!
              </p>
              
              <div className="bg-imperial_blue-500/50 px-8 py-4 rounded-full border-4 border-imperial_blue-300 shadow-inner flex items-center gap-4">
                <span className="text-2xl font-bold text-bright_ocean-500 uppercase">Ready:</span>
                <span className="text-4xl font-black text-white tracking-widest">{submittedCount} / {numGuessers}</span>
              </div>
            </div>
            
            <div className="flex justify-center shrink-0">
              <button 
                onClick={() => store.setGuessDebatePhase()}
                className="text-white/50 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest transition-colors"
              >
                <FastForward className="w-5 h-5" /> Force Reveal
              </button>
            </div>
          </div>
        )}

        {/* Phase: Guess Debate (Cluster + Captain's Wheel) */}
        {store.phase === 'guess_debate' && (
          <div className="w-full flex-1 flex flex-col min-h-0 space-y-4 md:space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-4 md:border-8 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] text-center shrink-0">
              <h2 className="text-sm md:text-lg font-bold text-bright_ocean-500 uppercase tracking-widest mb-1 md:mb-2">The Clue Is:</h2>
              <p className="text-3xl md:text-5xl font-black text-imperial_blue-800 uppercase leading-tight">"{store.clue}"</p>
            </div>

            <div className="flex-1 min-h-0 bg-imperial_blue-400 p-4 md:p-8 rounded-2xl md:rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] flex flex-col">
              <h2 className="text-xl md:text-2xl font-black text-cream-500 mb-4 md:mb-6 uppercase tracking-widest text-center shrink-0 animate-pulse">
                Debate! The Captain is driving...
              </h2>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <GameDial 
                  targetAngle={store.targetAngle} 
                  guessAngle={store.guessAngle} 
                  shutterOpen={false} 
                  interactive={false}
                  individualGuesses={individualGuessesArray}
                />
              </div>
            </div>
          </div>
        )}

        {/* Phase: Reveal */}
        {store.phase === 'reveal' && (
          <div className="w-full flex-1 flex flex-col min-h-0 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-4 md:border-8 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] text-center shrink-0">
              <h2 className="text-sm md:text-lg font-bold text-bright_ocean-500 uppercase tracking-widest mb-1 md:mb-2">The Clue Was:</h2>
              <p className="text-3xl md:text-5xl font-black text-imperial_blue-800 uppercase leading-tight">"{store.clue}"</p>
            </div>

            <div className="flex-1 min-h-0 bg-imperial_blue-400 p-4 md:p-8 rounded-2xl md:rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] flex flex-col">
              <div className="mb-4 md:mb-6 flex justify-center shrink-0">
                {store.mode === 'solo' ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    {individualGuessesArray.map(guess => {
                      const pts = calculatePoints(store.targetAngle, guess.angle);
                      return pts > 0 ? (
                        <div key={guess.id} className="px-4 py-2 bg-frosted_mint-500 border-2 border-frosted_mint-300 rounded-xl shadow-[0_2px_0_0_#010f2c]">
                          <span className="font-bold text-imperial_blue-800 uppercase">{guess.name}: +{pts}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className={`px-6 py-2 md:px-8 md:py-3 rounded-2xl border-4 shadow-[0_4px_0_0_#010f2c] ${calculatePoints(store.targetAngle, store.guessAngle) > 0 ? 'bg-frosted_mint-500 border-frosted_mint-300' : 'bg-red-500 border-red-300'}`}>
                    <h2 className="text-2xl md:text-4xl font-black text-imperial_blue-800 uppercase tracking-widest text-center drop-shadow-sm">
                      +{calculatePoints(store.targetAngle, store.guessAngle)} Points!
                    </h2>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <GameDial 
                  targetAngle={store.targetAngle} 
                  guessAngle={store.guessAngle} 
                  shutterOpen={true} 
                  interactive={false} 
                  individualGuesses={store.mode === 'solo' ? individualGuessesArray : undefined}
                  hideMainPointer={store.mode === 'solo'}
                />
              </div>
            </div>
            
            <Button 
              variant="primary" 
              size="xl" 
              className="w-full py-6 text-3xl shrink-0 mb-4"
              onClick={handleNextRound}
            >
              Next Round <ArrowRight className="w-8 h-8 ml-2" />
            </Button>
          </div>
        )}

        {/* Phase: Game Over */}
        {store.phase === 'game_over' && (
          <div className="w-full flex-1 flex flex-col min-h-0 space-y-4 md:space-y-6 animate-in fade-in zoom-in duration-700 items-center justify-center relative">
            <Confetti />
            
            <div className="bg-imperial_blue-400 p-8 md:p-12 rounded-[3rem] border-8 border-imperial_blue-300 shadow-[0_16px_0_0_#010f2c] text-center max-w-2xl w-full relative z-10 flex flex-col items-center">
              <Trophy className="w-32 h-32 md:w-48 md:h-48 text-bright_ocean-500 drop-shadow-[0_8px_0_#010f2c] mb-8 animate-bounce" />
              
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-[0_4px_0_#010f2c]">
                Victory!
              </h1>
              
              <p className="text-2xl md:text-4xl font-bold text-cream-500 uppercase tracking-widest bg-imperial_blue-500/50 p-6 rounded-2xl border-4 border-imperial_blue-300 shadow-inner w-full">
                {store.teams.find(t => t.id === store.winnerId)?.name} Wins!
              </p>
              
              <div className="mt-12 w-full flex flex-col md:flex-row gap-4">
                <Button 
                  variant="primary" 
                  size="xl" 
                  className="w-full md:flex-1 py-6 text-xl md:text-2xl"
                  onClick={() => {
                    localStorage.removeItem(`wave_room_state_${roomId}`);
                    store.resetGame();
                    router.push(`/host/${roomId}`);
                  }}
                >
                  <RefreshCcw className="w-6 h-6 mr-2" /> Play Again
                </Button>
                <Button 
                  variant="secondary" 
                  size="xl" 
                  className="w-full md:flex-1 py-6 text-xl md:text-2xl bg-black/20 hover:bg-black/40 text-white border-transparent"
                  onClick={() => {
                    localStorage.removeItem(`wave_room_state_${roomId}`);
                    localStorage.removeItem(`wave_room_teams_${roomId}`);
                    localStorage.removeItem(`wave_room_${roomId}`);
                    localStorage.removeItem(`wave_room_config_${roomId}`);
                    store.resetGame();
                    router.push('/');
                  }}
                >
                  <Home className="w-6 h-6 mr-2" /> Return to Home
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
      
      {/* Floating Control Panel */}
      <div className={`fixed inset-y-4 lg:inset-y-6 right-4 lg:right-6 w-[320px] lg:w-[400px] flex-shrink-0 bg-imperial_blue-500 rounded-3xl border-4 border-imperial_blue-300 shadow-[-8px_8px_16px_rgba(0,0,0,0.5)] flex flex-col z-50 transition-transform duration-500 ease-in-out ${isControlPanelOpen ? 'translate-x-0' : 'translate-x-[150%]'}`}>
        <div className="p-4 lg:p-6 border-b-4 border-imperial_blue-400 flex justify-between items-center bg-imperial_blue-600 shrink-0">
            <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-bright_ocean-500" /> Controls
            </h2>
            <button onClick={() => setIsControlPanelOpen(false)} className="text-white/50 hover:text-white bg-black/10 hover:bg-black/30 p-2 rounded-xl transition-colors">
              <X className="w-6 h-6 lg:w-8 lg:h-8" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8">
            
            {/* Game Overrides */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-bright_ocean-500 uppercase tracking-widest">Game Controls</h3>
              
              <button 
                onClick={handleSkipTurn}
                className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold py-4 rounded-xl border-b-4 border-purple-700 active:border-b-0 active:translate-y-[4px] transition-all uppercase tracking-widest"
              >
                <SkipForward className="w-5 h-5" /> Skip Turn
              </button>
              
              <div className="bg-imperial_blue-400 p-4 rounded-xl border-2 border-imperial_blue-300 space-y-4">
                <h4 className="text-xs font-bold text-cream-500 uppercase tracking-widest text-center">Force Phase</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['clue', 'guess_blind', 'guess_debate', 'reveal'].map(p => (
                    <button 
                      key={p}
                      onClick={() => handleForcePhase(p)}
                      className={`text-[10px] lg:text-xs font-bold py-2 rounded-lg border-2 uppercase tracking-wider transition-colors ${store.phase === p ? 'bg-bright_ocean-500 border-bright_ocean-300 text-white' : 'bg-imperial_blue-500 border-imperial_blue-300 text-white/50 hover:text-white hover:border-imperial_blue-200'}`}
                    >
                      {p.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Adjust Scores */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-bright_ocean-500 uppercase tracking-widest">Adjust Scores</h3>
              <div className="space-y-2">
                {store.teams.map(team => (
                  <div key={team.id} className="flex items-center justify-between bg-imperial_blue-400 p-3 rounded-xl border-2 border-imperial_blue-300">
                    <span className="font-bold text-white uppercase tracking-widest truncate flex-1 text-sm lg:text-base">{team.name}</span>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <button onClick={() => handleAdjustScore(team.id, -1)} className="p-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="font-black text-lg lg:text-xl text-cream-500 w-6 lg:w-8 text-center">{team.score}</span>
                      <button onClick={() => handleAdjustScore(team.id, 1)} className="p-1 bg-frosted_mint-500/20 text-frosted_mint-500 hover:bg-frosted_mint-500 hover:text-imperial_blue-800 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Player Moderation */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-bright_ocean-500 uppercase tracking-widest">Player Moderation</h3>
              <div className="space-y-4">
                {store.mode === 'solo' ? (
                  <div className="space-y-2">
                    {players.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-imperial_blue-400 px-3 py-2 rounded-lg border border-imperial_blue-300">
                        <span className="text-white font-bold text-xs lg:text-sm truncate flex-1">{p.name}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleKickPlayer(p.id)} className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 p-1.5 rounded-md transition-colors" title="Kick Player">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  store.teams.map(team => {
                    const teamPlayers = players.filter(p => p.teamId === team.id);
                    return (
                      <div key={team.id} className="space-y-2">
                        <h4 className="text-xs font-bold text-cream-500 uppercase tracking-widest border-b-2 border-imperial_blue-300 pb-1">{team.name}</h4>
                        {teamPlayers.length === 0 ? (
                          <p className="text-white/30 text-xs lg:text-sm italic">No players</p>
                        ) : (
                          teamPlayers.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-imperial_blue-400 px-3 py-2 rounded-lg">
                              <span className="text-white font-bold text-xs lg:text-sm truncate flex-1">{p.name}</span>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleMakeLeader(team.id, p.id)} className={`p-1.5 rounded-md transition-colors ${(team.psychicIndex || 0) % Math.max(1, teamPlayers.length) === teamPlayers.findIndex(tp => tp.id === p.id) ? 'text-bright_ocean-500 bg-bright_ocean-500/10' : 'text-white/30 hover:text-bright_ocean-400 hover:bg-bright_ocean-500/10'}`} title="Make Leader (Psychic / Captain)">
                                  <Crown className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleKickPlayer(p.id)} className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 p-1.5 rounded-md transition-colors" title="Kick Player">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>

          </div>
      </div>

      <Modal 
        isOpen={isEndGameModalOpen} 
        onClose={() => setIsEndGameModalOpen(false)}
        title="End Game"
      >
        <div className="space-y-6 text-center">
          <p className="text-xl text-white font-bold">
            Are you sure you want to end the game?
          </p>
          <div className="flex gap-4">
            <Button variant="primary" size="lg" className="flex-1" onClick={() => setIsEndGameModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="lg" className="flex-1 !bg-red-500 hover:!bg-red-400 !border-red-300 !text-white" onClick={() => {
              localStorage.removeItem(`wave_room_state_${roomId}`);
              localStorage.removeItem(`wave_room_teams_${roomId}`);
              localStorage.removeItem(`wave_room_${roomId}`);
              localStorage.removeItem(`wave_room_config_${roomId}`);
              router.push('/');
            }}>
              End Game
            </Button>
          </div>
        </div>
      </Modal>


    </div>
  );
}

export default function HostGame() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-imperial_blue-500 flex items-center justify-center"><div className="text-white font-bold">Loading...</div></div>}>
      <HostGameContent />
    </Suspense>
  );
}
