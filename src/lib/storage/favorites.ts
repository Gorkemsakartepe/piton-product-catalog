export type FavoriteItem = {
  id: string;
  name: string;
  description?: string;
  price?: number;
};

const KEY = "favorites";

function safeParse(json: string | null) {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(KEY));
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((x) => x.id === id);
}

export function addFavorite(item: FavoriteItem) {
  const list = getFavorites();
  if (list.some((x) => x.id === item.id)) return;
  localStorage.setItem(KEY, JSON.stringify([item, ...list]));
}

export function removeFavorite(id: string) {
  const list = getFavorites().filter((x) => x.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function toggleFavorite(item: FavoriteItem) {
  if (isFavorite(item.id)) removeFavorite(item.id);
  else addFavorite(item);
}
