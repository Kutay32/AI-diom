"use client";

import { create } from "zustand";

import type { GameStatus, Player } from "@/types/game";

type WrongGuessItem = {
  playerId: string;
  username: string;
  guess: string;
};

type GameStore = {
  roomCode: string;
  status: GameStatus;
  currentRound: number;
  activePlayerId: string | null;
  roundEndsAt?: string;
  emojis: string[];
  players: Player[];
  wrongGuesses: WrongGuessItem[];
  hasCorrectGuess: boolean;
  guessedIncorrectSet: Set<string>;
  setRoomCode: (roomCode: string) => void;
  setPlayers: (players: Player[]) => void;
  setStatus: (status: GameStatus) => void;
  syncState: (input: { status: GameStatus; activePlayerId: string; roundEndsAt?: string; currentRound?: number }) => void;
  setQuestion: (emojis: string[]) => void;
  addWrongGuess: (entry: WrongGuessItem) => void;
  markCorrectGuess: () => void;
  addLocalWrongGuessKey: (guess: string) => void;
  hasLocalWrongGuessKey: (guess: string) => boolean;
  resetRoundFlags: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  roomCode: "",
  status: "LOBBY",
  currentRound: 0,
  activePlayerId: null,
  roundEndsAt: undefined,
  emojis: [],
  players: [],
  wrongGuesses: [],
  hasCorrectGuess: false,
  guessedIncorrectSet: new Set<string>(),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPlayers: (players) => set({ players }),
  setStatus: (status) => set({ status }),
  syncState: ({ status, activePlayerId, roundEndsAt, currentRound }) =>
    set((state) => ({
      status,
      activePlayerId,
      roundEndsAt,
      currentRound: typeof currentRound === "number" ? currentRound : state.currentRound,
      wrongGuesses: status === "GUESSING" ? state.wrongGuesses : [],
      hasCorrectGuess: status === "GUESSING" ? state.hasCorrectGuess : false,
    })),
  setQuestion: (emojis) => set({ emojis }),
  addWrongGuess: (entry) =>
    set((state) => ({
      wrongGuesses: [entry, ...state.wrongGuesses].slice(0, 5),
    })),
  markCorrectGuess: () => set({ hasCorrectGuess: true }),
  addLocalWrongGuessKey: (guess) =>
    set((state) => {
      const next = new Set(state.guessedIncorrectSet);
      next.add(guess);
      return { guessedIncorrectSet: next };
    }),
  hasLocalWrongGuessKey: (guess) => get().guessedIncorrectSet.has(guess),
  resetRoundFlags: () => set({ hasCorrectGuess: false, wrongGuesses: [], guessedIncorrectSet: new Set<string>() }),
}));
