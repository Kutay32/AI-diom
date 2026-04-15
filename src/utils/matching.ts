import { distance } from "fastest-levenshtein";

const normalize = (value: string) => value.toLocaleLowerCase("tr-TR").replace(/[\s-]/g, "").trim();

export const isGuessCorrect = (guess: string, target: string): boolean => {
  const normalizedGuess = normalize(guess);
  const normalizedTarget = normalize(target);

  if (!normalizedGuess || !normalizedTarget) {
    return false;
  }

  const dist = distance(normalizedGuess, normalizedTarget);
  const maxLength = Math.max(normalizedGuess.length, normalizedTarget.length);
  const similarity = (maxLength - dist) / maxLength;

  return similarity >= 0.9;
};
