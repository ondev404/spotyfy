const { spoty, trackJson, spotifyUrl } = require("./_lib");

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ success: false, message: "Method tidak diizinkan" });
    }

    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ success: false, message: "URL Spotify wajib diisi" });
    }

    if (!spotifyUrl(url)) {
      return res.status(400).json({ success: false, message: "URL Spotify tidak valid" });
    }

    const data = await spoty(`/api/spotify/info?url=${encodeURIComponent(url)}`);

    if (!data.post) {
      throw new Error("Data lagu tidak ditemukan");
    }

    res.status(200).json({
      success: true,
      data: trackJson(data.post)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: e.message || "Gagal mengambil informasi lagu"
    });
  }
};
