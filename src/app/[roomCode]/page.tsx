import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { GameStatus } from "@/types/game";

import { GameClient } from "./GameClient";

type RoomPageProps = {
  params: Promise<{ roomCode: string }>;
};

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { roomCode } = await params;
  return {
    title: `Room ${roomCode.toUpperCase()} | EMOJIDEYIM`,
  };
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomCode } = await params;
  const normalizedRoomCode = roomCode.toUpperCase();

  if (!/^[A-Z0-9]{6}$/.test(normalizedRoomCode)) {
    notFound();
  }

  let initialStatus: GameStatus = "LOBBY";
  let currentRound = 0;

  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("rooms")
      .select("status,current_round")
      .eq("id", normalizedRoomCode)
      .maybeSingle();

    if (data?.status) {
      initialStatus = data.status as GameStatus;
    }

    if (typeof data?.current_round === "number") {
      currentRound = data.current_round;
    }
  }

  return <GameClient initialRound={currentRound} initialStatus={initialStatus} roomCode={normalizedRoomCode} />;
}
