import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-black text-center p-8">
      <div className="relative">
        <h1 className="text-5xl md:text-7xl font-bold text-red-600 mb-4 tracking-tighter animate-pulse text-glow font-mono">
          新手副本生成中......
        </h1>
        {/* Scanline effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/10 to-transparent animate-glitch opacity-30 pointer-events-none"></div>
      </div>

      <p className="text-gray-400 text-lg mb-12 tracking-widest">
        主神空间正在为您匹配适配副本
      </p>

      <div className="flex items-center gap-3 text-red-400 text-xl font-bold animate-bounce">
        <span>⚙️</span>
        <span>副本生成完成！正在加载环境......</span>
      </div>

      <div className="mt-20 max-w-lg text-xs text-gray-600 border-t border-zinc-800 pt-4">
        <p>警告: 您的每个选择都将影响生存概率，请谨慎决策。</p>
        <p className="font-mono mt-1">© 主神空间管理局 | 副本编号: MN-304-7D</p>
      </div>
    </div>
  );
};