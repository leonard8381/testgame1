import React, { useState, useEffect, useRef } from 'react';
import { Character, Dungeon, GameTurn } from '../types';
import { startDungeonGame, processPlayerTurn } from '../services/geminiService';

interface InteractiveDungeonScreenProps {
  character: Character;
  dungeon: Dungeon;
  onGameOver: (result: 'DEAD' | 'INSANE' | 'CLEARED', logs: string[]) => void;
}

const BGM_MAP = {
    'calm': 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3', // Ambient dark
    'tense': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_517926b48d.mp3', // Tension
    'horror': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_8db1f1d5a5.mp3', // Scary
    'battle': 'https://cdn.pixabay.com/download/audio/2022/03/22/audio_c3c33324f6.mp3', // Action drums
    'sad': 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_985536a83e.mp3' // Sad piano
};

export const InteractiveDungeonScreen: React.FC<InteractiveDungeonScreenProps> = ({ character, dungeon, onGameOver }) => {
  const [turn, setTurn] = useState<GameTurn | null>(null);
  const [history, setHistory] = useState<string[]>([]); 
  const [currentHp, setCurrentHp] = useState(character.hp);
  const [currentSan, setCurrentSan] = useState(character.san);
  const [loading, setLoading] = useState(true);
  const [bgImage, setBgImage] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false); 
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Helper to generate image URL
  const getImageUrl = (prompt: string) => {
      const enhancedPrompt = encodeURIComponent(`${prompt}, horror movie scene, cinematic lighting, 8k, dark atmosphere, highly detailed, unreal engine 5 render`);
      return `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random()*1000)}`;
  };

  // Initialize Game
  useEffect(() => {
    let mounted = true;
    startDungeonGame(character, dungeon).then(initialTurn => {
        if(mounted) {
            const safeTurn = { ...initialTurn, turnNumber: 1 };
            setTurn(safeTurn);
            setBgImage(getImageUrl(safeTurn.visualPrompt));
            setLoading(false);
            setHistory([`初始剧情: ${safeTurn.scenarioText}`]);
        }
    });
    return () => { mounted = false; };
  }, []);

  // Audio Manager
  useEffect(() => {
      const audio = audioRef.current;
      if (turn && audio) {
          const targetSrc = BGM_MAP[turn.atmosphere] || BGM_MAP['calm'];
          
          if (!audio.src.includes(targetSrc)) {
              audio.src = targetSrc;
              audio.load();
              if (!isMuted) {
                  const playPromise = audio.play();
                  if (playPromise !== undefined) {
                      playPromise.catch(error => {
                          console.log("Autoplay blocked:", error);
                          setIsMuted(true);
                      });
                  }
              }
          }
      }
  }, [turn]);

  useEffect(() => {
      const audio = audioRef.current;
      if (audio) {
          if (isMuted) audio.pause();
          else audio.play().catch(() => setIsMuted(true));
      }
  }, [isMuted]);

  // Scroll to bottom of text area when turn changes
  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [turn, loading]);

  const toggleMute = () => {
      if (isMuted && audioRef.current) {
          audioRef.current.play()
              .then(() => setIsMuted(false))
              .catch(() => {});
      } else {
          setIsMuted(true);
      }
  };

  const handleChoice = async (choiceId: string, choiceText: string) => {
    if (!turn) return;
    setLoading(true);
    
    const context = history.slice(-3).join("\n");
    const nextTurn = await processPlayerTurn(
        { ...character, hp: currentHp, san: currentSan }, 
        dungeon, 
        context, 
        choiceText,
        turn.turnNumber || 1
    );

    if (nextTurn.lastResult) {
        const newHp = currentHp + (nextTurn.lastResult.hpChange || 0);
        const newSan = currentSan + (nextTurn.lastResult.sanChange || 0);
        setCurrentHp(newHp);
        setCurrentSan(newSan);

        if (newHp <= 0) {
            onGameOver('DEAD', [...history, `选择: ${choiceText}`, nextTurn.lastResult.text]);
            return;
        }
        if (newSan <= 0) {
            onGameOver('INSANE', [...history, `选择: ${choiceText}`, nextTurn.lastResult.text]);
            return;
        }
    }

    const currentTurnCount = nextTurn.turnNumber || (turn.turnNumber + 1);
    if (currentTurnCount > 10) {
        onGameOver('CLEARED', [...history, `选择: ${choiceText}`, "恭喜！你成功活过了所有的危机！"]);
        return;
    }

    setTurn({ ...nextTurn, turnNumber: currentTurnCount });
    setBgImage(getImageUrl(nextTurn.visualPrompt)); 
    setHistory(prev => [...prev, `选择: ${choiceText}`, `结果: ${nextTurn.lastResult?.text || ''}`, `剧情: ${nextTurn.scenarioText}`]);
    setLoading(false);
  };

  const getHpPercent = () => Math.max(0, (currentHp / character.maxHp) * 100);
  const getSanPercent = () => Math.max(0, (currentSan / character.maxSan) * 100);

  const BackgroundLayer = () => (
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          {bgImage && (
              <img 
                src={bgImage} 
                alt="Background" 
                className={`w-full h-full object-cover transition-opacity duration-1000 ${loading ? 'opacity-50 blur-sm' : 'opacity-60 blur-0'}`}
              />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,black_120%)]"></div>
      </div>
  );

  if (!turn && loading) return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-20 bg-cover"></div>
          <div className="z-10 text-4xl mb-4 text-red-600 font-mono animate-pulse">正在构建...</div>
      </div>
  );

  return (
    <div className="w-full h-screen max-h-screen flex flex-col bg-black text-gray-200 overflow-hidden relative font-sans">
      <audio ref={audioRef} loop crossOrigin="anonymous" preload="auto" />
      <BackgroundLayer />

      {/* --- SECTION 1: HUD (Fixed Height, No Shrink) --- */}
      <div className="relative z-10 shrink-0 bg-black/80 backdrop-blur-md border-b border-red-900/50 p-2 shadow-lg flex flex-col gap-2">
          {/* Top Row: Title + Turn + Mute */}
          <div className="flex justify-between items-center">
              <div className="flex items-baseline gap-2 overflow-hidden">
                 <div className="text-base font-bold text-white font-mono truncate">{dungeon.name}</div>
                 <div className="text-[10px] text-red-300 font-mono whitespace-nowrap">
                     Day {turn?.day}|T{turn?.turnNumber}/10
                 </div>
              </div>
               <button 
                onClick={toggleMute}
                className={`w-6 h-6 flex items-center justify-center rounded border transition-colors shrink-0 ${
                    isMuted ? 'bg-red-900/50 border-red-500' : 'bg-zinc-800 border-zinc-600'
                }`}
              >
                  {isMuted ? '🔇' : '🔊'}
              </button>
          </div>
          
          {/* Bars Row */}
          <div className="flex gap-2 w-full text-[10px]">
              <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between text-red-500 font-bold">
                      <span>HP</span><span>{currentHp}/{character.maxHp}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                      <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${getHpPercent()}%` }}></div>
                  </div>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between text-blue-500 font-bold">
                      <span>SAN</span><span>{currentSan}/{character.maxSan}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                      <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${getSanPercent()}%` }}></div>
                  </div>
              </div>
          </div>
      </div>

      {/* --- SECTION 2: SCROLLABLE CONTENT (Flex-1) --- */}
      <div className="relative z-10 flex-1 overflow-y-auto p-3 scroll-smooth custom-scrollbar flex flex-col gap-3">
          
          {turn?.lastResult && (
              <div className="bg-black/60 backdrop-blur-sm border-l-2 border-yellow-600 p-2 rounded text-xs md:text-sm shadow-lg shrink-0">
                  <p className="text-gray-300 italic mb-1">{turn.lastResult.text}</p>
                  <div className="flex gap-3 font-mono font-bold">
                      {turn.lastResult.hpChange !== 0 && (
                          <span className={turn.lastResult.hpChange < 0 ? 'text-red-500' : 'text-green-500'}>
                              HP {turn.lastResult.hpChange > 0 ? '+' : ''}{turn.lastResult.hpChange}
                          </span>
                      )}
                      {turn.lastResult.sanChange !== 0 && (
                          <span className={turn.lastResult.sanChange < 0 ? 'text-blue-500' : 'text-blue-400'}>
                              SAN {turn.lastResult.sanChange > 0 ? '+' : ''}{turn.lastResult.sanChange}
                          </span>
                      )}
                  </div>
              </div>
          )}

          {/* Scenario Text */}
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-3 md:p-6 rounded-lg shadow-lg flex-1">
             <h3 className="text-red-500 font-mono mb-2 text-[10px] tracking-widest uppercase flex items-center gap-2">
                 <span className="animate-pulse">●</span> SITUATION
             </h3>
             <p className="text-sm md:text-lg leading-relaxed text-gray-100 font-serif tracking-wide drop-shadow-md">
                 {turn?.scenarioText}
             </p>
          </div>

           {loading && (
               <div className="flex justify-center p-4">
                   <div className="animate-spin text-3xl text-red-600 opacity-80">❂</div>
               </div>
           )}
           
           {/* Invisible element to scroll to */}
           <div ref={bottomRef} className="h-1"></div>
      </div>

      {/* --- SECTION 3: ACTIONS (Fixed Layout at Bottom, Part of Flex) --- */}
      <div className="relative z-20 bg-gradient-to-t from-black via-zinc-900 to-transparent p-3 pt-6 shrink-0">
          {!loading && turn && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-5xl mx-auto">
                  {turn.choices.map((choice) => (
                      <button
                          key={choice.id}
                          onClick={() => handleChoice(choice.id, choice.text)}
                          className="group relative overflow-hidden bg-zinc-900/90 backdrop-blur border border-zinc-600 hover:border-red-500 text-left p-2 rounded active:scale-95 flex flex-col justify-between min-h-[60px]"
                      >
                          <div className="absolute inset-0 bg-red-900/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                          <div className="relative z-10 w-full">
                              <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5 group-hover:text-red-400">
                                  {choice.type}
                              </div>
                              <div className="font-bold text-gray-200 group-hover:text-white text-xs md:text-sm line-clamp-2 leading-tight">
                                  {choice.text}
                              </div>
                          </div>
                      </button>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};