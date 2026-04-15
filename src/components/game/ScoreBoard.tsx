import type { Player } from "@/types/game";

type ScoreBoardProps = {
  players: Player[];
};

export function ScoreBoard({ players }: ScoreBoardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <section className="glass-panel p-4">
      <h3 className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">Skor Tablosu</h3>
      <ul className="mt-3 space-y-2">
        {sorted.map((player) => (
          <li className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2" key={player.id}>
            <span className="text-sm font-semibold text-slate-800">
              {player.username} {player.isHost ? "(H)" : ""}
            </span>
            <span className="font-mono text-sm text-slate-900">{player.score}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
