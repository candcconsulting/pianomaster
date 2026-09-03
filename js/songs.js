'use strict';

// ──────────────────────────────────────────────────────────────────────────────
// JUST PLAY — Song Library
// Each song has sections for focused practice, and full-song ABC for Just Play mode.
// ──────────────────────────────────────────────────────────────────────────────

const SONGS = [

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  ODE TO JOY — Beethoven 1824                                    ║
  // ║  Perfect starting point. 5 notes, right hand only.             ║
  // ╚══════════════════════════════════════════════════════════════════╝
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    composer: 'Ludwig van Beethoven',
    year: '1824',
    difficulty: 1,
    emoji: '🎶',
    color: '#4f46e5',
    description: 'The perfect first song. Just 5 notes, instantly recognisable, endlessly satisfying to play.',
    generalTip: 'Right hand only. Keep your hand relaxed — like holding a small ball.',
    fullAbc: `X:1
T:Ode to Joy (Full Song)
C:Ludwig van Beethoven
M:4/4
L:1/4
Q:1/4=70
K:C
%%MIDI program 0
E E F G | G F E D | C C D E | E3/2 D/ D2 |
E E F G | G F E D | C C D E | D3/2 C/ C2 |
D D E C | D E/F/ E C | D E/F/ E D | C D G,2 |
E E F G | G F E D | C C D E | D3/2 C/ C2 |]`,
    sections: [
      {
        id: 's1',
        label: 'Phrase 1 — The Famous Tune',
        bars: '1–4',
        tips: [
          '🖐 Place finger 3 (middle finger) on E — the note just above Middle C',
          '🎵 Pattern: E E F G · G F E D — say the note names aloud as you play',
          '🐢 Start very slowly. Speed comes naturally once your fingers know the shape'
        ],
        abc: `X:1
T:Ode to Joy — Phrase 1
C:Beethoven
M:4/4
L:1/4
Q:1/4=70
K:C
%%MIDI program 0
E E F G | G F E D | C C D E | E3/2 D/ D2 |]`
      },
      {
        id: 's2',
        label: 'Phrase 2 — Same but Different',
        bars: '5–8',
        tips: [
          '👀 Identical start to Phrase 1 — your fingers already know this!',
          '✨ Only the last bar differs: ends on C instead of D',
          '🎵 This is "question and answer" — Phrase 1 asks, Phrase 2 answers'
        ],
        abc: `X:1
T:Ode to Joy — Phrase 2
C:Beethoven
M:4/4
L:1/4
Q:1/4=70
K:C
%%MIDI program 0
E E F G | G F E D | C C D E | D3/2 C/ C2 |]`
      },
      {
        id: 's3',
        label: 'Phrase 3 — The Middle Climb',
        bars: '9–12',
        tips: [
          '🪜 The melody climbs up: D → E → F — feel the energy build',
          '🎯 Finger 2 on D, finger 3 on E, finger 4 on F',
          '💡 E/F/ means play both notes in one beat — smooth and flowing'
        ],
        abc: `X:1
T:Ode to Joy — Phrase 3
C:Beethoven
M:4/4
L:1/4
Q:1/4=70
K:C
%%MIDI program 0
D D E C | D E/F/ E C | D E/F/ E D | C D G,2 |]`
      },
      {
        id: 's4',
        label: 'Phrase 4 — Grand Finale',
        bars: '13–16',
        tips: [
          '🎉 You know this already! It\'s Phrase 2 again to close the piece',
          '🏆 Play the whole song from start to finish — you\'ve got this!',
          '🎹 You just played Beethoven. That\'s genuinely brilliant.'
        ],
        abc: `X:1
T:Ode to Joy — Finale
C:Beethoven
M:4/4
L:1/4
Q:1/4=70
K:C
%%MIDI program 0
E E F G | G F E D | C C D E | D3/2 C/ C2 |]`
      }
    ]
  },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  FÜR ELISE — Beethoven 1810                                     ║
  // ║  The most recognisable piano motif in history.                 ║
  // ╚══════════════════════════════════════════════════════════════════╝
  {
    id: 'fur-elise',
    title: 'Für Elise',
    composer: 'Ludwig van Beethoven',
    year: '1810',
    difficulty: 2,
    emoji: '🎹',
    color: '#059669',
    description: 'The iconic E–D#–E–D#–E motif. Sounds sophisticated, surprisingly accessible to learn.',
    generalTip: 'The key is the semitone step between E and D#. Keep fingers 5 and 4 light and nimble.',
    fullAbc: `X:1
T:Für Elise (Full Theme)
C:Ludwig van Beethoven
M:3/8
L:1/16
Q:3/8=50
K:Am
%%MIDI program 0
e ^d e ^d e | B d c A2 | C E A B2 | E ^G B c2 |
e ^d e ^d e | B d c A2 | C E A B2 | E c B A2 |]`,
    sections: [
      {
        id: 's1',
        label: 'Motif — The Iconic Opening',
        bars: '1–2',
        tips: [
          '✨ E – D# – E – D# – E — the famous two-note alternation',
          '🖐 Finger 5 on High E, finger 4 on D# (the black key just below E)',
          '🕊️ Feather-light touch — like raindrops on a window pane'
        ],
        abc: `X:1
T:Für Elise — Motif
C:Beethoven
M:3/8
L:1/16
Q:3/8=50
K:Am
%%MIDI program 0
e ^d e ^d e | B d c A2 |]`
      },
      {
        id: 's2',
        label: 'Theme Part A — The Arpeggio Rise',
        bars: '3–5',
        tips: [
          '🪜 The left-to-right climb: C → E → A → B',
          '🎵 Finger 1 on C, finger 2 on E, finger 4 on A, finger 5 on B',
          '🧘 Let each note connect smoothly to the next (legato)'
        ],
        abc: `X:1
T:Für Elise — Arpeggio Rise
C:Beethoven
M:3/8
L:1/16
Q:3/8=50
K:Am
%%MIDI program 0
C E A B2 | E ^G B c2 |]`
      },
      {
        id: 's3',
        label: 'Theme Part B — Resolution',
        bars: '6–8',
        tips: [
          '🔁 The motif returns! E – D# – E – D# – E again',
          '🎯 Ends with the quiet descent: E → c → B → A',
          '🏠 A is the home note (A minor) — feel it come to rest'
        ],
        abc: `X:1
T:Für Elise — Resolution
C:Beethoven
M:3/8
L:1/16
Q:3/8=50
K:Am
%%MIDI program 0
e ^d e ^d e | B d c A2 | C E A B2 | E c B A2 |]`
      },
      {
        id: 's4',
        label: 'Full Main Theme',
        bars: '1–8',
        tips: [
          '🔗 Put all three parts together into one flowing phrase',
          '🎵 Keep the tempo steady — don\'t speed up on the motif',
          '⭐ You are playing the most famous piano piece in the world!'
        ],
        abc: `X:1
T:Für Elise — Main Theme
C:Beethoven
M:3/8
L:1/16
Q:3/8=50
K:Am
%%MIDI program 0
e ^d e ^d e | B d c A2 | C E A B2 | E ^G B c2 |
e ^d e ^d e | B d c A2 | C E A B2 | E c B A2 |]`
      }
    ]
  },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  BOHEMIAN RHAPSODY — Queen 1975                                 ║
  // ║  The iconic piano intro, phrase by phrase.                     ║
  // ╚══════════════════════════════════════════════════════════════════╝
  {
    id: 'bohemian-rhapsody',
    title: 'Bohemian Rhapsody',
    composer: 'Freddie Mercury / Queen',
    year: '1975',
    difficulty: 3,
    emoji: '👑',
    color: '#d97706',
    description: 'Freddie Mercury\'s legendary piano intro. Dramatic, emotional, unforgettable to play.',
    generalTip: 'In Bb major — watch for Bb (black key) and Eb (black key). Play with feeling and drama.',
    fullAbc: `X:1
T:Bohemian Rhapsody (Full Piano Intro)
C:Freddie Mercury / Queen
M:4/4
L:1/4
Q:1/4=70
K:Bb
%%MIDI program 0
F F F G | A B3 | F F E E | _D C2 z |
G G _A G | F E D B, | E2 D2 | B,4 |
B B _A G | F2 E2 | _D2 C2 | B,4 |
F F F F | E _D C B, | B,4 | B,4 |
c B A G | F E D B, | E2 D2 | B,4 |
F F E D | C B, z2 | B,4 | B,4 |]`,
    sections: [
      {
        id: 's1',
        label: '"Is this the real life?"',
        bars: '1–4',
        tips: [
          '👑 The opening statement — 3 steady Fs, then climb to G, A, Bb',
          '🖐 Finger 1 on F, finger 2 on G, finger 3 on A, finger 4 on Bb',
          '✨ Bar 4 descends through Eb and Db to C — dramatic and mournful'
        ],
        abc: `X:1
T:Bohemian Rhapsody — Real Life
C:Queen (simplified arrangement)
M:4/4
L:1/4
Q:1/4=70
K:Bb
%%MIDI program 0
F F F G | A B3 | F F E E | _D C2 z |]`
      },
      {
        id: 's2',
        label: '"Caught in a landslide"',
        bars: '5–8',
        tips: [
          '🌊 The music cascades downward like the lyrics describe',
          '🎹 _A means Ab — the black key between G and A. Play it with finger 4',
          '🎵 The phrase ends on Bb — the home note. Feel it resolve and settle'
        ],
        abc: `X:1
T:Bohemian Rhapsody — Caught in a landslide
C:Queen (simplified arrangement)
M:4/4
L:1/4
Q:1/4=70
K:Bb
%%MIDI program 0
G G _A G | F E D B, | E2 D2 | B,4 |]`
      },
      {
        id: 's3',
        label: '"Mama, just killed a man"',
        bars: '9–14',
        tips: [
          '💔 The emotional heart of the song — slower, more tender',
          '📉 A gradual descent: Bb Ab G F Eb D C Bb — each note heavy with feeling',
          '🎸 Freddie composed this at the piano — you\'re playing his original instrument!'
        ],
        abc: `X:1
T:Bohemian Rhapsody — Mama
C:Queen (simplified arrangement)
M:4/4
L:1/4
Q:1/4=66
K:Bb
%%MIDI program 0
B B _A G | F2 E2 | _D2 C2 | B,4 |
F F F F | E _D C B, | B,4 | B,4 |]`
      },
      {
        id: 's4',
        label: '"Nothing really matters"',
        bars: '15–20',
        tips: [
          '🕊️ The gentle, reflective outro — slower, more peaceful than anything before',
          '🎵 A soft descending line that resolves quietly — like letting go',
          '💡 Try playing this section softer (piano/pp) than the earlier sections'
        ],
        abc: `X:1
T:Bohemian Rhapsody — Nothing really matters
C:Queen (simplified arrangement)
M:4/4
L:1/4
Q:1/4=58
K:Bb
%%MIDI program 0
c B A G | F E D B, | E2 D2 | B,4 |
F F E D | C B, z2 | B,2 z2 | B,4 |]`
      },
      {
        id: 's5',
        label: 'Full Song Run-Through',
        bars: '1–20',
        tips: [
          '🎹 You know every section — now play them in order from start to finish!',
          '🎵 Don\'t stop if you make a mistake — keep going, just like a real performance',
          '👑 You\'re playing Bohemian Rhapsody. Freddie would be pleased.'
        ],
        abc: `X:1
T:Bohemian Rhapsody — Full Run
C:Queen (simplified arrangement)
M:4/4
L:1/4
Q:1/4=70
K:Bb
%%MIDI program 0
F F F G | A B3 | F F E E | _D C2 z |
G G _A G | F E D B, | E2 D2 | B,4 |
B B _A G | F2 E2 | _D2 C2 | B,4 |
F F F F | E _D C B, | B,4 | B,4 |
c B A G | F E D B, | E2 D2 | B,4 |
F F E D | C B, z2 | B,4 | B,4 |]`
      }
    ]
  },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  CLAIR DE LUNE — Claude Debussy 1905                           ║
  // ║  Simplified arrangement in C major. Right hand melody.         ║
  // ╚══════════════════════════════════════════════════════════════════╝
  {
    id: 'claire-de-lune',
    title: 'Clair de Lune',
    composer: 'Claude Debussy',
    year: '1905',
    difficulty: 3,
    emoji: '🌙',
    color: '#0891b2',
    description: 'A simplified arrangement of Debussy\'s moonlight masterpiece. Dreamy, impressionistic, beautiful.',
    generalTip: '⚠️ Simplified arrangement in C major. Original is in Db major with complex arpeggios. Right hand melody only.',
    fullAbc: `X:1
T:Clair de Lune (Full Melody)
C:Claude Debussy
M:3/4
L:1/4
Q:1/4=48
K:C
%%MIDI program 0
G2 E | G2 E | c2 A | c3 |
G2 E | G2 C | E3 | C3 |
F A c | d2 B | A F D | F3 |
E G B | c2 A | G E C | E3 |
C E G | c2 B | A c e | d3 |
B d f | e2 c | A F D | C3 |
G2 E | G2 E | F2 D | F3 |
E2 C | E2 C | D3 | C3 |
G2 E | F2 D | E2 C | C3 |
z G2 | z E2 | z C2 | C6 |]`,
    sections: [
      {
        id: 's1',
        label: 'Opening Theme — Moonrise',
        bars: '1–8',
        tips: [
          '🌙 Play gently and very slowly — "Clair de Lune" means moonlight',
          '🎵 Let each note breathe and linger — don\'t rush a single one',
          '👆 G(5) E(3) C(1) — the G-E-C shape outlines a C major chord'
        ],
        abc: `X:1
T:Clair de Lune — Opening Theme
C:Debussy (simplified arrangement)
M:3/4
L:1/4
Q:1/4=50
K:C
%%MIDI program 0
G2 E | G2 E | c2 A | c3 |
G2 E | G2 C | E3 | C3 |]`
      },
      {
        id: 's2',
        label: 'Second Theme — Flowing',
        bars: '9–16',
        tips: [
          '🌊 This theme flows downward, like moonlight reflected on water',
          '🎵 Connect the notes smoothly — no gaps between them (legato)',
          '💡 Imagine the sound gently rising and falling like a calm tide'
        ],
        abc: `X:1
T:Clair de Lune — Second Theme
C:Debussy (simplified arrangement)
M:3/4
L:1/4
Q:1/4=50
K:C
%%MIDI program 0
F A c | d2 B | A F D | F3 |
E G B | c2 A | G E C | E3 |]`
      },
      {
        id: 's3',
        label: 'Development — Building',
        bars: '17–24',
        tips: [
          '📈 This section builds intensity — let it grow slightly louder',
          '🎵 The melody climbs: C → E → G → c (rising an octave)',
          '⚡ Feel the energy gather — the emotional peak is near'
        ],
        abc: `X:1
T:Clair de Lune — Development
C:Debussy (simplified arrangement)
M:3/4
L:1/4
Q:1/4=52
K:C
%%MIDI program 0
C E G | c2 B | A c e | d3 |
B d f | e2 c | A F D | C3 |]`
      },
      {
        id: 's4',
        label: 'Return — Like a Memory',
        bars: '25–32',
        tips: [
          '🌙 The opening theme returns — more tender now, like a fading memory',
          '🎵 Back to very soft and gentle — even quieter than the opening',
          '💭 Debussy wanted this to feel like recalling a half-remembered dream'
        ],
        abc: `X:1
T:Clair de Lune — Return
C:Debussy (simplified arrangement)
M:3/4
L:1/4
Q:1/4=46
K:C
%%MIDI program 0
G2 E | G2 E | F2 D | F3 |
E2 C | E2 C | D3 | C3 |]`
      },
      {
        id: 's5',
        label: 'Closing — The Moon Sets',
        bars: '33–40',
        tips: [
          '🌅 The piece fades like moonlight at dawn — very slow, very quiet',
          '🎵 Let the final C ring completely and decay on its own — don\'t rush to lift your hand',
          '🎹 You\'ve played Clair de Lune. That is genuinely remarkable.'
        ],
        abc: `X:1
T:Clair de Lune — Closing
C:Debussy (simplified arrangement)
M:3/4
L:1/4
Q:1/4=42
K:C
%%MIDI program 0
G2 E | F2 D | E2 C | C3 |
z G2 | z E2 | z C2 | C6 |]`
      }
    ]
  }

];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const PROGRESS_KEY = 'just-play-progress-v1';

function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch { return {}; }
}

function saveProgress(songId, data) {
  const all = getProgress();
  all[songId] = { ...all[songId], ...data, lastPlayed: new Date().toISOString() };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

function getSongProgress(songId) {
  return getProgress()[songId] || { currentSection: 0, completedSections: [] };
}

function markSectionComplete(songId, sectionIndex) {
  const prog = getSongProgress(songId);
  if (!prog.completedSections.includes(sectionIndex)) {
    prog.completedSections.push(sectionIndex);
  }
  const song = getSongById(songId);
  prog.currentSection = Math.min(sectionIndex + 1, (song?.sections.length ?? 1) - 1);
  saveProgress(songId, prog);
  return prog;
}

function getSongById(id) {
  return SONGS.find(s => s.id === id) || null;
}

function getFullSongAbc(song) {
  if (!song) return '';
  if (song.fullAbc) return song.fullAbc;
  // Fallback to last section or combine
  const lastSec = song.sections[song.sections.length - 1];
  return lastSec ? lastSec.abc : '';
}

function timeAgo(isoString) {
  if (!isoString) return null;
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1)  return 'yesterday';
  if (days < 7)    return `${days} days ago`;
  if (days < 30)   return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)} months ago`;
}
