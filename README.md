# EMOJIDEYIM

Realtime multiplayer emoji idiom guessing game.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + lightweight Radix wrappers
- Zustand (client state)
- Framer Motion (interaction animation)
- Supabase (PostgreSQL + Auth + Realtime)
- fastest-levenshtein (guess matching)

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create environment file

```bash
cp .env.example .env.local
```

3. Fill .env.local

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run dev server

```bash
npm run dev
```

## Database Setup (Supabase SQL Editor)

Run migration files in order:

1. supabase/migrations/001_init_schema.sql
2. supabase/migrations/002_rpc_increment_score.sql
3. supabase/migrations/003_rls_policies.sql

## Current Implementation Scope

- Landing page with room join/create UX
- Room route with server bootstrap
- Client runtime skeleton for LOBBY, ROLE_ASSIGNMENT/EMOJI_PICKING and GUESSING
- Realtime broadcast handlers (STATE_SYNC, QUESTION_SELECTED, GUESS_ATTEMPT)
- RPC-based score increment call (increment_score)
- Wrong-guess anti-spam set and fuzzy matching

## Seed Idioms (0$ Rule-Based)

Install python deps:

```bash
pip install -r scripts/requirements.txt
```

Run seed script:

```bash
python scripts/seed_idioms.py --input ./idioms.jsonl --batch-size 50 --concurrency 10
```

Input format (JSONL):

```json
{"text": "etekleri tutusmak", "meaning": "ani panik yasamak"}
```

## Validation

```bash
npm run typecheck
npm run lint
```
