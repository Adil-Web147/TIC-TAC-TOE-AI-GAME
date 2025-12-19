
export type Player = 'X' | 'O' | null;

export interface GameState {
  board: Player[];
  isXNext: boolean;
  winner: Player;
  winningLine: number[] | null;
  history: Player[][];
  scores: {
    X: number;
    O: number;
    Draws: number;
  };
}

export interface NarratorMessage {
  text: string;
  sender: 'AI' | 'SYSTEM';
}
