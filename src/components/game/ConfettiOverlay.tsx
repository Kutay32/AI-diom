"use client";

import { AnimatePresence, motion } from "framer-motion";

type ConfettiOverlayProps = {
  active: boolean;
};

const shards = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  left: `${(index * 11) % 100}%`,
  delay: (index % 7) * 0.05,
  rotate: index % 2 === 0 ? 35 : -35,
}));

export function ConfettiOverlay({ active }: ConfettiOverlayProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          animate={{ opacity: 1 }}
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          {shards.map((shard) => (
            <motion.div
              animate={{ y: [0, 560], rotate: [0, shard.rotate], opacity: [1, 0.15] }}
              className="absolute top-0 h-4 w-2 rounded-full bg-emerald-500"
              initial={{ y: -20, x: shard.left, opacity: 1 }}
              key={shard.id}
              style={{ left: shard.left }}
              transition={{ duration: 1.2, delay: shard.delay, ease: "easeIn" }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
