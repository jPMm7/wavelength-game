'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { HeroDial } from '@/components/wheel/HeroDial';
import { Users, User, ArrowRight, Play, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleHostGame = (mode: 'team' | 'coop') => {
    // Basic room generation for now
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    router.push(`/host/${roomId}?mode=${mode}`);
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      router.push(`/play/${roomCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-12">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 w-full max-w-lg flex flex-col items-center">
        <div className="inline-block relative z-10">
          <h1 className="text-6xl md:text-8xl font-black text-cream-500 tracking-tight drop-shadow-[4px_4px_0px_#010f2c] rotate-[-2deg]">
            WAVELENGTH
          </h1>
        </div>

        {/* Animated Hero Graphic */}
        <div className="w-full -mt-4 z-0">
          <HeroDial />
        </div>

        <p className="text-xl md:text-2xl text-bright_ocean-800 font-bold mx-auto -mt-8 relative z-10">
          A social party game of telepathy, empathy, and perspective.
        </p>
      </div>

      {/* Quick Join Module */}
      <div className="w-full max-w-md bg-imperial_blue-400 p-6 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c]">
        <h2 className="text-2xl font-bold text-cream-500 mb-4 text-center">Join a Party</h2>
        <form onSubmit={handleJoinGame} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Room Code" 
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="flex-1 bg-imperial_blue-200 text-white font-bold text-xl px-4 py-3 rounded-xl border-2 border-imperial_blue-300 focus:outline-none focus:border-bright_ocean-500 uppercase placeholder:text-imperial_blue-400 placeholder:normal-case"
            maxLength={4}
          />
          <Button type="submit" variant="accent" className="px-8">
            <ArrowRight className="w-6 h-6" />
          </Button>
        </form>
      </div>

      {/* Game Mode Selector */}
      <div className="w-full max-w-md space-y-6">
        <Button 
          variant="primary" 
          size="xl"
          onClick={() => setIsHostModalOpen(true)}
        >
          <QrCode className="w-8 h-8" />
          Host a Party
        </Button>
        
        <Button 
          variant="secondary" 
          size="lg"
          className="w-full"
          onClick={() => router.push('/local/setup')}
        >
          <Play className="w-6 h-6" />
          Pass & Play (Local)
        </Button>
      </div>

      {/* Host Game Options Modal */}
      <Modal 
        isOpen={isHostModalOpen} 
        onClose={() => setIsHostModalOpen(false)}
        title="Host Game Options"
      >
        <div className="space-y-6">
          <p className="text-bright_ocean-800 text-lg">Select how you want to play:</p>
          
          <div className="grid gap-4">
            <Button 
              variant="primary" 
              className="w-full py-6 flex-col gap-1 items-start px-6"
              onClick={() => handleHostGame('team')}
            >
              <div className="flex items-center gap-2 text-xl">
                <Users className="w-6 h-6 text-cream-500" />
                Team vs Team
              </div>
              <div className="text-sm text-bright_ocean-800 font-normal text-left">
                Divide into two teams. First to 10 points wins!
              </div>
            </Button>
            
            <Button 
              variant="secondary" 
              className="w-full py-6 flex-col gap-1 items-start px-6"
              onClick={() => handleHostGame('coop')}
            >
              <div className="flex items-center gap-2 text-xl">
                <User className="w-6 h-6 text-frosted_mint-500" />
                Cooperative (Solo Team)
              </div>
              <div className="text-sm text-imperial_blue-800 font-normal text-left">
                Everyone works together to beat the game's high score.
              </div>
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
