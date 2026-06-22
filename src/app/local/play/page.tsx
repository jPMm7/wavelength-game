'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { GameDial } from '@/components/wheel/GameDial';
import { Button } from '@/components/ui/Button';
import { EyeOff, ArrowRight } from 'lucide-react';

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

  // Reset shield and inputs when phase changes to 'clue'
  useEffect(() => {
    if (phase === 'clue') {
      setShieldOpen(true);
      setClueInput('');
      setLocalGuess(90);
    }
  }, [phase]);

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
    <div className="min-h-screen flex flex-col p-6 lg:p-12 bg-gradient-to-b from-imperial_blue-500 to-imperial_blue-600 overflow-hidden">
      
      {/* Header: Scores */}
      <div className="flex flex-wrap justify-between items-center mb-8 bg-imperial_blue-400 p-4 rounded-3xl border-4 border-imperial_blue-300 shadow-[0_4px_0_0_#010f2c] gap-4">
        <div className="flex gap-4">
          {teams.map(team => (
            <div key={team.id} className={`px-6 py-2 rounded-xl font-bold text-xl uppercase tracking-widest border-2 border-transparent transition-all ${team.id === currentTeamId ? 'bg-cream-500 text-imperial_blue-800 shadow-[0_4px_0_0_#010f2c] -translate-y-1' : 'text-white bg-imperial_blue-500 border-imperial_blue-300'}`}>
              {team.name}: {team.score}
            </div>
          ))}
        </div>
        <div className="text-bright_ocean-500 font-bold uppercase tracking-widest hidden md:block">
          Playing to {targetScore}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full space-y-8">
        
        {/* The Card */}
        <div className="w-full flex justify-between items-center bg-white p-6 rounded-3xl border-8 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c]">
          <div className="text-xl md:text-4xl font-black text-imperial_blue-800 uppercase text-center flex-1 break-words">
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
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="bg-imperial_blue-400 p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c]">
                  <h2 className="text-2xl font-bold text-cream-500 mb-6 uppercase tracking-widest text-center">
                    Where is the target?
                  </h2>
                  <GameDial 
                    targetAngle={targetAngle} 
                    guessAngle={targetAngle} 
                    shutterOpen={true} 
                    interactive={false} 
                  />
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="text" 
                    value={clueInput}
                    onChange={(e) => setClueInput(e.target.value)}
                    placeholder="Enter your clue..."
                    className="flex-1 bg-white text-imperial_blue-800 font-black text-3xl px-8 py-6 rounded-2xl border-8 border-imperial_blue-300 focus:outline-none focus:border-bright_ocean-500 transition-colors placeholder:text-gray-300"
                  />
                  <Button 
                    variant="primary" 
                    size="xl" 
                    disabled={!clueInput.trim()}
                    onClick={() => submitClue(clueInput.trim())}
                  >
                    Lock Clue
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {phase === 'guess' && (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-6 rounded-3xl border-8 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c] text-center">
              <h2 className="text-lg font-bold text-bright_ocean-500 uppercase tracking-widest mb-2">The Clue Is:</h2>
              <p className="text-4xl md:text-5xl font-black text-imperial_blue-800 uppercase">"{clue}"</p>
            </div>

            <div className="bg-imperial_blue-400 p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c]">
              <h2 className="text-2xl font-bold text-cream-500 mb-6 uppercase tracking-widest text-center">
                Discuss and Dial Your Guess
              </h2>
              <GameDial 
                targetAngle={targetAngle} 
                guessAngle={localGuess} 
                shutterOpen={false} 
                interactive={true} 
                onGuessChange={setLocalGuess}
              />
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
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-6 rounded-3xl border-8 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c] text-center">
              <h2 className="text-lg font-bold text-bright_ocean-500 uppercase tracking-widest mb-2">The Clue Was:</h2>
              <p className="text-4xl font-black text-imperial_blue-800 uppercase">"{clue}"</p>
            </div>

            <div className="bg-imperial_blue-400 p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c]">
              <div className="mb-6 flex justify-center">
                <div className={`px-8 py-3 rounded-2xl border-4 shadow-[0_4px_0_0_#010f2c] ${calculatePoints(targetAngle, storeGuessAngle) > 0 ? 'bg-frosted_mint-500 border-frosted_mint-300' : 'bg-red-500 border-red-300'}`}>
                  <h2 className="text-4xl font-black text-imperial_blue-800 uppercase tracking-widest text-center drop-shadow-sm">
                    +{calculatePoints(targetAngle, storeGuessAngle)} Points!
                  </h2>
                </div>
              </div>
              <GameDial 
                targetAngle={targetAngle} 
                guessAngle={storeGuessAngle} 
                shutterOpen={true} 
                interactive={false} 
              />
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
    </div>
  );
}
