# W.A.L.V.I.S.

**Walrus Autonomous Learning & Vibe Intelligence System**

An AI-powered knowledge manager that lives in Telegram and stores everything on [Walrus](https://docs.wal.app/) decentralized storage. Save anything — links, text, images — and browse your knowledge vault via a web UI deployed to [Walrus Sites](https://docs.wal.app/walrus-sites/intro.html).

Built for the **OpenClaw x Sui Hackathon 2026** — Track 2: Local God Mode.

---

## Features

- **Save anything** — Links, text, images — send it to Telegram and WALVIS analyzes, tags, and stores it
- **AI-powered analysis** — Auto-generates summaries, tags, and screenshots for every item
- **Decentralized storage** — Your knowledge lives on Walrus, censorship-resistant and always available
- **Smart organization** — Spaces, tags, full-text search, and AI-powered daily digests
- **Proactive reminders** — WALVIS scans your vault for deadlines and time-sensitive items, nudging you when it matters
- **Web UI** — Browse your vault on Walrus Sites with Sui wallet connect
- **Local preview** — Run the dashboard locally to preview and edit before syncing
- **OpenClaw skill** — Integrates natively with [OpenClaw](https://docs.openclaw.ai/) as an installable skill

## Quick Install

```bash
git clone https://github.com/yourusername/walvis ~/.openclaw/skills/walvis
cd ~/.openclaw/skills/walvis
npm install
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

**Requirements:** Node.js 18+, [OpenClaw](https://docs.openclaw.ai/) CLI

## Telegram Usage

After setup, start OpenClaw (`openclaw gateway start`) and connect your Telegram bot. Then:

| Command | Description |
|---|---|
| `/walvis` | List items or initialize |
| `/walvis https://...` | Save and analyze a link |
| `/walvis some text` | Save a text note |
| `/walvis [image]` | Save an image (uploaded to Walrus) |
| `/walvis list` | List items (with action buttons) |
| `/walvis search query` | Search your vault (paginated) |
| `/walvis sync` | Sync all spaces to Walrus |
| `/walvis spaces` | List all spaces |
| `/walvis new research` | Create a new space |
| `/walvis use research` | Switch active space |
| `/walvis status` | Show wallet and sync status |
| `/walvis balance` | Check SUI balance |
| `/walvis web` | Get web UI link |
| `/walvis reminders on/off` | Toggle smart reminders |

When you save an item, WALVIS responds with:
```
Saved to [Space Name]
Title: How Bitcoin Works
Explains the fundamentals of Bitcoin's blockchain, proof-of-work...
Tags: #bitcoin #blockchain #crypto #explainer
Screenshot captured
```

## Local Preview

Run the web UI locally to preview your data before syncing to Walrus:

```bash
cd web
npm run dev
```

Open `http://localhost:5173` and the app will automatically load your local `~/.walvis/` data. You can:
- Browse all items across spaces
- Search and filter by tags
- Edit tags and notes inline
- View local screenshots
- Test the UI before deploying to Walrus Sites

## Web UI

After syncing your space with `/walvis sync`, deploy the web UI to Walrus Sites:

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
├── cron-state.json        # Daily organizer & reminder state
├── media/                 # Local screenshots & images
│   ├── abc123.png
│   └── def456.jpg
└── spaces/
    ├── abc123.json        # "default" space
    └── def456.json        # "research" space
```

When you run `/walvis sync`, images are uploaded to Walrus first, then each space is uploaded and you get a blob ID. Share this ID to let others view your public vault.

## Configuration

`~/.walvis/manifest.json` structure:
```json
{
  "agent": "walvis",
  "activeSpace": "space-id",
  "network": "testnet",
  "walrusPublisher": "https://publisher.walrus-testnet.walrus.space",
  "walrusAggregator": "https://aggregator.walrus-testnet.walrus.space",
  "spaces": {
    "space-id": { "blobId": "abc...", "syncedAt": "2026-03-03T..." }
  }
}
```


## Architecture

```
Telegram → OpenClaw → WALVIS Skill (SKILL.md instructions)
                          ↓
                    AI Analysis (built-in)
                          ↓
               ~/.walvis/spaces/<id>.json
               ~/.walvis/media/<id>.png (local)
                          ↓
                  Walrus Sync (PUT blobs)
                          ↓
              Walrus Testnet Blob Storage
                          ↑
              web/src/lib/walrus.ts (GET)
                          ↑
              Walrus Sites Web UI
                          ↑
              Local Dev Server (npm run dev)
```

## Sui Stack Integration

| Component | Usage |
|---|---|
| **Walrus** | Storing all spaces as JSON blobs |
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
