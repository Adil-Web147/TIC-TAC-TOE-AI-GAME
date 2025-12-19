
import React from 'react';
import type { NarratorMessage } from '../types';

interface CyberNarratorProps {
  message: NarratorMessage;
  isThinking: boolean;
}

const CyberNarrator: React.FC<CyberNarratorProps> = ({ message, isThinking }) => {
  return (
    <div className="w-full p-4 bg-cyan-950/10 border-l-4 border-cyan-500/40 relative overflow-hidden group rounded-r-xl">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #00f3ff 1px, transparent 1px)', backgroundSize: '12px 12px'}}></div>
      
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_cyan]' : 'bg-slate-700'}`}></div>
        <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-[0.3em]">AI Chat</span>
      </div>
      
      <div className="min-h-[2.5rem] flex items-center">
        <p className="text-white/90 text-sm font-medium tracking-wide">
          {isThinking ? "Just a second, friend..." : message.text}
          {!isThinking && <span className="inline-block w-1.5 h-3.5 bg-cyan-400/40 ml-1 animate-pulse align-middle"></span>}
        </p>
      </div>
    </div>
  );
};

export default CyberNarrator;
