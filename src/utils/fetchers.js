export async function fetchJson(url, fallback = null) {
  try {
    const response = await fetch(url);
    const data = await response.json().catch(() => fallback);
    if (!response.ok) return fallback;
    return data;
  } catch {
    return fallback;
  }
}

export async function fetchJsonArray(url) {
  const data = await fetchJson(url, []);
  return Array.isArray(data) ? data : [];
}

export async function fetchJsonObject(url, fallback = {}) {
  const data = await fetchJson(url, fallback);
  return data && typeof data === 'object' && !Array.isArray(data) ? data : fallback;
}
