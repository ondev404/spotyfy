/*
 * =========================================================
 * SPOTYLOAD APP
 * Spotify Downloader & Playlist Metadata
 * =========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     CONFIG
  ======================================================= */

  const BASE_URL = "";

  const HEADERS = {
    "Accept": "application/json"
  };


  /* =======================================================
     ELEMENTS
  ======================================================= */

  const welcomeModal =
    document.getElementById("welcomeModal");

  const continueBtn =
    document.getElementById("continueBtn");

  const followChannelBtn =
    document.getElementById("followChannelBtn");

  const urlInput =
    document.getElementById("url");

  const pasteBtn =
    document.getElementById("pasteBtn");

  const clearBtn =
    document.getElementById("clearBtn");

  const trackBtn =
    document.getElementById("trackBtn");

  const playlistBtn =
    document.getElementById("playlistBtn");

  const loading =
    document.getElementById("loading");

  const loadingTitle =
    document.getElementById("loadingTitle");

  const loadingText =
    document.getElementById("loadingText");

  const errorBox =
    document.getElementById("errorBox");

  const errorText =
    document.getElementById("errorText");

  const closeError =
    document.getElementById("closeError");

  const trackResult =
    document.getElementById("trackResult");

  const playlistResult =
    document.getElementById("playlistResult");

  const toast =
    document.getElementById("toast");

  const toastText =
    document.getElementById("toastText");

  const downloadBtn =
    document.getElementById("downloadBtn");

  const copyTrack =
    document.getElementById("copyTrack");

  const copyPlaylist =
    document.getElementById("copyPlaylist");


  /* =======================================================
     GLOBAL DATA
  ======================================================= */

  window.currentTrack = null;
  window.currentPlaylist = null;

  let toastTimer = null;


  /* =======================================================
     WELCOME POPUP
  ======================================================= */

  function showContinueButton() {

    if (!continueBtn) {
      return;
    }

    continueBtn.classList.remove("hidden");
    continueBtn.classList.add("ready");
    continueBtn.disabled = false;
  }


  function closeWelcome() {

    if (!welcomeModal) {
      return;
    }

    welcomeModal.classList.add("hide");

    welcomeModal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow = "";

    setTimeout(() => {

      welcomeModal.style.display = "none";

    }, 450);
  }


  function startWelcome() {

    if (!welcomeModal) {
      return;
    }

    document.body.style.overflow = "hidden";

    welcomeModal.style.display = "flex";

    welcomeModal.classList.remove("hide");

    welcomeModal.setAttribute(
      "aria-hidden",
      "false"
    );

    /*
     * Pastikan tombol Lanjut benar-benar muncul.
     */

    setTimeout(() => {

      showContinueButton();

    }, 800);
  }


  try {

    const done =
      localStorage.getItem(
        "spotyload_welcome_done"
      );

    if (done === "1") {

      welcomeModal &&
        (welcomeModal.style.display = "none");

      document.body.style.overflow = "";

    } else {

      startWelcome();

    }

  } catch (error) {

    startWelcome();

  }


  /* =======================================================
     CONTINUE
  ======================================================= */

  if (continueBtn) {

    continueBtn.addEventListener(
      "click",
      () => {

        try {

          localStorage.setItem(
            "spotyload_welcome_done",
            "1"
          );

        } catch (error) {

          console.warn(
            "LocalStorage tidak tersedia."
          );

        }

        closeWelcome();

      }
    );

  }


  /* =======================================================
     FOLLOW CHANNEL
  ======================================================= */

  if (followChannelBtn) {

    followChannelBtn.addEventListener(
      "click",
      () => {

        /*
         * Jangan menyembunyikan tombol lanjut.
         */

        setTimeout(() => {

          showContinueButton();

        }, 300);

      }
    );

  }


  /* =======================================================
     ESC
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        welcomeModal &&
        !welcomeModal.classList.contains("hide")
      ) {

        event.preventDefault();

      }

    }
  );


  /* =======================================================
     TOAST
  ======================================================= */

  function showToast(message) {

    if (!toast) {
      return;
    }

    if (toastText) {
      toastText.textContent = message;
    }

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

      toast.classList.remove("show");

    }, 2200);
  }


  /* =======================================================
     ERROR
  ======================================================= */

  function showError(message) {

    if (!errorBox) {
      return;
    }

    if (errorText) {

      errorText.textContent =
        message ||
        "Terjadi kesalahan.";

    }

    errorBox.classList.remove("hidden");

    errorBox.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }


  function hideError() {

    if (errorBox) {
      errorBox.classList.add("hidden");
    }

  }


  if (closeError) {

    closeError.addEventListener(
      "click",
      hideError
    );

  }


  /* =======================================================
     LOADING
  ======================================================= */

  function showLoading(
    title = "Processing...",
    text = "Please wait..."
  ) {

    hideError();

    if (loadingTitle) {

      loadingTitle.textContent =
        title;

    }

    if (loadingText) {

      loadingText.textContent =
        text;

    }

    if (loading) {

      loading.classList.remove(
        "hidden"
      );

    }

  }


  function hideLoading() {

    if (loading) {

      loading.classList.add(
        "hidden"
      );

    }

  }


  /* =======================================================
     INPUT
  ======================================================= */

  function getInputUrl() {

    if (!urlInput) {
      return "";
    }

    return urlInput.value.trim();

  }


  /* =======================================================
     PASTE
  ======================================================= */

  if (pasteBtn) {

    pasteBtn.addEventListener(
      "click",
      async () => {

        try {

          const text =
            await navigator.clipboard.readText();

          if (!text) {

            showToast(
              "Clipboard kosong"
            );

            return;

          }

          if (urlInput) {

            urlInput.value =
              text.trim();

            urlInput.dispatchEvent(
              new Event(
                "input",
                {
                  bubbles: true
                }
              )
            );

            urlInput.focus();

          }

          showToast(
            "Link berhasil ditempel"
          );

        } catch (error) {

          /*
           * Fallback untuk browser yang
           * memblokir Clipboard API.
           */

          if (urlInput) {

            urlInput.focus();

            showToast(
              "Izinkan akses clipboard browser"
            );

          }

        }

      }
    );

  }


  /* =======================================================
     CLEAR
  ======================================================= */

  if (clearBtn) {

    clearBtn.addEventListener(
      "click",
      () => {

        if (!urlInput) {
          return;
        }

        urlInput.value = "";

        urlInput.dispatchEvent(
          new Event(
            "input",
            {
              bubbles: true
            }
          )
        );

        urlInput.focus();

        hideError();

      }
    );

  }


  /* =======================================================
     INPUT EVENT
  ======================================================= */

  if (urlInput) {

    urlInput.addEventListener(
      "input",
      () => {

        hideError();

      }
    );


    urlInput.addEventListener(
      "keydown",
      event => {

        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();

        if (trackBtn) {
          trackBtn.click();
        }

      }
    );

  }


  /* =======================================================
     SPOTIFY URL
  ======================================================= */

  function getSpotifyType(value) {

    if (!value) {
      return null;
    }

    const url =
      value.trim();

    /*
     * Track
     */

    if (
      /open\.spotify\.com\/track\/[A-Za-z0-9]+/i
        .test(url) ||

      /^spotify:track:[A-Za-z0-9]+/i
        .test(url)
    ) {

      return "track";

    }


    /*
     * Playlist
     */

    if (
      /open\.spotify\.com\/playlist\/[A-Za-z0-9]+/i
        .test(url) ||

      /^spotify:playlist:[A-Za-z0-9]+/i
        .test(url)
    ) {

      return "playlist";

    }


    return null;

  }


  /* =======================================================
     API REQUEST
  ======================================================= */

  async function requestAPI(
    path,
    options = {}
  ) {

    const response =
      await fetch(
        `${BASE_URL}${path}`,
        {
          ...options,

          headers: {
            ...HEADERS,
            ...(options.headers || {})
          }
        }
      );


    let data = {};

    try {

      data =
        await response.json();

    } catch (error) {

      data = {};

    }


    if (!response.ok && response.status !== 202) {

      let message =
        data?.message ||
        data?.error ||
        data?.msg ||
        `Request failed (${response.status})`;


      if (response.status === 404) {

        message =
          "Endpoint tidak ditemukan (404).";

      }


      throw new Error(message);

    }


    return {
      status: response.status,
      data
    };

  }


  /* =======================================================
     GET TRACK INFORMATION
     GET /api/spotify/info?url=
  ======================================================= */

  async function getTrackInfo(url) {

    const result =
      await requestAPI(
        `/api/info?url=${encodeURIComponent(url)}`
      );


    /*
     * Backend:
     * {
     *   post: {...}
     * }
     */

    return (
      result.data?.data ||
      result.data?.post ||
      result.data?.result ||
      result.data ||
      {}
    );

  }


  /* =======================================================
     GET PLAYLIST
     POST /api/spotify/playlist
  ======================================================= */

  async function getPlaylistInfo(url) {

    const result =
      await requestAPI(
        "/api/playlist",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            url: url
          })
        }
      );


    return (
      result.data?.data ||
      result.data?.post ||
      result.data?.result ||
      result.data ||
      {}
    );

  }


  /* =======================================================
     CREATE DOWNLOAD JOB
     POST /api/spotify/track
  ======================================================= */

  async function createDownloadJob(
    url,
    format = "mp3"
  ) {

    const result =
      await requestAPI(
        "/api/download",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            url: url,
            format: format
          })
        }
      );


    const data =
      result.data || {};


    if (!data.jobId) {

      throw new Error(
        data.message ||
        data.error ||
        "Gagal membuat job download."
      );

    }


    return data.jobId;

  }


  /* =======================================================
     CHECK DOWNLOAD STATUS
     GET /api/spotify/track/status/{jobId}
  ======================================================= */

  async function checkDownloadStatus(
    jobId
  ) {

    const result =
      await requestAPI(
        `/api/status/${encodeURIComponent(jobId)}`
      );


    return result.data?.data || result.data || {};

  }


  /* =======================================================
     WAIT DOWNLOAD
  ======================================================= */

  async function waitForDownload(
    jobId
  ) {

    /*
     * Backend asli:
     * 80 x 2500ms
     */

    for (
      let attempt = 0;
      attempt < 80;
      attempt++
    ) {

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            2500
          )
      );


      const status =
        await checkDownloadStatus(
          jobId
        );


      if (
        status.status === "ready" &&
        status.downloadLink
      ) {

        return status.downloadLink;

      }


      if (
        status.status === "error"
      ) {

        throw new Error(
          status.message ||
          "Download gagal diproses server."
        );

      }


      /*
       * Update loading text.
       */

      if (loadingText) {

        const seconds =
          Math.round(
            ((attempt + 1) * 2.5)
          );

        loadingText.textContent =
          `Server sedang memproses • ${seconds}s`;

      }

    }


    throw new Error(
      "Timeout menunggu download server."
    );

  }


  /* =======================================================
     HIDE RESULTS
  ======================================================= */

  function hideResults() {

    if (trackResult) {

      trackResult.classList.add(
        "hidden"
      );

    }

    if (playlistResult) {

      playlistResult.classList.add(
        "hidden"
      );

    }

  }


  /* =======================================================
     DURATION
  ======================================================= */

  function formatDuration(value) {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {

      return "0:00";

    }


    let seconds =
      Number(value);


    if (
      Number.isNaN(seconds)
    ) {

      return "0:00";

    }


    /*
     * API Spotify memakai milliseconds.
     */

    if (seconds > 1000) {

      seconds =
        Math.floor(
          seconds / 1000
        );

    } else {

      seconds =
        Math.floor(seconds);

    }


    const minutes =
      Math.floor(
        seconds / 60
      );


    const remaining =
      seconds % 60;


    return (
      `${minutes}:` +
      String(
        remaining
      ).padStart(
        2,
        "0"
      )
    );

  }


  /* =======================================================
     ESCAPE HTML
  ======================================================= */

  function escapeHTML(value) {

    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  /* =======================================================
     GET ARTIST
  ======================================================= */

  function getArtist(value) {

    if (!value) {
      return "-";
    }


    if (typeof value === "string") {
      return value;
    }


    if (Array.isArray(value)) {

      return value
        .map(
          artist => {

            if (
              typeof artist === "string"
            ) {

              return artist;

            }

            return (
              artist?.name ||
              artist?.artist ||
              ""
            );

          }
        )
        .filter(Boolean)
        .join(", ");

    }


    if (typeof value === "object") {

      return (
        value.name ||
        value.artist ||
        "-"
      );

    }


    return "-";

  }


  /* =======================================================
     GET IMAGE
  ======================================================= */

  function getImage(data) {

    if (!data) {
      return null;
    }


    if (typeof data === "string") {
      return data;
    }


    return (
      data.image ||
      data.thumbnail ||
      data.cover ||
      data.cover_url ||
      data.image_url ||
      data.images?.[0]?.url ||
      null
    );

  }


  /* =======================================================
     TRACK RENDER
  ======================================================= */

  function renderTrack(track) {

    const title =
      document.getElementById(
        "title"
      );

    const artist =
      document.getElementById(
        "artist"
      );

    const album =
      document.getElementById(
        "album"
      );

    const duration =
      document.getElementById(
        "duration"
      );

    const cover =
      document.getElementById(
        "cover"
      );


    /*
     * API SpotyLoader:
     *
     * name
     * artist
     * album
     * duration_ms
     * image
     */

    const trackTitle =
      track.name ||
      track.title ||
      track.judul ||
      "Unknown Track";


    const trackArtist =
      getArtist(
        track.artist ||
        track.artis ||
        track.artists
      );


    const trackAlbum =
      typeof track.album === "object"
        ? (
            track.album?.name ||
            "-"
          )
        : (
            track.album ||
            "-"
          );


    const trackDuration =
      formatDuration(
        track.duration_ms ||
        track.duration ||
        track.durasi
      );


    const trackImage =
      getImage(track) ||
      track.thumbnail ||
      null;


    if (title) {

      title.textContent =
        trackTitle;

    }


    if (artist) {

      artist.textContent =
        trackArtist;

    }


    if (album) {

      album.textContent =
        trackAlbum;

    }


    if (duration) {

      duration.textContent =
        trackDuration;

    }


    if (cover && trackImage) {

      cover.src =
        trackImage;

      cover.onerror =
        () => {

          cover.src =
            "/logo.png";

        };

    }


    /*
     * Simpan data untuk tombol download.
     */

    window.currentTrack = {

      ...track,

      name:
        trackTitle,

      artist:
        trackArtist,

      album:
        trackAlbum,

      duration_ms:
        track.duration_ms ||
        track.duration ||
        track.durasi,

      image:
        trackImage

    };

  }


  /* =======================================================
     PLAYLIST RENDER
  ======================================================= */

  function renderPlaylist(
    playlist
  ) {

    const playlistTitle =
      document.getElementById(
        "playlistTitle"
      );

    const playlistOwner =
      document.getElementById(
        "playlistOwner"
      );

    const playlistCover =
      document.getElementById(
        "playlistCover"
      );

    const playlistCount =
      document.getElementById(
        "playlistCount"
      );

    const playlistList =
      document.getElementById(
        "playlistList"
      );


    const tracks =
      Array.isArray(playlist.tracks)
        ? playlist.tracks
        : Array.isArray(playlist.daftar_lagu)
          ? playlist.daftar_lagu
          : Array.isArray(playlist.items)
            ? playlist.items
            : [];


    const title =
      playlist.name ||
      playlist.title ||
      playlist.judul ||
      "Spotify Playlist";


    const owner =
      typeof playlist.owner === "object"
        ? (
            playlist.owner?.display_name ||
            playlist.owner?.name ||
            "-"
          )
        : (
            playlist.owner ||
            "-"
          );


    const image =
      getImage(
        playlist
      );


    if (playlistTitle) {

      playlistTitle.textContent =
        title;

    }


    if (playlistOwner) {

      playlistOwner.textContent =
        owner;

    }


    if (
      playlistCover &&
      image
    ) {

      playlistCover.src =
        image;

      playlistCover.onerror =
        () => {

          playlistCover.src =
            "/logo.png";

        };

    }


    if (playlistCount) {

      playlistCount.textContent =
        `${
          playlist.total_tracks ||
          playlist.total_lagu ||
          tracks.length
        } tracks`;

    }


    if (playlistList) {

      playlistList.innerHTML = "";


      if (!tracks.length) {

        playlistList.innerHTML = `

          <div
            style="
              padding:20px;
              text-align:center;
              color:#596469;
              font-size:9px;
            "
          >
            Tidak ada lagu ditemukan.
          </div>

        `;

      }


      tracks.forEach(
        (track, index) => {

          const item =
            document.createElement(
              "div"
            );


          item.className =
            "playlist-item";


          const trackTitle =
            track.name ||
            track.title ||
            track.judul ||
            "Unknown Track";


          const trackArtist =
            getArtist(
              track.artist ||
              track.artis ||
              track.artists
            );


          const trackImage =
            getImage(track) ||
            track.thumbnail ||
            image ||
            "/logo.png";


          const trackDuration =
            formatDuration(
              track.duration_ms ||
              track.duration ||
              track.durasi
            );


          item.innerHTML = `

            <span class="playlist-number">
              ${index + 1}
            </span>

            <img
              class="playlist-image"
              src="${escapeHTML(trackImage)}"
              alt=""
              loading="lazy"
            >

            <div class="playlist-track">

              <strong>
                ${escapeHTML(trackTitle)}
              </strong>

              <span>
                ${escapeHTML(trackArtist)}
              </span>

            </div>

            <span class="playlist-duration">
              ${escapeHTML(trackDuration)}
            </span>

          `;


          playlistList.appendChild(
            item
          );

        }
      );

    }


    window.currentPlaylist = {

      ...playlist,

      name:
        title,

      owner:
        owner,

      tracks:
        tracks

    };

  }


  /* =======================================================
     TRACK BUTTON
  ======================================================= */

  if (trackBtn) {

    trackBtn.addEventListener(
      "click",
      async () => {

        const url =
          getInputUrl();


        if (!url) {

          showError(
            "Masukkan link Spotify terlebih dahulu."
          );

          return;

        }


        const type =
          getSpotifyType(url);


        if (type !== "track") {

          showError(
            "Link tersebut bukan Spotify Track."
          );

          return;

        }


        hideResults();

        showLoading(
          "Getting track...",
          "Mengambil informasi track Spotify"
        );


        try {

          const track =
            await getTrackInfo(
              url
            );


          if (
            !track ||
            Object.keys(track).length === 0
          ) {

            throw new Error(
              "Data track tidak ditemukan."
            );

          }


          renderTrack(
            track
          );


          hideLoading();


          if (trackResult) {

            trackResult.classList.remove(
              "hidden"
            );

            trackResult.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

          }


          showToast(
            "Track berhasil ditemukan"
          );


        } catch (error) {

          hideLoading();

          showError(
            error.message ||
            "Gagal mengambil track."
          );

        }

      }
    );

  }


  /* =======================================================
     PLAYLIST BUTTON
  ======================================================= */

  if (playlistBtn) {

    playlistBtn.addEventListener(
      "click",
      async () => {

        const url =
          getInputUrl();


        if (!url) {

          showError(
            "Masukkan link Spotify terlebih dahulu."
          );

          return;

        }


        const type =
          getSpotifyType(url);


        if (type !== "playlist") {

          showError(
            "Link tersebut bukan Spotify Playlist."
          );

          return;

        }


        hideResults();

        showLoading(
          "Getting playlist...",
          "Mengambil informasi playlist Spotify"
        );


        try {

          const playlist =
            await getPlaylistInfo(
              url
            );


          if (
            !playlist ||
            Object.keys(
              playlist
            ).length === 0
          ) {

            throw new Error(
              "Data playlist tidak ditemukan."
            );

          }


          renderPlaylist(
            playlist
          );


          hideLoading();


          if (playlistResult) {

            playlistResult.classList.remove(
              "hidden"
            );

            playlistResult.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

          }


          showToast(
            "Playlist berhasil ditemukan"
          );


        } catch (error) {

          hideLoading();

          showError(
            error.message ||
            "Gagal mengambil playlist."
          );

        }

      }
    );

  }


  /* =======================================================
     DOWNLOAD TRACK
  ======================================================= */

  if (downloadBtn) {

    downloadBtn.addEventListener(
      "click",
      async () => {

        const track =
          window.currentTrack;


        if (!track) {

          showToast(
            "Track belum tersedia"
          );

          return;

        }


        /*
         * Cegah double click.
         */

        if (
          downloadBtn.disabled
        ) {

          return;

        }


        downloadBtn.disabled =
          true;


        const originalHTML =
          downloadBtn.innerHTML;


        try {

          showLoading(
            "Preparing download...",
            "Membuat proses download MP3"
          );


          /*
           * 1. Buat job
           */

          const jobId =
            await createDownloadJob(
              getInputUrl(),
              "mp3"
            );


          /*
           * 2. Poll status
           */

          const downloadLink =
            await waitForDownload(
              jobId
            );


          hideLoading();


          /*
           * 3. Buka hasil download
           */

          if (downloadLink) {

            window.open(
              downloadLink,
              "_blank",
              "noopener,noreferrer"
            );


            showToast(
              "Download siap dimulai"
            );

          } else {

            throw new Error(
              "Link download kosong."
            );

          }


        } catch (error) {

          hideLoading();

          showError(
            error.message ||
            "Gagal memproses download."
          );

        } finally {

          downloadBtn.disabled =
            false;

          downloadBtn.innerHTML =
            originalHTML;

        }

      }
    );

  }


  /* =======================================================
     COPY TRACK
  ======================================================= */

  if (copyTrack) {

    copyTrack.addEventListener(
      "click",
      async () => {

        const track =
          window.currentTrack;


        if (!track) {

          showToast(
            "Belum ada metadata"
          );

          return;

        }


        const text = [

          `Title: ${
            track.name ||
            track.title ||
            track.judul ||
            "-"
          }`,

          `Artist: ${
            getArtist(
              track.artist ||
              track.artis ||
              track.artists
            )
          }`,

          `Album: ${
            typeof track.album === "object"
              ? (
                  track.album?.name ||
                  "-"
                )
              : (
                  track.album ||
                  "-"
                )
          }`,

          `Duration: ${
            formatDuration(
              track.duration_ms ||
              track.duration ||
              track.durasi
            )
          }`

        ].join("\n");


        try {

          await navigator.clipboard.writeText(
            text
          );

          showToast(
            "Metadata berhasil disalin"
          );

        } catch (error) {

          showToast(
            "Gagal menyalin metadata"
          );

        }

      }
    );

  }


  /* =======================================================
     COPY PLAYLIST
  ======================================================= */

  if (copyPlaylist) {

    copyPlaylist.addEventListener(
      "click",
      async () => {

        const playlist =
          window.currentPlaylist;


        if (!playlist) {

          showToast(
            "Belum ada playlist"
          );

          return;

        }


        const tracks =
          playlist.tracks ||
          [];


        const lines = [

          `Playlist: ${
            playlist.name ||
            playlist.title ||
            "-"
          }`,

          `Owner: ${
            typeof playlist.owner === "object"
              ? (
                  playlist.owner?.display_name ||
                  playlist.owner?.name ||
                  "-"
                )
              : (
                  playlist.owner ||
                  "-"
                )
          }`,

          `Total: ${
            tracks.length
          } tracks`,

          "",

          ...tracks.map(
            (
              track,
              index
            ) => {

              const artist =
                getArtist(
                  track.artist ||
                  track.artists
                );


              return (
                `${index + 1}. ` +
                `${
                  track.name ||
                  track.title ||
                  "-"
                } — ${artist}`
              );

            }
          )

        ];


        try {

          await navigator.clipboard.writeText(
            lines.join("\n")
          );

          showToast(
            "Metadata playlist disalin"
          );

        } catch (error) {

          showToast(
            "Gagal menyalin metadata"
          );

        }

      }
    );

  }


  /* =======================================================
     IMAGE FALLBACK
  ======================================================= */

  document.addEventListener(
    "error",
    event => {

      const element =
        event.target;


      if (
        element &&
        element.tagName === "IMG"
      ) {

        if (
          element.dataset.fallbackDone
        ) {

          return;

        }


        element.dataset.fallbackDone =
          "1";


        element.src =
          "/logo.png";

      }

    },
    true
  );


  /* =======================================================
     FINISH
  ======================================================= */

  console.log(
    "%cSpotyLoad initialized",
    "color:#1ed760;font-weight:bold;"
  );

});