"use client";

import { AnimatePresence, motion } from "framer-motion";

type WrongGuessItem = {
  playerId: string;
  username: string;
  guess: string;
};

type WrongGuessesFeedProps = {
  items: WrongGuessItem[];
};

export function WrongGuessesFeed({ items }: WrongGuessesFeedProps) {
  return (
    <section className="glass-panel p-4">
      <h3 className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">Yanlis Tahminler</h3>
      <ul className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 12 }}
              key={`${item.playerId}-${item.guess}`}
              layout
            >
              <strong>{item.username}</strong>: {item.guess}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
