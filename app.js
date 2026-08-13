const $=s=>document.querySelector(s);
const url=$("#url"),loading=$("#loading"),error=$("#error"),trackResult=$("#trackResult"),playlistResult=$("#playlistResult");
const fallback="data:image/svg+xml;charset=UTF-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="100%" height="100%" fill="#11161b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#1ed760" font-size="100">♪</text></svg>');

function reset(){loading.classList.add("hidden");error.classList.add("hidden");trackResult.classList.add("hidden");playlistResult.classList.add("hidden")}
function err(msg){error.classList.remove("hidden");$("#errorText").textContent=msg}
function load(a,b){loading.classList.remove("hidden");$("#loadTitle").textContent=a;$("#loadText").textContent=b}
function valid(u){try{let x=new URL(u);return x.hostname==="open.spotify.com"||x.hostname==="spotify.com"||x.hostname.endsWith(".spotify.com")}catch{return false}}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
async function req(u,o={}){let r=await fetch(u,o),d=await r.json().catch(()=>({}));if(!r.ok||d.success===false)throw Error(d.message||`Request gagal (${r.status})`);return d}
function duration(ms){if(!ms)return"0:00";let s=Math.round(ms/1000);return`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`}

$("#track").onclick=async()=>{
  let u=url.value.trim();reset();
  if(!u)return err("Masukkan link Spotify terlebih dahulu.");
  if(!valid(u))return err("Link Spotify tidak valid.");
  load("Mengambil informasi lagu","Sedang mengambil metadata Spotify...");
  try{
    let r=await req("/api/info?url="+encodeURIComponent(u)),d=r.data;
    $("#title").textContent=d.judul||"-";$("#artist").textContent=d.artis||"-";$("#album").textContent=d.album||"-";$("#duration").textContent=d.durasi||"0:00";
    let im=$("#cover");im.src=d.thumbnail||fallback;im.onerror=()=>im.src=fallback;
    loading.classList.add("hidden");trackResult.classList.remove("hidden");trackResult.scrollIntoView({behavior:"smooth"});
  }catch(e){loading.classList.add("hidden");err(e.message)}
};

$("#playlist").onclick=async()=>{
  let u=url.value.trim();reset();
  if(!u)return err("Masukkan link playlist Spotify.");
  if(!valid(u))return err("Link Spotify tidak valid.");
  load("Mengambil playlist","Sedang mengambil daftar lagu...");
  try{
    let r=await req("/api/playlist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:u})}),d=r.data;
    $("#playlistTitle").textContent=d.judul||"-";$("#owner").textContent=d.owner?"oleh "+d.owner:"Spotify Playlist";$("#count").textContent=(d.total_lagu||0)+" lagu";
    let im=$("#playlistCover");im.src=d.thumbnail||fallback;im.onerror=()=>im.src=fallback;
    let list=$("#list");list.innerHTML="";
    (d.daftar_lagu||[]).forEach((t,i)=>{
      let x=document.createElement("div");x.className="item";
      x.innerHTML=`<div class="num">${i+1}</div><img src="${esc(t.thumbnail||fallback)}"><div><strong>${esc(t.judul||"-")}</strong><p>${esc(t.artis||"-")}${t.album?" • "+esc(t.album):""}</p></div><div class="dur">${esc(t.durasi||"0:00")}</div>`;
      let im=x.querySelector("img");im.onerror=()=>im.src=fallback;list.appendChild(x);
    });
    loading.classList.add("hidden");playlistResult.classList.remove("hidden");playlistResult.scrollIntoView({behavior:"smooth"});
  }catch(e){loading.classList.add("hidden");err(e.message)}
};

$("#download").onclick=async()=>{
  let u=url.value.trim();if(!u)return;
  let b=$("#download"),s=$("#downloadStatus");b.disabled=true;s.textContent="Membuat job...";
  try{
    let r=await req("/api/download",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:u,format:"mp3"})});
    for(let i=0;i<80;i++){
      await new Promise(x=>setTimeout(x,2500));
      let q=await req("/api/status/"+encodeURIComponent(r.jobId)),d=q.data;
      if(d.status==="ready"&&d.downloadLink){
        s.textContent="Download siap";b.disabled=false;
        let a=document.createElement("a");a.href=d.downloadLink;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove();return;
      }
      if(d.status==="error")throw Error("Download gagal diproses server.");
      s.textContent=`Memproses... ${i+1}/80`;
    }
    throw Error("Timeout menunggu download.");
  }catch(e){b.disabled=false;s.textContent="Download gagal";err(e.message)}
};

$("#clear").onclick=()=>{url.value="";reset();url.focus()};
url.onkeydown=e=>{if(e.key==="Enter")$("#track").click()};
