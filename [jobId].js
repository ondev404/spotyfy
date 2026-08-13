const { spoty } = require("../_lib");

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ success: false, message: "Method tidak diizinkan" });
    }

    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID wajib diisi" });
    }

    const data = await spoty(
      `/api/spotify/track/status/${encodeURIComponent(jobId)}`
    );

    res.status(200).json({
      success: true,
      data
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: e.message || "Gagal mengecek status download"
    });
  }
};
