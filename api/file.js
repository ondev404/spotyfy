/*
 * SpotyLoad download proxy
 *
 * Fungsi ini mengambil file dari storage server SpotyLoader
 * lalu melakukan streaming langsung ke browser.
 *
 * Dibuat untuk mengatasi kasus downloadLink storage yang
 * menghasilkan ERR_SSL_PROTOCOL_ERROR di browser.
 */

const http = require("http");
const https = require("https");

const ALLOWED_HOSTS = [
  "contabostorage.com"
];

function isAllowedHost(hostname) {
  const host = String(hostname || "").toLowerCase();

  return ALLOWED_HOSTS.some(
    allowed =>
      host === allowed ||
      host.endsWith("." + allowed)
  );
}

function getClient(url) {
  return url.protocol === "https:" ? https : http;
}

function proxyRequest(targetUrl, res, redirects = 0) {
  if (redirects > 5) {
    res.statusCode = 508;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Terlalu banyak redirect.");
  }

  let parsed;

  try {
    parsed = new URL(targetUrl);
  } catch {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("URL download tidak valid.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Protocol download tidak didukung.");
  }

  if (!isAllowedHost(parsed.hostname)) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Host download tidak diizinkan.");
  }

  const client = getClient(parsed);

  const options = {
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port || undefined,
    path: parsed.pathname + parsed.search,
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
      "Accept": "*/*",
      "Connection": "close"
    },

    /*
     * Beberapa endpoint storage yang dipakai provider
     * mempunyai konfigurasi TLS yang tidak cocok dengan
     * browser. Kita hanya melakukan ini untuk host yang
     * sudah di-whitelist di atas.
     */
    rejectUnauthorized: parsed.protocol === "https:" ? false : undefined
  };

  const request = client.request(options, upstream => {
    const location = upstream.headers.location;

    if (
      [301, 302, 303, 307, 308].includes(upstream.statusCode) &&
      location
    ) {
      upstream.resume();

      const nextUrl = new URL(location, parsed).toString();

      if (!res.headersSent) {
        return proxyRequest(nextUrl, res, redirects + 1);
      }

      return res.end();
    }

    if (
      !upstream.statusCode ||
      upstream.statusCode < 200 ||
      upstream.statusCode >= 300
    ) {
      let body = "";

      upstream.setEncoding("utf8");

      upstream.on("data", chunk => {
        if (body.length < 1000) {
          body += chunk;
        }
      });

      upstream.on("end", () => {
        if (!res.headersSent) {
          res.statusCode = upstream.statusCode || 502;
          res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
          );
          res.end(
            `Storage mengembalikan HTTP ${upstream.statusCode || 502}.`
          );
        }
      });

      return;
    }

    /*
     * Streaming: jangan buffer file ke memory.
     */
    res.statusCode = 200;

    res.setHeader(
      "Content-Type",
      upstream.headers["content-type"] ||
        "audio/mpeg"
    );

    if (upstream.headers["content-length"]) {
      res.setHeader(
        "Content-Length",
        upstream.headers["content-length"]
      );
    }

    /*
     * Paksa browser memperlakukan hasil sebagai file MP3.
     */
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="SpotyLoad.mp3"'
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    upstream.pipe(res);

    upstream.on("error", error => {
      console.error("UPSTREAM STREAM ERROR:", error);

      if (!res.writableEnded) {
        res.destroy(error);
      }
    });
  });

  request.on("error", error => {
    console.error("PROXY ERROR:", error.message);

    /*
     * Kalau HTTPS storage gagal karena TLS, coba HTTP
     * ke host yang sama sebagai fallback.
     */
    if (
      parsed.protocol === "https:" &&
      !res.headersSent
    ) {
      const httpUrl =
        "http://" +
        parsed.host +
        parsed.pathname +
        parsed.search;

      return proxyRequest(
        httpUrl,
        res,
        redirects + 1
      );
    }

    if (!res.headersSent) {
      res.statusCode = 502;
      res.setHeader(
        "Content-Type",
        "text/plain; charset=utf-8"
      );
      res.end(
        "Gagal mengambil file dari server storage."
      );
    }
  });

  request.end();
}

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan"
    });
  }

  const rawUrl = req.query?.url;

  if (!rawUrl) {
    return res.status(400).json({
      success: false,
      message: "URL file wajib diisi"
    });
  }

  return proxyRequest(rawUrl, res);
};
