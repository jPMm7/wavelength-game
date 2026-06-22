'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GameDial } from '@/components/wheel/GameDial';
import { User, Users, CheckCircle2, ArrowLeft, Plus, EyeOff, MessageCircle, Dices, Clock, RefreshCcw, Crown } from 'lucide-react';

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

function PlayerGameController({ roomId, myId, myTeamId, masterState, players, onLeave }: { roomId: string, myId: string, myTeamId: string, masterState: any, players: any[], onLeave: () => void }) {
  const isMyTeam = masterState.mode === 'solo' 
    ? myId === masterState.currentTeamId
    : myTeamId === masterState.currentTeamId;
  const currentTeam = masterState.teams.find((t:any) => t.id === masterState.currentTeamId);
  const teamPlayers = masterState.mode === 'solo'
    ? players.filter((p:any) => p.id === currentTeam?.id)
    : players.filter((p:any) => p.teamId === currentTeam?.id);
  const myIndexInTeam = teamPlayers.findIndex((p:any) => p.id === myId);
  const myPlayer = players.find((p:any) => p.id === myId);
  const myPlayerTeam = masterState.mode === 'solo' 
    ? masterState.teams.find((t:any) => t.id === myId)
    : masterState.teams.find((t:any) => t.id === myTeamId);
  
  // Predictably determine who the psychic is based on the index
  const isPsychic = masterState.mode === 'solo'
    ? isMyTeam
    : isMyTeam && teamPlayers.length > 0 && 
      ((currentTeam?.psychicIndex || 0) % teamPlayers.length) === myIndexInTeam;

  // The Guessers are now everyone NOT on the current team (the opposing team)
  const isGuesser = !isMyTeam;
  const guessingPlayers = masterState.mode === 'solo'
    ? players.filter((p:any) => p.id !== currentTeam?.id)
    : players.filter((p:any) => p.teamId !== currentTeam?.id);
  const myIndexInGuessers = guessingPlayers.findIndex((p:any) => p.id === myId);

  const myTeamPlayers = masterState.mode === 'solo'
    ? players.filter((p:any) => p.id === myId)
    : players.filter((p:any) => p.teamId === myTeamId);
  const myIndexInMyTeam = myTeamPlayers.findIndex((p:any) => p.id === myId);

  // The Captain is exactly one player per non-Psychic team
  const isCaptain = masterState.mode === 'solo'
    ? isGuesser // In solo, every guesser is their own captain
    : isGuesser && myTeamPlayers.length > 0 && 
      ((myPlayerTeam?.psychicIndex || 0) % myTeamPlayers.length) === myIndexInMyTeam;

  const [clueInput, setClueInput] = useState('');
  const [localTarget, setLocalTarget] = useState(90);
  const [localGuess, setLocalGuess] = useState(90);
  const [hasSubmittedBlind, setHasSubmittedBlind] = useState(false);
  const [hasSubmittedTeam, setHasSubmittedTeam] = useState(false);

  // Derive individual guesses array for the GameDial
  const myTeamIndividualGuesses = Object.values(masterState.individualGuesses || {})
    .filter((g: any) => myTeamPlayers.some((p:any) => p.id === g.id))
    .filter((g: any, index, self) => self.findIndex((t: any) => t.name === g.name) === index);

  // Sync states
  useEffect(() => {
    if (masterState.phase === 'clue') {
      setLocalTarget(masterState.targetAngle);
      setClueInput('');
    }
    if (masterState.phase === 'guess_blind') {
      setLocalGuess(90);
      setHasSubmittedBlind(false);
    }
    if (masterState.phase === 'guess_debate') {
      setHasSubmittedTeam(false);
    }
  }, [masterState.phase, masterState.targetAngle]);

  const handleLockClue = (clue: string) => {
    localStorage.setItem(`wave_room_clue_${roomId}`, JSON.stringify({
      clue,
      targetAngle: localTarget,
      ts: Date.now()
    }));
  };

  const handleGuessChange = (angle: number) => {
    setLocalGuess(angle);
    if (masterState.phase === 'guess_debate') {
      localStorage.setItem(`wave_room_guess_${roomId}`, JSON.stringify({ angle, ts: Date.now() }));
    }
  };

  const handleSubmitBlindGuess = () => {
    setHasSubmittedBlind(true);
    
    const guessColor = myPlayerTeam?.color?.split(' ')[0].replace('bg-', '') || 'white';
    
    const hexColor = guessColor.includes('bright_ocean') ? '#1a8fe3' :
                     guessColor.includes('imperial_blue') ? '#010f2c' :
                     guessColor.includes('frosted_mint') ? '#eaf7cf' :
                     guessColor.includes('red') ? '#ef4444' :
                     guessColor.includes('yellow') ? '#eab308' :
                     guessColor.includes('purple') ? '#a855f7' : '#ffffff';
                     
    localStorage.setItem(`wave_room_secret_guess_${roomId}`, JSON.stringify({
      id: myId,
      name: myPlayer?.name || 'Player',
      angle: localGuess,
      color: hexColor,
      ts: Date.now()
    }));
  };

  const handleSubmitTeamGuess = () => {
    setHasSubmittedTeam(true);
    
    const guessColor = myPlayerTeam?.color?.split(' ')[0].replace('bg-', '') || 'white';
    const hexColor = guessColor.includes('bright_ocean') ? '#1a8fe3' :
                     guessColor.includes('imperial_blue') ? '#010f2c' :
                     guessColor.includes('frosted_mint') ? '#eaf7cf' :
                     guessColor.includes('red') ? '#ef4444' :
                     guessColor.includes('yellow') ? '#eab308' :
                     guessColor.includes('purple') ? '#a855f7' : '#ffffff';
                     
    localStorage.setItem(`wave_room_team_guess_${roomId}`, JSON.stringify({
      id: myTeamId,
      name: myPlayerTeam?.name || 'Team',
      angle: localGuess,
      color: hexColor,
      ts: Date.now()
    }));
  };

  const handleLockGuess = () => {
    localStorage.setItem(`wave_room_action_${roomId}`, JSON.stringify({ type: 'LOCK_GUESS', ts: Date.now() }));
  };

  const individualGuessesArray = masterState.individualGuesses ? Object.values(masterState.individualGuesses) : [];

  const renderHeader = () => (
    <div className="flex flex-col gap-2 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500 z-10">
      <div className="flex items-center justify-between bg-black/20 p-3 rounded-2xl border border-black/10 shadow-inner">
        <div>
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest block leading-tight">Playing As</span>
          <span className="text-white font-black text-base">{myPlayer?.name}</span>
        </div>
        <div className="text-right">
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest block leading-tight">Team</span>
          <span className={`font-black text-base ${myPlayerTeam?.color?.split(' ')[0].replace('bg-', 'text-') || 'text-bright_ocean-500'}`}>{myPlayerTeam?.name}</span>
        </div>
      </div>
      <div className="flex justify-center">
        <button 
          onClick={onLeave}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Leave Game
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (masterState.phase === 'clue') {
      if (isPsychic) {
        return (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="bg-white p-4 rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] shrink-0 text-center">
              <h2 className="text-sm font-bold text-bright_ocean-500 uppercase tracking-widest mb-1">Your Concepts:</h2>
              <div className="text-xl md:text-3xl font-black text-imperial_blue-800 uppercase break-words leading-tight">
                {masterState.currentCard.leftConcept} <span className="text-bright_ocean-500 text-lg">VS</span> {masterState.currentCard.rightConcept}
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-imperial_blue-400 p-4 rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] flex flex-col">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-sm font-bold text-cream-500 uppercase tracking-widest flex-1">Adjust Target</h2>
                <button 
                  onClick={() => setLocalTarget(Math.floor(Math.random() * 140) + 20)}
                  className="p-2 bg-bright_ocean-500 text-white rounded-lg active:translate-y-[2px]"
                >
                  <Dices className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <GameDial interactive={true} shutterOpen={true} targetAngle={localTarget} guessAngle={localTarget} onGuessChange={setLocalTarget} />
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              <input 
                type="text" 
                value={clueInput}
                onChange={(e) => setClueInput(e.target.value)}
                placeholder="Enter your clue..."
                className="w-full bg-white text-imperial_blue-800 font-black text-xl px-6 py-4 rounded-2xl border-4 border-imperial_blue-300 focus:outline-none placeholder:text-gray-300"
              />
              <div className="flex gap-2">
                <Button variant="primary" size="lg" className="flex-1" disabled={!clueInput.trim()} onClick={() => handleLockClue(clueInput.trim())}>
                  Lock Clue
                </Button>
                <Button variant="accent" size="lg" className="flex-1" onClick={() => handleLockClue('Spoken Aloud')}>
                  <MessageCircle className="w-5 h-5 mr-1" /> Say It
                </Button>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-imperial_blue-400 p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c] text-center w-full animate-in fade-in zoom-in duration-500">
              <EyeOff className="w-20 h-20 text-frosted_mint-500 mx-auto mb-4 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] animate-pulse" />
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Psychic Phase</h2>
              <p className="text-cream-500 font-bold">Waiting for {currentTeam?.name} Psychic to provide a clue. Look at the Big Screen!</p>
            </div>
          </div>
        );
      }
    }

    if (masterState.phase === 'guess_blind') {
      if (isGuesser) {
        if (hasSubmittedBlind) {
          return (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-imperial_blue-400 p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c] text-center w-full animate-in fade-in zoom-in duration-500">
                <CheckCircle2 className="w-20 h-20 text-frosted_mint-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Locked In</h2>
                <p className="text-cream-500 font-bold">Waiting for everyone else to lock in their initial guesses...</p>
              </div>
            </div>
          );
        }

        return (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="bg-white p-4 rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] shrink-0 text-center">
              <h2 className="text-sm font-bold text-bright_ocean-500 uppercase tracking-widest mb-1">The Clue Is:</h2>
              <p className="text-3xl font-black text-imperial_blue-800 uppercase leading-tight">"{masterState.clue}"</p>
            </div>

            <div className="flex-1 min-h-0 bg-imperial_blue-400 p-4 rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] flex flex-col">
              <h2 className="text-sm font-bold text-cream-500 uppercase tracking-widest text-center mb-2 shrink-0">Secret Initial Guess</h2>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <GameDial interactive={true} shutterOpen={false} targetAngle={masterState.targetAngle} guessAngle={localGuess} onGuessChange={handleGuessChange} />
              </div>
            </div>
            
            <Button variant="primary" size="xl" className="w-full py-6 text-2xl shrink-0" onClick={handleSubmitBlindGuess}>
              Submit Secret Guess
            </Button>
          </div>
        );
      } else {
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-imperial_blue-400 p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c] text-center w-full animate-in fade-in zoom-in duration-500">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Secret Guess Phase</h2>
              <p className="text-cream-500 font-bold">
                {isPsychic ? "Shh! You can't talk. The opposing teams are locking in their initial blind guesses." : "Waiting for the opposing teams to guess."}
              </p>
            </div>
          </div>
        );
      }
    }

    if (masterState.phase === 'guess_debate') {
      if (isGuesser) {
        if (!isCaptain) {
          return (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-imperial_blue-400 p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c] text-center w-full animate-in fade-in zoom-in duration-500">
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Team Debate</h2>
                <p className="text-cream-500 font-bold mb-4">Discuss your initial guesses with your team!</p>
                <p className="text-bright_ocean-300 text-sm italic">The Team Captain is deciding the final guess on their phone.</p>
              </div>
            </div>
          );
        }

        if (hasSubmittedTeam) {
          return (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-imperial_blue-400 p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c] text-center w-full animate-in fade-in zoom-in duration-500">
                <CheckCircle2 className="w-20 h-20 text-frosted_mint-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Team Guess Locked In</h2>
                <p className="text-cream-500 font-bold">Waiting for other teams to finish debating...</p>
              </div>
            </div>
          );
        }

        return (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="bg-white p-4 rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] shrink-0 text-center">
              <h2 className="text-sm font-bold text-bright_ocean-500 uppercase tracking-widest mb-1">You Are The Captain!</h2>
              <p className="text-lg font-black text-imperial_blue-800 uppercase leading-tight">Discuss with your team, then lock it in.</p>
            </div>

            <div className="flex-1 min-h-0 bg-imperial_blue-400 p-4 rounded-3xl border-4 border-imperial_blue-300 shadow-[4px_4px_0px_0px_#010f2c] flex flex-col">
              <h2 className="text-xs font-bold text-cream-500 uppercase tracking-widest text-center mb-2 shrink-0">{myTeamPlayers.length > 1 ? "Your Team's Initial Guesses" : "Your Initial Guess"}</h2>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <GameDial interactive={true} shutterOpen={false} targetAngle={masterState.targetAngle} guessAngle={localGuess} onGuessChange={handleGuessChange} individualGuesses={myTeamIndividualGuesses as any} />
              </div>
            </div>
            
            <Button variant="accent" size="xl" className="w-full py-6 text-2xl shrink-0" onClick={handleSubmitTeamGuess}>
              Lock In Team Guess
            </Button>
          </div>
        );
      } else {
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-imperial_blue-400 p-8 rounded-3xl border-4 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c] text-center w-full animate-in fade-in zoom-in duration-500">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Debate Phase</h2>
              <p className="text-cream-500 font-bold">
                {isPsychic ? "Shh! You can't talk. Listen to the opposing teams argue!" : "Watch the opposing teams debate!"}
              </p>
            </div>
          </div>
        );
      }
    }

    if (masterState.phase === 'reveal') {
      const myGuess = masterState.individualGuesses[myId];
      let myPoints = 0;
      if (myGuess) {
        const diff = Math.abs(masterState.targetAngle - myGuess.angle);
        if (diff <= 5) myPoints = 4;
        else if (diff <= 15) myPoints = 3;
        else if (diff <= 25) myPoints = 2;
      }

      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl border-8 border-imperial_blue-300 shadow-[8px_8px_0px_0px_#010f2c] text-center w-full animate-in fade-in zoom-in duration-500">
            <h2 className="text-3xl font-black text-imperial_blue-800 uppercase tracking-widest mb-4">Reveal Phase</h2>
            <p className="text-xl font-bold text-imperial_blue-500">Look at the TV for the results!</p>
            {masterState.mode === 'solo' && isGuesser && myGuess && (
               <div className={`mt-6 p-4 rounded-xl border-4 font-bold text-2xl uppercase tracking-widest ${myPoints > 0 ? 'bg-frosted_mint-100 border-frosted_mint-500 text-frosted_mint-800' : 'bg-red-100 border-red-500 text-red-800'}`}>
                 You scored: +{myPoints}
               </div>
            )}
          </div>
        </div>
      );
    }

    if (masterState.phase === 'game_over') {
      const isWinner = masterState.mode === 'solo' 
        ? masterState.winnerId === myId 
        : masterState.winnerId === myTeamId;
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className={`p-8 rounded-3xl border-4 shadow-[8px_8px_0px_0px_#010f2c] text-center w-full animate-in fade-in zoom-in duration-500 ${isWinner ? 'bg-frosted_mint-500 border-frosted_mint-300' : 'bg-imperial_blue-400 border-imperial_blue-300'}`}>
            <h2 className={`text-4xl font-black uppercase tracking-widest mb-2 ${isWinner ? 'text-imperial_blue-800' : 'text-white'}`}>
              GAME OVER
            </h2>
            <p className={`font-bold text-2xl ${isWinner ? 'text-imperial_blue-500' : 'text-cream-500'}`}>
              {isWinner ? "🎉 YOU WIN! 🎉" : "Better luck next time!"}
            </p>
            <p className={`text-sm mt-4 font-bold uppercase tracking-widest ${isWinner ? 'text-imperial_blue-800/50' : 'text-white/50'}`}>
              Look at the TV
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen h-[100dvh] flex flex-col p-4 bg-gradient-to-b from-imperial_blue-500 to-imperial_blue-600 overflow-hidden space-y-4">
      {renderHeader()}
      {renderContent()}
    </div>
  );
}

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
  const [players, setPlayers] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [masterState, setMasterState] = useState<any>(null);

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
        if (config) setMode(JSON.parse(config).mode);
      } catch (e) {}
    }
  }, [roomId, searchParams]);

  // Sync teams, players, and master state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const teamsKey = `wave_room_teams_${roomId}`;
    const playersKey = `wave_room_${roomId}`;
    const stateKey = `wave_room_state_${roomId}`;
    
    // Initial load
    try {
      const storedTeams = localStorage.getItem(teamsKey);
      if (storedTeams) setTeams(JSON.parse(storedTeams));
      
      const storedPlayers = localStorage.getItem(playersKey);
      if (storedPlayers) setPlayers(JSON.parse(storedPlayers));
      
      const ms = localStorage.getItem(stateKey);
      if (ms) setMasterState(JSON.parse(ms));
    } catch (e) {}

    const handleStorage = (e: StorageEvent) => {
      try {
        if (e.key === teamsKey && !e.newValue) {
          router.push('/');
        }
        if (e.key === teamsKey && e.newValue) setTeams(JSON.parse(e.newValue));
        if (e.key === playersKey) {
          if (e.newValue) {
            const p = JSON.parse(e.newValue);
            setPlayers(p);
            // Auto-kick if missing
            if (joinedState !== 'unjoined') {
              const stillIn = p.some((player: any) => player.id === myId);
              if (!stillIn) setJoinedState('unjoined');
            }
          } else {
            // Room completely disbanded
            router.push('/');
          }
        }
        if (e.key === stateKey) {
          if (e.newValue) setMasterState(JSON.parse(e.newValue));
          else setMasterState(null); // Game ended or reset
        }
      } catch (err) {}
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [roomId, joinedState, myId]);

  const handleJoin = (teamId: string) => {
    if (!name.trim()) return;
    
    let currentPlayers = [...players];
    currentPlayers.push({ id: myId, name: name.trim(), teamId });
    setPlayers(currentPlayers);
    localStorage.setItem(`wave_room_${roomId}`, JSON.stringify(currentPlayers));
    
    setJoinedState(teamId);
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    
    const newTeamId = `team_${Math.random().toString(36).substring(2, 6)}`;
    const colorIndex = teams.length % TEAM_COLORS.length;
    const newTeam = { id: newTeamId, name: newTeamName.trim(), color: TEAM_COLORS[colorIndex] };
    
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    localStorage.setItem(`wave_room_teams_${roomId}`, JSON.stringify(updatedTeams));
    
    setIsCreatingTeam(false);
    setNewTeamName('');
    handleJoin(newTeamId);
  };

  const handleLeave = () => {
    const p = players.filter((player: any) => player.id !== myId);
    setPlayers(p);
    localStorage.setItem(`wave_room_${roomId}`, JSON.stringify(p));
    setJoinedState('unjoined');
  };

  // If game is active AND we are joined, show the controller!
  if (joinedState !== 'unjoined' && masterState && masterState.phase !== 'setup') {
    return <PlayerGameController roomId={roomId} myId={myId} myTeamId={joinedState} masterState={masterState} players={players} onLeave={handleLeave} />;
  }

  // Lobby waiting state
  if (joinedState !== 'unjoined') {
    const joinedTeam = teams.find(t => t.id === joinedState);
    const teamName = mode === 'coop' ? 'The Collective' : (mode === 'solo' ? 'Free-for-All' : (joinedTeam?.name || 'A Team'));
    
    const teamPlayers = mode === 'solo' ? players : players.filter((p: any) => p.teamId === joinedState);

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

          <div className="bg-imperial_blue-400 p-6 rounded-3xl border-4 border-imperial_blue-300 shadow-[0_8px_0_0_#010f2c] text-left">
            <h3 className="text-xs font-bold text-bright_ocean-500 uppercase tracking-widest border-b-2 border-imperial_blue-300 pb-2 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Team Roster
            </h3>
            
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
              {teamPlayers.length === 0 ? (
                <p className="text-white/50 text-sm italic text-center py-4">It's quiet in here...</p>
              ) : (
                teamPlayers.map((p, index) => (
                  <div key={p.id} className="flex items-center gap-3 bg-imperial_blue-500 p-3 rounded-xl border-2 border-imperial_blue-300 shadow-inner">
                    <User className={`w-5 h-5 ${p.id === myId ? 'text-bright_ocean-500' : 'text-white/30'}`} />
                    <span className="text-white font-bold flex-1 truncate">
                      {p.name} {p.id === myId && <span className="text-white/50 text-xs font-normal ml-1">(You)</span>}
                    </span>
                    {index === 0 && (
                      <div className="flex items-center gap-1 bg-bright_ocean-500/20 text-bright_ocean-500 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                        <Crown className="w-3 h-3" /> Leader
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t-2 border-imperial_blue-300 text-center">
              <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
                <EyeOff className="w-4 h-4 text-frosted_mint-500" /> Waiting for Host...
              </p>
            </div>
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
              {mode === 'solo' ? <User className="w-4 h-4 text-bright_ocean-500" /> : <Users className="w-4 h-4 text-bright_ocean-500" />}
              {mode === 'coop' || mode === 'solo' ? 'Join Game' : 'Select Team'}
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
            ) : mode === 'solo' ? (
              <Button 
                variant="accent" 
                className="w-full py-5 text-xl bg-cream-500 border-cream-300 text-imperial_blue-800 hover:bg-cream-400 hover:border-cream-200 active:border-b-0"
                disabled={!name.trim()}
                onClick={() => handleJoin('solo')}
              >
                Enter Free-for-All
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
