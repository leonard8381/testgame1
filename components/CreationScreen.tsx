import React, { useState } from 'react';
import { Gender } from '../types';

interface CreationScreenProps {
  onComplete: (name: string, age: number, gender: Gender) => void;
}

export const CreationScreen: React.FC<CreationScreenProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('18');
  const [gender, setGender] = useState<Gender>(Gender.MALE);

  const handleSubmit = () => {
    const ageNum = parseInt(age);
    if (!name.trim()) return alert("请输入姓名");
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 70) return alert("年龄必须在 18-70 岁之间");
    onComplete(name, ageNum, gender);
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center p-4 bg-black overflow-hidden relative">
      <div className="w-full max-w-lg bg-zinc-900/90 border border-red-900/50 rounded-lg shadow-2xl p-5 relative z-10 flex flex-col gap-4">
          
          <header className="text-center">
            <h1 className="text-2xl font-bold text-red-600 tracking-wider text-glow">主神游戏</h1>
            <p className="text-red-400 text-[10px] tracking-[0.2em] uppercase">Survival Simulator</p>
          </header>

          <div className="bg-zinc-950 p-3 rounded border-l-2 border-red-700 text-xs text-gray-400 leading-snug">
            <p>濒死之际，你被拽入“主神空间”。通关副本可进化，失败则抹杀。</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-gray-500 text-xs mb-1">你的姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-2 text-sm focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-xs mb-1">你的年龄 (18-70)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={18}
                max={70}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-2 text-sm focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-xs mb-1">你的性别</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGender(Gender.MALE)}
                  className={`p-2 rounded border text-sm transition-all ${
                    gender === Gender.MALE ? 'bg-red-900/40 border-red-500 text-red-200' : 'bg-zinc-800 border-zinc-700 text-gray-400'
                  }`}
                >
                  男性
                </button>
                <button
                  onClick={() => setGender(Gender.FEMALE)}
                  className={`p-2 rounded border text-sm transition-all ${
                    gender === Gender.FEMALE ? 'bg-red-900/40 border-red-500 text-red-200' : 'bg-zinc-800 border-zinc-700 text-gray-400'
                  }`}
                >
                  女性
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-2 bg-red-800 hover:bg-red-700 text-white font-bold py-3 rounded shadow-lg text-sm flex justify-center items-center gap-2"
            >
              进入主神空间
            </button>
          </div>
      </div>
    </div>
  );
};