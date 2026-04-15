import type { IdiomOption } from "@/types/game";

import { Button } from "@/components/ui/button";

type EmojiSelectorProps = {
  options: IdiomOption[];
  selectedId: string | null;
  onSelect: (option: IdiomOption) => void;
  onSubmit: () => void;
};

export function EmojiSelector({ options, selectedId, onSelect, onSubmit }: EmojiSelectorProps) {
  return (
    <section className="glass-panel p-6 md:p-8">
      <h2 className="text-2xl font-bold text-slate-900">Deyimi sec ve emojileri gonder</h2>
      <p className="mt-2 text-sm text-slate-600">Host olarak yalnizca sen deyimi gorursun.</p>

      <ul className="mt-6 grid gap-3">
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          return (
            <li key={option.id}>
              <button
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isSelected ? "border-teal-700 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-400"
                }`}
                onClick={() => onSelect(option)}
                type="button"
              >
                <p className="text-lg font-semibold text-slate-900">{option.text}</p>
                <p className="mt-2 text-2xl">{option.emojis.join(" ")}</p>
              </button>
            </li>
          );
        })}
      </ul>

      <Button className="mt-6" disabled={!selectedId} onClick={onSubmit}>
        Diger oyunculara gonder
      </Button>
    </section>
  );
}
