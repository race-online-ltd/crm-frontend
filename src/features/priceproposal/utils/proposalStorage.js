const STORAGE_KEY = 'crm_price_proposals';

function readJsonArray(key) {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readPriceProposals() {
  return readJsonArray(STORAGE_KEY);
}

export function appendPriceProposals(rows) {
  if (typeof window === 'undefined') return;

  const currentRows = readPriceProposals();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...currentRows, ...rows]));
}

export function clearPriceProposals() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

