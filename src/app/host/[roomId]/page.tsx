'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useRoomSync } from '@/hooks/useRoomSync';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/Button';
import { Users, Play, ArrowLeft, X, Copy, Check } from 'lucide-react';

interface MockPlayer {
  id: string;
  name: string;
  teamId?: string;
}

interface MockTeam {
  id: string;
  name: string;
  color: string;
}



const DEFAULT_TEAMS: MockTeam[] = [
  { id: 'team1', name: 'Pugs', color: 'bg-bright_ocean-500 border-bright_ocean-300' },
  { id: 'team2', name: 'Dinosaurs', color: 'bg-imperial_blue-500 border-imperial_blue-300' }
];

function HostLobbyContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const mode = searchParams.get('mode') || 'team';
  
  const [players, setPlayers] = useState<MockPlayer[]>([]);
  const [teams, setTeams] = useState<MockTeam[]>([]);
  const [joinUrl, setJoinUrl] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/play/${roomId}?mode=${mode}`);
      localStorage.setItem(`wave_room_config_${roomId}`, JSON.stringify({ mode }));
    }
  }, [roomId, mode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const playersKey = `wave_room_${roomId}`;
    const teamsKey = `wave_room_teams_${roomId}`;
    
    // Initial load
    const storedPlayers = localStorage.getItem(playersKey);
    if (storedPlayers) {
      try { setPlayers(JSON.parse(storedPlayers)); } catch (e) {}
    }

    const storedTeams = localStorage.getItem(teamsKey);
    if (storedTeams) {
      try { 
        setTeams(JSON.parse(storedTeams)); 
      } catch (e) {}
    } else {
      if (mode === 'team') {
        setTeams(DEFAULT_TEAMS);
        localStorage.setItem(teamsKey, JSON.stringify(DEFAULT_TEAMS));
      }
    }
  }, [roomId, mode]);

  const { channel, isConnected, broadcastMessage } = useRoomSync(roomId);

  const stateRef = useRef({ players, teams, mode });
  useEffect(() => {
    stateRef.current = { players, teams, mode };
  }, [players, teams, mode]);

  // Broadcast state whenever it changes (or when requested)
  useEffect(() => {
    if (isConnected) {
      broadcastMessage('LOBBY_STATE', { players, teams, mode });
    }
  }, [players, teams, mode, isConnected]);

  useEffect(() => {
    if (!channel) return;

    const handleBroadcast = (payload: any) => {
      const { event, payload: data } = payload;
      if (event === 'REQUEST_STATE') {
        broadcastMessage('LOBBY_STATE', stateRef.current);
      } else if (event === 'PLAYER_JOIN') {
        setPlayers((prev) => {
          const exists = prev.find(p => p.id === data.id);
          const newPlayers = exists ? prev.map(p => p.id === data.id ? data : p) : [...prev, data];
          localStorage.setItem(`wave_room_${roomId}`, JSON.stringify(newPlayers));
          return newPlayers;
        });
      } else if (event === 'PLAYER_LEAVE') {
        setPlayers((prev) => {
          const newPlayers = prev.filter(p => p.id !== data.id);
          localStorage.setItem(`wave_room_${roomId}`, JSON.stringify(newPlayers));
          return newPlayers;
        });
      } else if (event === 'TEAM_CREATE') {
        setTeams((prev) => {
          const newTeams = [...prev, data];
          localStorage.setItem(`wave_room_teams_${roomId}`, JSON.stringify(newTeams));
          return newTeams;
        });
      }
    };

    channel.on('broadcast', { event: '*' }, handleBroadcast);
  }, [channel, roomId]);

  const updatePlayers = (newPlayers: MockPlayer[]) => {
    setPlayers(newPlayers);
    localStorage.setItem(`wave_room_${roomId}`, JSON.stringify(newPlayers));
  };

  const kickPlayer = (id: string) => {
    updatePlayers(players.filter(p => p.id !== id));
  };

  const deleteTeam = (teamId: string) => {
    // 1. Kick all players on this team
    const remainingPlayers = players.filter(p => p.teamId !== teamId);
    updatePlayers(remainingPlayers);
    
    // 2. Remove the team itself
    const remainingTeams = teams.filter(t => t.id !== teamId);
    setTeams(remainingTeams);
    localStorage.setItem(`wave_room_teams_${roomId}`, JSON.stringify(remainingTeams));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-6xl mx-auto flex flex-col xl:flex-row gap-12 xl:gap-24">
        
        {/* Left Side: Room Info & QR */}
        <div className="flex-1 flex flex-col items-center xl:items-start text-center xl:text-left space-y-8">
          <button 
            type="button"
            onClick={() => {
              broadcastMessage('ROOM_CLOSED', {});
              localStorage.removeItem(`wave_room_${roomId}`);
              localStorage.removeItem(`wave_room_teams_${roomId}`);
              localStorage.removeItem(`wave_room_config_${roomId}`);
              localStorage.removeItem(`wave_room_state_${roomId}`);
              router.push('/');
            }}
            className="p-3 bg-imperial_blue-300 rounded-full hover:bg-imperial_blue-200 transition-colors self-center xl:self-start mb-4"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-bright_ocean-800 uppercase tracking-widest mb-2 flex items-center justify-center xl:justify-start gap-4">
              Room Code
              <button 
                onClick={handleCopyCode} 
                className="p-2 bg-imperial_blue-400 hover:bg-bright_ocean-500 text-white rounded-xl transition-colors flex items-center justify-center shadow-[0_4px_0_0_#010f2c] active:translate-y-[2px] active:shadow-none"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </h1>
            <div className="text-8xl md:text-[9rem] font-black text-cream-500 tracking-widest drop-shadow-[6px_6px_0px_#010f2c] cursor-pointer" onClick={handleCopyCode}>
              {roomId}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border-8 border-imperial_blue-400 shadow-[8px_8px_0px_0px_#010f2c] inline-block">
            {joinUrl ? (
              <QRCode value={joinUrl} size={256} className="w-48 h-48 md:w-64 md:h-64" />
            ) : (
              <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-200 animate-pulse flex items-center justify-center">
                <span className="text-gray-400 font-bold">Generating...</span>
              </div>
            )}
          </div>
          
          <p className="text-2xl font-bold text-imperial_blue-400">
            Scan to join or enter code at <br/>
            <button 
              onClick={handleCopyUrl}
              className="text-cream-500 underline break-all hover:text-white transition-colors flex items-center justify-center xl:justify-start gap-2 mx-auto xl:mx-0 mt-2"
              title="Copy Link"
            >
              {joinUrl.replace('http://', '').replace('https://', '') || '...'}
              {copiedUrl ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </p>
        </div>

        {/* Right Side: Player Roster */}
        <div className="flex-1 w-full bg-imperial_blue-400 p-8 lg:p-12 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c] flex flex-col">
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-cream-500 flex items-center gap-3">
              <Users className="w-8 h-8" />
              Players ({players.length})
            </h2>
            

          </div>

          <div className="flex-1 bg-imperial_blue-500/50 rounded-2xl p-6 min-h-[400px] mb-8 overflow-y-auto">
            {mode === 'team' ? (
              teams.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-imperial_blue-300 opacity-70">
                  <p className="text-xl font-bold uppercase tracking-widest">No Teams Created</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {teams.map(team => {
                    const teamPlayers = players.filter(p => p.teamId === team.id);
                    return (
                      <div key={team.id} className="space-y-3">
                        <div className="flex items-center justify-between border-b-2 border-imperial_blue-300 pb-2">
                          <h3 className="text-xl font-bold text-cream-500 uppercase tracking-widest">
                            {team.name} ({teamPlayers.length})
                          </h3>
                          <button 
                            onClick={() => deleteTeam(team.id)}
                            className="text-red-400 hover:text-white bg-black/20 hover:bg-red-500 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold shadow-[0_2px_0_0_#010f2c] active:shadow-none active:translate-y-[2px]"
                            title="Disband Team & Kick Players"
                          >
                            <X className="w-4 h-4" /> DISBAND
                          </button>
                        </div>
                        {teamPlayers.length === 0 ? (
                          <p className="text-imperial_blue-300 italic">No players yet</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teamPlayers.map(player => (
                              <div key={player.id} className={`${team.color} text-white font-bold text-xl px-4 py-3 rounded-xl border-2 shadow-[0_4px_0_0_#010f2c] flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-cream-500 rounded-full" />
                                  <span className="truncate max-w-[120px]">{player.name}</span>
                                </div>
                                <button 
                                  onClick={() => kickPlayer(player.id)}
                                  className="text-white/70 hover:text-white bg-black/10 hover:bg-red-500 p-1.5 rounded-lg transition-colors flex-shrink-0"
                                  title="Kick Player"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              players.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-imperial_blue-300 opacity-70">
                  <Users className="w-16 h-16 mb-4" />
                  <p className="text-xl font-bold uppercase tracking-widest">Waiting for players...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {players.map(player => (
                    <div key={player.id} className="bg-frosted_mint-500 text-imperial_blue-800 font-bold text-xl px-4 py-3 rounded-xl border-2 border-frosted_mint-300 shadow-[0_4px_0_0_#010f2c] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-imperial_blue-800 rounded-full" />
                        <span className="truncate max-w-[150px]">{player.name}</span>
                        {mode === 'coop' && player.teamId === 'coop' && <span className="text-xs bg-imperial_blue-800 text-white px-2 py-1 rounded-md">Coop</span>}
                      </div>
                      <button 
                        onClick={() => kickPlayer(player.id)}
                        className="text-imperial_blue-800/70 hover:text-white bg-black/5 hover:bg-red-500 p-1.5 rounded-lg transition-colors flex-shrink-0"
                        title="Kick Player"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          <Button 
            variant="accent" 
            size="xl" 
            className="w-full py-6 text-3xl"
            disabled={players.length < 2 || (mode === 'team' && teams.length === 0)}
            onClick={() => {
              if (mode === 'solo') {
                const soloTeams = players.map((p, i) => ({
                  id: p.id,
                  name: p.name,
                  color: [
                    'bg-bright_ocean-500 border-bright_ocean-300',
                    'bg-imperial_blue-500 border-imperial_blue-300',
                    'bg-frosted_mint-500 border-frosted_mint-300',
                    'bg-red-500 border-red-300',
                    'bg-yellow-500 border-yellow-300',
                    'bg-purple-500 border-purple-300'
                  ][i % 6]
                }));
                localStorage.setItem(`wave_room_teams_${roomId}`, JSON.stringify(soloTeams));
                setTeams(soloTeams);
              }
              broadcastMessage('START_GAME', {});
              router.push(`/host/${roomId}/game`);
            }}
          >
            START GAME
            <Play className="w-8 h-8" />
          </Button>

        </div>
      </div>
    </div>
  );
}

export default function HostLobby() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-imperial_blue-500 flex items-center justify-center"><div className="text-white font-bold">Loading...</div></div>}>
      <HostLobbyContent />
    </Suspense>
  );
}
