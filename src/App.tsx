
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Square from './components/Square';
import { calculateWinner, getBestMove } from './services/minimax';
import { getNarratorCommentary } from './services/geminiService';
import { playXSound, playOSound, playWinSound, playLossSound, playDrawSound } from './services/audioService';
import type { NarratorMessage, Player } from './types';

const App: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("ADIL");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [vitals, setVitals] = useState(100);
  
  // FIX: Destructure both the state value and the setter correctly
  const [narratorMsg, setNarratorMsg] = useState<NarratorMessage>({
    text: "Hi! I'm your AI bestie. Ready to play?",
    sender: 'AI'
  });

  const { winner, line: winningLine } = calculateWinner(board);
  const isGameOver = !!winner || board.every(s => s !== null);
  
  // Ref to prevent multiple score updates in one game
  const scoreProcessedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(v => Math.max(70, Math.min(100, v + (Math.random() - 0.5) * 8)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // FIX: Added setNarratorMsg to dependency array
  const updateNarrator = useCallback(async (currentBoard: Player[], moveIdx: number, hasWinner: boolean, winnerSymbol: Player) => {
    const boardStr = currentBoard.map(s => s || '-').join('');
    const comment = await getNarratorCommentary(boardStr, moveIdx, hasWinner, winnerSymbol === 'X' ? userName : 'Bestie');
    setNarratorMsg({ text: comment, sender: 'AI' });
  }, [userName, setNarratorMsg]);

  useEffect(() => {
    if (isGameOver && !scoreProcessedRef.current) {
      scoreProcessedRef.current = true;
      // FIX: Wrap in setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        if (winner === 'X') {
          setScores(s => ({ ...s, X: s.X + 1 }));
          playWinSound(userName);
        } else if (winner === 'O') {
          setScores(s => ({ ...s, O: s.O + 1 }));
          playLossSound();
        } else {
          setScores(s => ({ ...s, Draws: s.Draws + 1 }));
          playDrawSound();
        }
      }, 0);
    }
  }, [isGameOver, winner, userName]);

  useEffect(() => {
    if (!isXNext && !isGameOver) {
      // FIX: Wrap in setTimeout to avoid synchronous setState in effect
      const thinkTimer = setTimeout(() => {
        setIsAiThinking(true);
      }, 0);

      const aiTimer = setTimeout(() => {
        const bestMove = getBestMove([...board]);
        const newBoard = [...board];
        newBoard[bestMove] = 'O';
        setBoard(newBoard);
        setIsXNext(true);
        setIsAiThinking(false);
        playOSound();
        const { winner: moveWinner } = calculateWinner(newBoard);
        updateNarrator(newBoard, bestMove, !!moveWinner, moveWinner);
      }, 700);
      return () => {
        clearTimeout(thinkTimer);
        clearTimeout(aiTimer);
      };
    }
  }, [isXNext, isGameOver, board, updateNarrator]);

  const handleClick = (i: number) => {
    if (board[i] || winner || !isXNext) return;
    playXSound();
    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
  };

  const resetGame = () => {
    playXSound();
    scoreProcessedRef.current = false;
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setNarratorMsg({ text: "Let's play again! I'll try my best.", sender: 'AI' });
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-between p-0 m-0 overflow-hidden relative bg-[#02040a] min-h-screen">
      
      {/* Gorgeous Navbar */}
      <nav className="w-full px-6 py-2 flex justify-between items-center navbar-glass z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30 shadow-[0_0_10px_rgba(0,243,255,0.2)]">
             <span className="text-cyan-400 font-bold text-sm">AI</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-orbitron font-black text-white tracking-[0.1em] flex items-center gap-2">
              TIC-TAC-TOE<span className="text-cyan-400">GAME</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_green]"></span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-4 md:gap-8 items-center">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">AI Smile</span>
            <div className="w-20 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all duration-1000" style={{width: `${vitals}%`}}></div>
            </div>
          </div>
          <div className="flex items-center gap-3 cursor-pointer bg-white/5 px-4 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-all" onClick={() => setIsEditingName(true)}>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none">Me</span>
              <span className="text-white text-xs font-bold truncate max-w-[130px]">{userName}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Unified Content Area */}
      <main className="flex-1 w-full max-w-md flex flex-col justify-around py-4 px-4 overflow-hidden">
        
        {/* Score Board */}
        <div className="w-full grid grid-cols-3 gap-2 animate-slide-up stagger-1">
          <div className="hud-border p-2.5 text-center rounded-2xl bg-cyan-500/5">
            <span className="text-[9px] text-cyan-400 font-black uppercase tracking-widest">My Score</span>
            <p className="text-3xl font-orbitron font-black text-white">{scores.X}</p>
          </div>
          <div className="hud-border p-2.5 text-center rounded-2xl">
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Ties</span>
            <p className="text-3xl font-orbitron font-black text-slate-400">{scores.Draws}</p>
          </div>
          <div className="hud-border p-2.5 text-center rounded-2xl bg-rose-500/5">
            <span className="text-[9px] text-rose-400 font-black uppercase tracking-widest">AI Friend</span>
            <p className="text-3xl font-orbitron font-black text-white">{scores.O}</p>
          </div>
        </div>

        {/* Board - No Scroll Fit */}
        <div className="relative mx-auto w-fit animate-slide-up stagger-2 scale-90 sm:scale-100">
          {isAiThinking && <div className="scanner z-30"></div>}
          <div className="hud-border p-4 grid grid-cols-3 gap-3 bg-slate-900/40 rounded-[2.5rem] relative shadow-2xl">
            {board.map((sq, i) => (
              <Square
                key={i}
                value={sq}
                onClick={() => handleClick(i)}
                isWinningSquare={winningLine?.includes(i) || false}
                disabled={isAiThinking}
              />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {/* <div className="w-full animate-slide-up stagger-3">
          <CyberNarrator message={narratorMsg} isThinking={isAiThinking} />
        </div> */}
      </main>

      {/* Result Layer */}
      {isGameOver && (
        <div className="fixed inset-0 bg-slate-950/98 z-[200] flex flex-col items-center justify-center p-8 backdrop-blur-3xl animate-result">
          <div className="text-center space-y-8 max-w-sm w-full">
            <h3 className="text-cyan-400 text-[10px] font-bold tracking-[0.6em] uppercase opacity-50">Game Result</h3>
            <h2 className={`text-6xl font-orbitron font-black tracking-tighter leading-none ${winner === 'X' ? 'text-cyan-400' : winner === 'O' ? 'text-rose-500' : 'text-slate-400'}`}>
              {winner ? (winner === 'X' ? 'YOU WON!' : 'AI WON') : 'FRIENDS TIE'}
            </h2>
            <p className="text-slate-400 font-medium text-lg px-6">
              {winner === 'X' ? "Wow! You are super smart!" : winner === 'O' ? "I got lucky! Try again?" : "We are both smart! Let's break the tie!"}
            </p>
            <button
              onClick={resetGame}
              className="w-full py-5 font-orbitron font-black tracking-[0.3em] rounded-2xl transition-all hover:scale-105 active:scale-95 bg-cyan-600 shadow-[0_0_30px_rgba(8,145,178,0.4)] text-white uppercase"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Name Input Layer */}
      {isEditingName && (
        <div className="fixed inset-0 bg-slate-950/98 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl">
          <div className="hud-border p-12 w-full max-w-xl text-center rounded-[3rem] border-cyan-500/30">
            <h3 className="text-cyan-400 text-xs font-bold tracking-[0.4em] mb-10 uppercase">Your Name?</h3>
            <input 
              autoFocus
              className="bg-transparent border-b-2 border-cyan-500/50 text-white outline-none text-center text-4xl font-orbitron font-bold px-2 w-full mb-12 uppercase"
              value={userName}
              onChange={(e) => setUserName(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
            />
            <button 
              onClick={() => setIsEditingName(false)}
              className="w-full py-5 bg-cyan-600 text-white font-bold rounded-2xl tracking-widest font-orbitron hover:bg-cyan-500 transition-colors"
            >
              LET'S GO
            </button>
          </div>
        </div>
      )}

      <footer className="w-full py-3 text-slate-200 text-[9px] font-orbitron tracking-[0.5em] pointer-events-none uppercase text-center opacity-40">
        Best Friend AI System
      </footer>
    </div>
  );
};

export default App;
