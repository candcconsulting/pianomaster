'use strict';

// ──────────────────────────────────────────────────────────────────────────────
// JUST PLAY — Song Library
// Songs are loaded dynamically from the songs/ folder.
// Any JSON song placed in songs/ is automatically loaded into the SONGS array.
// ──────────────────────────────────────────────────────────────────────────────

const SONGS = [];
let songsLoadedPromise = null;

async function discoverSongFiles() {
  let fileList = [];

  // 1. Try directory listing from 'songs/' (works when server has autoindex, e.g. nginx or dev servers)
  try {
    const res = await fetch('songs/');
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          fileList = data
            .map(item => (typeof item === 'string' ? item : item.name))
            .filter(name => name && name.endsWith('.json') && name !== 'index.json');
        }
      } else {
        const text = await res.text();
        // Match .json links if server provides HTML directory index (Python http.server, Apache, etc.)
        const matches = text.match(/href=["']([^"']+\.json)["']/gi);
        if (matches) {
          fileList = matches
            .map(m => m.replace(/href=["']/i, '').replace(/["']$/, ''))
            .map(url => url.split('/').pop().split('?')[0])
            .filter(name => name && name.endsWith('.json') && name !== 'index.json');
          fileList = [...new Set(fileList)];
        }
      }
    }
  } catch (e) {
    console.debug('Directory listing fetch failed, falling back to index.json', e);
  }

  // 2. Fallback to songs/index.json manifest for environments where directory listing is restricted
  if (!fileList || fileList.length === 0) {
    try {
      const res = await fetch('songs/index.json');
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          fileList = list.filter(f => f && f !== 'index.json');
        }
      }
    } catch (e) {
      console.warn('Failed to load songs/index.json fallback', e);
    }
  }

  return fileList;
}

async function loadSongs() {
  if (songsLoadedPromise) return songsLoadedPromise;

  songsLoadedPromise = (async () => {
    try {
      const files = await discoverSongFiles();
      if (!files || files.length === 0) {
        console.warn('No song files discovered in songs/');
        return SONGS;
      }

      const songPromises = files.map(async file => {
        const path = file.startsWith('songs/') ? file : `songs/${file}`;
        const res = await fetch(path);
        if (!res.ok) {
          throw new Error(`Failed to load song from ${path}: HTTP ${res.status}`);
        }
        return await res.json();
      });

      const loadedSongs = await Promise.all(songPromises);

      // Sort by difficulty, then title for consistent progression
      loadedSongs.sort((a, b) => {
        if ((a.difficulty || 0) !== (b.difficulty || 0)) {
          return (a.difficulty || 0) - (b.difficulty || 0);
        }
        return (a.title || '').localeCompare(b.title || '');
      });

      SONGS.length = 0;
      SONGS.push(...loadedSongs);
      return SONGS;
    } catch (err) {
      console.error('Error loading songs:', err);
      return SONGS;
    }
  })();

  return songsLoadedPromise;
}

// Automatically start loading songs immediately
loadSongs();

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
  const lastSec = song.sections ? song.sections[song.sections.length - 1] : null;
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
