/* =========================================================
   SPOTYLOAD APP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

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


  /* =======================================================
     WELCOME POPUP
  ======================================================= */

  let welcomeFinished = false;

  function closeWelcome(){

    if(!welcomeModal){
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


  function showContinueButton(){

    if(!continueBtn){
      return;
    }

    continueBtn.classList.remove("hidden");

    continueBtn.classList.add("ready");

    continueBtn.disabled = false;
  }


  function startWelcome(){

    if(!welcomeModal){
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
      Tombol langsung tersedia setelah popup
      selesai tampil.
    */

    setTimeout(() => {
      showContinueButton();
    }, 1200);
  }


  /*
    Kalau user sudah pernah masuk sebelumnya,
    popup tidak perlu muncul lagi.
  */

  try{

    const alreadyEntered =
      localStorage.getItem(
        "spotyload_welcome_done"
      );

    if(alreadyEntered === "1"){

      welcomeFinished = true;

      if(welcomeModal){
        welcomeModal.style.display = "none";

        welcomeModal.setAttribute(
          "aria-hidden",
          "true"
        );
      }

      document.body.style.overflow = "";

    }else{

      startWelcome();

    }

  }catch(error){

    startWelcome();

  }


  /* =======================================================
     CONTINUE BUTTON
  ======================================================= */

  if(continueBtn){

    continueBtn.addEventListener(
      "click",
      () => {

        welcomeFinished = true;

        try{

          localStorage.setItem(
            "spotyload_welcome_done",
            "1"
          );

        }catch(error){

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

  if(followChannelBtn){

    followChannelBtn.addEventListener(
      "click",
      () => {

        /*
          Tombol Follow hanya membuka channel.
          Setelah kembali ke website,
          tombol Lanjutkan tetap tersedia.
        */

        setTimeout(() => {
          showContinueButton();
        }, 500);

      }
    );

  }


  /* =======================================================
     ESCAPE
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if(
        event.key === "Escape" &&
        welcomeModal &&
        !welcomeModal.classList.contains("hide")
      ){

        /*
          Jangan tutup popup menggunakan ESC.
          User harus menekan Lanjutkan.
        */

        event.preventDefault();

      }

    }
  );


  /* =======================================================
     TOAST
  ======================================================= */

  let toastTimer = null;

  function showToast(message){

    if(!toast){
      return;
    }

    if(toastText){
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

  function showError(message){

    if(!errorBox){
      return;
    }

    if(errorText){
      errorText.textContent =
        message || "Terjadi kesalahan.";
    }

    errorBox.classList.remove("hidden");

    errorBox.scrollIntoView({
      behavior:"smooth",
      block:"center"
    });

  }


  function hideError(){

    if(errorBox){
      errorBox.classList.add("hidden");
    }

  }


  if(closeError){

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
    text = "Please wait"
  ){

    hideError();

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


  /* =======================================================
     PASTE
  ======================================================= */

  if(pasteBtn){

    pasteBtn.addEventListener(
      "click",
      async () => {

        try{

          const text =
            await navigator.clipboard.readText();

          if(!text){

            showToast(
              "Clipboard kosong"
            );

            return;

          }

          if(urlInput){
            urlInput.value = text;

            urlInput.dispatchEvent(
              new Event(
                "input",
                { bubbles:true }
              )
            );

            urlInput.focus();
          }

          showToast(
            "Link berhasil ditempel"
          );

        }catch(error){

          showToast(
            "Tidak bisa membaca clipboard"
          );

        }

      }
    );

  }


  /* =======================================================
     CLEAR INPUT
  ======================================================= */

  if(clearBtn){

    clearBtn.addEventListener(
      "click",
      () => {

        if(urlInput){

          urlInput.value = "";

          urlInput.focus();

          urlInput.dispatchEvent(
            new Event(
              "input",
              { bubbles:true }
            )
          );

        }

      }
    );

  }


  /* =======================================================
     URL INPUT
  ======================================================= */

  if(urlInput){

    urlInput.addEventListener(
      "input",
      () => {

        hideError();

      }
    );


    urlInput.addEventListener(
      "keydown",
      event => {

        if(event.key !== "Enter"){
          return;
        }

        event.preventDefault();

        if(trackBtn){
          trackBtn.click();
        }

      }
    );

  }


  /* =======================================================
     SPOTIFY URL VALIDATION
  ======================================================= */

  function getSpotifyType(url){

    if(!url){
      return null;
    }

    const value =
      url.trim();

    /*
      Support:

      https://open.spotify.com/track/...
      https://open.spotify.com/playlist/...
      spotify:track:...
      spotify:playlist:...
    */

    if(
      /open\.spotify\.com\/track\//i.test(value) ||
      /^spotify:track:/i.test(value)
    ){

      return "track";

    }


    if(
      /open\.spotify\.com\/playlist\//i.test(value) ||
      /^spotify:playlist:/i.test(value)
    ){

      return "playlist";

    }


    return null;

  }


  function getInputUrl(){

    if(!urlInput){
      return "";
    }

    return urlInput.value.trim();

  }


  /* =======================================================
     API HELPER
  ======================================================= */

  async function requestAPI(
    endpoint,
    url
  ){

    const response =
      await fetch(
        endpoint,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({
            url:url
          })
        }
      );


    let data = null;

    try{

      data =
        await response.json();

    }catch(error){

      data = null;

    }


    if(!response.ok){

      throw new Error(
        data?.message ||
        data?.error ||
        `Request failed (${response.status})`
      );

    }


    return data;

  }


  /* =======================================================
     HIDE RESULTS
  ======================================================= */

  function hideResults(){

    if(trackResult){
      trackResult.classList.add("hidden");
    }

    if(playlistResult){
      playlistResult.classList.add("hidden");
    }

  }


  /* =======================================================
     GET TRACK
     
     NOTE:
     Endpoint disesuaikan dengan backend kamu.
     Kalau backend memakai route berbeda,
     ubah TRACK_API di bawah.
  ======================================================= */

  const TRACK_API =
    "/api/track";


  const PLAYLIST_API =
    "/api/playlist";


  if(trackBtn){

    trackBtn.addEventListener(
      "click",
      async () => {

        const url =
          getInputUrl();

        if(!url){

          showError(
            "Masukkan link Spotify terlebih dahulu."
          );

          return;

        }


        const type =
          getSpotifyType(url);


        if(type !== "track"){

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


        try{

          const data =
            await requestAPI(
              TRACK_API,
              url
            );


          renderTrack(data);

          hideLoading();


          if(trackResult){

            trackResult.classList.remove(
              "hidden"
            );

            trackResult.scrollIntoView({
              behavior:"smooth",
              block:"start"
            });

          }

        }catch(error){

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
     GET PLAYLIST
  ======================================================= */

  if(playlistBtn){

    playlistBtn.addEventListener(
      "click",
      async () => {

        const url =
          getInputUrl();

        if(!url){

          showError(
            "Masukkan link Spotify terlebih dahulu."
          );

          return;

        }


        const type =
          getSpotifyType(url);


        if(type !== "playlist"){

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


        try{

          const data =
            await requestAPI(
              PLAYLIST_API,
              url
            );


          renderPlaylist(data);

          hideLoading();


          if(playlistResult){

            playlistResult.classList.remove(
              "hidden"
            );

            playlistResult.scrollIntoView({
              behavior:"smooth",
              block:"start"
            });

          }

        }catch(error){

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
     TRACK RENDER
  ======================================================= */

  function renderTrack(data){

    const title =
      document.getElementById("title");

    const artist =
      document.getElementById("artist");

    const album =
      document.getElementById("album");

    const duration =
      document.getElementById("duration");

    const cover =
      document.getElementById("cover");


    const result =
      data?.data ||
      data?.result ||
      data ||
      {};


    if(title){

      title.textContent =
        result.title ||
        result.name ||
        "Unknown Track";

    }


    if(artist){

      artist.textContent =
        result.artist ||
        result.artists?.map(
          artist => artist.name || artist
        ).join(", ") ||
        "Unknown Artist";

    }


    if(album){

      album.textContent =
        result.album ||
        result.album?.name ||
        "Unknown Album";

    }


    if(duration){

      duration.textContent =
        formatDuration(
          result.duration ||
          result.duration_ms
        );

    }


    if(cover){

      const image =
        result.cover ||
        result.cover_url ||
        result.image ||
        result.thumbnail ||
        result.album?.images?.[0]?.url;


      if(image){

        cover.src = image;

      }

    }


    window.currentTrack =
      result;

  }


  /* =======================================================
     PLAYLIST RENDER
  ======================================================= */

  function renderPlaylist(data){

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


    const result =
      data?.data ||
      data?.result ||
      data ||
      {};


    const tracks =
      result.tracks ||
      result.items ||
      [];


    if(playlistTitle){

      playlistTitle.textContent =
        result.title ||
        result.name ||
        "Spotify Playlist";

    }


    if(playlistOwner){

      playlistOwner.textContent =
        result.owner ||
        result.owner?.display_name ||
        "Unknown owner";

    }


    if(playlistCover){

      const image =
        result.cover ||
        result.cover_url ||
        result.image ||
        result.thumbnail ||
        result.images?.[0]?.url;


      if(image){

        playlistCover.src =
          image;

      }

    }


    if(playlistCount){

      playlistCount.textContent =
        `${tracks.length} tracks`;

    }


    if(playlistList){

      playlistList.innerHTML = "";


      tracks.forEach(
        (track,index) => {

          const item =
            document.createElement(
              "div"
            );

          item.className =
            "playlist-item";


          const image =
            track.cover ||
            track.cover_url ||
            track.image ||
            track.thumbnail ||
            track.album?.images?.[0]?.url ||
            "/logo.png";


          const title =
            track.title ||
            track.name ||
            "Unknown Track";


          const artist =
            track.artist ||
            track.artists?.map(
              artist =>
                artist.name ||
                artist
            ).join(", ") ||
            "Unknown Artist";


          const duration =
            formatDuration(
              track.duration ||
              track.duration_ms
            );


          item.innerHTML = `

            <span class="playlist-number">
              ${index + 1}
            </span>

            <img
              class="playlist-image"
              src="${escapeHTML(image)}"
              alt=""
              loading="lazy"
            >

            <div class="playlist-track">

              <strong>
                ${escapeHTML(title)}
              </strong>

              <span>
                ${escapeHTML(artist)}
              </span>

            </div>

            <span class="playlist-duration">
              ${duration}
            </span>

          `;


          playlistList.appendChild(
            item
          );

        }
      );

    }


    window.currentPlaylist =
      result;

  }


  /* =======================================================
     DURATION
  ======================================================= */

  function formatDuration(value){

    if(!value){
      return "0:00";
    }


    let seconds =
      Number(value);


    if(
      Number.isNaN(seconds)
    ){

      return "0:00";

    }


    /*
      Kalau API memberikan milliseconds.
    */

    if(seconds > 1000){

      seconds =
        Math.floor(
          seconds / 1000
        );

    }else{

      seconds =
        Math.floor(seconds);

    }


    const minutes =
      Math.floor(
        seconds / 60
      );


    const remaining =
      seconds % 60;


    return `${minutes}:${String(
      remaining
    ).padStart(2,"0")}`;

  }


  /* =======================================================
     ESCAPE HTML
  ======================================================= */

  function escapeHTML(value){

    return String(value ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");

  }


  /* =======================================================
     COPY TRACK
  ======================================================= */

  const copyTrack =
    document.getElementById(
      "copyTrack"
    );


  if(copyTrack){

    copyTrack.addEventListener(
      "click",
      async () => {

        const track =
          window.currentTrack;


        if(!track){

          showToast(
            "Belum ada metadata"
          );

          return;

        }


        const text = [

          `Title: ${
            track.title ||
            track.name ||
            "-"
          }`,

          `Artist: ${
            track.artist ||
            "-"
          }`,

          `Album: ${
            track.album ||
            "-"
          }`

        ].join("\n");


        try{

          await navigator.clipboard.writeText(
            text
          );

          showToast(
            "Metadata berhasil disalin"
          );

        }catch(error){

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

  const copyPlaylist =
    document.getElementById(
      "copyPlaylist"
    );


  if(copyPlaylist){

    copyPlaylist.addEventListener(
      "click",
      async () => {

        const playlist =
          window.currentPlaylist;


        if(!playlist){

          showToast(
            "Belum ada playlist"
          );

          return;

        }


        const tracks =
          playlist.tracks ||
          playlist.items ||
          [];


        const lines = [

          `Playlist: ${
            playlist.title ||
            playlist.name ||
            "-"
          }`,

          `Owner: ${
            playlist.owner ||
            "-"
          }`,

          "",

          ...tracks.map(
            (track,index) =>
              `${index + 1}. ${
                track.title ||
                track.name ||
                "-"
              } — ${
                track.artist ||
                "Unknown Artist"
              }`
          )

        ];


        try{

          await navigator.clipboard.writeText(
            lines.join("\n")
          );

          showToast(
            "Metadata playlist disalin"
          );

        }catch(error){

          showToast(
            "Gagal menyalin metadata"
          );

        }

      }
    );

  }


  /* =======================================================
     DOWNLOAD TRACK
  ======================================================= */

  const downloadBtn =
    document.getElementById(
      "downloadBtn"
    );


  if(downloadBtn){

    downloadBtn.addEventListener(
      "click",
      async () => {

        const track =
          window.currentTrack;


        if(!track){

          showToast(
            "Track belum tersedia"
          );

          return;

        }


        /*
          Jika API sudah mengirim URL download,
          langsung buka URL tersebut.
        */

        const downloadUrl =
          track.download ||
          track.download_url ||
          track.url;


        if(downloadUrl){

          window.open(
            downloadUrl,
            "_blank",
            "noopener"
          );

          showToast(
            "Download dimulai"
          );

          return;

        }


        showToast(
          "URL download belum tersedia"
        );

      }
    );

  }


  /* =======================================================
     FINISH
  ======================================================= */

  console.log(
    "SpotyLoad initialized."
  );

});