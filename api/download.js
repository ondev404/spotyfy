const { spoty, valid } = require("./_lib");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method tidak diizinkan"
      });
    }

    const { url, format = "mp3" } = req.body || {};

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL Spotify wajib diisi"
      });
    }

    if (!valid(url)) {
      return res.status(400).json({
        success: false,
        message: "URL Spotify tidak valid"
      });
    }

    const data = await spoty("/api/spotify/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url, format })
    });

    const jobId =
      data?.jobId ||
      data?.job_id ||
      data?.data?.jobId ||
      data?.result?.jobId;

    if (!jobId) {
      throw new Error(
        data?.message || "Gagal membuat job download"
      );
    }

    return res.status(200).json({
      success: true,
      jobId
    });
  } catch (e) {
    console.error("DOWNLOAD API:", e);

    return res.status(500).json({
      success: false,
      message: e?.message || "Gagal membuat download"
    });
  }
};
