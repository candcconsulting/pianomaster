'use strict';

// ──────────────────────────────────────────────────────────────────────────────
// player.js — Section-by-section piano practice player
// Uses abcjs for sheet music rendering and audio synthesis
// ──────────────────────────────────────────────────────────────────────────────

let song               = null;   // current song object
let currentSection     = 0;      // current section index
let synthController    = null;   // abcjs SynthController instance

// ── URL helpers ───────────────────────────────────────────────────────────────

function param(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function setUrlSection(index) {
  const url = new URL(window.location.href);
  url.searchParams.set('section', index);
  window.history.replaceState({}, '', url);
}

// ── Initialise ────────────────────────────────────────────────────────────────

async function init() {
  try {
    await loadSongs();
  } catch (err) {
    console.error('Error loading songs in player:', err);
  }
  const songId = param('song');
  song = getSongById(songId);

  if (!song) {
    document.body.innerHTML = `
      <div class="loading-box" style="height:100vh">
        <p style="color:var(--text3)">Song not found.</p>
        <a href="index.html" style="color:var(--accent)">← Back to songs</a>
      </div>`;
    return;
  }

  // Determine starting section
  const sectionParam = parseInt(param('section') ?? '', 10);
  const savedProg    = getSongProgress(song.id);
  currentSection     = isNaN(sectionParam)
    ? savedProg.currentSection
    : Math.max(0, Math.min(sectionParam, song.sections.length - 1));

  // Static header content
  document.getElementById('song-title').textContent = song.title;
  document.getElementById('song-sub').textContent   = `${song.composer} · ${song.year}`;
  document.title = `🎹 ${song.title} — Just Play`;

  // Render section nav dots
  renderDots();

  // Load the initial section
  loadSection(currentSection);
}

// ── Section Dots ──────────────────────────────────────────────────────────────

function renderDots() {
  const prog  = getSongProgress(song.id);
  const bar   = document.getElementById('dots-bar');
  const label = song.sections[currentSection]?.label ?? '';

  bar.innerHTML =
    song.sections.map((s, i) => {
      const done   = prog.completedSections.includes(i);
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

// ── Load a Section ────────────────────────────────────────────────────────────

function loadSection(index) {
  if (!song) return;
  index = Math.max(0, Math.min(index, song.sections.length - 1));
  currentSection = index;

  const section = song.sections[index];
  const prog    = getSongProgress(song.id);

  // Persist position
  saveProgress(song.id, { currentSection: index });
  setUrlSection(index);

  // Update dots
  renderDots();

  // ── Sheet music ──────────────────────────────────────────
  // Stop previous audio if any
  if (synthController) {
    try { synthController.pause(); } catch (_) {}
    synthController = null;
  }

  const notationEl = document.getElementById('notation');
  notationEl.innerHTML = '';   // clear previous SVG

  const visualObj = ABCJS.renderAbc('notation', section.abc, {
    responsive:     'resize',
    add_classes:    true,
    scale:          1.6,
    paddingtop:     16,
    paddingbottom:  16,
    paddingright:   24,
    paddingleft:    24,
    staffwidth:     Math.min(window.innerWidth - 60, 750),
  });

  // ── Audio ────────────────────────────────────────────────
  setupAudio(visualObj[0]);

  // ── Tips ─────────────────────────────────────────────────
  const tipsList = document.getElementById('tips-list');
  tipsList.innerHTML = section.tips.map(t => `<li>${t}</li>`).join('');

  // ── Got it button ─────────────────────────────────────────
  const gotBtn = document.getElementById('btn-got-it');
  const isDone = prog.completedSections.includes(index);
  if (isDone) {
    gotBtn.className  = 'btn btn-got-it is-done';
    gotBtn.textContent = '✓ Done!';
  } else {
    gotBtn.className  = 'btn btn-got-it';
    gotBtn.textContent = '✓ Got it!';
  }

  // ── Nav buttons ───────────────────────────────────────────
  document.getElementById('btn-prev').disabled = index === 0;
  document.getElementById('btn-next').disabled = index === song.sections.length - 1;
}

// ── Audio Setup ───────────────────────────────────────────────────────────────

function setupAudio(visualObj) {
  const audioEl = document.getElementById('audio-player');
  audioEl.innerHTML = '';

  if (!ABCJS.synth || !ABCJS.synth.supportsAudio()) {
    audioEl.innerHTML = '<p style="font-size:0.78rem;color:var(--text3);padding:8px">Audio unavailable in this browser</p>';
    return;
  }

  try {
    synthController = new ABCJS.synth.SynthController();
    synthController.load('#audio-player', null, {
      displayLoop:     true,
      displayRestart:  true,
      displayPlay:     true,
      displayProgress: true,
      displayWarp:     true,
    });

    synthController.setTune(visualObj, false, {
      // FluidR3_GM soundfont — real piano samples loaded from CDN
      soundFontUrl: 'https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/',
      program: 0,   // Acoustic Grand Piano
    }).catch(err => {
      // Non-fatal: audio will just be silent (notation still shows)
      console.warn('Just Play: audio init error:', err);
    });
  } catch (err) {
    console.warn('Just Play: SynthController error:', err);
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────

function goToSection(index) { loadSection(index); }
function prevSection()      { loadSection(currentSection - 1); }
function nextSection()      { loadSection(currentSection + 1); }

// ── Mark Section Complete ─────────────────────────────────────────────────────

function markDone() {
  const prog = markSectionComplete(song.id, currentSection);
  renderDots();

  const gotBtn = document.getElementById('btn-got-it');
  gotBtn.className  = 'btn btn-got-it is-done';
  gotBtn.textContent = '✓ Done!';

  // All sections done?
  if (prog.completedSections.length >= song.sections.length) {
    showToast(`🎉 ${song.title} complete! Amazing work!`);
  } else if (currentSection < song.sections.length - 1) {
    // Auto-advance to next section after a brief pause
    setTimeout(() => loadSection(currentSection + 1), 700);
  }
}

// ── Toast notification ────────────────────────────────────────────────────────

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

// ── Re-render on orientation/resize ──────────────────────────────────────────

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Re-render current section notation at new viewport width
    const section = song?.sections[currentSection];
    if (!section) return;

    if (synthController) {
      try { synthController.pause(); } catch (_) {}
      synthController = null;
    }

    document.getElementById('notation').innerHTML = '';

    const visualObj = ABCJS.renderAbc('notation', section.abc, {
      responsive:    'resize',
      add_classes:   true,
      scale:         1.6,
      paddingtop:    16,
      paddingbottom: 16,
      paddingright:  24,
      paddingleft:   24,
      staffwidth:    Math.min(window.innerWidth - 60, 750),
    });

    setupAudio(visualObj[0]);
  }, 250);
});

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
