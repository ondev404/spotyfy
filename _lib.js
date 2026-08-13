const BASE="https://spotyloader.com";
const HEADERS={"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36","Accept":"application/json","Referer":"https://spotyloader.com/"};
async function spoty(path,opts={}){const r=await fetch(BASE+path,{...opts,headers:{...HEADERS,...(opts.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok&&r.status!==202)throw Error(`SpotyLoader API ${r.status}`);return d}
function valid(u){try{let x=new URL(u);return x.hostname==="open.spotify.com"||x.hostname==="spotify.com"||x.hostname.endsWith(".spotify.com")}catch{return false}}
function dur(ms){if(!ms)return"0:00";let s=Math.round(ms/1000);return`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`}
function track(t){return{judul:t.name,artis:t.artist||(t.artists||[]).join(", ")||"-",album:t.album||"-",durasi:dur(t.duration_ms),thumbnail:t.image||t.thumbnail||null}}
module.exports={spoty,valid,track};