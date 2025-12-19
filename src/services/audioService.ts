/* eslint-disable @typescript-eslint/no-explicit-any */

import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey:  import.meta.env.VITE_API_KEY });
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const playBeep = (freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration);
};

const playSuccessChime = () => {
  const now = audioCtx.currentTime;
  const vol = 0.08;
  playBeep(329.63, now, 0.3, 'sine', vol); // E4
  playBeep(392.00, now + 0.1, 0.3, 'sine', vol); // G4
  playBeep(523.25, now + 0.2, 0.6, 'sine', vol); // C5
};

const playFailureTune = () => {
  const now = audioCtx.currentTime;
  playBeep(261.63, now, 0.2, 'sine', 0.05); // C4
  playBeep(196.00, now + 0.2, 0.4, 'sine', 0.05); // G3
};

async function playGeminiVoice(prompt: string, delay: number = 0) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const buffer = await decodeAudioData(decodeBase64(base64Audio), audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start(audioCtx.currentTime + delay);
    }
  } catch (e) {
    console.error("Audio trigger failed", e);
  }
}

export const playXSound = () => {
  playBeep(1200, audioCtx.currentTime, 0.04, 'sine', 0.08);
};

export const playOSound = () => {
  playBeep(800, audioCtx.currentTime, 0.05, 'sine', 0.1);
};

export const playWinSound = (name: string) => {
  playSuccessChime();
  playGeminiVoice(`Wow! Great job ${name}, you won! You're really good at this.`, 0.4);
};

export const playLossSound = () => {
  playFailureTune();
  playGeminiVoice("I got this one! But don't worry, you're playing great. Try again?", 0.4);
};

export const playDrawSound = () => {
  playGeminiVoice("It's a tie! We both played perfectly.");
};
