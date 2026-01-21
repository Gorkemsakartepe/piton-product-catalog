const KEY = "favorites";

export function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids.map(String)))));
}

export function isFavorite(id: string): boolean {
  return loadFavorites().includes(String(id));
}

export function toggleFavorite(id: string): { ids: string[]; active: boolean } {
  const sid = String(id);
  const current = loadFavorites();
  const exists = current.includes(sid);
  const next = exists ? current.filter((x) => x !== sid) : [...current, sid];
  saveFavorites(next);
  return { ids: next, active: !exists };
}

export function removeFavorite(id: string): string[] {
  const sid = String(id);
  const next = loadFavorites().filter((x) => x !== sid);
  saveFavorites(next);
  return next;
}
