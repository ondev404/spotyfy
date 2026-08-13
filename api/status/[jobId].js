const { spoty } = require("../_lib");

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        message: "Method tidak diizinkan"
      });
    }

    const id = req.query.jobId;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID wajib diisi"
      });
    }

    const data = await spoty(
      "/api/spotify/track/status/" + encodeURIComponent(id)
    );

    /*
     * SpotyLoader mengembalikan downloadLink yang kadang
     * mengarah ke storage dengan SSL bermasalah di browser
     * (contoh: *.contabostorage.com).
     *
     * Jangan kirim URL storage langsung ke browser.
     * Bungkus melalui /api/file agar browser hanya terhubung
     * ke domain Vercel kita sendiri.
     */
    const result = data || {};

    if (
      result.status === "ready" &&
      result.downloadLink
    ) {
      result.downloadLink =
        "/api/file?url=" +
        encodeURIComponent(result.downloadLink);
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    console.error("STATUS API:", e);

    return res.status(500).json({
      success: false,
      message: e?.message || "Gagal mengecek status download"
    });
  }
};
