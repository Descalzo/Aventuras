/* TRICKY DOORS — representación visual
 * mount(handlers): prepara el escenario; los escenarios y primeros planos se
 *                  construyen bajo demanda a partir de TD.scenes.
 * update(state):   sincroniza el DOM con el estado. No modifica el estado.
 * transition(fn): fundido a negro, ejecuta fn (normalmente update) y descubre la vista.
 * effects(events): reproduce efectos visuales transitorios (pulsos, destellos).
 *
 * La interfaz se localiza por `data-slot`, no por su posición en el documento.
 */
window.TD = window.TD || {};

TD.render = (function(){
const D = TD.data;
const slot = name => document.querySelector('[data-slot="'+name+'"]');

let H = {};
let els = {};
const sceneEls = {};     // sceneId -> { root, overlays:{id:{img,ph}}, hotspots:[{def,el}] }
const closeupEls = {};   // "scene/cu" -> { root, img, layers:{id:{img,ph}}, hotspots:[], dials:[], html:[] }
const missing = new Set(); // "scene/overlay" o "scene/cu/layer" cuya imagen no existe
let last = { scene:null, view:null, items:[], message:null };
let messageTimer = null;

function applyRect(el, r){
  el.style.left=r.left+"%"; el.style.top=r.top+"%";
  el.style.width=r.width+"%"; el.style.height=r.height+"%";
}
function makeHotspot(def){
  const b=document.createElement("button");
  b.type="button"; b.className="hotspot"; b.dataset.id=def.id;
  b.setAttribute("aria-label",def.label||def.id); b.title=def.label||"";
  applyRect(b,def.rect);
  return b;
}
function makeLayer(container, def, key, zIndex){
  const img=document.createElement("img");
  img.className="layer overlay"; img.src=def.src; img.alt=""; img.dataset.id=def.id;
  img.style.zIndex=zIndex;
  img.addEventListener("error",()=>{ missing.add(key); if(H.onAssetMissing) H.onAssetMissing(key); });
  const ph=document.createElement("div");
  ph.className="placeholder ph-"+def.id; ph.style.zIndex=zIndex;
  if(def.rect) applyRect(ph,def.rect); else { ph.style.left="40%"; ph.style.top="40%"; ph.style.width="20%"; ph.style.height="20%"; }
  ph.innerHTML='<span class="tag">'+(def.label||def.id)+'</span>';
  container.appendChild(img); container.appendChild(ph);
  return {img,ph};
}
function validLayer(o){
  const okv = o && typeof o.id==="string" && o.id && typeof o.src==="string" && o.src && typeof o.when==="function";
  if(!okv) console.warn("[render] capa ignorada por definicion incompleta:", o);
  return okv;
}

/* ---------- construcción ---------- */
function mount(handlers){
  H = handlers || {};
  els = {
    stage: slot("stage"), room: slot("room"), closeup: slot("closeup"),
    back: slot("back"), message: slot("message"), inventory: slot("inventory"),
    pickupToast: slot("pickup-toast"), pickupToastImg: slot("pickup-toast-img"),
    notes: slot("notes"), progress: slot("progress"), notesCount: slot("notes-count"),
    ending: slot("ending"), endingTitle: slot("ending-title"), endingText: slot("ending-text"),
    curtain: slot("curtain"), fx: slot("fx"), sceneName: slot("scene-name")
  };
  if(els.progress){
    els.progress.innerHTML="";
    D.PROGRESS.forEach(p=>{
      const row=document.createElement("div");
      row.className="row"; row.innerHTML='<span class="dot" data-key="'+p.key+'"></span>'+p.label;
      els.progress.appendChild(row);
    });
  }
  if(els.back) els.back.addEventListener("click",()=>H.onBack());
}

function ensureScene(sceneId){
  if(sceneEls[sceneId]) return sceneEls[sceneId];
  const sc = TD.scenes[sceneId];
  const root=document.createElement("div");
  root.className="scene"+(sc.mirror?" mirror":""); root.dataset.scene=sceneId; root.hidden=true;
  const base=document.createElement("img");
  base.className="layer base"; base.src=sc.base; base.alt=sc.name||sceneId;
  root.appendChild(base);
  const layers=document.createElement("div"); layers.className="layers"; root.appendChild(layers);
  const overlays={};
  (sc.overlays||[]).forEach((o,i)=>{
    if(!validLayer(o)) return;
    overlays[o.id]=makeLayer(layers,o,sceneId+"/"+o.id,1+i);
  });
  const vig=document.createElement("div"); vig.className="vignette"; root.appendChild(vig);
  const hsBox=document.createElement("div"); hsBox.className="hotspots"; root.appendChild(hsBox);
  const hotspots=(sc.hotspots||[]).map(def=>{
    const el=makeHotspot(def);
    el.addEventListener("click",()=>H.onRoomHotspot(def.id));
    hsBox.appendChild(el);
    return {def,el};
  });
  els.room.appendChild(root);
  sceneEls[sceneId]={root,overlays,hotspots};
  return sceneEls[sceneId];
}

function ensureCloseup(sceneId, cuId){
  const key=sceneId+"/"+cuId;
  if(closeupEls[key]) return closeupEls[key];
  const cu=TD.scenes[sceneId].closeups[cuId];
  const root=document.createElement("div");
  root.className="closeup-view"; root.dataset.closeup=cuId; root.hidden=true;
  const img=document.createElement("img"); img.className="layer base"; img.alt="";
  img.addEventListener("error",()=>root.classList.add("missing"));
  img.addEventListener("load",()=>root.classList.remove("missing"));
  root.appendChild(img);
  const layersBox=document.createElement("div"); layersBox.className="layers"; root.appendChild(layersBox);
  const layers={};
  (cu.layers||[]).forEach((o,i)=>{
    if(!validLayer(o)) return;
    layers[o.id]=makeLayer(layersBox,o,key+"/"+o.id,1+i);
  });
  const vig=document.createElement("div"); vig.className="vignette"; root.appendChild(vig);
  const html=(cu.html||[]).map(def=>{
    const el=document.createElement("div");
    el.className="cu-html "+(def.cls||""); applyRect(el,def.rect);
    root.appendChild(el);
    return {def,el};
  });
  const hsBox=document.createElement("div"); hsBox.className="hotspots"; root.appendChild(hsBox);
  const hotspots=(cu.hotspots||[]).map(def=>{
    const el=makeHotspot(def);
    el.addEventListener("click",()=>H.onCloseupHotspot(cuId,def.id));
    hsBox.appendChild(el);
    return {def,el};
  });
  let dials=[];
  if(cu.dials){
    const box=document.createElement("div"); box.className="dials"; root.appendChild(box);
    if(cu.dials.help){ const h=document.createElement("div"); h.className="dial-help"; h.textContent=cu.dials.help; box.appendChild(h); }
    dials=cu.dials.positions.map((r,i)=>{
      const b=document.createElement("button");
      b.type="button"; b.className="dial"; b.dataset.index=i; applyRect(b,r);
      b.title="Girar (clic: siguiente, clic derecho: anterior)";
      b.addEventListener("click",()=>H.onDial(i,+1));
      b.addEventListener("contextmenu",e=>{ e.preventDefault(); H.onDial(i,-1); });
      box.appendChild(b);
      return b;
    });
    closeupEls[key+"/dialsBox"]=box;
  }
  const tag=document.createElement("div"); tag.className="missing-tag"; tag.textContent=(cu.label||cuId)+" (imagen pendiente)"; root.appendChild(tag);
  els.closeup.appendChild(root);
  closeupEls[key]={root,img,layers,hotspots,dials,html};
  return closeupEls[key];
}

/* ---------- sincronización ---------- */
function update(state){
  const sc = TD.scenes[state.scene];
  const se = ensureScene(state.scene);
  Object.keys(sceneEls).forEach(id=>{ sceneEls[id].root.hidden = id!==state.scene; });

  renderLayers(sc.overlays||[], se.overlays, state.scene, state);
  se.hotspots.forEach(({def,el})=>{ el.hidden = def.when ? !def.when(state) : false; });

  const inRoom = state.view==="room";
  if(els.stage) els.stage.classList.toggle("in-closeup", !inRoom);
  els.room.hidden = !inRoom;
  els.closeup.hidden = inRoom;
  Object.keys(closeupEls).forEach(k=>{ if(closeupEls[k].root) closeupEls[k].root.hidden=true; });
  if(!inRoom) renderCloseup(sc, state);

  if(els.sceneName) els.sceneName.textContent = sc.name || "";
  renderInventory(state);
  renderNotes(state);
  renderProgress(state);
  renderMessage(state);
  renderEnding(state);
  last.scene=state.scene; last.view=state.view;
}

/* Pantalla final. Si hay un telón en marcha (el portón acaba de abrirse), se muestra
 * cuando el telón se ha levantado y tras una pausa para ver la escena; si no (recarga
 * de partida terminada, pruebas), al instante. */
const ENDING_DELAY=2200;
let endingToken=0;
let endingScheduled=false;   // ya hay un afterCurtain+setTimeout pendiente: no reprogramar
function renderEnding(state){
  if(!els.ending) return;
  const end = D.END.when(state);
  if(!end){ endingToken++; endingScheduled=false; els.ending.hidden=true; return; }
  if(els.endingTitle) els.endingTitle.textContent = D.END.title;
  if(els.endingText) els.endingText.textContent = D.END.text;
  if(!els.ending.hidden || endingScheduled) return;   // ya visible, o ya hay una revelación en curso
  if(!curtainActive){ els.ending.hidden=false; return; }
  endingScheduled=true;
  const token=++endingToken;
  afterCurtain(()=>setTimeout(()=>{ if(token===endingToken) els.ending.hidden=false; }, ENDING_DELAY));
}

/* Capas: se ve la capa si when(state); si su imagen falta, placeholder + fallback. */
function renderLayers(defs, elsMap, keyPrefix, state){
  const mounted = defs.filter(o=>elsMap[o.id]);
  const active = new Set(mounted.filter(o=>o.when(state)).map(o=>o.id));
  const shown = new Set(), placeholders = new Set();
  active.forEach(id=>{
    if(!missing.has(keyPrefix+"/"+id)){ shown.add(id); return; }
    placeholders.add(id);
    const def = mounted.find(o=>o.id===id);
    const fb = def && def.fallback;
    if(fb && elsMap[fb] && !missing.has(keyPrefix+"/"+fb)) shown.add(fb);
  });
  mounted.forEach(o=>{
    const {img,ph}=elsMap[o.id];
    img.classList.toggle("visible", shown.has(o.id));
    ph.classList.toggle("visible", placeholders.has(o.id));
  });
}

function renderCloseup(sc, state){
  const cu = sc.closeups[state.view];
  const ce = ensureCloseup(state.scene, state.view);
  ce.root.hidden=false;
  const src = typeof cu.image==="function" ? cu.image(state) : cu.image;
  if(ce.img.getAttribute("src")!==src) ce.img.src=src;
  renderLayers(cu.layers||[], ce.layers, state.scene+"/"+state.view, state);
  ce.hotspots.forEach(({def,el})=>{ el.hidden = def.when ? !def.when(state) : false; });
  ce.html.forEach(({def,el})=>{
    const on = def.when ? def.when(state) : true;
    el.hidden = !on;
    if(on) el.innerHTML = typeof def.content==="function" ? def.content(state) : def.content;
  });
  if(cu.dials){
    const box = closeupEls[state.scene+"/"+state.view+"/dialsBox"];
    const on = cu.dials.when ? cu.dials.when(state) : true;
    box.hidden = !on;
    if(on){
      const locked = cu.dials.locked ? cu.dials.locked(state) : false;
      box.classList.toggle("locked", locked);
      const values = state.dials[cu.dials.id] || [];
      ce.dials.forEach((b,i)=>{
        b.disabled = locked;
        const txt = TD.actions.symbolsFor(cu.dials, i)[values[i]||0];
        const tileSrc = cu.dials.tiles && cu.dials.tiles[txt];
        b.dataset.symbol = txt;
        b.classList.toggle("dial-tile", !!tileSrc);
        if(tileSrc){
          b.textContent = "";
          b.style.backgroundImage = 'url("'+tileSrc+'")';
        }else{
          b.style.backgroundImage = "";
          b.textContent = txt;
          b.classList.toggle("dial-word", String(txt).length>4);
        }
      });
    }
  }
}

/* Objetos combinables (D.COMBOS): cualquier item que aparezca como `a` o `b` de una
 * combinación lleva un "+" para que se note que se puede unir con otro, sin tener
 * que descubrirlo a ciegas. */
function isCombinable(id){
  return (D.COMBOS||[]).some(c=>c.a===id || c.b===id);
}
function wireItemImg(b, src){
  const img=b.querySelector("img"), svg=b.querySelector("svg");
  if(svg) svg.style.display="none";
  if(img) img.addEventListener("error",()=>{ img.classList.add("missing"); if(svg) svg.style.display="block"; });
}
/* Colecciones (D.GROUPS): varios items con el mismo `group` se muestran como una
 * sola entrada acumulativa "n/total" (p.ej. las hojas de un derrotero repartidas
 * por la casa), en vez de un icono suelto por cada una. */
function renderInventory(state){
  const box=els.inventory; if(!box) return;
  box.innerHTML="";
  const groups = D.GROUPS || {};
  const seenGroups = new Set();
  let any=false;
  state.items.forEach(id=>{
    const d=D.ITEMS[id]; if(!d) return;
    any=true;
    if(d.group && groups[d.group]){
      if(seenGroups.has(d.group)) return;
      seenGroups.add(d.group);
      const g = groups[d.group];
      const owned = state.items.filter(x=>D.ITEMS[x] && D.ITEMS[x].group===d.group).length;
      const complete = owned>=g.total;
      const selected = state.selected==="group:"+d.group;
      const b=document.createElement("button");
      b.type="button"; b.dataset.group=d.group;
      b.className="item group"+(complete?" complete":"")+(selected?" selected":"");
      b.title=g.name+" ("+owned+"/"+g.total+")";
      b.innerHTML='<img src="'+(g.img||d.img)+'" alt="">'+(g.icon||d.icon)+'<span>'+g.name+'</span><span class="count">'+owned+"/"+g.total+"</span>";
      wireItemImg(b, g.img||d.img);
      b.addEventListener("click",()=>H.onGroupItem(d.group));
      box.appendChild(b);
      return;
    }
    const combinable = isCombinable(id);
    const b=document.createElement("button");
    b.type="button";
    b.className="item"+(state.selected===id?" selected":"")+(last.items.includes(id)?"":" new")+(combinable?" combinable":"");
    b.dataset.id=id;
    b.title=d.name+(combinable?" — se puede combinar con otro objeto":"");
    b.innerHTML='<img src="'+d.img+'" alt="">'+d.icon+'<span>'+d.name+'</span>';
    wireItemImg(b, d.img);
    b.addEventListener("click",()=>H.onItem(id));
    box.appendChild(b);
  });
  if(!any) box.innerHTML='<div class="empty">Inventario vacío</div>';
  last.items=state.items.slice();
}

function renderNotes(state){
  if(!els.notes) return;
  const notes = D.NOTES.filter(n=>n.when(state)).map(n=>n.text);
  els.notes.innerHTML = notes.length ? notes.map(t=>"<p>"+t+"</p>").join("") : "<p>"+D.NOTES_EMPTY+"</p>";
  if(els.notesCount){
    els.notesCount.textContent = notes.length;
    els.notesCount.hidden = notes.length===0;
  }
}

function renderProgress(state){
  if(!els.progress) return;
  els.progress.querySelectorAll(".dot").forEach(dot=>{
    dot.classList.toggle("done", !!state.flags[dot.dataset.key]);
  });
}

/* Mensaje: se muestra y se atenúa solo tras unos segundos (vuelve al pasar el ratón). */
function renderMessage(state){
  if(!els.message) return;
  els.message.textContent = state.message;
  if(state.message!==last.message){
    last.message = state.message;
    els.message.classList.remove("faded");
    if(messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(()=>els.message.classList.add("faded"), 6000);
  }
}

/* ---------- efectos transitorios ---------- */
function pulse(rect, cls){
  if(!els.fx || !rect) return;
  const sc = TD.scenes[last.scene];
  if(sc && sc.mirror && last.view==="room") rect = { ...rect, left: 100-rect.left-rect.width };
  const el=document.createElement("div");
  el.className="fx-pulse "+(cls||"");
  applyRect(el,rect);
  el.addEventListener("animationend",()=>el.remove());
  els.fx.appendChild(el);
}
/* Telón: oscurece el escenario, aplica el cambio de vista con la pantalla en negro
 * y vuelve a descubrirla. Si la imagen base de la nueva vista aún no ha cargado,
 * espera (con tope) antes de levantar el telón. Sin Web Animations (pruebas) o con
 * "reducir movimiento", el cambio es inmediato. */
const CUT_IN=200, CUT_OUT=380, LOAD_WAIT=1500;
let curtainRun=0;
let curtainActive=false;      // hay un telón en marcha (bajando, en negro o levantándose)
let afterCurtainQueue=[];     // callbacks a ejecutar cuando el telón termine de levantarse
function afterCurtain(cb){ if(curtainActive) afterCurtainQueue.push(cb); else cb(); }
function flushAfterCurtain(){ const q=afterCurtainQueue; afterCurtainQueue=[]; q.forEach(cb=>cb()); }
function reducedMotion(){
  return typeof matchMedia==="function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function baseReady(cb){
  const view = els.closeup && !els.closeup.hidden ? els.closeup : els.room;
  const img = view && view.querySelector(".scene:not([hidden]) > .layer.base, .closeup-view:not([hidden]) > .layer.base");
  if(!img || img.complete){ cb(); return; }
  let done=false; const fin=()=>{ if(done) return; done=true; clearTimeout(t); cb(); };
  const t=setTimeout(fin, LOAD_WAIT);
  img.addEventListener("load",fin,{once:true}); img.addEventListener("error",fin,{once:true});
}
function transition(apply){
  const c=els.curtain;
  if(!c || typeof c.animate!=="function" || reducedMotion()){ apply(); return; }
  const run=++curtainRun;
  curtainActive=true;
  // si otro telón estaba en marcha, se continúa desde su opacidad actual (sin destello)
  const from=Math.min(1, Math.max(0, parseFloat(getComputedStyle(c).opacity)||0));
  c.getAnimations().forEach(a=>a.cancel());
  c.classList.add("on");
  const fadeIn=c.animate([{opacity:from},{opacity:1}],{duration:Math.round(CUT_IN*(1-from)),easing:"ease-in",fill:"forwards"});
  let revealed=false, ended=false;
  const end=()=>{
    if(ended || run!==curtainRun) return;
    ended=true;
    c.getAnimations().forEach(a=>a.cancel());
    c.classList.remove("on");
    curtainActive=false;
    flushAfterCurtain();
  };
  const reveal=()=>{
    if(revealed) return;                  // onfinish y respaldo: solo el primero actúa
    revealed=true;
    // el cambio de vista se aplica siempre, aunque otro telón haya tomado el relevo
    if(els.stage) els.stage.classList.add("cut");
    apply();
    if(els.stage){ void els.stage.offsetWidth; els.stage.classList.remove("cut"); }
    if(run!==curtainRun) return;
    baseReady(()=>{
      if(run!==curtainRun) return;
      const fadeOut=c.animate([{opacity:1},{opacity:0}],{duration:CUT_OUT,easing:"ease-out",fill:"forwards"});
      fadeOut.onfinish=end;
      setTimeout(end, CUT_OUT+100);       // respaldo si onfinish no llega
    });
  };
  fadeIn.onfinish=reveal;
  setTimeout(reveal, CUT_IN+60);          // respaldo: el cambio de vista se aplica siempre
}
/* Tipos de evento que se muestran con telón. */
const CUTS=new Set(["view","travel","door"]);
function needsCut(events){ return events.some(ev=>CUTS.has(ev.type)); }
/* Confirmación visual al recoger un objeto: aparece grande en el centro, se
 * desvanece sola (ver @keyframes pickupToast en css/style.css) y no deja ningún
 * resto — el timeout oculta el contenedor y limpia el src pase lo que pase con
 * la animación CSS. Pickups seguidos reinician la animación desde cero. */
let pickupToastTimer=null;
function showPickupToast(itemId){
  if(!els.pickupToast || !els.pickupToastImg) return;
  const d = D.ITEMS[itemId]; if(!d) return;
  els.pickupToastImg.src = d.img;
  els.pickupToastImg.alt = d.name || "";
  els.pickupToast.hidden = false;
  els.pickupToastImg.classList.remove("play");
  void els.pickupToastImg.offsetWidth;   // fuerza reflow: reinicia la animación aunque ya estuviera en marcha
  els.pickupToastImg.classList.add("play");
  if(pickupToastTimer) clearTimeout(pickupToastTimer);
  pickupToastTimer = setTimeout(()=>{
    els.pickupToast.hidden = true;
    els.pickupToastImg.removeAttribute("src");
  }, 1900);
}
function effects(events){
  events.forEach(ev=>{
    switch(ev.type){
      case "pickup": pulse(ev.at,"gold"); showPickupToast(ev.item); break;
      case "use":    pulse(ev.at,"gold"); break;
      case "unlock":
      case "solve":  pulse(ev.at,"gold big"); if(els.stage){ els.stage.classList.remove("flash"); void els.stage.offsetWidth; els.stage.classList.add("flash"); } break;
      case "wrong":  pulse(ev.at,"red"); break;
    }
  });
}

function toggleDebug(){ els.stage.classList.toggle("debug"); }

/* Estado visual calculado (útil para pruebas). */
function visibleLayers(){
  const st = TD.state.get(); const se = sceneEls[st.scene]; if(!se) return [];
  return Object.keys(se.overlays).filter(id=>se.overlays[id].img.classList.contains("visible"));
}
function visiblePlaceholders(){
  const st = TD.state.get(); const se = sceneEls[st.scene]; if(!se) return [];
  return Object.keys(se.overlays).filter(id=>se.overlays[id].ph.classList.contains("visible"));
}
function closeupVisibleLayers(){
  const st = TD.state.get(); const ce = closeupEls[st.scene+"/"+st.view]; if(!ce) return [];
  return Object.keys(ce.layers).filter(id=>ce.layers[id].img.classList.contains("visible"));
}
function markMissing(id){ missing.add(id.includes("/") ? id : TD.state.get().scene+"/"+id); }

return { mount, update, transition, needsCut, effects, toggleDebug, visibleLayers, visiblePlaceholders, closeupVisibleLayers, markMissing, missing, pulse };
})();
