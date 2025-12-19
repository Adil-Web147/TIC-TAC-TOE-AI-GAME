/* eslint-disable @typescript-eslint/no-unused-vars */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey:  import.meta.env.VITE_API_KEY});

export async function getNarratorCommentary(
  boardState: string, 
  lastMove: number, 
  isWinner: boolean, 
  winnerName: string | null
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are 'Cerebro', a friendly and helpful AI companion.
      A player named ${winnerName} is playing Tic-Tac-Toe with you.
      Board: ${boardState}. Last move at ${lastMove}.
      ${isWinner ? `${winnerName} just won!` : "The game is still going."}
      
      Provide a very short (max 12 words) friendly, encouraging, and easy-to-understand comment. 
      Do NOT use difficult words. Be like a helpful friend who enjoys the game.`,
      config: {
        systemInstruction: "You are a friendly, encouraging AI who uses simple and clear language.",
        temperature: 0.9,
      },
    });

    return response.text?.trim() || "Good move!";
  } catch (error) {
    return "Nice one!";
  }
}
