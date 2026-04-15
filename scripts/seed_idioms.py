"""Seed idioms table with a zero-cost rule-based emoji generator.

Input format (JSONL):
{"text": "etekleri tutusmak", "meaning": "ani panik yasamak"}
"""

from __future__ import annotations

import argparse
import asyncio
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from dotenv import load_dotenv
from supabase import Client, create_client


DEFAULT_FALLBACK = ["🤔", "💬"]

KEYWORD_EMOJI_MAP = {
    "ates": "🔥",
    "yan": "🔥",
    "kos": "🏃",
    "hiz": "💨",
    "goz": "👀",
    "bekle": "⏳",
    "kalp": "❤️",
    "sevin": "😄",
    "uzul": "😢",
    "kork": "😱",
    "para": "💸",
    "yol": "🛣️",
    "agiz": "👄",
    "el": "✋",
    "bas": "🧠",
    "yuk": "📦",
    "dus": "⬇️",
    "cik": "⬆️",
    "su": "💧",
    "dag": "⛰️",
    "deniz": "🌊",
}


@dataclass
class IdiomRecord:
    text: str
    meaning: str


def normalize(value: str) -> str:
    return value.lower().replace("ı", "i").replace("ğ", "g").replace("ş", "s").replace("ç", "c").replace("ö", "o").replace("ü", "u")


def generate_emojis(text: str, meaning: str, limit: int = 4) -> list[str]:
    haystack = normalize(f"{text} {meaning}")
    chosen: list[str] = []

    for key, emoji in KEYWORD_EMOJI_MAP.items():
        if key in haystack and emoji not in chosen:
            chosen.append(emoji)
        if len(chosen) >= limit:
            break

    if not chosen:
        chosen = DEFAULT_FALLBACK.copy()

    return chosen[:limit]


def read_jsonl(path: Path) -> Iterable[IdiomRecord]:
    with path.open("r", encoding="utf-8") as file:
        for line_no, line in enumerate(file, start=1):
            line = line.strip()
            if not line:
                continue

            try:
                payload = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid JSONL at line {line_no}: {exc}") from exc

            text = str(payload.get("text", "")).strip()
            meaning = str(payload.get("meaning", "")).strip()
            if not text:
                continue

            yield IdiomRecord(text=text, meaning=meaning)


async def upsert_batch(client: Client, batch: list[dict]) -> None:
    await asyncio.to_thread(
        lambda: client.table("idioms")
        .upsert(batch, on_conflict="text", ignore_duplicates=False)
        .execute()
    )


async def seed(client: Client, rows: list[IdiomRecord], batch_size: int, concurrency: int) -> None:
    semaphore = asyncio.Semaphore(concurrency)
    chunks = [rows[i : i + batch_size] for i in range(0, len(rows), batch_size)]

    async def worker(chunk: list[IdiomRecord], index: int) -> None:
        async with semaphore:
            payload = [
                {
                    "text": record.text,
                    "emojis": generate_emojis(record.text, record.meaning),
                    "base_weight": 100,
                }
                for record in chunk
            ]
            await upsert_batch(client, payload)
            print(f"batch {index + 1}/{len(chunks)} seeded ({len(chunk)} rows)")

    await asyncio.gather(*(worker(chunk, index) for index, chunk in enumerate(chunks)))


def create_supabase_client() -> Client:
    load_dotenv()
    url = __import__("os").environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = __import__("os").environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise EnvironmentError("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")

    return create_client(url, key)


async def main() -> None:
    parser = argparse.ArgumentParser(description="Seed idioms with emoji sets.")
    parser.add_argument("--input", required=True, help="Path to JSONL idiom file")
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--concurrency", type=int, default=10)
    args = parser.parse_args()

    records = list(read_jsonl(Path(args.input)))
    if not records:
        print("No idioms to seed.")
        return

    client = create_supabase_client()
    await seed(client, records, batch_size=args.batch_size, concurrency=args.concurrency)
    print(f"Seeding done: {len(records)} idioms")


if __name__ == "__main__":
    asyncio.run(main())
