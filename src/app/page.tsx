"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROOM_CODE_LENGTH = 6;

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: ROOM_CODE_LENGTH }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedRoomCode = localStorage.getItem("emojideyim.roomCode");
    const storedPlayerId = localStorage.getItem("emojideyim.playerId");

    if (storedRoomCode && storedPlayerId) {
      router.replace(`/${storedRoomCode}`);
    }
  }, [router]);

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedRoomCode = roomCode.trim().toUpperCase();
    const normalizedUsername = username.trim();

    if (normalizedRoomCode.length !== ROOM_CODE_LENGTH || normalizedUsername.length < 2) {
      return;
    }

    localStorage.setItem("emojideyim.username", normalizedUsername);
    localStorage.setItem("emojideyim.roomCode", normalizedRoomCode);
    router.push(`/${normalizedRoomCode}`);
  };

  const handleCreateRoom = () => {
    const normalizedUsername = username.trim();
    if (normalizedUsername.length < 2) {
      alert("Lütfen önce bir kullanıcı adı giriniz (en az 2 karakter).");
      return;
    }

    const code = generateRoomCode();
    localStorage.setItem("emojideyim.username", normalizedUsername);
    localStorage.setItem("emojideyim.roomCode", code);
    router.push(`/${code}`);
  };

  return (
    <main className="grain-overlay mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
      <section className="glass-panel w-full overflow-hidden shadow-2xl shadow-teal-900/10 md:grid md:grid-cols-[1.2fr_1fr]">
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 p-8 text-slate-50 md:p-12">
          <p className="font-mono text-sm uppercase tracking-[0.35em] opacity-80">Realtime Party Game</p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">EMOJIDEYIM</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-teal-50/90 md:text-lg">
            Bir oyuncu deyimi emojilerle anlatır, herkes aynı anda tahmin eder. Host-authoritative akis sayesinde
            skor ve turlar senkron kalir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider text-teal-100">
            <span className="rounded-full border border-teal-100/40 px-3 py-1">Supabase Realtime</span>
            <span className="rounded-full border border-teal-100/40 px-3 py-1">Framer Motion</span>
            <span className="rounded-full border border-teal-100/40 px-3 py-1">Zustand FSM</span>
          </div>
        </div>
        <div className="bg-card p-8 md:p-10">
          <h2 className="font-mono text-sm uppercase tracking-[0.22em] text-slate-500">Odaya Katil</h2>
          <form className="mt-5 space-y-4" onSubmit={handleJoin}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="username">
                Kullanici adi
              </label>
              <Input
                id="username"
                maxLength={20}
                minLength={2}
                placeholder="Orn: kelimeavcisi"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="roomCode">
                Oda kodu
              </label>
              <Input
                id="roomCode"
                maxLength={ROOM_CODE_LENGTH}
                minLength={ROOM_CODE_LENGTH}
                placeholder="A7X9P2"
                required
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              />
            </div>
            <Button className="w-full" type="submit">
              Odaya gir
            </Button>
          </form>

          <div className="my-5 border-t border-slate-200" />

          <Button className="w-full" variant="secondary" type="button" onClick={handleCreateRoom}>
            Yeni oda olustur
          </Button>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Not: Ilk giren oyuncu host olur ve oyun dongusunu baslatir.
          </p>
        </div>
      </section>
    </main>
  );
}
