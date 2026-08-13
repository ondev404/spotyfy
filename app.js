const $ = selector => document.querySelector(selector);


/* =====================================================
   WELCOME POPUP
===================================================== */

const welcomeModal = $("#welcomeModal");
const continueBtn = $("#continueBtn");

if (welcomeModal && continueBtn) {

  // Tombol lanjut muncul setelah 2 detik
  setTimeout(() => {

    continueBtn.classList.remove("hidden");

    requestAnimationFrame(() => {
      continueBtn.classList.add("show");
    });

  }, 2000);


  // Tutup popup
  continueBtn.addEventListener("click", () => {

    welcomeModal.classList.add("closing");

    setTimeout(() => {

      welcomeModal.classList.add("hidden");

      document.body.classList.remove(
        "modal-open"
      );

    }, 450);

  });

}


/* =====================================================
   ELEMENTS
===================================================== */

const urlInput = $("#url");

const loading = $("#loading");
const loadingTitle = $("#loadingTitle");
const loadingText = $("#loadingText");

const errorBox = $("#errorBox");
const errorText = $("#errorText");

const trackResult = $("#trackResult");
const playlistResult = $("#playlistResult");


/* =====================================================
   FALLBACK IMAGE
===================================================== */

const fallbackImage =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg"
      width="500"
      height="500">

      <rect
        width="100%"
        height="100%"
        fill="#101416"/>

      <circle
        cx="250"
        cy="250"
        r="90"
        fill="none"
        stroke="#1ed760"
        stroke-width="8"/>

      <path
        d="M230 190v120l100-60z"
        fill="#1ed760"/>

    </svg>
  `);


/* =====================================================
   RESET RESULTS
===================================================== */

function resetResults(){

  if(trackResult){
    trackResult.classList.add("hidden");
  }

  if(playlistResult){
    playlistResult.classList.add("hidden");
  }

}


/* =====================================================
   LOADING
===================================================== */

function showLoading(title, text){

  if(loadingTitle){
    loadingTitle.textContent = title;
  }

  if(loadingText){
    loadingText.textContent = text;
  }

  if(loading){
    loading.classList.remove("hidden");
  }

}


function hideLoading(){

  if(loading){
    loading.classList.add("hidden");
  }

}


/* =====================================================
   ERROR
===================================================== */

function showError(message){

  hideLoading();

  if(errorText){
    errorText.textContent =
      message || "Terjadi kesalahan.";
  }

  if(errorBox){
    errorBox.classList.remove("hidden");
  }

}


function hideError(){

  if(errorBox){
    errorBox.classList.add("hidden");
  }

}


/* =====================================================
   URL VALIDATION
===================================================== */

function validSpotifyUrl(value){

  try{

    const url = new URL(value);

    return (
      url.hostname === "open.spotify.com" ||
      url.hostname === "spotify.com" ||
      url.hostname.endsWith(".spotify.com")
    );

  }catch{

    return false;

  }

}


/* =====================================================
   API REQUEST
===================================================== */

async function apiRequest(endpoint, options = {}){

  const response = await fetch(
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


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value){

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;

function toast(message){

  const element = $("#toast");

  if(!element){
    return;
  }

  const text = $("#toastText");

  if(text){
    text.textContent = message;
  }

  element.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    element.classList.remove("show");

  }, 2200);

}


/* =====================================================
   HISTORY
   Tetap tersedia supaya app.js tidak error.
===================================================== */

const HISTORY_KEY = "spotyload_history";


function getHistory(){

  try{

    return JSON.parse(
      localStorage.getItem(HISTORY_KEY)
    ) || [];

  }catch{

    return [];

  }

}


function saveHistory(link){

  let history = getHistory();

  history = history.filter(
    item => item !== link
  );

  history.unshift(link);

  history = history.slice(0, 8);

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history)
  );

}


/* =====================================================
   PASTE
===================================================== */

const pasteBtn = $("#pasteBtn");

if(pasteBtn){

  pasteBtn.addEventListener(
    "click",
    async () => {

      try{

        if(
          !navigator.clipboard ||
          !navigator.clipboard.readText
        ){

          throw new Error();
        }

        const text =
          await navigator.clipboard.readText();

        if(!text){

          toast("Clipboard kosong");

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

}


/* =====================================================
   CLEAR INPUT
===================================================== */

const clearBtn = $("#clearBtn");

if(clearBtn){

  clearBtn.addEventListener(
    "click",
    () => {

      urlInput.value = "";

      resetResults();

      hideError();

      urlInput.focus();

    }
  );

}


/* =====================================================
   ERROR CLOSE
===================================================== */

const closeError = $("#closeError");

if(closeError){

  closeError.addEventListener(
    "click",
    hideError
  );

}


/* =====================================================
   GET TRACK
===================================================== */

const trackBtn = $("#trackBtn");

if(trackBtn){

  trackBtn.addEventListener(
    "click",
    getTrack
  );

}


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


    if(cover){

      cover.src =
        data.thumbnail ||
        fallbackImage;

      cover.onerror = () => {

        cover.src =
          fallbackImage;

      };

    }


    hideLoading();


    trackResult.classList.remove(
      "hidden"
    );


    setTimeout(() => {

      trackResult.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }, 100);


    toast(
      "Track berhasil ditemukan"
    );


  }catch(error){

    showError(
      error.message
    );

  }

}


/* =====================================================
   GET PLAYLIST
===================================================== */

const playlistBtn =
  $("#playlistBtn");

if(playlistBtn){

  playlistBtn.addEventListener(
    "click",
    getPlaylist
  );

}


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
          method: "POST",

          headers: {
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


    $("#playlistTitle").textContent =
      data.judul ||
      "Unknown Playlist";


    $("#playlistOwner").textContent =
      data.owner
        ? `by ${data.owner}`
        : "Spotify Playlist";


    $("#playlistCount").textContent =
      `${data.total_lagu || 0} tracks`;


    const cover =
      $("#playlistCover");


    if(cover){

      cover.src =
        data.thumbnail ||
        fallbackImage;

      cover.onerror = () => {

        cover.src =
          fallbackImage;

      };

    }


    renderPlaylist(
      data.daftar_lagu || []
    );


    hideLoading();


    playlistResult.classList.remove(
      "hidden"
    );


    setTimeout(() => {

      playlistResult.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }, 100);


    toast(
      "Playlist berhasil ditemukan"
    );


  }catch(error){

    showError(
      error.message
    );

  }

}


/* =====================================================
   RENDER PLAYLIST
===================================================== */

function renderPlaylist(tracks){

  const list =
    $("#playlistList");

  if(!list){
    return;
  }

  list.innerHTML = "";


  if(!tracks.length){

    list.innerHTML = `

      <div class="info-card">

        <div class="info-icon">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >

            <circle
              cx="12"
              cy="12"
              r="9"
            ></circle>

            <path d="M12 7v6"></path>

            <path d="M12 16h.01"></path>

          </svg>

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
    (track, index) => {

      const item =
        document.createElement("div");


      item.className =
        "playlist-item";


      item.style.animation =
        `resultIn .35s ease ${
          index * 0.025
        }s both`;


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
              track.judul || "-"
            )}
          </strong>

          <span>

            ${escapeHTML(
              track.artis || "-"
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
        item.querySelector("img");


      if(image){

        image.onerror = () => {

          image.src =
            fallbackImage;

        };

      }


      list.appendChild(item);

    }
  );

}


/* =====================================================
   DOWNLOAD TRACK
===================================================== */

const downloadBtn =
  $("#downloadBtn");

if(downloadBtn){

  downloadBtn.addEventListener(
    "click",
    downloadTrack
  );

}


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

    button.disabled = true;


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
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              url,
              format: "mp3"
            })
        }
      );


    const jobId =
      response.jobId;


    if(!jobId){

      throw new Error(
        "Gagal membuat download job."
      );

    }


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
          encodeURIComponent(jobId)
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

  if(!button){
    return;
  }


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


  $("#downloadStatus")
    .textContent =
    "MP3";

}


/* =====================================================
   COPY TRACK
===================================================== */

const copyTrack =
  $("#copyTrack");


if(copyTrack){

  copyTrack.addEventListener(
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

}


/* =====================================================
   COPY PLAYLIST
===================================================== */

const copyPlaylist =
  $("#copyPlaylist");


if(copyPlaylist){

  copyPlaylist.addEventListener(
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
            (item, index) =>
              `${index + 1}. ${
                item.textContent.trim()
              }`
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

}


/* =====================================================
   ENTER KEY
===================================================== */

if(urlInput){

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

}


/* =====================================================
   INPUT INTERACTION
===================================================== */

if(urlInput){

  urlInput.addEventListener(
    "input",
    () => {

      if(errorBox){

        errorBox.classList.add(
          "hidden"
        );

      }

    }
  );

}


/* =====================================================
   BUTTON PRESS EFFECT
===================================================== */

document.addEventListener(
  "pointerdown",
  event => {

    const button =
      event.target.closest(
        "button"
      );

    if(!button){
      return;
    }

    button.classList.add(
      "pressing"
    );

  }
);


document.addEventListener(
  "pointerup",
  event => {

    const button =
      event.target.closest(
        "button"
      );

    if(!button){
      return;
    }

    button.classList.remove(
      "pressing"
    );

  }
);


document.addEventListener(
  "pointercancel",
  event => {

    const button =
      event.target.closest(
        "button"
      );

    if(!button){
      return;
    }

    button.classList.remove(
      "pressing"
    );

  }
);


/* =====================================================
   PREVENT DOUBLE SUBMIT
===================================================== */

let pageBusy = false;


/* =====================================================
   INITIAL
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // Fokus hanya kalau popup sudah ditutup.
    if(
      urlInput &&
      welcomeModal &&
      welcomeModal.classList.contains("hidden")
    ){

      urlInput.focus();

    }

  }
);