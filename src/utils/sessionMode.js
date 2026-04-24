/* Helpers to tell whether the current session is 'live' (came in through
   the real /signin or /register) vs 'demo' (the /login shortcut page).

   Stores use this to split their storage keys and skip seed data when
   the user wants a clean, production-like experience. */

const AUTH_KEY = 'rr_user';

export function isLive() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    return Boolean(JSON.parse(raw)?.liveMode);
  } catch { return false; }
}

export function keyFor(base) {
  return isLive() ? `${base}_live` : base;
}
