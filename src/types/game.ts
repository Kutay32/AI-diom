export type GameStatus =
  | "LOBBY"
  | "ROLE_ASSIGNMENT"
  | "EMOJI_PICKING"
  | "GUESSING"
  | "ROUND_END"
  | "GAME_OVER";

export interface Player {
  id: string;
  username: string;
  score: number;
  isHost: boolean;
}

export interface IdiomOption {
  id: string;
  text: string;
  emojis: string[];
}

export interface RoomStateSnapshot {
  roomCode: string;
  status: GameStatus;
  currentRound: number;
  activePlayerId: string | null;
  roundEndsAt?: string;
}

export type BroadcastEvent =
  | {
      type: "STATE_SYNC";
      payload: {
        status: GameStatus;
        activePlayerId: string;
        roundEndsAt?: string;
        currentRound?: number;
      };
    }
  | {
      type: "QUESTION_SELECTED";
      payload: {
        emojis: string[];
        idiomIdHash: string;
      };
    }
  | {
      type: "GUESS_ATTEMPT";
      payload: {
        playerId: string;
        username: string;
        guess: string;
        isCorrect: boolean;
      };
    };
