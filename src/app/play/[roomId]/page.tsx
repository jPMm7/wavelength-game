'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { User, Users, CheckCircle2, ArrowLeft, Plus } from 'lucide-react';

interface MockTeam {
  id: string;
  name: string;
  color: string;
}

const TEAM_COLORS = [
  'bg-bright_ocean-500 border-bright_ocean-300',
  'bg-imperial_blue-500 border-imperial_blue-300',
  'bg-orange-500 border-orange-300',
  'bg-purple-500 border-purple-300',
  'bg-pink-500 border-pink-300',
  'bg-green-500 border-green-300'
];

function PlayJoinContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const [mode, setMode] = useState<'team' | 'coop'>('team');

  const [name, setName] = useState('');
  const [joinedState, setJoinedState] = useState<'unjoined' | 'coop' | string>('unjoined');
  const [myId, setMyId] = useState<string>('');
  
  const [teams, setTeams] = useState<MockTeam[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  useEffect(() => {
    setMyId(Math.random().toString(36).substring(2, 9));
  }, []);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'team' || urlMode === 'coop') {
      setMode(urlMode);
    } else if (typeof window !== 'undefined') {
      try {
        const config = localStorage.getItem(`wave_room_config_${roomId}`);
        if (config) {
          setMode(JSON.parse(config).mode);
        }
      } catch (e) {}
    }
  }, [roomId, searchParams]);

  // Sync teams from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const teamsKey = `wave_room_teams_${roomId}`;
    
    const stored = localStorage.getItem(teamsKey);
    if (stored) {
      try { setTeams(JSON.parse(stored)); } catch (e) {}
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === teamsKey && e.newValue) {
        try { setTeams(JSON.parse(e.newValue)); } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [roomId]);

  // Listen for kicks
  useEffect(() => {
    if (joinedState === 'unjoined' || typeof window === 'undefined') return;
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `wave_room_${roomId}`) {
        if (!e.newValue) {
          setJoinedState('unjoined');
          return;
        }
        try {
          const players = JSON.parse(e.newValue);
          const stillIn = players.some((p: any) => p.id === myId);
          if (!stillIn) setJoinedState('unjoined');
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [roomId, joinedState, myId]);

  const handleJoin = (teamId: string) => {
    if (!name.trim()) return;
    
    const storageKey = `wave_room_${roomId}`;
    let players = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) players = JSON.parse(stored);
    } catch (e) {}

    players.push({ id: myId, name: name.trim(), teamId });
    localStorage.setItem(storageKey, JSON.stringify(players));
    
    setJoinedState(teamId);
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    
    const newTeamId = `team_${Math.random().toString(36).substring(2, 6)}`;
    const colorIndex = teams.length % TEAM_COLORS.length;
    
    const newTeam = {
      id: newTeamId,
      name: newTeamName.trim(),
      color: TEAM_COLORS[colorIndex]
    };
    
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    localStorage.setItem(`wave_room_teams_${roomId}`, JSON.stringify(updatedTeams));
    
    setIsCreatingTeam(false);
    setNewTeamName('');
    handleJoin(newTeamId);
  };

  const handleLeave = () => {
    const storageKey = `wave_room_${roomId}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        let players = JSON.parse(stored);
        players = players.filter((p: any) => p.id !== myId);
        localStorage.setItem(storageKey, JSON.stringify(players));
      }
    } catch (e) {}
    
    setJoinedState('unjoined');
  };

  if (joinedState !== 'unjoined') {
    const joinedTeam = teams.find(t => t.id === joinedState);
    const teamName = mode === 'coop' ? 'The Collective' : (joinedTeam?.name || 'A Team');
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-imperial_blue-500 to-imperial_blue-600">
        <div className="w-full max-w-sm text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <CheckCircle2 className="w-24 h-24 text-frosted_mint-500 mx-auto drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]" />
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-widest uppercase">
              You're In!
            </h1>
            <p className="text-xl font-bold text-cream-500">
              Joined {teamName}
            </p>
          </div>

          <div className="bg-imperial_blue-400 p-6 rounded-3xl border-4 border-imperial_blue-300 shadow-[0_8px_0_0_#010f2c]">
            <p className="text-xl font-bold text-white uppercase tracking-widest animate-pulse">
              Look at the TV
            </p>
            <p className="text-white/70 font-medium mt-2">
              Waiting for host to start the game...
            </p>
          </div>
          
          <button 
            onClick={handleLeave}
            className="flex items-center gap-2 mx-auto text-imperial_blue-200 hover:text-white font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Leave Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-imperial_blue-500 to-imperial_blue-600">
      <div className="w-full max-w-sm space-y-8">
        
        {/* Header */}
        <div className="relative flex justify-center items-start">
          <button 
            type="button"
            onClick={() => router.push('/')}
            className="absolute left-0 top-1 p-3 bg-imperial_blue-400 rounded-full hover:bg-imperial_blue-300 transition-colors shadow-[0_4px_0_0_#010f2c]"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-bright_ocean-500 uppercase tracking-widest">Joining Room</h2>
            <div className="inline-block bg-white px-6 py-2 rounded-2xl border-4 border-imperial_blue-300 shadow-[0_4px_0_0_#010f2c]">
              <span className="text-4xl font-black text-imperial_blue-800 tracking-widest">{roomId}</span>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-imperial_blue-400 p-6 rounded-3xl border-4 border-imperial_blue-300 shadow-[0_8px_0_0_#010f2c] space-y-6">
          
          <div className="space-y-2">
            <label className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-bright_ocean-500" />
              Your Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Einstein"
              maxLength={15}
              className="w-full bg-imperial_blue-500 text-white font-bold text-2xl p-4 rounded-xl border-4 border-imperial_blue-300 focus:outline-none focus:border-bright_ocean-500 transition-colors placeholder:text-white/20"
            />
          </div>

          <div className="space-y-4">
            <label className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-bright_ocean-500" />
              {mode === 'coop' ? 'Join Game' : 'Select Team'}
            </label>
            
            {mode === 'coop' ? (
              <Button 
                variant="primary" 
                className="w-full py-5 text-xl bg-frosted_mint-500 border-frosted_mint-300 text-imperial_blue-800 hover:bg-frosted_mint-400 hover:border-frosted_mint-200 active:border-b-0"
                disabled={!name.trim()}
                onClick={() => handleJoin('coop')}
              >
                The Collective
              </Button>
            ) : (
              <div className="flex flex-col gap-4">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    disabled={!name.trim()}
                    onClick={() => handleJoin(team.id)}
                    className={`w-full py-4 text-xl font-black uppercase tracking-widest rounded-2xl border-b-[6px] active:border-b-0 active:translate-y-[6px] transition-all text-white ${team.color} ${!name.trim() ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:brightness-110'}`}
                  >
                    {team.name}
                  </button>
                ))}
                
                {/* Create New Team Flow */}
                {isCreatingTeam ? (
                  <div className="bg-imperial_blue-500 p-4 rounded-2xl border-4 border-imperial_blue-300 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <input 
                      type="text" 
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Team Name"
                      maxLength={15}
                      className="w-full bg-imperial_blue-600 text-white font-bold text-xl p-3 rounded-xl border-2 border-imperial_blue-300 focus:outline-none focus:border-bright_ocean-500 transition-colors"
                    />
                    <div className="flex gap-2">
                      <Button variant="secondary" className="flex-1 py-3 text-lg" onClick={() => setIsCreatingTeam(false)}>Cancel</Button>
                      <Button variant="primary" className="flex-1 py-3 text-lg" disabled={!newTeamName.trim()} onClick={handleCreateTeam}>Join</Button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsCreatingTeam(true)}
                    disabled={!name.trim()}
                    className={`w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-imperial_blue-200 rounded-2xl text-imperial_blue-200 font-bold hover:bg-imperial_blue-500/50 hover:text-white transition-colors ${!name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Plus className="w-5 h-5" />
                    Create New Team
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default function PlayJoin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-imperial_blue-500 flex items-center justify-center"><div className="text-white font-bold">Loading...</div></div>}>
      <PlayJoinContent />
    </Suspense>
  );
}
