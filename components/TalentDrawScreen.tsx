import React, { useState, useEffect, useRef } from 'react';
import { Talent, Rank } from '../types';

interface TalentDrawScreenProps {
    onConfirm: (talent: Talent) => void;
}

const TALENT_POOL: Talent[] = [
    { name: "直死魔眼", rank: Rank.S, description: "能看到事物的‘死线’，感知大幅提升，但消耗理智。", effect: (a) => ({ perception: a.perception + 5, spirit: a.spirit - 2 }) },
    { name: "基因锁一阶", rank: Rank.A, description: "生死关头爆发潜能，全物理属性提升。", effect: (a) => ({ strength: a.strength + 3, agility: a.agility + 3 }) },
    { name: "冷血", rank: Rank.B, description: "面对恐怖事物时理智判定优势，精神提升。", effect: (a) => ({ spirit: a.spirit + 5 }) },
    { name: "跑得快", rank: Rank.C, description: "字面意思，逃跑成功率提升。", effect: (a) => ({ agility: a.agility + 3 }) },
    { name: "幸运E", rank: Rank.D, description: "虽然倒霉，但总能苟活下来。体质微升。", effect: (a) => ({ constitution: a.constitution + 2 }) },
    { name: "路人甲", rank: Rank.E, description: "极低的存在感，怪物容易忽略你。", effect: (a) => ({ }) },
    { name: "钞能力", rank: Rank.A, description: "初始积分翻倍 (200点)，有钱能使鬼推磨。", effect: (a) => ({ }) },
    { name: "天煞孤星", rank: Rank.S, description: "队友祭天，法力无边。初始力量与精神极高。", effect: (a) => ({ strength: a.strength + 2, spirit: a.spirit + 5 }) },
];

export const TalentDrawScreen: React.FC<TalentDrawScreenProps> = ({ onConfirm }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTalent, setCurrentTalent] = useState<Talent | null>(null);
    const [drawCount, setDrawCount] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Animation Loop
    useEffect(() => {
        if (isDrawing) {
            timerRef.current = setInterval(() => {
                const randomTalent = TALENT_POOL[Math.floor(Math.random() * TALENT_POOL.length)];
                setCurrentTalent(randomTalent);
                setDrawCount(prev => prev + 1);
            }, 80); // Fast shuffle
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isDrawing]);

    // Stop animation after fixed rounds
    useEffect(() => {
        if (drawCount > 25) { 
            // Force stop
            setIsDrawing(false);
            setDrawCount(0);
            
            const finalTalent = TALENT_POOL[Math.floor(Math.random() * TALENT_POOL.length)];
            setCurrentTalent(finalTalent);
        }
    }, [drawCount]);

    const startDraw = () => {
        if (isDrawing) return;
        setIsDrawing(true);
        setDrawCount(1);
    };

    const handleConfirm = (e: React.MouseEvent) => {
        e.preventDefault(); 
        if (currentTalent) {
            onConfirm(currentTalent);
        }
    };

    const getRankColor = (rank: Rank) => {
        switch(rank) {
            case Rank.S: return "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.9)]";
            case Rank.A: return "text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]";
            case Rank.B: return "text-blue-400";
            case Rank.C: return "text-green-400";
            default: return "text-gray-400";
        }
    };

    return (
        <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-lg text-center relative overflow-hidden shadow-2xl m-4">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
             
             {/* Decorative Elements */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-2 font-mono tracking-wider animate-pulse">天赋觉醒</h2>
            <p className="text-gray-500 text-xs md:text-sm mb-8 md:mb-12 font-mono">System is scanning your soul signature...</p>

            <div className="min-h-[14rem] md:h-56 flex items-center justify-center mb-8 relative">
                {currentTalent ? (
                    <div className={`transition-all duration-100 transform ${isDrawing ? 'scale-95 blur-[1px] opacity-80' : 'scale-100 opacity-100'}`}>
                        <div className={`text-6xl md:text-8xl font-black mb-4 font-mono ${getRankColor(currentTalent.rank)}`}>
                            {currentTalent.rank}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentTalent.name}</h3>
                        <p className="text-gray-400 max-w-md mx-auto min-h-[3rem] flex items-center justify-center text-sm md:text-base px-2">
                            {currentTalent.description}
                        </p>
                    </div>
                ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-dashed border-zinc-700 rounded-full flex items-center justify-center animate-pulse group cursor-pointer" onClick={startDraw}>
                        <span className="text-5xl text-zinc-700 group-hover:text-red-500 transition-colors">?</span>
                    </div>
                )}
                
                {isDrawing && (
                    <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay animate-pulse pointer-events-none"></div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center items-center">
                {(!currentTalent || isDrawing) ? (
                    <button 
                        onClick={startDraw}
                        disabled={isDrawing}
                        className={`w-full md:w-auto bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-10 rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all transform active:scale-95 ${isDrawing ? 'opacity-80 cursor-wait' : ''}`}
                    >
                        {isDrawing ? "觉醒中..." : "开始觉醒"}
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={startDraw}
                            className="w-full md:w-auto border border-zinc-600 hover:border-zinc-400 text-zinc-400 hover:text-white py-3 px-6 rounded transition-colors text-sm"
                        >
                            重抽 (消耗寿命)
                        </button>
                        <button 
                            onClick={handleConfirm}
                            className="w-full md:w-auto bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-3 px-10 rounded shadow-[0_0_25px_rgba(220,38,38,0.6)] transform hover:scale-105 transition-transform"
                        >
                            确认天赋
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};