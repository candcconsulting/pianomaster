# 🎹 Just Play

A free, subscription-free piano learning web app. Breaks songs into sections, displays sheet music, plays reference audio, and remembers exactly where you left off — even after weeks away.

**Built for iPad** (landscape, sheet-music-holder position) but works on any browser.

---

## Songs Included

| Song | Difficulty | Sections |
|------|-----------|----------|
| 🎶 Ode to Joy — Beethoven | ⚫⚫○○ Beginner | 4 |
| 🌹 Für Elise — Beethoven | ⚫⚫⚫○ Easy | 4 |
| 👑 Bohemian Rhapsody — Queen | ⚫⚫⚫○ Intermediate | 5 |
| 🌙 Clair de Lune — Debussy | ⚫⚫⚫○ Intermediate | 5 |

> **Note:** Bohemian Rhapsody and Clair de Lune are simplified arrangements designed for beginners to learn the melody. They are not full transcriptions.

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

Edit `js/songs.js` and add a new object to the `SONGS` array following the existing pattern. Each section needs:
- `id` — unique string
- `label` — shown in the section nav bar  
- `tips` — array of 3 practice tips
- `abc` — the ABC notation string for that section

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
