"use client";

import { motion } from "framer-motion";

type GuessCanvasProps = {
  emojis: string[];
  roundEndsAt?: string;
};

export function GuessCanvas({ emojis, roundEndsAt }: GuessCanvasProps) {
  const timerLabel = roundEndsAt
    ? new Date(roundEndsAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--";

  return (
    <section className="glass-panel p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Tahmin zamani</h2>
        <span className="rounded-full bg-slate-900 px-3 py-1 font-mono text-sm text-white">Biter: {timerLabel}</span>
      </div>

      <div className="mt-8 grid min-h-36 grid-cols-2 gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-5 md:grid-cols-4">
        {emojis.map((emoji, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex h-16 items-center justify-center rounded-xl bg-slate-100 text-4xl"
            initial={{ opacity: 0, y: -24, scale: 0.8 }}
            key={`${emoji}-${index}`}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 220, damping: 18 }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
