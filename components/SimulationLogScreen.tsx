import React, { useEffect, useState } from 'react';
import { SimulationLog, Character, Dungeon } from '../types';
import { simulateSurvival } from '../services/geminiService';

interface SimulationLogScreenProps {
  character: Character;
  dungeon: Dungeon;
  onReset: () => void;
}

export const SimulationLogScreen: React.FC<SimulationLogScreenProps> = ({ character, dungeon, onReset }) => {
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    simulateSurvival(character, dungeon).then(data => {
        if(mounted) {
            setLogs(data);
            setLoading(false);
        }
    });
    return () => { mounted = false; };
  }, [character, dungeon]);

  if (loading) {
      return (
          <div className="text-red-500 animate-pulse font-mono text-xl">
              [SYSTEM] 模拟推演中... 计算存活概率...
          </div>
      )
  }

  const getResultColor = (result: string) => {
      if (result === 'DEAD') return 'text-red-600';
      if (result === 'INSANE') return 'text-purple-500';
      if (result === 'CLEARED' || result === 'ALIVE') return 'text-green-500';
      return 'text-gray-400';
  };

  return (
    <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 p-6 rounded shadow-2xl">
      <h2 className="text-2xl font-bold text-red-600 mb-6 border-b border-red-900/30 pb-4">推演日志</h2>
      
      <div className="space-y-6 font-mono text-sm md:text-base">
        {logs.map((log, idx) => (
            <div key={idx} className="flex gap-4 border-l border-zinc-800 pl-4 relative">
                <div className="absolute -left-[5px] top-2 w-2 h-2 bg-zinc-600 rounded-full"></div>
                <div className="text-zinc-500 min-w-[60px]">Day {log.day}</div>
                <div className="flex-1">
                    <p className="text-gray-300 mb-1">{log.event}</p>
                    <div className="flex gap-3 text-xs">
                        {log.hpChange !== 0 && (
                            <span className={log.hpChange < 0 ? 'text-red-400' : 'text-green-400'}>
                                HP {log.hpChange > 0 ? '+' : ''}{log.hpChange}
                            </span>
                        )}
                        {log.sanChange !== 0 && (
                            <span className={log.sanChange < 0 ? 'text-blue-400' : 'text-blue-300'}>
                                SAN {log.sanChange > 0 ? '+' : ''}{log.sanChange}
                            </span>
                        )}
                    </div>
                     {/* Final Result Label if it's the last item */}
                     {idx === logs.length - 1 && (
                         <div className={`mt-2 font-bold uppercase tracking-widest ${getResultColor(log.result)}`}>
                             RESULT: {log.result}
                         </div>
                     )}
                </div>
            </div>
        ))}
      </div>

      <button 
        onClick={onReset}
        className="mt-8 px-6 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-colors text-sm"
      >
        重启轮回
      </button>
    </div>
  );
};