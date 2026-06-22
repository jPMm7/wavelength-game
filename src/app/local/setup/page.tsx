'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/store/gameStore';
import { GameMode } from '@/types/game.types';
import { Users, User, ArrowRight, ArrowLeft, Infinity } from 'lucide-react';

export default function LocalSetup() {
  const router = useRouter();
  const setGameConfig = useGameStore((state) => state.setGameConfig);
  
  const [mode, setMode] = useState<GameMode>('team');
  const [team1Name, setTeam1Name] = useState('Left Brains');
  const [team2Name, setTeam2Name] = useState('Right Brains');
  const [targetScore, setTargetScore] = useState(10);
  const [isFreeplay, setIsFreeplay] = useState(false);

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    
    const teams = mode === 'team' 
      ? [
          { id: 'team1', name: team1Name, score: 0 },
          { id: 'team2', name: team2Name, score: 0 }
        ]
      : [
          { id: 'coop', name: 'The Collective', score: 0 }
        ];

    setGameConfig(mode, teams, isFreeplay ? 0 : targetScore);
    router.push('/local/play');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-2xl bg-imperial_blue-400 p-8 lg:p-12 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c]">
        
        <div className="flex items-center justify-between mb-8">
          <button 
            type="button"
            onClick={() => router.push('/')}
            className="p-3 bg-imperial_blue-300 rounded-full hover:bg-imperial_blue-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-3xl lg:text-4xl font-black text-cream-500 tracking-tight text-center flex-1 mr-12">
            Local Game Setup
          </h1>
        </div>

        <form onSubmit={handleStartGame} className="space-y-8">
          
          {/* Game Mode Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-bright_ocean-800 uppercase tracking-widest">Format</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode('team')}
                className={`pt-[24px] px-6 rounded-2xl flex flex-col items-center gap-2 transition ${
                  mode === 'team' 
                    ? 'bg-bright_ocean-500 border-bright_ocean-300 text-white translate-y-[4px] border-b-4 pb-[28px]' 
                    : 'bg-imperial_blue-200 border-imperial_blue-300 text-imperial_blue-800 border-b-8 pb-[24px] hover:bg-imperial_blue-300'
                }`}
              >
                <Users className="w-10 h-10" />
                <span className="font-bold text-xl">Team vs Team</span>
              </button>
              
              <button
                type="button"
                onClick={() => setMode('coop')}
                className={`pt-[24px] px-6 rounded-2xl flex flex-col items-center gap-2 transition ${
                  mode === 'coop' 
                    ? 'bg-frosted_mint-500 border-frosted_mint-300 text-imperial_blue-500 translate-y-[4px] border-b-4 pb-[28px]' 
                    : 'bg-imperial_blue-200 border-imperial_blue-300 text-imperial_blue-800 border-b-8 pb-[24px] hover:bg-imperial_blue-300'
                }`}
              >
                <User className="w-10 h-10" />
                <span className="font-bold text-xl">Cooperative</span>
              </button>
            </div>
          </div>

          {/* Team Names (Conditional) */}
          {mode === 'team' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-bright_ocean-800 uppercase tracking-widest">Teams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white font-bold block">Team 1 Name</label>
                  <input 
                    type="text" 
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="w-full bg-imperial_blue-200 text-white font-bold text-xl px-4 py-3 rounded-xl border-2 border-imperial_blue-300 focus:outline-none focus:border-bright_ocean-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white font-bold block">Team 2 Name</label>
                  <input 
                    type="text" 
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="w-full bg-imperial_blue-200 text-white font-bold text-xl px-4 py-3 rounded-xl border-2 border-imperial_blue-300 focus:outline-none focus:border-bright_ocean-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Target Score */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-bright_ocean-800 uppercase tracking-widest">Points to Win</h2>
              <button
                type="button"
                onClick={() => setIsFreeplay(!isFreeplay)}
                className={`px-6 pt-[8px] rounded-xl font-bold transition flex items-center gap-2 ${
                  isFreeplay 
                    ? 'bg-bright_ocean-500 border-bright_ocean-300 text-white translate-y-[2px] border-b-2 pb-[10px]' 
                    : 'bg-imperial_blue-200 border-imperial_blue-300 text-imperial_blue-800 border-b-4 pb-[8px] hover:bg-imperial_blue-300'
                }`}
              >
                Freeplay <Infinity className="w-5 h-5" />
              </button>
            </div>
            
            <div className={`flex items-center gap-6 transition-opacity ${isFreeplay ? 'opacity-50 pointer-events-none' : ''}`}>
              <input 
                type="range" 
                min="5" 
                max="50" 
                step="1"
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value))}
                className="flex-1 h-3 bg-imperial_blue-200 rounded-lg appearance-none cursor-pointer accent-bright_ocean-500"
              />
              <span className="text-4xl font-black text-cream-500 w-16 text-center leading-none h-10 flex items-center justify-center">
                {isFreeplay ? '∞' : targetScore}
              </span>
            </div>
          </div>

          <div className="pt-8">
            <Button type="submit" variant="accent" size="xl" className="py-6 text-3xl">
              START GAME
              <ArrowRight className="w-8 h-8" />
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
