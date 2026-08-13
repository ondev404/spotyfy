const { spoty, trackJson, spotifyUrl } = require("./_lib");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, message: "Method tidak diizinkan" });
    }

    const { url } = req.body || {};

    if (!url) {
      return res.status(400).json({ success: false, message: "URL playlist wajib diisi" });
    }

    if (!spotifyUrl(url)) {
      return res.status(400).json({ success: false, message: "URL Spotify tidak valid" });
    }

    const data = await spoty("/api/spotify/playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!data.post) {
      throw new Error("Playlist tidak ditemukan");
    }

    const p = data.post;

    res.status(200).json({
      success: true,
      data: {
        judul: p.name,
        owner: p.owner,
        total_lagu: p.total_tracks,
        thumbnail: p.image || null,
        daftar_lagu: (p.tracks || []).map(trackJson)
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: e.message || "Gagal mengambil playlist"
    });
  }
};
