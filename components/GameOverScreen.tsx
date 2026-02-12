import React from 'react';

interface GameOverScreenProps {
  result: 'DEAD' | 'INSANE' | 'CLEARED';
  logs: string[];
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ result, logs, onRestart }) => {
  const isVictory = result === 'CLEARED';
  
  const getTitle = () => {
      if (result === 'CLEARED') return '任务完成';
      if (result === 'DEAD') return '死亡';
      if (result === 'INSANE') return '精神崩溃';
      return result;
  };

  const getSubtitle = () => {
      if (result === 'CLEARED') return 'Mission Accomplished';
      return 'Mission Failed';
  };

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center p-6 bg-black text-center relative overflow-hidden`}>
      {/* Background Effect */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none ${isVictory ? 'bg-green-900' : 'bg-red-900 animate-pulse'}`}></div>
      
      <div className="z-10 max-w-2xl w-full">
        <h1 className={`text-4xl md:text-8xl font-black mb-2 font-mono tracking-tighter ${isVictory ? 'text-green-500' : 'text-red-600'}`}>
            {getTitle()}
        </h1>
        <div className="text-lg md:text-2xl font-bold tracking-widest mb-8 md:mb-12 text-white uppercase">
            {getSubtitle()}
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 p-4 md:p-6 rounded text-left max-h-48 md:max-h-60 overflow-y-auto mb-6 md:mb-8 text-xs md:text-sm font-mono text-gray-400 custom-scrollbar">
            <h3 className="border-b border-zinc-700 pb-2 mb-4 text-white">生还记录 (LOGS)</h3>
            {logs.slice(-5).map((log, i) => (
                <div key={i} className="mb-2">{log}</div>
            ))}
        </div>

        <p className="text-gray-500 mb-6 md:mb-8 italic text-sm md:text-base">
            {isVictory 
                ? "你成功活过了这场恐怖轮回，获得了回归主神空间的资格。" 
                : result === 'DEAD' 
                    ? "你的生命体征已消失。主神已抹杀你的存在。" 
                    : "你的理智彻底崩溃，成为了副本中游荡的怪物之一。"}
        </p>

        <button 
            onClick={onRestart}
            className={`w-full md:w-auto px-8 py-3 md:px-12 md:py-4 text-base md:text-lg font-bold rounded shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                isVictory 
                ? 'bg-green-700 hover:bg-green-600 text-white' 
                : 'bg-red-700 hover:bg-red-600 text-white'
            }`}
        >
            {isVictory ? '领取奖励 & 返回' : '重新轮回'}
        </button>
      </div>
    </div>
  );
};