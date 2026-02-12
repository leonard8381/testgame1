import React from 'react';
import { Dungeon } from '../types';

interface DungeonInfoScreenProps {
  dungeon: Dungeon;
  onStartSimulation: () => void;
}

const InfoCard: React.FC<{ title: string; value: string | number; color?: string }> = ({ title, value, color = "text-white" }) => (
    <div className="bg-black/50 p-4 border-l-2 border-red-800">
        <div className="text-gray-500 text-xs mb-1 font-bold uppercase">{title}</div>
        <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
);

export const DungeonInfoScreen: React.FC<DungeonInfoScreenProps> = ({ dungeon, onStartSimulation }) => {
  return (
    <div className="w-full max-w-5xl p-8 bg-zinc-900 border border-zinc-800 relative">
       {/* Header with Icon */}
       <div className="flex items-center gap-3 mb-6 border-b border-zinc-700 pb-4">
           <span className="text-red-500 text-2xl">🎬</span>
           <h2 className="text-2xl font-bold text-gray-100">副本信息</h2>
       </div>

       {/* Grid Info */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-zinc-950 p-1 rounded border border-zinc-800">
            <InfoCard title="副本名称" value={dungeon.name} />
            <InfoCard title="难度" value={dungeon.difficulty} color="text-yellow-500" />
            <InfoCard title="类型" value={dungeon.type} color="text-blue-400" />
            <InfoCard title="玩家人数" value={`${dungeon.playerCount}人 (含你在内)`} color="text-green-400" />
       </div>

       {/* Special Mechanism */}
       <div className="mb-6 bg-purple-900/20 border border-purple-900/50 p-4 rounded">
           <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold text-sm">
               <span>⚠️</span> 特殊机制
           </div>
           <p className="text-gray-300 text-sm">
               {dungeon.specialMechanism}
           </p>
       </div>

       {/* Backstory */}
       <div className="mb-10">
           <h3 className="text-yellow-600 font-bold mb-3 text-lg">背景故事</h3>
           <p className="text-gray-400 leading-relaxed text-sm md:text-base border-l-4 border-zinc-700 pl-4">
               {dungeon.backstory}
           </p>
       </div>
       
       <button 
            onClick={onStartSimulation}
            className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded shadow-lg transition-all active:scale-[0.98]"
        >
            开始生存模拟
        </button>

       <div className="mt-6 text-right text-xs text-zinc-600 font-mono">
            小红书号: 11536228573
       </div>
    </div>
  );
};