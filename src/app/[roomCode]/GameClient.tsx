"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";

import { ChatBox } from "@/components/game/ChatBox";
import { ConfettiOverlay } from "@/components/game/ConfettiOverlay";
import { EmojiSelector } from "@/components/game/EmojiSelector";
import { GuessCanvas } from "@/components/game/GuessCanvas";
import { LobbyScreen } from "@/components/game/LobbyScreen";
import { ScoreBoard } from "@/components/game/ScoreBoard";
import { WrongGuessesFeed } from "@/components/game/WrongGuessesFeed";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { broadcastRoomEvent, createRoomChannel, onRoomBroadcast, onPlayersChange, subscribeRoomChannel } from "@/lib/supabase/realtime";
import { useGameStore } from "@/lib/store/useGameStore";
import type { GameStatus, IdiomOption, Player } from "@/types/game";
import { isGuessCorrect } from "@/utils/matching";

const ROUND_SECONDS = 30;

type GameClientProps = {
  roomCode: string;
  initialStatus: GameStatus;
  initialRound: number;
};

export function GameClient({ roomCode, initialRound, initialStatus }: GameClientProps) {
  const [dbOptions, setDbOptions] = useState<IdiomOption[]>([]);
  const [isFetchingOptions, setIsFetchingOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<IdiomOption | null>(null);
  const [targetIdiom, setTargetIdiom] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isJoining, setIsJoining] = useState(true);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const playerIdRef = useRef<string | null>(null);

  const {
    activePlayerId,
    currentRound,
    emojis,
    hasCorrectGuess,
    players,
    roomCode: storeRoomCode,
    roundEndsAt,
    status,
    wrongGuesses,
    addLocalWrongGuessKey,
    addWrongGuess,
    hasLocalWrongGuessKey,
    markCorrectGuess,
    resetRoundFlags,
    setPlayers,
    setQuestion,
    setRoomCode,
    setStatus,
    syncState,
  } = useGameStore();

  useEffect(() => {
    setRoomCode(roomCode);
    setStatus(initialStatus);
    syncState({ status: initialStatus, activePlayerId: "", currentRound: initialRound });
    setIsHydrated(true);
  }, [initialRound, initialStatus, roomCode, setRoomCode, setStatus, syncState]);

  const activePlayer = useMemo(() => players.find((player) => player.id === activePlayerId) ?? null, [activePlayerId, players]);

  const me = useMemo(() => players.find((player) => player.id === playerIdRef.current), [players]);
  const isHost = me?.isHost ?? false;
  const isActivePlayer = me?.id && activePlayer?.id ? me.id === activePlayer.id : false;

  const handleBroadcast = useCallback(
    async (event: Parameters<typeof broadcastRoomEvent>[1]) => {
      if (!channelRef.current) {
        return;
      }
      await broadcastRoomEvent(channelRef.current, event);
    },
    [],
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const setup = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const username = localStorage.getItem("emojideyim.username")?.trim() || `oyuncu-${Math.floor(Math.random() * 1000)}`;

        let userId = localStorage.getItem("emojideyim.playerId");
        if (!userId) {
          const authResult = await supabase.auth.signInAnonymously();
          if (authResult.error) {
            throw authResult.error;
          }
          userId = authResult.data.user?.id ?? null;
        }

        if (!userId) {
          throw new Error("Anonymous player ID could not be initialized.");
        }

        playerIdRef.current = userId;
        localStorage.setItem("emojideyim.playerId", userId);

        const roomQuery = await supabase.from("rooms").select("id,host_id").eq("id", roomCode).maybeSingle();
        const roomExists = !!roomQuery.data;

        if (!roomExists) {
          await supabase.from("rooms").insert({ id: roomCode, host_id: userId, status: "LOBBY" });
        }

        const hostId = roomQuery.data?.host_id ?? userId;
        const isPlayerHost = hostId === userId;

        await supabase.from("players").upsert({
          id: userId,
          room_id: roomCode,
          username,
          score: 0,
          is_host: isPlayerHost,
        });

        const playersResult = await supabase
          .from("players")
          .select("id,username,score,is_host")
          .eq("room_id", roomCode)
          .order("joined_at", { ascending: true });

        if (playersResult.data) {
          const mappedPlayers: Player[] = playersResult.data.map((player: { id: string; username: string; score: number; is_host: boolean }) => ({
            id: String(player.id),
            username: String(player.username),
            score: Number(player.score ?? 0),
            isHost: Boolean(player.is_host),
          }));
          setPlayers(mappedPlayers);

          if (!activePlayerId && mappedPlayers.length > 0) {
            syncState({ status: initialStatus, activePlayerId: mappedPlayers[0].id, currentRound: initialRound });
          }
        }

        const channel = createRoomChannel(roomCode, userId);
        channelRef.current = channel;

        onRoomBroadcast(channel, (event) => {
          if (event.type === "STATE_SYNC") {
            syncState({
              status: event.payload.status,
              activePlayerId: event.payload.activePlayerId,
              roundEndsAt: event.payload.roundEndsAt,
              currentRound: event.payload.currentRound,
            });

            if (event.payload.status !== "GUESSING") {
              resetRoundFlags();
            }
          }

          if (event.type === "QUESTION_SELECTED") {
            setQuestion(event.payload.emojis);
          }

          if (event.type === "GUESS_ATTEMPT") {
            if (event.payload.isCorrect) {
              if (event.payload.playerId === playerIdRef.current) {
                markCorrectGuess();
              }
              return;
            }

            addWrongGuess({
              playerId: event.payload.playerId,
              username: event.payload.username,
              guess: event.payload.guess,
            });
          }
        });

        onPlayersChange(channel, roomCode, async () => {
          const latest = await supabase
            .from("players")
            .select("id,username,score,is_host")
            .eq("room_id", roomCode)
            .order("joined_at", { ascending: true });

          if (latest.data) {
            const nextPlayers: Player[] = latest.data.map((player: { id: string; username: string; score: number; is_host: boolean }) => ({
              id: String(player.id),
              username: String(player.username),
              score: Number(player.score ?? 0),
              isHost: Boolean(player.is_host),
            }));
            setPlayers(nextPlayers);
          }
        });

        await subscribeRoomChannel(channel, { username, playerId: userId });

        setIsJoining(false);
      } catch (error) {
        console.error(error);
        setIsJoining(false);
      }
    };

    void setup();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [
    activePlayerId,
    addWrongGuess,
    initialRound,
    initialStatus,
    isHydrated,
    markCorrectGuess,
    resetRoundFlags,
    roomCode,
    setPlayers,
    setQuestion,
    syncState,
  ]);

  const startGame = useCallback(async () => {
    if (!isHost) {
      return;
    }

    const firstActivePlayer = players[0]?.id;
    if (!firstActivePlayer) {
      return;
    }

    await handleBroadcast({
      type: "STATE_SYNC",
      payload: {
        status: "ROLE_ASSIGNMENT",
        activePlayerId: firstActivePlayer,
        currentRound: 1,
      },
    });

    setStatus("ROLE_ASSIGNMENT");
  }, [handleBroadcast, isHost, players, setStatus]);

  const submitQuestion = useCallback(async () => {
    if (!selectedOption) {
      return;
    }

    const roundEndsAtIso = new Date(Date.now() + ROUND_SECONDS * 1000).toISOString();
    setTargetIdiom(selectedOption.text);
    setQuestion(selectedOption.emojis);
    resetRoundFlags();

    await handleBroadcast({
      type: "QUESTION_SELECTED",
      payload: {
        emojis: selectedOption.emojis,
        idiomIdHash: btoa(selectedOption.id),
      },
    });

    await handleBroadcast({
      type: "STATE_SYNC",
      payload: {
        status: "GUESSING",
        activePlayerId: activePlayerId ?? "",
        roundEndsAt: roundEndsAtIso,
        currentRound,
      },
    });
  }, [activePlayerId, currentRound, handleBroadcast, resetRoundFlags, selectedOption, setQuestion]);

  const submitGuess = useCallback(
    async (guess: string) => {
      const meId = playerIdRef.current;
      if (!meId || !me) {
        return;
      }

      const wrongGuessKey = guess.toLocaleLowerCase("tr-TR").replace(/[\s-]/g, "");
      if (hasLocalWrongGuessKey(wrongGuessKey)) {
        return;
      }

      const correct = isGuessCorrect(guess, targetIdiom);
      if (!correct) {
        addLocalWrongGuessKey(wrongGuessKey);
      }

      await handleBroadcast({
        type: "GUESS_ATTEMPT",
        payload: {
          playerId: meId,
          username: me.username,
          guess,
          isCorrect: correct,
        },
      });

      if (!correct) {
        return;
      }

      markCorrectGuess();
      const supabase = getSupabaseBrowserClient();
      await supabase.rpc("increment_score", { p_player_id: meId, p_points: 3 });
    },
    [addLocalWrongGuessKey, handleBroadcast, hasLocalWrongGuessKey, markCorrectGuess, me, targetIdiom],
  );

  const showEmojiPicker = status === "EMOJI_PICKING" || (status === "ROLE_ASSIGNMENT" && isActivePlayer);
  const showGuessing = status === "GUESSING";

  useEffect(() => {
    if (showEmojiPicker && isActivePlayer && dbOptions.length === 0 && !isFetchingOptions) {
      const fetchOptions = async () => {
        setIsFetchingOptions(true);
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.from("idioms").select("id, text, emojis").limit(30);

        if (data && data.length > 0) {
          const randomOptions: IdiomOption[] = [...data].sort(() => 0.5 - Math.random()).slice(0, 3).map(opt => ({
            id: opt.id,
            text: opt.text,
            emojis: opt.emojis
          }));
          setDbOptions(randomOptions);
        }
        setIsFetchingOptions(false);
      };
      
      fetchOptions();
    }
  }, [showEmojiPicker, isActivePlayer, dbOptions.length, isFetchingOptions]);

  if (!isHydrated || isJoining) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="glass-panel px-6 py-5">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-slate-600">Odaya baglaniliyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <ConfettiOverlay active={hasCorrectGuess} />

      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Room {storeRoomCode}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Durum: <strong>{status}</strong>
          </p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 font-mono text-xs uppercase tracking-wider text-slate-50">
          Round {currentRound}
        </span>
      </header>

      {status === "LOBBY" ? <LobbyScreen canStart={isHost} onStart={startGame} players={players} roomCode={roomCode} /> : null}

      {showEmojiPicker ? (
        <EmojiSelector
          onSelect={setSelectedOption}
          onSubmit={submitQuestion}
          options={dbOptions}
          selectedId={selectedOption?.id ?? null}
        />
      ) : null}

      {showGuessing ? (
        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <GuessCanvas emojis={emojis} roundEndsAt={roundEndsAt} />
            <ChatBox disabled={hasCorrectGuess} onSubmitGuess={submitGuess} />
          </div>
          <div className="space-y-4">
            <ScoreBoard players={players} />
            <WrongGuessesFeed items={wrongGuesses} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
