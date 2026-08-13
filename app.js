const $ = (selector) =>
  document.querySelector(selector);

const urlInput = $("#url");

const loading = $("#loading");
const loadingTitle = $("#loadingTitle");
const loadingText = $("#loadingText");

const errorBox = $("#errorBox");
const errorText = $("#errorText");

const trackResult = $("#trackResult");
const playlistResult = $("#playlistResult");

const fallbackImage =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg"
      width="500"
      height="500">

      <rect
        width="100%"
        height="100%"
        fill="#101416"
      />

      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="#1ed760"
        font-size="110">
        ♪
      </text>

    </svg>
  `);


/* =========================================
   HELPERS
========================================= */

function resetResults(){

  trackResult.classList.add("hidden");
  playlistResult.classList.add("hidden");

}

function showLoading(title,text){

  loadingTitle.textContent = title;
  loadingText.textContent = text;

  loading.classList.remove("hidden");

}

function hideLoading(){

  loading.classList.add("hidden");

}

function showError(message){

  hideLoading();

  errorText.textContent =
    message || "Terjadi kesalahan.";

  errorBox.classList.remove("hidden");

}

function hideError(){

  errorBox.classList.add("hidden");

}

function validSpotifyUrl(value){

  try{

    const u = new URL(value);

    return (
      u.hostname === "open.spotify.com" ||
      u.hostname === "spotify.com" ||
      u.hostname.endsWith(".spotify.com")
    );

  }catch{

    return false;

  }

}

async function apiRequest(endpoint,options = {}){

  const response =
    await fetch(
      endpoint,
      options
    );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if(
    !response.ok ||
    data.success === false
  ){

    throw new Error(
      data.message ||
      `Request gagal (${response.status})`
    );

  }

  return data;

}

function escapeHTML(value){

  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* =========================================
   TOAST
========================================= */

let toastTimer;

function toast(message){

  const el =
    $("#toast");

  $("#toastText").textContent =
    message;

  el.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      el.classList.remove("show");

    },2200);

}


/* =========================================
   HISTORY
========================================= */

const HISTORY_KEY =
  "spotyload_history";

function getHistory(){

  try{

    return JSON.parse(
      localStorage.getItem(
        HISTORY_KEY
      )
    ) || [];

  }catch{

    return [];

  }

}

function saveHistory(link){

  let history =
    getHistory();

  history =
    history.filter(
      item => item !== link
    );

  history.unshift(link);

  history =
    history.slice(0,8);

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history)
  );

  renderHistory();

}

function renderHistory(){

  const history =
    getHistory();

  const section =
    $("#historySection");

  const list =
    $("#historyList");

  if(!history.length){

    section.classList.add(
      "hidden"
    );

    return;

  }

  section.classList.remove(
    "hidden"
  );

  list.innerHTML = "";

  history.forEach(link => {

    const item =
      document.createElement("div");

    item.className =
      "history-item";

    item.innerHTML = `

      <div class="history-icon">
        ↗
      </div>

      <div>

        <strong>
          ${escapeHTML(link)}
        </strong>

        <span>
          Tap untuk menggunakan kembali
        </span>

      </div>

      <div>
        →
      </div>

    `;

    item.addEventListener(
      "click",
      () => {

        urlInput.value =
          link;

        window.scrollTo({
          top:0,
          behavior:"smooth"
        });

      }
    );

    list.appendChild(item);

  });

}


/* =========================================
   PASTE
========================================= */

$("#pasteBtn")
  .addEventListener(
    "click",
    async () => {

      try{

        const text =
          await navigator.clipboard.readText();

        if(!text){

          toast(
            "Clipboard kosong"
          );

          return;

        }

        urlInput.value =
          text.trim();

        toast(
          "Link berhasil ditempel"
        );

        urlInput.focus();

      }catch{

        toast(
          "Clipboard tidak tersedia"
        );

      }

    }
  );


/* =========================================
   CLEAR
========================================= */

$("#clearBtn")
  .addEventListener(
    "click",
    () => {

      urlInput.value = "";

      resetResults();

      hideError();

      urlInput.focus();

    }
  );


/* =========================================
   CLOSE ERROR
========================================= */

$("#closeError")
  .addEventListener(
    "click",
    hideError
  );


/* =========================================
   GET TRACK
========================================= */

$("#trackBtn")
  .addEventListener(
    "click",
    getTrack
  );

async function getTrack(){

  const url =
    urlInput.value.trim();

  hideError();

  resetResults();

  if(!url){

    showError(
      "Masukkan link Spotify terlebih dahulu."
    );

    return;

  }

  if(!validSpotifyUrl(url)){

    showError(
      "Link Spotify tidak valid."
    );

    return;

  }

  saveHistory(url);

  showLoading(
    "Getting track",
    "Mengambil informasi lagu..."
  );

  try{

    const response =
      await apiRequest(
        "/api/info?url=" +
        encodeURIComponent(url)
      );

    const data =
      response.data;

    $("#title").textContent =
      data.judul || "Unknown";

    $("#artist").textContent =
      data.artis || "Unknown";

    $("#album").textContent =
      data.album || "Unknown";

    $("#duration").textContent =
      data.durasi || "0:00";

    const cover =
      $("#cover");

    cover.src =
      data.thumbnail ||
      fallbackImage;

    cover.onerror =
      () => {

        cover.src =
          fallbackImage;

      };

    hideLoading();

    trackResult.classList.remove(
      "hidden"
    );

    trackResult.scrollIntoView({
      behavior:"smooth",
      block:"center"
    });

    toast(
      "Track berhasil ditemukan"
    );

  }catch(error){

    showError(
      error.message
    );

  }

}


/* =========================================
   GET PLAYLIST
========================================= */

$("#playlistBtn")
  .addEventListener(
    "click",
    getPlaylist
  );

async function getPlaylist(){

  const url =
    urlInput.value.trim();

  hideError();

  resetResults();

  if(!url){

    showError(
      "Masukkan link playlist Spotify."
    );

    return;

  }

  if(!validSpotifyUrl(url)){

    showError(
      "Link Spotify tidak valid."
    );

    return;

  }

  saveHistory(url);

  showLoading(
    "Getting playlist",
    "Mengambil daftar lagu..."
  );

  try{

    const response =
      await apiRequest(
        "/api/playlist",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              url
            })
        }
      );

    const data =
      response.data;

    $("#playlistTitle")
      .textContent =
      data.judul ||
      "Unknown Playlist";

    $("#playlistOwner")
      .textContent =
      data.owner
        ? `by ${data.owner}`
        : "Spotify Playlist";

    $("#playlistCount")
      .textContent =
      `${data.total_lagu || 0} tracks`;

    const cover =
      $("#playlistCover");

    cover.src =
      data.thumbnail ||
      fallbackImage;

    cover.onerror =
      () => {

        cover.src =
          fallbackImage;

      };

    renderPlaylist(
      data.daftar_lagu || []
    );

    hideLoading();

    playlistResult.classList.remove(
      "hidden"
    );

    playlistResult.scrollIntoView({
      behavior:"smooth",
      block:"center"
    });

    toast(
      "Playlist berhasil ditemukan"
    );

  }catch(error){

    showError(
      error.message
    );

  }

}


/* =========================================
   RENDER PLAYLIST
========================================= */

function renderPlaylist(
  tracks
){

  const list =
    $("#playlistList");

  list.innerHTML = "";

  if(!tracks.length){

    list.innerHTML = `

      <div class="info-card">

        <div class="info-icon">
          !
        </div>

        <div>

          <strong>
            Playlist kosong
          </strong>

          <p>
            Tidak ada track yang ditemukan.
          </p>

        </div>

      </div>

    `;

    return;

  }

  tracks.forEach(
    (track,index) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "playlist-item";

      item.style.animation =
        `resultIn .35s ease ${index * .025}s both`;

      item.innerHTML = `

        <div class="playlist-number">
          ${index + 1}
        </div>

        <img
          class="playlist-image"
          src="${escapeHTML(
            track.thumbnail ||
            fallbackImage
          )}"
          alt=""
        >

        <div class="playlist-track">

          <strong>
            ${escapeHTML(
              track.judul ||
              "-"
            )}
          </strong>

          <span>
            ${escapeHTML(
              track.artis ||
              "-"
            )}

            ${
              track.album
                ? " • " +
                  escapeHTML(
                    track.album
                  )
                : ""
            }

          </span>

        </div>

        <div class="playlist-duration">

          ${escapeHTML(
            track.durasi ||
            "0:00"
          )}

        </div>

      `;

      const image =
        item.querySelector(
          "img"
        );

      image.onerror =
        () => {

          image.src =
            fallbackImage;

        };

      list.appendChild(
        item
      );

    }
  );

}


/* =========================================
   DOWNLOAD
========================================= */

$("#downloadBtn")
  .addEventListener(
    "click",
    downloadTrack
  );

async function downloadTrack(){

  const url =
    urlInput.value.trim();

  const button =
    $("#downloadBtn");

  const normal =
    button.querySelector(
      ".download-normal"
    );

  const loadingState =
    button.querySelector(
      ".download-loading"
    );

  const status =
    $("#downloadStatus");

  if(!url){

    showError(
      "Link Spotify tidak ditemukan."
    );

    return;

  }

  try{

    button.disabled =
      true;

    normal.classList.add(
      "hidden"
    );

    loadingState.classList.remove(
      "hidden"
    );

    status.textContent =
      "Creating download job...";

    const response =
      await apiRequest(
        "/api/download",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              url,
              format:"mp3"
            })
        }
      );

    const jobId =
      response.jobId;

    for(
      let i = 0;
      i < 80;
      i++
    ){

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            2500
          )
      );

      status.textContent =
        `Processing... ${i + 1}/80`;

      const result =
        await apiRequest(
          "/api/status/" +
          encodeURIComponent(
            jobId
          )
        );

      const data =
        result.data;

      if(
        data.status === "ready" &&
        data.downloadLink
      ){

        status.textContent =
          "Download ready";

        window.open(
          data.downloadLink,
          "_blank",
          "noopener"
        );

        toast(
          "Download siap!"
        );

        resetDownloadButton();

        return;

      }

      if(
        data.status === "error"
      ){

        throw new Error(
          "Download gagal diproses server."
        );

      }

    }

    throw new Error(
      "Timeout menunggu proses download."
    );

  }catch(error){

    resetDownloadButton();

    showError(
      error.message
    );

  }

}

function resetDownloadButton(){

  const button =
    $("#downloadBtn");

  const normal =
    button.querySelector(
      ".download-normal"
    );

  const loadingState =
    button.querySelector(
      ".download-loading"
    );

  button.disabled =
    false;

  normal.classList.remove(
    "hidden"
  );

  loadingState.classList.add(
    "hidden"
  );

}


/* =========================================
   COPY TRACK
========================================= */

$("#copyTrack")
  .addEventListener(
    "click",
    async () => {

      const text = `

${$("#title").textContent}

Artist:
${$("#artist").textContent}

Album:
${$("#album").textContent}

Duration:
${$("#duration").textContent}

Spotify:
${urlInput.value}

      `.trim();

      try{

        await navigator.clipboard
          .writeText(text);

        toast(
          "Metadata berhasil dicopy"
        );

      }catch{

        toast(
          "Gagal menyalin"
        );

      }

    }
  );


/* =========================================
   COPY PLAYLIST
========================================= */

$("#copyPlaylist")
  .addEventListener(
    "click",
    async () => {

      const title =
        $("#playlistTitle")
          .textContent;

      const owner =
        $("#playlistOwner")
          .textContent;

      const items =
        [
          ...document.querySelectorAll(
            ".playlist-track strong"
          )
        ];

      const text =
        [
          title,
          owner,
          "",
          ...items.map(
            (item,index) =>
              `${index + 1}. ${item.textContent}`
          )
        ].join("\n");

      try{

        await navigator.clipboard
          .writeText(text);

        toast(
          "Playlist berhasil dicopy"
        );

      }catch{

        toast(
          "Gagal menyalin"
        );

      }

    }
  );


/* =========================================
   CLEAR HISTORY
========================================= */

$("#clearHistory")
  .addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        HISTORY_KEY
      );

      renderHistory();

      toast(
        "History dibersihkan"
      );

    }
  );


/* =========================================
   ENTER KEY
========================================= */

urlInput.addEventListener(
  "keydown",
  event => {

    if(
      event.key === "Enter"
    ){

      getTrack();

    }

  }
);


/* =========================================
   INITIAL
========================================= */

renderHistory();