# 🐋 W.A.L.V.I.S.

**Walrus Autonomous Learning & Vibe Intelligence System**

An AI-powered bookmark manager that lives in Telegram and stores everything on [Walrus](https://docs.wal.app/) decentralized storage. Browse your collection via a web UI deployed to [Walrus Sites](https://docs.wal.app/walrus-sites/intro.html).

Built for the **OpenClaw x Sui Hackathon 2026** — Track 2: Local God Mode.

---

## Features

- **Save anything** — Send links, text, or images to Telegram and WALVIS analyzes, tags, and stores them
- **AI-powered tagging** — Uses any OpenAI-compatible LLM to generate summaries and tags
- **Decentralized storage** — Everything stored on Walrus (Sui's decentralized blob storage)
- **Smart search** — Full-text search across all your spaces and bookmarks
- **Web UI** — Browse your collection on Walrus Sites with wallet connect
- **OpenClaw skill** — Integrates natively with [OpenClaw](https://docs.openclaw.ai/) as an installable skill

## Quick Install

```bash
npx walvis
```

This runs an interactive setup that:
1. Asks for your LLM API key and endpoint (any OpenAI-compatible API)
2. Configures your Sui network and wallet
3. Creates your first bookmark space
4. Optionally restores from an existing Walrus blob
5. Installs the OpenClaw skill to `~/.openclaw/skills/walvis/`

**Requirements:** Node.js 18+, [OpenClaw](https://docs.openclaw.ai/) CLI

## Telegram Usage

After setup, start OpenClaw (`openclaw gateway start`) and connect your Telegram bot. Then:

| Command | Description |
|---|---|
| `@walvis https://...` | Save and analyze a link |
| `@walvis some text` | Save a text note |
| `@walvis -q blockchain` | Search bookmarks |
| `@walvis -s` | Sync all spaces to Walrus |
| `@walvis -ls` | List all spaces |
| `@walvis -new research` | Create a new space |
| `@walvis -use research` | Switch active space |
| `@walvis -tag ai` | Filter by tag |
| `@walvis -status` | Show wallet and sync status |
| `@walvis -balance` | Check SUI balance |
| `@walvis -web` | Get web UI link |

When you save a bookmark, WALVIS responds with:
```
🐋 Saved to bookmarks
📌 How Bitcoin Works
Explains the fundamentals of Bitcoin's blockchain, proof-of-work...
Tags: #bitcoin #blockchain #crypto #explainer
```

## Web UI

After syncing your space with `@walvis -s`, deploy the web UI to Walrus Sites:

```bash
# Build
npm run build:web

# Deploy to Walrus Sites (requires site-builder)
npx @mysten/walrus-site-builder publish web/dist
```

Then open `https://<site-id>.walrus.site/` and enter your manifest blob ID.

## Data Storage

All data lives locally at `~/.walvis/`:
```
~/.walvis/
├── manifest.json          # Config + space blob ID mapping
└── spaces/
    ├── abc123.json        # Your "bookmarks" space
    └── def456.json        # Your "research" space
```

When you run `@walvis -s`, each space is uploaded to Walrus and you get a blob ID. Share this ID to let others view your public bookmarks.

## Configuration

`~/.walvis/manifest.json` structure:
```json
{
  "agent": "walvis",
  "activeSpace": "space-id",
  "llmEndpoint": "https://api.openai.com/v1",
  "llmModel": "gpt-4o",
  "network": "testnet",
  "walrusPublisher": "https://publisher.walrus-testnet.walrus.space",
  "walrusAggregator": "https://aggregator.walrus-testnet.walrus.space",
  "spaces": {
    "space-id": { "blobId": "abc...", "syncedAt": "2026-03-03T..." }
  }
}
```

## Manual OpenClaw Skill Install

```bash
git clone https://github.com/yourusername/walvis ~/.openclaw/skills/walvis
```

Then add to `~/.openclaw/openclaw.json`:
```json
{
  "skills": {
    "entries": {
      "walvis": {
        "enabled": true,
        "env": { "WALVIS_LLM_API_KEY": "your-key" }
      }
    }
  }
}
```

## Architecture

```
Telegram → OpenClaw → WALVIS Skill (SKILL.md instructions)
                          ↓
                    analyze.ts (LLM)
                          ↓
               ~/.walvis/spaces/<id>.json
                          ↓
                  walrus-sync.ts (PUT)
                          ↓
              Walrus Testnet Blob Storage
                          ↑
              web/src/lib/walrus.ts (GET)
                          ↑
              Walrus Sites Web UI
```

## Sui Stack Integration

| Component | Usage |
|---|---|
| **Walrus** | Storing all bookmark spaces as JSON blobs |
| **Walrus Sites** | Hosting the web UI at `*.walrus.site` |
| **Sui Blockchain** | Wallet connection in web UI (dapp-kit) |

## Development

```bash
# Web UI dev server
npm run dev:web

# Build web UI
npm run build:web
```

## License

MIT
