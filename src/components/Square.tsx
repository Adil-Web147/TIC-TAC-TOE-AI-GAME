
import React from 'react';
import type { Player } from '../types';

interface SquareProps {
  value: Player;
  onClick: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        relative aspect-square
        w-[clamp(75px,22vw,95px)] h-[clamp(75px,22vw,95px)]
        flex items-center justify-center 
        text-[clamp(2rem,8vw,3.5rem)] font-orbitron font-bold
        transition-all duration-300 group
        ${isWinningSquare 
          ? 'bg-cyan-500/30 border border-cyan-400 scale-105 z-10 shadow-[0_0_20px_rgba(0,243,255,0.4)]' 
          : 'bg-slate-900/30 border border-slate-800/40 hover:border-cyan-500/30 hover:bg-cyan-900/5'}
        ${disabled && !value ? 'cursor-not-allowed opacity-20' : 'cursor-pointer active:scale-90'}
      `}
    >
      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-slate-700/50 group-hover:border-cyan-500/30"></div>
      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-slate-700/50 group-hover:border-cyan-500/30"></div>
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-slate-700/50 group-hover:border-cyan-500/30"></div>
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-slate-700/50 group-hover:border-cyan-500/30"></div>

      <span className={`
        ${value === 'X' ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(0,243,255,0.6)]' : 'text-rose-500 drop-shadow-[0_0_10px_rgba(255,0,85,0.6)]'}
        transition-all duration-500 transform
        ${value ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
      `}>
        {value}
      </span>
    </button>
  );
};

export default Square;
