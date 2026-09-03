'use strict';

// ──────────────────────────────────────────────────────────────────────────────
// player.js — Piano practice player with Count-In, Section Practice & Just Play
// ──────────────────────────────────────────────────────────────────────────────

let song            = null;         // current song object
let currentSection  = 0;            // current section index
let synthController = null;         // abcjs SynthController instance
let pianoKeyboard   = null;         // CasiotoneKeyboard instance
let playerMode      = 'practice';   // 'practice' | 'justplay'
let isCountingIn    = false;        // true while 2-second lead-in is ticking
let isPlaying       = false;        // true while audio is actively playing
let metronomeCtx    = null;         // Web Audio Context for metronome clicks

// ── URL helpers ───────────────────────────────────────────────────────────────

function param(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function setUrlSection(index) {
  const url = new URL(window.location.href);
  url.searchParams.set('section', index);
  url.searchParams.set('mode', playerMode);
  window.history.replaceState({}, '', url);
}

// ── Metronome Count-In Sound (Web Audio) ───────────────────────────────────────

function initMetronomeAudio() {
  if (!metronomeCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) metronomeCtx = new AudioCtx();
  }
  if (metronomeCtx && metronomeCtx.state === 'suspended') {
    metronomeCtx.resume();
  }
}

function playMetronomeClick(freq = 1100, isAccent = false) {
  try {
    initMetronomeAudio();
    if (!metronomeCtx) return;

    const osc = metronomeCtx.createOscillator();
    const gain = metronomeCtx.createGain();
    const now = metronomeCtx.currentTime;

    osc.type = isAccent ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(isAccent ? 0.6 : 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(metronomeCtx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    console.warn('Metronome click audio warning:', e);
  }
}

/**
 * 2-second count-in lead-in with audio ticks and visual countdown
 */
function runCountIn(callback) {
  if (isCountingIn) return;
  isCountingIn = true;

  const overlay = document.getElementById('count-in-overlay');
  const numEl   = document.getElementById('count-in-number');
  const subEl   = document.getElementById('count-in-sub');

  if (overlay) overlay.classList.add('show');

  // Beat 1 (2 seconds remaining)
  if (numEl) numEl.textContent = '2';
  if (subEl) subEl.textContent = 'Get ready on note 1…';
  playMetronomeClick(1000, false);

  setTimeout(() => {
    // Beat 2 (1 second remaining)
    if (numEl) numEl.textContent = '1';
    if (subEl) subEl.textContent = 'Hands in position…';
    playMetronomeClick(1250, true);

    setTimeout(() => {
      // GO / Note 1 starts
      if (numEl) numEl.textContent = '▶';
      if (subEl) subEl.textContent = 'Play!';
      playMetronomeClick(1600, true);

      setTimeout(() => {
        if (overlay) overlay.classList.remove('show');
        isCountingIn = false;
        if (typeof callback === 'function') {
          callback();
        }
      }, 350);

    }, 1000);

  }, 1000);
}

// ── Initialise ────────────────────────────────────────────────────────────────

async function init() {
  // Ensure dynamic song loader runs if present, otherwise rely on inline SONGS
  try {
    if (typeof loadSongs === 'function') await loadSongs();
  } catch (err) {
    console.error('Error loading songs in player:', err);
  }

  const songId = param('song') || 'ode-to-joy';
  song = (typeof getSongById === 'function') ? getSongById(songId) : null;

  if (!song && typeof SONGS !== 'undefined' && SONGS.length > 0) {
    song = SONGS[0];
  }

  if (!song) {
    document.body.innerHTML = `
      <div class="loading-box" style="height:100vh">
        <p style="color:var(--text3)">Song not found.</p>
        <a href="index.html" style="color:var(--accent);margin-top:10px">← Back to songs</a>
      </div>`;
    return;
  }

  const modeParam = param('mode');
  if (modeParam === 'justplay' || modeParam === 'practice') {
    playerMode = modeParam;
  }

  const keyboardContainer = document.getElementById('piano-keyboard-container');
  if (keyboardContainer && typeof CasiotoneKeyboard !== 'undefined') {
    try {
      pianoKeyboard = new CasiotoneKeyboard('piano-keyboard-container');
    } catch (e) {
      console.warn('Keyboard init error:', e);
    }
  }

  const sectionParam = parseInt(param('section') ?? '', 10);
  const savedProg    = (typeof getSongProgress === 'function') ? getSongProgress(song.id) : { currentSection: 0, completedSections: [] };
  currentSection     = isNaN(sectionParam)
    ? (savedProg.currentSection || 0)
    : Math.max(0, Math.min(sectionParam, song.sections.length - 1));

  const titleEl = document.getElementById('song-title');
  const subEl   = document.getElementById('song-sub');
  if (titleEl) titleEl.textContent = song.title;
  if (subEl)   subEl.textContent   = `${song.composer} · ${song.year}`;
  document.title = `🎹 ${song.title} — Just Play`;

  updateModeUI();

  if (playerMode === 'justplay') {
    loadJustPlayMode();
  } else {
    renderDots();
    loadSection(currentSection);
  }
}

// ── Mode Switching ────────────────────────────────────────────────────────────

function switchMode(mode) {
  if (mode === playerMode) return;
  playerMode = mode;
  updateModeUI();

  if (playerMode === 'justplay') {
    loadJustPlayMode();
  } else {
    renderDots();
    loadSection(currentSection);
  }
  setUrlSection(currentSection);
}

function updateModeUI() {
  const btnPractice = document.getElementById('btn-mode-practice');
  const btnJustPlay = document.getElementById('btn-mode-justplay');
  const dotsBar     = document.getElementById('dots-bar');
  const practiceCtrls = document.getElementById('footer-practice-controls');
  const justPlayCtrls = document.getElementById('footer-justplay-controls');

  if (btnPractice) btnPractice.classList.toggle('active', playerMode === 'practice');
  if (btnJustPlay) btnJustPlay.classList.toggle('active', playerMode === 'justplay');

  if (dotsBar) {
    dotsBar.style.display = (playerMode === 'practice') ? 'flex' : 'none';
  }

  if (practiceCtrls) practiceCtrls.style.display = (playerMode === 'practice') ? 'flex' : 'none';
  if (justPlayCtrls) justPlayCtrls.style.display = (playerMode === 'justplay') ? 'flex' : 'none';
}

// ── Section Dots ──────────────────────────────────────────────────────────────

function renderDots() {
  if (!song || playerMode !== 'practice') return;
  const prog  = (typeof getSongProgress === 'function') ? getSongProgress(song.id) : { currentSection: 0, completedSections: [] };
  const bar   = document.getElementById('dots-bar');
  if (!bar) return;
  const label = song.sections[currentSection]?.label ?? '';

  bar.innerHTML =
    song.sections.map((s, i) => {
      const done   = prog.completedSections && prog.completedSections.includes(i);
      const active = i === currentSection;
      return `<div
        class="dot ${done ? 'done' : ''} ${active ? 'active' : ''}"
        title="${s.label}"
        onclick="goToSection(${i})"
        role="button"
        aria-label="Go to section ${i + 1}: ${s.label}"
      ></div>`;
    }).join('') +
    `<span class="dot-label">${label}</span>`;
}

// ── Load Section (Practice Mode) ──────────────────────────────────────────────

function loadSection(index) {
  if (!song || !song.sections || song.sections.length === 0) return;
  index = Math.max(0, Math.min(index, song.sections.length - 1));
  currentSection = index;

  const section = song.sections[index];
  const prog    = (typeof getSongProgress === 'function') ? getSongProgress(song.id) : { currentSection: 0, completedSections: [] };

  if (typeof saveProgress === 'function') {
    saveProgress(song.id, { currentSection: index });
  }
  setUrlSection(index);
  renderDots();

  // 1. Tips
  const tipsList = document.getElementById('tips-list');
  if (tipsList) {
    tipsList.innerHTML = (section.tips || []).map(t => `<li>${t}</li>`).join('');
  }

  // 2. Keyboard Highlights
  if (pianoKeyboard && typeof CasiotoneKeyboard !== 'undefined') {
    try {
      const notes = CasiotoneKeyboard.extractNotesFromSection(section);
      pianoKeyboard.setHighlights(notes);
    } catch (e) {
      console.warn('Keyboard highlight error:', e);
    }
  }

  // 3. Sheet Music
  renderScore(section.abc, section, false);

  // 4. Update Buttons
  const gotBtn = document.getElementById('btn-got-it');
  if (gotBtn) {
    const isDone = prog.completedSections && prog.completedSections.includes(index);
    gotBtn.className = isDone ? 'btn btn-got-it is-done' : 'btn btn-got-it';
    gotBtn.textContent = isDone ? '✓ Done!' : '✓ Got it!';
  }

  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) nextBtn.disabled = index === song.sections.length - 1;
}

// ── Load Full Song (Just Play Mode) ───────────────────────────────────────────

function loadJustPlayMode() {
  if (!song) return;
  const fullAbc = typeof getFullSongAbc === 'function' ? getFullSongAbc(song) : (song.fullAbc || song.sections[0].abc);

  const tipsList = document.getElementById('tips-list');
  if (tipsList) {
    tipsList.innerHTML = `
      <li>🎹 <strong>Continuous Flow:</strong> 2-second lead-in tick starts when you press Play so you have time to ready your hands.</li>
      <li>⚡ <strong>Auto-Scrolling Score:</strong> The score smoothly follows the playhead cursor in real-time.</li>
      <li>✨ ${song.generalTip || 'Relax your hands and play along with confidence!'}</li>
    `;
  }

  if (pianoKeyboard && typeof CasiotoneKeyboard !== 'undefined') {
    try {
      const fullSectionMock = { abc: fullAbc, tips: [song.generalTip || ''] };
      const allNotes = CasiotoneKeyboard.extractNotesFromSection(fullSectionMock);
      pianoKeyboard.setHighlights(allNotes);
    } catch (e) {
      console.warn('Keyboard highlight error:', e);
    }
  }

  renderScore(fullAbc, { abc: fullAbc }, true);
}

// ── Render Sheet Music & Setup Audio Cursor ───────────────────────────────────

function renderScore(abcString, sectionData, isFullPlay) {
  if (synthController) {
    try { synthController.pause(); } catch (_) {}
    synthController = null;
  }
  isPlaying = false;

  const notationEl = document.getElementById('notation');
  let visualObj = null;

  if (notationEl) {
    notationEl.innerHTML = '';

    if (typeof ABCJS !== 'undefined' && ABCJS.renderAbc) {
      try {
        visualObj = ABCJS.renderAbc(notationEl, abcString, {
          responsive:     'resize',
          add_classes:    true,
          scale:          isFullPlay ? 1.15 : 1.25,
          paddingtop:     12,
          paddingbottom:  12,
          paddingright:   16,
          paddingleft:    16,
        });
      } catch (e) {
        console.error('Error rendering ABC score:', e);
        notationEl.innerHTML = '<div class="loading-box"><p style="color:#ef4444">Unable to render score</p></div>';
      }
    } else {
      notationEl.innerHTML = '<div class="loading-box"><p style="color:var(--text3)">Notation loading...</p></div>';
    }
  }

  if (visualObj && visualObj[0]) {
    setupAudio(visualObj[0], sectionData, isFullPlay);
  }
}

// ── Audio Setup & Real-Time Auto-Scroll Cursor ────────────────────────────────

function setupAudio(visualObj, sectionData, isFullPlay) {
  const audioEl = document.getElementById('audio-player');
  if (!audioEl) return;
  audioEl.innerHTML = '';

  if (typeof ABCJS === 'undefined' || !ABCJS.synth || !ABCJS.synth.supportsAudio()) {
    audioEl.innerHTML = '<p style="font-size:0.78rem;color:var(--text3);padding:8px">Audio unavailable</p>';
    return;
  }

  const cursorControl = {
    cursor: null,
    onStart: function() {
      isPlaying = true;
      const svg = document.querySelector('#notation svg');
      if (svg) {
        if (!this.cursor) {
          const c = document.createElementNS("http://www.w3.org/2000/svg", "line");
          c.setAttribute("class", "abcjs-playhead-cursor");
          c.setAttributeNS(null, 'stroke', '#f59e0b');
          c.setAttributeNS(null, 'stroke-width', '3.5');
          c.setAttributeNS(null, 'stroke-linecap', 'round');
          c.setAttributeNS(null, 'opacity', '0.9');
          svg.appendChild(c);
          this.cursor = c;
        }
        this.cursor.style.display = 'block';
      }

      const notes = CasiotoneKeyboard.extractNotesFromSection(sectionData);
      if (notes.length > 0 && pianoKeyboard) {
        pianoKeyboard.setCurrentNote(notes[0].note);
      }
    },
    onEvent: function(ev) {
      if (!ev) return;

      // 1. Move orange tracker dot on Casiotone keyboard
      if (ev.midiPitches && ev.midiPitches.length > 0 && pianoKeyboard) {
        const midi = ev.midiPitches[0].pitch;
        const noteName = CasiotoneKeyboard.midiToNoteName(midi);
        pianoKeyboard.setCurrentNote(noteName);
      }

      // 2. Move playhead cursor line on sheet music SVG & auto-scroll
      if (ev.elements && ev.elements.length > 0) {
        const noteGroup = ev.elements[0];
        const el = Array.isArray(noteGroup) ? noteGroup[0] : noteGroup;

        if (el && typeof el.getBBox === 'function') {
          try {
            const bbox = el.getBBox();
            if (this.cursor) {
              this.cursor.setAttributeNS(null, 'x1', bbox.x - 3);
              this.cursor.setAttributeNS(null, 'x2', bbox.x - 3);
              this.cursor.setAttributeNS(null, 'y1', Math.max(0, bbox.y - 12));
              this.cursor.setAttributeNS(null, 'y2', bbox.y + bbox.height + 12);
            }

            const scrollContainer = document.getElementById('notation-scroll-container');
            if (scrollContainer) {
              const elRect = el.getBoundingClientRect();
              const contRect = scrollContainer.getBoundingClientRect();

              if (elRect.top < contRect.top + 30 || elRect.bottom > contRect.bottom - 30) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          } catch (_) {}
        }
      }
    },
    onFinished: function() {
      isPlaying = false;
      if (this.cursor) this.cursor.style.display = 'none';
      const notes = CasiotoneKeyboard.extractNotesFromSection(sectionData);
      if (notes.length > 0 && pianoKeyboard) {
        pianoKeyboard.setCurrentNote(notes[0].note);
      }
      if (isFullPlay) {
        showToast(`🎉 You finished ${song.title}! Magnificent performance!`);
      }
    }
  };

  try {
    synthController = new ABCJS.synth.SynthController();
    synthController.load('#audio-player', cursorControl, {
      displayLoop:     true,
      displayRestart:  true,
      displayPlay:     true,
      displayProgress: true,
      displayWarp:     true,
    });

    synthController.setTune(visualObj, false, {
      soundFontUrl: 'https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/',
      program: 0,
    }).then(() => {
      // Attach 2-second Count-In Click Interceptor to Play Button
      attachCountInPlayInterceptor();
    }).catch(err => {
      console.warn('Just Play audio synth warning:', err);
    });
  } catch (err) {
    console.warn('Just Play SynthController error:', err);
  }
}

/**
 * Intercepts Play button click to execute the 2-second metronome tick lead-in
 */
function attachCountInPlayInterceptor() {
  const audioWrap = document.getElementById('audio-player');
  if (!audioWrap) return;

  const playBtn = audioWrap.querySelector('.abcjs-btn.abcjs-play') || audioWrap.querySelector('button');
  if (!playBtn || playBtn.dataset.hasCountInInterceptor) return;
  playBtn.dataset.hasCountInInterceptor = 'true';

  playBtn.addEventListener('click', function(e) {
    // If not already playing and not currently in countdown, run 2s count-in first!
    if (!isPlaying && !isCountingIn && synthController) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      runCountIn(() => {
        if (synthController && synthController.play) {
          synthController.play();
        }
      });
    } else if (isPlaying) {
      isPlaying = false;
    }
  }, true);
}

// ── Navigation & Completion ───────────────────────────────────────────────────

function goToSection(index) { loadSection(index); }
function prevSection()      { loadSection(currentSection - 1); }
function nextSection()      { loadSection(currentSection + 1); }

function restartJustPlay() {
  if (synthController) {
    try {
      synthController.restart();
      runCountIn(() => {
        if (synthController && synthController.play) synthController.play();
      });
    } catch (_) {}
  }
}

function markDone() {
  if (typeof markSectionComplete !== 'function') return;
  const prog = markSectionComplete(song.id, currentSection);
  renderDots();

  const gotBtn = document.getElementById('btn-got-it');
  if (gotBtn) {
    gotBtn.className  = 'btn btn-got-it is-done';
    gotBtn.textContent = '✓ Done!';
  }

  if (prog.completedSections.length >= song.sections.length || playerMode === 'justplay') {
    showToast(`🎉 ${song.title} complete! Amazing work!`);
  } else if (currentSection < song.sections.length - 1) {
    setTimeout(() => loadSection(currentSection + 1), 700);
  }
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

// ── Resize ────────────────────────────────────────────────────────────────────

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (playerMode === 'justplay') {
      loadJustPlayMode();
    } else {
      loadSection(currentSection);
    }
  }, 250);
});

// ── Boot ──────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
