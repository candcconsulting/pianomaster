'use strict';

// ──────────────────────────────────────────────────────────────────────────────
// app.js — Home page logic: renders song library grid and resume banner
// ──────────────────────────────────────────────────────────────────────────────

(async function () {

  function getDifficultyBadge(level) {
    if (level === 1) return '<span class="diff-badge diff-1">Level 1 · Easy</span>';
    if (level === 2) return '<span class="diff-badge diff-2">Level 2 · Medium</span>';
    return '<span class="diff-badge diff-3">Level 3 · Hard</span>';
  }

  function renderSongCard(song) {
    const prog      = typeof getSongProgress === 'function' ? getSongProgress(song.id) : { currentSection: 0, completedSections: [] };
    const allProg   = typeof getProgress === 'function' ? getProgress() : {};
    const pdata     = allProg[song.id];
    const doneCount = prog.completedSections ? prog.completedSections.length : 0;
    const total     = song.sections ? song.sections.length : 1;
    const pct       = Math.round((doneCount / total) * 100);
    const href      = `player.html?song=${song.id}&section=${prog.currentSection || 0}`;
    const ago       = (pdata?.lastPlayed && typeof timeAgo === 'function') ? timeAgo(pdata.lastPlayed) : null;

    return `
      <div class="song-card"
           style="--song-accent: ${song.color || '#6366f1'}"
           onclick="location.href='${href}'"
           role="button" tabindex="0"
           aria-label="Open ${song.title}">
        
        <div class="song-card-header">
          <span class="song-emoji">${song.emoji || '🎵'}</span>
          ${getDifficultyBadge(song.difficulty || 1)}
        </div>

        <div class="song-card-content">
          <h2 class="song-title">${song.title}</h2>
          <div class="song-composer">${song.composer} · ${song.year}</div>
          <p class="song-desc">${song.description || ''}</p>
        </div>

        <div class="song-card-footer">
          <div class="progress-info">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${pct}%"></div>
            </div>
            <span class="progress-label">
              ${doneCount > 0 ? `<strong>${doneCount}/${total}</strong> done (${pct}%)` : `${total} sections`}
            </span>
          </div>
          ${ago ? `<div class="song-last-played">Last played ${ago}</div>` : ''}
        </div>
      </div>`;
  }

  function renderResumeBanner() {
    if (typeof getProgress !== 'function' || typeof getSongById !== 'function') return '';
    const allProg = getProgress();
    let latestId = null, latestTime = 0;

    for (const [id, data] of Object.entries(allProg)) {
      const t = data.lastPlayed ? new Date(data.lastPlayed).getTime() : 0;
      if (t > latestTime) { latestTime = t; latestId = id; }
    }

    if (!latestId) return '';

    const song = getSongById(latestId);
    if (!song) return '';

    const prog = getSongProgress(latestId);
    const ago  = timeAgo(allProg[latestId].lastPlayed);
    const href = `player.html?song=${latestId}&section=${prog.currentSection || 0}`;
    const sectionLabel = song.sections[prog.currentSection]?.label || `Section ${(prog.currentSection || 0) + 1}`;

    return `
      <div class="resume-banner" onclick="location.href='${href}'">
        <div class="resume-left">
          <span class="resume-emoji">${song.emoji || '🎹'}</span>
          <div class="resume-details">
            <div class="resume-tag">Jump back in · ${ago || 'recently'}</div>
            <h3 class="resume-title">${song.title}</h3>
            <div class="resume-sub">${sectionLabel}</div>
          </div>
        </div>
        <button class="resume-button" onclick="event.stopPropagation(); location.href='${href}'">
          Resume Practice →
        </button>
      </div>`;
  }

  // Await song discovery and loading before rendering, if a loader exists.
  try {
    if (typeof loadSongs === 'function') {
      await loadSongs();
    }
  } catch (err) {
    console.error('Error awaiting loadSongs:', err);
  }

  function initHome() {
    const resumeEl = document.getElementById('resume-container');
    const gridEl   = document.getElementById('songs-grid');

    if (resumeEl) {
      resumeEl.innerHTML = renderResumeBanner();
    }

    if (gridEl && typeof SONGS !== 'undefined' && Array.isArray(SONGS)) {
      gridEl.innerHTML = SONGS.map(renderSongCard).join('');
    }

    // Keyboard support for cards
    document.querySelectorAll('.song-card').forEach(card => {
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHome);
  } else {
    initHome();
  }

})();
