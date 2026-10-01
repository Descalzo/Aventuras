/* TRICKY DOORS — sonido
 * Efectos sintetizados con Web Audio (sin archivos externos).
 * play(name) es seguro de llamar siempre: si no hay AudioContext o está
 * silenciado, no hace nada.
 */
window.TD = window.TD || {};

TD.audio = (function(){
const MUTE_KEY = "trickyDoors.muted";
let ctx = null;
let muted = false;
try{ muted = localStorage.getItem(MUTE_KEY)==="1"; }catch(e){}

function context(){
  if(ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return null;
  try{ ctx = new AC(); }catch(e){ return null; }
  return ctx;
}
function master(gain, when, dur){
  const c=context(); if(!c) return null;
  const g=c.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, when+dur);
  g.connect(c.destination);
  return g;
}
function tone(freq, dur, type, gain, delay, slideTo){
  const c=context(); if(!c) return;
  const t=c.currentTime+(delay||0);
  const o=c.createOscillator(); o.type=type||"sine";
  o.frequency.setValueAtTime(freq,t);
  if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo,t+dur);
  const g=master(gain||0.15,t,dur); if(!g) return;
  o.connect(g); o.start(t); o.stop(t+dur+0.05);
}
function noise(dur, gain, delay, filterFreq, slideTo){
  const c=context(); if(!c) return;
  const t=c.currentTime+(delay||0);
  const len=Math.floor(c.sampleRate*dur);
  const buf=c.createBuffer(1,len,c.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
  const src=c.createBufferSource(); src.buffer=buf;
  const f=c.createBiquadFilter(); f.type="lowpass";
  f.frequency.setValueAtTime(filterFreq||800,t);
  if(slideTo) f.frequency.exponentialRampToValueAtTime(slideTo,t+dur);
  const g=master(gain||0.1,t,dur); if(!g) return;
  src.connect(f); f.connect(g); src.start(t); src.stop(t+dur+0.05);
}

const SOUNDS = {
  click(){ noise(0.04,0.08,0,2500); },
  dial(){ tone(1400,0.03,"square",0.03); noise(0.03,0.06,0,3000); },
  wrong(){ tone(180,0.18,"triangle",0.08,0,140); },
  pickup(){ tone(880,0.08,"sine",0.08); tone(1320,0.12,"sine",0.07,0.07); },
  select(){ tone(660,0.05,"sine",0.05); },
  use(){ tone(520,0.07,"triangle",0.07); tone(780,0.09,"triangle",0.06,0.06); },
  unlock(){ noise(0.06,0.12,0,1200); tone(240,0.12,"square",0.05,0.05,200); tone(1200,0.05,"sine",0.05,0.12); },
  solve(){ [523,659,784,1046].forEach((f,i)=>tone(f,0.35,"sine",0.07,i*0.09)); },
  door(){ noise(0.9,0.12,0,300,90); tone(70,0.8,"sawtooth",0.03,0,55); },
  travel(){ noise(0.5,0.08,0,900,200); },
  paper(){ noise(0.25,0.06,0,1800,600); },
  open(){ noise(0.2,0.09,0,700,300); tone(300,0.12,"triangle",0.04,0.05,220); },
  bell(){ [1,2.0,2.98,4.2].forEach((h,i)=>tone(440*h,1.6-i*0.3,"sine",0.06/(i+1))); noise(0.03,0.05,0,3000); },
  bellLow(){ [1,2.0,2.98,4.2].forEach((h,i)=>tone(220*h,2.2-i*0.4,"sine",0.07/(i+1))); noise(0.04,0.06,0,2000); },
  /* Tres campanas de la espadaña, cada una con su propia nota (DO-MI-SOL, un acorde mayor
   * ascendente) — antes las tres reproducían exactamente el mismo sonido ("bell"),
   * indistinguibles entre sí; petición directa del usuario. Mismo timbre campanil (serie de
   * armónicos 1/2.0/2.98/4.2) que "bell"/"bellLow", solo cambia la fundamental: la campana
   * grande es la más grave (DO), la mediana entre medias (MI), la chica la más aguda (SOL). */
  bellGrande(){ [1,2.0,2.98,4.2].forEach((h,i)=>tone(130.81*h,2.4-i*0.4,"sine",0.09/(i+1))); noise(0.05,0.07,0,1600); },
  bellMediana(){ [1,2.0,2.98,4.2].forEach((h,i)=>tone(164.81*h,2.0-i*0.35,"sine",0.08/(i+1))); noise(0.04,0.06,0,2000); },
  bellChica(){ [1,2.0,2.98,4.2].forEach((h,i)=>tone(196.00*h,1.7-i*0.3,"sine",0.07/(i+1))); noise(0.03,0.05,0,2400); }
};

function play(name){
  if(muted) return;
  const fn=SOUNDS[name]; if(!fn) return;
  const c=context(); if(!c) return;
  if(c.state==="suspended"){ try{ c.resume(); }catch(e){} }
  try{ fn(); }catch(e){}
}
function isMuted(){ return muted; }
function setMuted(v){
  muted=!!v;
  try{ localStorage.setItem(MUTE_KEY, muted?"1":"0"); }catch(e){}
  return muted;
}
function toggle(){ return setMuted(!muted); }

return { play, isMuted, setMuted, toggle, SOUNDS };
})();
