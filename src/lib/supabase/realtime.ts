import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BroadcastEvent } from "@/types/game";

const ROOM_CHANNEL_PREFIX = "room:";

export function createRoomChannel(roomCode: string, presenceKey: string): RealtimeChannel {
  const supabase = getSupabaseBrowserClient();
  return supabase.channel(`${ROOM_CHANNEL_PREFIX}${roomCode}`, {
    config: {
      broadcast: { self: true },
      presence: { key: presenceKey },
    },
  });
}

export async function broadcastRoomEvent(channel: RealtimeChannel, event: BroadcastEvent): Promise<void> {
  await channel.send({
    type: "broadcast",
    event: event.type,
    payload: event.payload,
  });
}

export function onRoomBroadcast(channel: RealtimeChannel, onEvent: (event: BroadcastEvent) => void): RealtimeChannel {
  return channel.on("broadcast", { event: "*" }, ({ event, payload }) => {
    if (event === "STATE_SYNC") {
      onEvent({ type: "STATE_SYNC", payload });
    }
    if (event === "QUESTION_SELECTED") {
      onEvent({ type: "QUESTION_SELECTED", payload });
    }
    if (event === "GUESS_ATTEMPT") {
      onEvent({ type: "GUESS_ATTEMPT", payload });
    }
  });
}

export async function subscribeRoomChannel(channel: RealtimeChannel, trackPayload: Record<string, string>) {
  await channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track(trackPayload);
    }
  });
}

export function onPlayersChange(
  channel: RealtimeChannel,
  roomCode: string,
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
) {
  return channel.on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomCode}` }, onChange);
}
