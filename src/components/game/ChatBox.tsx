"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatBoxProps = {
  disabled?: boolean;
  onSubmitGuess: (guess: string) => Promise<void> | void;
};

export function ChatBox({ disabled, onSubmitGuess }: ChatBoxProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = value.trim();
    if (!normalized || disabled) {
      return;
    }

    await onSubmitGuess(normalized);
    setValue("");
  };

  return (
    <motion.form
      animate={{ x: 0 }}
      className="glass-panel mt-4 flex flex-col gap-3 p-4 md:flex-row"
      onSubmit={handleSubmit}
      transition={{ duration: 0.28 }}
    >
      <Input
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Tahminini yaz..."
        ref={inputRef}
        value={value}
      />
      <Button className="md:w-36" disabled={disabled || value.trim().length < 2} type="submit">
        Gonder
      </Button>
    </motion.form>
  );
}
