# AGENTS.md - Paradiplomacia WhatsApp Bot

## Project Type
- **Node.js backend** with ES modules (`"type": "module"`)
- **Express** server + **Prisma** ORM (PostgreSQL)
- **Baileys** for WhatsApp bot integration
- Location: `backend/` folder

## Key Commands
```bash
cd backend
npm install
npm run dev          # Start dev server (watch mode)
npm run prisma:push # Push schema to DB
npm run prisma:generate
npm run db:seed    # Seed initial data
```

## Database
- Uses Prisma with PostgreSQL
- Schema: `backend/prisma/schema.prisma`
- Run migrations after schema changes: `npm run prisma:generate && npm run prisma:push`

## WhatsApp Bot
- Baileys v6 for WhatsApp connection
- Auth via QR code (first time), then session persisted
- Operates in group chat mode with commands

## Bot Commands (to implement)
| Command | Description |
|---------|------------|
| `!economista` | Respond as Economista |
| `!politologo` | Respond as Politólogo |
| `!jurista` | Respond as Jurista |
| `!compare` | Compare 3 perspectives |
| `!ayuda` | Show help |

## Personalities
- **Economista**: Focus on economics, investment, trade, impact
- **Politólogo**: Focus on governance, power, strategy, actors
- **Jurista**: Focus on law, competencies, regulations

## LLM Integration
- Uses Groq API with `llama-3.3-70b-versatile`
- Service: `backend/src/services/llm.service.js`
- Prompts built per personality in `backend/src/services/personalities.service.js`

## Current Status
- Backend API exists, WhatsApp bot module not yet implemented
- Docs updated in `docs/` reflecting WhatsApp bot architecture