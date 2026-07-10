/** API base URL — empty string = same origin (nginx proxies to backend). */
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const menuItemsUrl = `${API_BASE}/menu-items`;
