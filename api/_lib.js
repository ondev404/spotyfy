const BASE = "https://spotyloader.com";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
  Accept: "application/json",
  Referer: "https://spotyloader.com/"
};

async function spoty(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...HEADERS,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok && response.status !== 202) {
    throw new Error(`SpotyLoader API ${response.status}`);
  }

  return data;
}

function valid(url) {
  try {
    const u = new URL(url);

    return (
      u.hostname === "open.spotify.com" ||
      u.hostname === "spotify.com" ||
      u.hostname.endsWith(".spotify.com")
    );
  } catch {
    return false;
  }
}

function duration(ms) {
  if (!ms) return "0:00";

  const seconds = Math.round(ms / 1000);

  return `${Math.floor(seconds / 60)}:${String(
    seconds % 60
  ).padStart(2, "0")}`;
}

function track(t) {
  return {
    judul: t.name,
    artis:
      t.artist ||
      (Array.isArray(t.artists) ? t.artists.join(", ") : "") ||
      "-",
    album: t.album || "-",
    durasi: duration(t.duration_ms),
    thumbnail: t.image || t.thumbnail || null
  };
}

module.exports = {
  spoty,
  valid,
  track,
  duration
};