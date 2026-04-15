import type { Player } from "@/types/game";

import { Button } from "@/components/ui/button";

type LobbyScreenProps = {
  roomCode: string;
  players: Player[];
  canStart: boolean;
  onStart: () => void;
};

export function LobbyScreen({ roomCode, players, canStart, onStart }: LobbyScreenProps) {
  return (
    <section className="glass-panel p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">Room Code</p>
          <h2 className="mt-1 text-3xl font-black text-slate-900">{roomCode}</h2>
        </div>
        <Button disabled={!canStart || players.length < 2} onClick={onStart}>
          Oyunu baslat
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4">
        <p className="text-sm font-semibold text-slate-600">Oyuncular ({players.length}/8)</p>
        <ul className="mt-3 space-y-2">
          {players.map((player) => (
            <li className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2" key={player.id}>
              <span className="font-medium text-slate-800">
                {player.username} {player.isHost ? "(Host)" : ""}
              </span>
              <span className="font-mono text-sm text-slate-500">{player.score}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
