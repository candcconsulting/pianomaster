'use strict';

// ──────────────────────────────────────────────────────────────────────────────
// Home page logic — renders the song grid and resume banner
// ──────────────────────────────────────────────────────────────────────────────

(function () {

  function difficultyPips(level) {
    let html = '<div class="difficulty">';
    for (let i = 1; i <= 4; i++) {
      html += `<span class="pip ${i <= level ? 'on' : ''}"></span>`;
    }
    return html + '</div>';
  }

  function renderSongCard(song) {
    const prog   = getSongProgress(song.id);
    const allProg = getProgress();
    const pdata  = allProg[song.id];
    const done   = prog.completedSections.length;
    const total  = song.sections.length;
    const href   = `player.html?song=${song.id}&section=${prog.currentSection}`;
    const ago    = pdata?.lastPlayed ? timeAgo(pdata.lastPlayed) : null;

    return `
      <div class="song-card"
           style="--card-color:${song.color}"
           onclick="location.href='${href}'"
           role="button" tabindex="0"
           aria-label="Open ${song.title}">
        <div class="card-emoji">${song.emoji}</div>
        <div class="card-title">${song.title}</div>
        <div class="card-composer">${song.composer} · ${song.year}</div>
        <p class="card-desc">${song.description}</p>
        <div class="card-footer">
          ${difficultyPips(song.difficulty)}
          <span class="progress-text">
            ${done > 0 ? `<span class="done-count">${done}/${total}</span> sections done` : `${total} sections`}
          </span>
        </div>
        ${ago ? `<div class="last-played-text">Last played: ${ago}</div>` : ''}
      </div>`;
  }

  function renderResumeBanner() {
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
    const href = `player.html?song=${latestId}&section=${prog.currentSection}`;
    const sectionLabel = song.sections[prog.currentSection]?.label || '';

    return `
      <div class="resume-card">
        <div class="resume-info">
          <h3>${song.emoji} ${song.title}</h3>
          <p>${sectionLabel} · ${ago}</p>
        </div>
        <a href="${href}" class="btn-resume">Resume →</a>
      </div>`;
  }

  // Render everything
  document.getElementById('resume-container').innerHTML = renderResumeBanner();
  document.getElementById('songs-grid').innerHTML = SONGS.map(renderSongCard).join('');

  // Keyboard navigation for cards
  document.querySelectorAll('.song-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });

})();
