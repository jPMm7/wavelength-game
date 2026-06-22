'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { GameDial } from '@/components/wheel/GameDial';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EyeOff, ArrowRight, X, Dices, MessageCircle } from 'lucide-react';

export default function LocalPlay() {
  const router = useRouter();
  const { 
    phase, 
    teams, 
    currentTeamId, 
    targetScore, 
    currentCard, 
    targetAngle, 
    clue, 
    guessAngle: storeGuessAngle,
    submitClue,
    submitGuess,
    addScore,
    nextTurn
  } = useGameStore();

  const [shieldOpen, setShieldOpen] = useState(true);
  const [clueInput, setClueInput] = useState('');
  const [localGuess, setLocalGuess] = useState(90);
  const [localTarget, setLocalTarget] = useState(90);
  const [isEndGameModalOpen, setIsEndGameModalOpen] = useState(false);

  // Reset shield and inputs when phase changes to 'clue'
  useEffect(() => {
    if (phase === 'clue') {
      setShieldOpen(true);
      setClueInput('');
      setLocalGuess(90);
      setLocalTarget(targetAngle);
    }
  }, [phase, targetAngle]);

  // If no teams are set, we shouldn't be here (e.g., accessed via URL without setup)
  useEffect(() => {
    if (teams.length === 0) {
      router.push('/local/setup');
    }
  }, [teams, router]);

  const currentTeam = teams.find(t => t.id === currentTeamId);

  // Scoring logic based on Wavelength physical game rules
  const calculatePoints = (target: number, guess: number) => {
    const diff = Math.abs(target - guess);
    if (diff <= 5) return 4;   // Bullseye
    if (diff <= 15) return 3;  // Inner Wedge
    if (diff <= 25) return 2;  // Outer Wedge
    return 0;                  // Miss
  };

  const handleNextRound = () => {
    const points = calculatePoints(targetAngle, storeGuessAngle);
    addScore(currentTeamId!, points);
    
    // Check if team won
    if ((currentTeam?.score || 0) + points >= targetScore) {
      alert(`🎉 ${currentTeam?.name} WINS! 🎉`);
      router.push('/');
      return;
    }
    
    nextTurn();
  };

  if (!currentTeam || !currentCard) return <div className="min-h-screen bg-imperial_blue-500" />;

  return (
    <div className="min-h-screen lg:h-screen flex flex-col p-4 lg:p-6 bg-gradient-to-b from-imperial_blue-500 to-imperial_blue-600 overflow-y-auto lg:overflow-hidden">
      
      {/* Header: Scores */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 bg-imperial_blue-400 p-3 md:p-4 rounded-2xl md:rounded-3xl border-4 border-imperial_blue-300 shadow-[0_4px_0_0_#010f2c] gap-4 shrink-0">
        <div className="flex gap-4">
          {teams.map(team => (
            <div key={team.id} className={`px-6 py-2 rounded-xl font-bold text-xl uppercase tracking-widest border-2 border-transparent transition-all ${team.id === currentTeamId ? 'bg-cream-500 text-imperial_blue-800 shadow-[0_4px_0_0_#010f2c] -translate-y-1' : 'text-white bg-imperial_blue-500 border-imperial_blue-300'}`}>
              {team.name}: {team.score}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-bright_ocean-500 font-bold uppercase tracking-widest hidden md:block">
            Playing to {targetScore}
          </div>
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
            {currentCard.leftConcept}
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-bright_ocean-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0 mx-4 border-4 border-white shadow-inner">
            VS
          </div>
          <div className="text-xl md:text-4xl font-black text-imperial_blue-800 uppercase text-center flex-1 break-words">
            {currentCard.rightConcept}
          </div>
        </div>

        {/* Phase Specific Content */}

        {phase === 'clue' && (
          <>
            {shieldOpen ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in zoom-in duration-500">
                <EyeOff className="w-24 h-24 md:w-32 md:h-32 text-frosted_mint-500 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]" />
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-[0_4px_0_#010f2c]">
                    Psychic Phase
                  </h1>
                  <p className="text-xl md:text-2xl font-bold text-cream-500 uppercase tracking-widest bg-black/20 p-4 rounded-xl border border-black/10 shadow-inner">
                    Pass the device to the {currentTeam.name} Psychic.
                  </p>
                  <p className="text-lg md:text-xl font-bold text-bright_ocean-500 mt-4">
                    Everyone else, look away!
                  </p>
                </div>
                <Button variant="accent" size="xl" onClick={() => setShieldOpen(false)}>
                  I am the Psychic <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="w-full flex-1 flex flex-col min-h-0 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex-1 min-h-0 bg-imperial_blue-400 p-4 md:p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] flex flex-col">
                  <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
                    <h2 className="text-lg md:text-2xl font-bold text-cream-500 uppercase tracking-widest flex-1">
                      Adjust the Target (Optional)
                    </h2>
                    <button 
                      onClick={() => setLocalTarget(Math.floor(Math.random() * 140) + 20)}
                      className="p-3 bg-bright_ocean-500 text-white rounded-xl hover:bg-bright_ocean-400 transition-colors shadow-[0_4px_0_0_#010f2c] active:translate-y-[4px] active:shadow-none flex items-center gap-2 font-bold"
                      title="Randomize Target"
                    >
                      <Dices className="w-6 h-6" />
                      <span className="hidden md:inline">Randomize</span>
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center">
                    <GameDial 
                      targetAngle={localTarget} 
                      guessAngle={localTarget} 
                      shutterOpen={true} 
                      interactive={true} 
                      onGuessChange={setLocalTarget}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 md:gap-4 shrink-0">
                  <input 
                    type="text" 
                    value={clueInput}
                    onChange={(e) => setClueInput(e.target.value)}
                    placeholder="Enter your clue..."
                    className="w-full bg-white text-imperial_blue-800 font-black text-xl md:text-3xl px-6 md:px-8 py-4 md:py-6 rounded-2xl border-4 md:border-8 border-imperial_blue-300 focus:outline-none focus:border-bright_ocean-500 transition-colors placeholder:text-gray-300"
                  />
                  <div className="flex flex-col md:flex-row gap-4">
                    <Button 
                      variant="primary" 
                      size="xl" 
                      className="flex-1"
                      disabled={!clueInput.trim()}
                      onClick={() => submitClue(clueInput.trim(), localTarget)}
                    >
                      Lock Clue
                    </Button>
                    <Button 
                      variant="accent" 
                      size="xl" 
                      className="flex-1"
                      onClick={() => submitClue('Spoken Aloud', localTarget)}
                    >
                      <MessageCircle className="w-6 h-6 mr-2" />
                      Say It Out Loud
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {phase === 'guess' && (
          <div className="w-full flex-1 flex flex-col min-h-0 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-4 md:border-8 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] text-center shrink-0">
              <h2 className="text-sm md:text-lg font-bold text-bright_ocean-500 uppercase tracking-widest mb-1 md:mb-2">The Clue Is:</h2>
              <p className="text-3xl md:text-5xl font-black text-imperial_blue-800 uppercase leading-tight">"{clue}"</p>
            </div>

            <div className="flex-1 min-h-0 bg-imperial_blue-400 p-4 md:p-8 rounded-2xl md:rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] flex flex-col">
              <h2 className="text-xl md:text-2xl font-bold text-cream-500 mb-4 md:mb-6 uppercase tracking-widest text-center shrink-0">
                Discuss and Dial Your Guess
              </h2>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <GameDial 
                  targetAngle={targetAngle} 
                  guessAngle={localGuess} 
                  shutterOpen={false} 
                  interactive={true} 
                  onGuessChange={setLocalGuess}
                />
              </div>
            </div>
            
            <Button 
              variant="accent" 
              size="xl" 
              className="w-full py-6 text-3xl"
              onClick={() => submitGuess(localGuess)}
            >
              Lock Guess
            </Button>
          </div>
        )}

        {phase === 'reveal' && (
          <div className="w-full flex-1 flex flex-col min-h-0 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-4 md:border-8 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] text-center shrink-0">
              <h2 className="text-sm md:text-lg font-bold text-bright_ocean-500 uppercase tracking-widest mb-1 md:mb-2">The Clue Was:</h2>
              <p className="text-3xl md:text-5xl font-black text-imperial_blue-800 uppercase leading-tight">"{clue}"</p>
            </div>

            <div className="flex-1 min-h-0 bg-imperial_blue-400 p-4 md:p-8 rounded-2xl md:rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] md:shadow-[8px_8px_0px_0px_#010f2c] flex flex-col">
              <div className="mb-4 md:mb-6 flex justify-center shrink-0">
                <div className={`px-6 py-2 md:px-8 md:py-3 rounded-2xl border-4 shadow-[0_4px_0_0_#010f2c] ${calculatePoints(targetAngle, storeGuessAngle) > 0 ? 'bg-frosted_mint-500 border-frosted_mint-300' : 'bg-red-500 border-red-300'}`}>
                  <h2 className="text-2xl md:text-4xl font-black text-imperial_blue-800 uppercase tracking-widest text-center drop-shadow-sm">
                    +{calculatePoints(targetAngle, storeGuessAngle)} Points!
                  </h2>
                </div>
              </div>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <GameDial 
                  targetAngle={targetAngle} 
                  guessAngle={storeGuessAngle} 
                  shutterOpen={true} 
                  interactive={false} 
                />
              </div>
            </div>
            
            <Button 
              variant="primary" 
              size="xl" 
              className="w-full py-6 text-3xl"
              onClick={handleNextRound}
            >
              Next Round <ArrowRight className="w-8 h-8 ml-2" />
            </Button>
          </div>
        )}

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
            <Button variant="accent" size="lg" className="flex-1 !bg-red-500 hover:!bg-red-400 !border-red-300 !text-white" onClick={() => router.push('/')}>
              End Game
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
