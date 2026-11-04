/**
 * The graveyard - an archive of stitched creatures kept in localStorage.
 *
 * Every storage call is wrapped: a private-mode browser must not break the
 * app, it must only disable this one feature.
 */

const STORAGE_KEY = "monster-composer:graveyard:v1";

export function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [], error: null };
    const parsed = JSON.parse(raw);
    return { entries: Array.isArray(parsed) ? parsed : [], error: null };
  } catch (error) {
    return { entries: [], error: errorMessage(error) };
  }
}

export function save(entries) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export function add(entry) {
  const current = load();
  const entries = [entry, ...current.entries.filter((item) => item.id !== entry.id)].slice(0, 20);
  const result = save(entries);
  return { entries, ...result };
}

export function remove(id) {
  const current = load();
  const entries = current.entries.filter((item) => item.id !== id);
  const result = save(entries);
  return { entries, ...result };
}

function errorMessage(error) {
  return error && error.message ? error.message : String(error);
}
