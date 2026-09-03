# 🎹 Just Play

A free, subscription-free piano learning web app. Breaks songs into sections, displays sheet music, plays reference audio, and remembers exactly where you left off — even after weeks away.

**Built for iPad** (landscape, sheet-music-holder position) but works on any browser.

---

## Songs Included

| Song | Difficulty | Sections |
|------|-----------|----------|
| 🎶 Ode to Joy — Beethoven | ⚫○○○ Beginner | 4 |
| 🌹 Für Elise — Beethoven | ⚫⚫○○ Easy | 4 |
| 🪜 Stairway to Heaven — Led Zeppelin | ⚫⚫○○ Easy | 5 |
| 👑 Bohemian Rhapsody — Queen (arr. Keveren) | ⚫⚫○○ Easy | 5 |
| 🌙 Clair de Lune — Debussy | ⚫⚫⚫○ Intermediate | 5 |

> **Note:** Bohemian Rhapsody, Clair de Lune, and Stairway to Heaven are simplified arrangements designed for beginners to learn the melody. They are not full transcriptions.

---

## Run Locally

To test and play songs on your computer without deploying:

```bash
node server.js
```

Then open your browser to **[http://localhost:3000](http://localhost:3000)**.

---

## Deploy on Your Linux Server

### Prerequisites
- Docker + Docker Compose installed on the server
- Files transferred to the server (see below)

### Step 1 — Copy files to your server

```bash
# From your Windows machine (adjust IP and path):
scp -r D:\development\just-play user@your-server-ip:/opt/just-play
```

Or use Git:
```bash
# On your server:
git clone <your-repo-url> /opt/just-play
```

### Step 2 — Build and start

```bash
cd /opt/just-play
docker compose up -d --build
```

The app will be available at `http://your-server-ip:3141`

### Step 3 — Bookmark on iPads

Open `http://your-server-ip:3141` in Safari on each iPad.

For a proper home screen icon:
1. Open the URL in Safari
2. Tap the Share button (box with arrow)
3. Tap **Add to Home Screen**
4. Name it "Just Play" → tap Add

It will behave like an app (full screen, no browser chrome).

---

## Updating the App

After making changes on your PC:

```bash
# Copy updated files to server
scp -r D:\development\just-play user@your-server-ip:/opt/just-play

# Rebuild and restart the container
ssh user@your-server-ip "cd /opt/just-play && docker compose up -d --build"
```

---

## Changing the Port

Edit `docker-compose.yml` and change `3141:80` to `<your-port>:80`:

```yaml
ports:
  - "8080:80"   # example: use port 8080
```

Then restart: `docker compose up -d --build`

---

## Adding More Songs

Create a new `<song-id>.json` file inside the `songs/` folder (and list it in `songs/index.json`). The app dynamically loads any JSON song in the `songs/` folder!

Each song JSON file structure:
```json
{
  "id": "song-id",
  "title": "Song Title",
  "composer": "Artist or Composer",
  "year": "Year",
  "difficulty": 1,
  "emoji": "🎹",
  "color": "#4f46e5",
  "description": "Short description of the song.",
  "generalTip": "Tip for the learner.",
  "sections": [
    {
      "id": "s1",
      "label": "Section 1 — Description",
      "bars": "1–4",
      "tips": [
        "Tip 1",
        "Tip 2",
        "Tip 3"
      ],
      "abc": "X:1\nT:Title\nM:4/4\nL:1/4\nQ:1/4=70\nK:C\n%%MIDI program 0\nC D E C |]"
    }
  ]
}
```

ABC notation resources:
- [abcjs editor](https://www.abcjs.net/abcjs-editor.html) — live preview as you type
- [ABC notation guide](https://abcnotation.com/wiki/abc:standard:v2.1)

---

## How Progress Works

Progress is saved in the browser's **LocalStorage** on each iPad separately. It persists indefinitely — even after months away, it opens on the last section you were practising.

No account, no server-side storage, no data leaves the device.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Hosting | nginx:alpine (Docker) |
| Sheet music | [abcjs](https://www.abcjs.net/) — open source |
| Audio | abcjs synth + [FluidR3_GM soundfont](https://github.com/gleitz/midi-js-soundfonts) |
| Progress | Browser LocalStorage |
| Frontend | Vanilla HTML/CSS/JS — no framework |

Audio requires internet access to load the piano soundfont on first play (cached afterwards).
