/**
 * keyboard.js — Casiotone CT-400 Interactive Visual Piano Keyboard
 * Provides:
 * 1. 49-Key Keyboard layout (C2 to C6) matching the Casiotone CT-400.
 * 2. Active Section Notes Highlighting (blue keys + finger number badges).
 * 3. Dynamic Orange Play-Along Tracker Dot that rests on the first note to play
 *    and moves note-by-note in real-time as the tune advances.
 * 4. Web Audio API synthesizer for instant key playback on touch/click.
 */

class CasiotoneKeyboard {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.audioCtx = null;
    this.keyElements = new Map(); // noteName -> { el, badge, label, dot }
    this.currentTrackerNote = null;
    this.init();
  }

  static noteToFreq(noteName) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const match = noteName.match(/^([A-G][#b]?)([0-9])$/);
    if (!match) return 440;
    
    let note = match[1];
    const octave = parseInt(match[2], 10);
    const flatMap = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    if (flatMap[note]) note = flatMap[note];
    
    const semitone = notes.indexOf(note);
    if (semitone === -1) return 440;
    
    const midiNumber = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midiNumber - 69) / 12);
  }

  static midiToNoteName(midiNumber) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNumber / 12) - 1;
    const semitone = midiNumber % 12;
    return `${notes[semitone]}${octave}`;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playNoteSound(noteName, duration = 0.9) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const freq = CasiotoneKeyboard.noteToFreq(noteName);
      const now = this.audioCtx.currentTime;

      const noteGain = this.audioCtx.createGain();
      noteGain.connect(this.audioCtx.destination);
      noteGain.gain.setValueAtTime(0.32, now);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      const harmonics = [
        { mult: 1, gain: 0.65, type: 'triangle' },
        { mult: 2, gain: 0.25, type: 'sine' },
        { mult: 3, gain: 0.12, type: 'sine' },
        { mult: 4, gain: 0.05, type: 'triangle' }
      ];

      harmonics.forEach(h => {
        const osc = this.audioCtx.createOscillator();
        const hGain = this.audioCtx.createGain();
        osc.type = h.type;
        osc.frequency.setValueAtTime(freq * h.mult, now);
        hGain.gain.setValueAtTime(h.gain, now);
        osc.connect(hGain);
        hGain.connect(noteGain);
        osc.start(now);
        osc.stop(now + duration);
      });
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  init() {
    if (!this.container) return;
    this.renderChassis();
  }

  renderChassis() {
    this.container.innerHTML = `
      <div class="casiotone-chassis">
        <!-- Casiotone Vintage Panel -->
        <div class="casiotone-panel">
          <div class="casiotone-branding">
            <span class="casio-logo">CASIO</span>
            <span class="casiotone-text">Casiotone <span class="ct400-badge">CT-400</span></span>
          </div>
          <div class="casiotone-legend">
            <span class="legend-item"><span class="legend-dot tracker-legend-dot"></span> <strong>Play Note (Target)</strong></span>
            <span class="legend-item"><span class="legend-dot key-dot"></span> In Phrase / Finger (1–5)</span>
          </div>
        </div>

        <!-- Red Felt Strip -->
        <div class="casiotone-felt"></div>

        <!-- Keyboard Viewport -->
        <div class="casiotone-keys-viewport" id="keys-viewport">
          <div class="casiotone-keys-bed" id="keys-bed"></div>
        </div>
      </div>
    `;

    const keysBed = this.container.querySelector('#keys-bed');
    this.buildKeyboardBed(keysBed);
  }

  buildKeyboardBed(keysBed) {
    this.keyElements.clear();
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackMap = {
      'C': 'C#',
      'D': 'D#',
      'F': 'F#',
      'G': 'G#',
      'A': 'A#'
    };

    const startOctave = 2;
    const endOctave = 6;

    for (let oct = startOctave; oct <= endOctave; oct++) {
      for (let i = 0; i < whiteNotes.length; i++) {
        const wNote = whiteNotes[i];
        if (oct === endOctave && wNote !== 'C') break; // ends on C6

        const fullWhiteName = `${wNote}${oct}`;

        const keyGroup = document.createElement('div');
        keyGroup.className = 'key-group';

        const whiteKey = document.createElement('div');
        whiteKey.className = 'piano-key white-key';
        whiteKey.dataset.note = fullWhiteName;

        // Orange tracker dot
        const wDot = document.createElement('span');
        wDot.className = 'play-tracker-dot';
        whiteKey.appendChild(wDot);

        // Finger badge
        const wBadge = document.createElement('span');
        wBadge.className = 'finger-badge';
        whiteKey.appendChild(wBadge);

        // Key label
        const wLabel = document.createElement('span');
        wLabel.className = 'key-name';
        wLabel.textContent = (wNote === 'C') ? `C${oct}` : wNote;
        whiteKey.appendChild(wLabel);

        // Click / Touch
        const playWhite = (e) => {
          e.preventDefault();
          this.triggerKeyPress(fullWhiteName, whiteKey);
        };
        whiteKey.addEventListener('mousedown', playWhite);
        whiteKey.addEventListener('touchstart', playWhite, { passive: false });

        keyGroup.appendChild(whiteKey);
        this.keyElements.set(fullWhiteName, { el: whiteKey, badge: wBadge, label: wLabel, dot: wDot });

        // Overlapping black key if present
        if (blackMap[wNote] && !(oct === endOctave && wNote === 'C')) {
          const bNote = blackMap[wNote];
          const fullBlackName = `${bNote}${oct}`;

          const blackKey = document.createElement('div');
          blackKey.className = 'piano-key black-key';
          blackKey.dataset.note = fullBlackName;

          // Orange tracker dot
          const bDot = document.createElement('span');
          bDot.className = 'play-tracker-dot';
          blackKey.appendChild(bDot);

          const bBadge = document.createElement('span');
          bBadge.className = 'finger-badge';
          blackKey.appendChild(bBadge);

          const bLabel = document.createElement('span');
          bLabel.className = 'key-name';
          bLabel.textContent = bNote;
          blackKey.appendChild(bLabel);

          const playBlack = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.triggerKeyPress(fullBlackName, blackKey);
          };
          blackKey.addEventListener('mousedown', playBlack);
          blackKey.addEventListener('touchstart', playBlack, { passive: false });

          keyGroup.appendChild(blackKey);
          this.keyElements.set(fullBlackName, { el: blackKey, badge: bBadge, label: bLabel, dot: bDot });
        }

        keysBed.appendChild(keyGroup);
      }
    }
  }

  triggerKeyPress(noteName, keyEl) {
    keyEl.classList.add('pressed');
    this.playNoteSound(noteName);
    setTimeout(() => keyEl.classList.remove('pressed'), 250);
  }

  clearHighlights() {
    this.keyElements.forEach(({ el, badge, dot }) => {
      el.classList.remove('active-key', 'is-current-target', 'finger-1', 'finger-2', 'finger-3', 'finger-4', 'finger-5');
      if (badge) {
        badge.textContent = '';
        badge.style.display = 'none';
      }
      if (dot) {
        dot.classList.remove('active-tracker');
      }
    });
  }

  /**
   * Set highlights for all notes in the phrase
   */
  setHighlights(noteHighlights = []) {
    this.clearHighlights();
    if (!Array.isArray(noteHighlights) || noteHighlights.length === 0) return;

    let centerKeyEl = null;

    noteHighlights.forEach((nh) => {
      const normalized = this.normalizeNote(nh.note);
      const entry = this.keyElements.get(normalized);
      if (entry) {
        if (!centerKeyEl) centerKeyEl = entry.el;
        entry.el.classList.add('active-key');

        if (nh.finger && entry.badge) {
          entry.badge.textContent = `${nh.finger}`;
          entry.badge.style.display = 'flex';
          entry.el.classList.add(`finger-${nh.finger}`);
        } else if (nh.label && entry.badge) {
          entry.badge.textContent = nh.label;
          entry.badge.style.display = 'flex';
        }
      }
    });

    // Automatically place the orange tracker dot on the first note of the section!
    if (noteHighlights.length > 0) {
      this.setCurrentNote(noteHighlights[0].note);
    }

    const target = centerKeyEl || (this.keyElements.get('C4') ? this.keyElements.get('C4').el : null);
    if (target) {
      setTimeout(() => this.scrollToKey(target), 80);
    }
  }

  /**
   * Move the active glowing orange tracker dot to the current note being played
   */
  setCurrentNote(rawNote) {
    if (!rawNote) return;
    const normalized = this.normalizeNote(rawNote);

    // Remove previous tracker dot
    if (this.currentTrackerNote && this.keyElements.has(this.currentTrackerNote)) {
      const prevEntry = this.keyElements.get(this.currentTrackerNote);
      prevEntry.el.classList.remove('is-current-target');
      if (prevEntry.dot) prevEntry.dot.classList.remove('active-tracker');
    }

    // Set new tracker dot
    const entry = this.keyElements.get(normalized);
    if (entry) {
      this.currentTrackerNote = normalized;
      entry.el.classList.add('is-current-target');
      if (entry.dot) {
        entry.dot.classList.add('active-tracker');
      }
    }
  }

  scrollToKey(targetEl) {
    const viewport = this.container.querySelector('#keys-viewport');
    if (!viewport || !targetEl) return;
    const targetOffset = targetEl.parentElement.offsetLeft;
    const vpWidth = viewport.clientWidth;
    const scrollPos = Math.max(0, targetOffset - (vpWidth / 2) + 30);
    viewport.scrollTo({ left: scrollPos, behavior: 'smooth' });
  }

  normalizeNote(raw) {
    if (!raw) return '';
    let n = raw.trim();
    if (!/[0-9]$/.test(n)) n = `${n}4`;
    const flatMap = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    return n.replace(/^([A-G]b)/, (m) => flatMap[m] || m);
  }

  /**
   * Parse notes from ABC in chronological order
   */
  static extractNotesFromSection(section) {
    if (!section || !section.abc) return [];
    const notes = [];
    const abc = section.abc;

    const keyMatch = abc.match(/K:\s*([A-Ga-g][#b]?m?)/);
    const key = keyMatch ? keyMatch[1].trim() : 'C';

    const keySharps = {
      'G': ['F'], 'D': ['F', 'C'], 'A': ['F', 'C', 'G'], 'E': ['F', 'C', 'G', 'D'], 'B': ['F', 'C', 'G', 'D', 'A']
    };
    const keyFlats = {
      'F': ['B'], 'Bb': ['B', 'E'], 'Eb': ['B', 'E', 'A'], 'Ab': ['B', 'E', 'A', 'D'], 'Db': ['B', 'E', 'A', 'D', 'G']
    };

    const scoreLines = abc.split('\n').filter(line => !line.match(/^[A-Z]:/) && !line.startsWith('%%'));
    const scoreText = scoreLines.join(' ');

    const noteRegex = /([_=\^]?)([A-Ga-g])([,']*)/g;
    let match;

    while ((match = noteRegex.exec(scoreText)) !== null) {
      const accidental = match[1];
      const letter = match[2];
      const octaveShift = match[3];

      let baseLetter = letter.toUpperCase();
      let octave = (letter === letter.toLowerCase()) ? 5 : 4;

      if (octaveShift) {
        if (octaveShift.includes("'")) octave += octaveShift.split("'").length - 1;
        if (octaveShift.includes(",")) octave -= octaveShift.split(",").length - 1;
      }

      let noteName = baseLetter;
      if (accidental === '^') noteName += '#';
      else if (accidental === '_') {
        const flatMap = { 'D': 'C#', 'E': 'D#', 'G': 'F#', 'A': 'G#', 'B': 'A#' };
        noteName = flatMap[baseLetter] || baseLetter;
      } else if (accidental === '=') {
        noteName = baseLetter;
      } else {
        if (keySharps[key] && keySharps[key].includes(baseLetter)) noteName += '#';
        if (keyFlats[key] && keyFlats[key].includes(baseLetter)) {
          const flatMap = { 'B': 'A#', 'E': 'D#', 'A': 'G#', 'D': 'C#', 'G': 'F#' };
          noteName = flatMap[baseLetter] || baseLetter;
        }
      }

      const fullPitch = `${noteName}${octave}`;
      notes.push({ note: fullPitch });
    }

    // Extract finger numbers from tips
    const tipText = (section.tips || []).join(' ');
    const fingerMap = new Map();

    const patterns = [
      /finger\s+([1-5])\s+on\s+([A-G][#b]?)/gi,
      /([A-G][#b]?)\s*\(([1-5])\)/g,
      /([1-5])\s*=\s*([A-G][#b]?)/g
    ];

    patterns.forEach(p => {
      let m;
      while ((m = p.exec(tipText)) !== null) {
        if (p === patterns[0]) fingerMap.set(m[2].toUpperCase(), parseInt(m[1], 10));
        else if (p === patterns[1]) fingerMap.set(m[1].toUpperCase(), parseInt(m[2], 10));
        else if (p === patterns[2]) fingerMap.set(m[2].toUpperCase(), parseInt(m[1], 10));
      }
    });

    const uniqueBases = [...new Set(notes.map(n => n.note.replace(/[0-9]/, '')))];
    if (uniqueBases.length <= 5 && ['C', 'D', 'E', 'F', 'G'].every(p => uniqueBases.includes(p))) {
      fingerMap.set('C', 1);
      fingerMap.set('D', 2);
      fingerMap.set('E', 3);
      fingerMap.set('F', 4);
      fingerMap.set('G', 5);
    }

    // Filter unique notes for highlights while preserving the sequence for first-note detection
    const seen = new Set();
    const uniqueNoteHighlights = [];

    notes.forEach(n => {
      if (!seen.has(n.note)) {
        seen.add(n.note);
        const base = n.note.replace(/[0-9]/, '');
        if (fingerMap.has(base)) {
          n.finger = fingerMap.get(base);
        }
        uniqueNoteHighlights.push(n);
      }
    });

    return uniqueNoteHighlights;
  }
}

window.CasiotoneKeyboard = CasiotoneKeyboard;
