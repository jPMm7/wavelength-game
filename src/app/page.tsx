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

  const handleHostGame = (mode: 'team' | 'coop' | 'solo') => {
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
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-12 xl:gap-24">
        
        {/* Left Side: Hero Section (Title + Graphic + Subtitle) */}
        <div className="flex-1 text-center xl:text-left flex flex-col items-center xl:items-start w-full">
          <div className="relative z-10 w-full flex justify-center xl:justify-start">
            <h1 className="text-[12vw] sm:text-6xl md:text-8xl xl:text-[8rem] font-black text-cream-500 tracking-tight drop-shadow-[4px_4px_0px_#010f2c] xl:drop-shadow-[8px_8px_0px_#010f2c] rotate-[-2deg] text-center xl:text-left">
              WAVELENGTH
            </h1>
          </div>

          {/* Animated Hero Graphic */}
          <div className="w-full max-w-md md:max-w-xl xl:max-w-2xl -mt-4 xl:-mt-8 z-0 flex justify-center xl:justify-start">
            <HeroDial />
          </div>

          <p className="text-lg sm:text-xl md:text-2xl xl:text-3xl text-bright_ocean-800 font-bold max-w-lg xl:max-w-2xl mx-auto xl:mx-0 -mt-8 xl:-mt-12 relative z-10 text-center xl:text-left px-4 xl:px-0">
            A social party game of telepathy, empathy, and perspective.
          </p>
        </div>

        {/* Right Side: Interactions (Quick Join + Buttons) */}
        <div className="w-full max-w-md xl:max-w-xl space-y-10 flex flex-col justify-center">
          
          {/* Quick Join Module */}
          <div className="w-full bg-imperial_blue-400 p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c]">
            <h2 className="text-2xl xl:text-3xl font-bold text-cream-500 mb-6 text-center">Join a Party</h2>
            <form onSubmit={handleJoinGame} className="relative flex items-center justify-center">
              <input 
                type="text" 
                placeholder="Room Code" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full text-center bg-imperial_blue-200 text-white font-bold text-2xl pr-16 pl-6 py-4 rounded-2xl border-2 border-imperial_blue-300 focus:outline-none focus:border-bright_ocean-500 uppercase placeholder:text-imperial_blue-400 placeholder:normal-case"
                maxLength={4}
              />
              <Button type="submit" variant="accent" className="absolute -right-6 px-6">
                <ArrowRight className="w-8 h-8" />
              </Button>
            </form>
          </div>

          {/* Game Mode Selector */}
          <div className="w-full space-y-6">
            <Button 
              variant="primary" 
              size="xl"
              className="py-8 text-3xl xl:text-4xl"
              onClick={() => setIsHostModalOpen(true)}
            >
              <QrCode className="w-10 h-10 xl:w-12 xl:h-12" />
              Host a Party
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg"
              className="w-full py-6 text-2xl xl:text-3xl"
              onClick={() => router.push('/local/setup')}
            >
              <Play className="w-8 h-8 xl:w-10 xl:h-10" />
              Pass & Play (Local)
            </Button>
          </div>

        </div>
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
              variant="accent" 
              className="w-full py-6 flex-col gap-1 items-start px-6"
              onClick={() => handleHostGame('solo')}
            >
              <div className="flex items-center gap-2 text-xl">
                <User className="w-6 h-6 text-imperial_blue-800" />
                Free-for-All (Solo)
              </div>
              <div className="text-sm text-imperial_blue-800 font-normal text-left">
                Everyone guesses individually. Most points wins!
              </div>
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
