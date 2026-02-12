import React from 'react';
import { Character, Gender } from '../types';

interface DashboardScreenProps {
  character: Character;
  onNext: () => void;
}

const StatBox: React.FC<{ label: string; value: number; desc: string }> = ({ label, value, desc }) => (
  <div className="bg-zinc-900/50 p-1.5 rounded border border-zinc-800 flex flex-col justify-center">
    <div className="flex justify-between items-baseline">
        <div className="text-gray-400 text-[10px]">{label}</div>
        <div className="text-lg font-bold text-red-500 font-mono">{value}</div>
    </div>
    <div className="text-zinc-600 text-[8px] truncate">{desc}</div>
  </div>
);

const InventoryItem: React.FC<{ name: string; desc: string; icon: string }> = ({ name, desc, icon }) => (
  <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800 flex flex-col items-center text-center">
    <div className="text-lg text-red-500">{icon}</div>
    <div className="text-[10px] font-bold text-gray-300 truncate w-full">{name}</div>
  </div>
);

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ character, onNext }) => {
  return (
    <div className="w-full h-screen flex flex-col bg-black text-gray-200 overflow-hidden">
      
      {/* Header Profile - Shrink-0 */}
      <div className="shrink-0 bg-zinc-900 p-3 border-b-2 border-red-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center border border-red-800 text-2xl shrink-0">
                {character.gender === Gender.MALE ? '🙍‍♂️' : '🙍‍♀️'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-bold text-red-500 truncate">{character.name}</h2>
                    <span className="text-xs text-zinc-500 font-mono">{character.age}岁</span>
                </div>
                {/* Talent Badge */}
                {character.talent && (
                    <div className="bg-yellow-900/10 border border-yellow-600/30 px-2 py-0.5 rounded flex justify-between items-center text-[10px]">
                        <span className="text-yellow-600">天赋</span>
                        <span className="text-yellow-400 font-bold truncate ml-2">{character.talent.name} ({character.talent.rank})</span>
                    </div>
                )}
            </div>
      </div>

      {/* Scrollable Middle Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          
          {/* Stats Bars */}
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <div className="mb-2">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-gray-400">HP</span>
                <span className="font-mono text-red-400">{character.hp}/{character.maxHp}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-700 w-full"></div>
              </div>
            </div>
            <div>
               <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-gray-400">SAN</span>
                <span className="font-mono text-blue-400">{character.san}/{character.maxSan}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-700 w-full"></div>
              </div>
            </div>
          </div>

          {/* Attributes Grid */}
          <div>
            <h3 className="font-bold text-red-500 text-[10px] uppercase mb-1.5">基础属性</h3>
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="力量" value={character.attributes.strength} desc="破坏力" />
              <StatBox label="敏捷" value={character.attributes.agility} desc="速度" />
              <StatBox label="体质" value={character.attributes.constitution} desc="生存" />
              <StatBox label="智力" value={character.attributes.intelligence} desc="逻辑" />
              <StatBox label="感知" value={character.attributes.perception} desc="侦查" />
              <StatBox label="精神" value={character.attributes.spirit} desc="意志" />
            </div>
          </div>

          {/* Inventory */}
          <div>
            <h3 className="font-bold text-gray-400 text-[10px] uppercase mb-1.5">物品背包</h3>
            <div className="grid grid-cols-4 gap-2">
                <InventoryItem icon="💎" name="积分" desc={`${character.points}`} />
                <InventoryItem icon="📘" name="指南" desc="×1" />
                <InventoryItem icon="🗡️" name="匕首" desc="Atk+1" />
                <InventoryItem icon="🧪" name="药剂" desc="Heal" />
            </div>
          </div>
      </div>

      {/* Footer Button - Shrink-0 */}
      <div className="shrink-0 p-3 bg-zinc-950 border-t border-zinc-900">
          <button 
            onClick={onNext}
            className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 rounded shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <span className="animate-pulse">⚠️</span> 进入轮回世界
          </button>
      </div>
    </div>
  );
};