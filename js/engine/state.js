/* TRICKY DOORS — estado lógico
 * Único lugar donde vive gameState. Sin DOM, sin decisiones visuales.
 *
 *  scene   -> escenario actual (id registrado en TD.scenes)
 *  view    -> "room" o id de un primer plano del escenario actual
 *  flags   -> booleanos de puzzles (drawerOpen, safeOpen, ...) compartidos por todo el juego
 *  dials   -> valores de ruedas/mecanismos por id (safe: [0,8,2,5])
 *  items   -> ids de inventario (ver TD.data.ITEMS)
 *
 * Los eventos (emit) no forman parte del estado guardado: son avisos
 * transitorios para efectos visuales y sonido.
 */
window.TD = window.TD || {};

TD.state = (function(){
const SAVE_VERSION = 3;
/* Clave de guardado y escena inicial: las define la fase activa (TD.usePhase). */
const saveKey    = () => TD.phase ? TD.phase.saveKey : "trickyDoors.save";
const startScene = () => TD.phase ? TD.phase.startScene : "study";

/* Claves booleanas del guardado v2 que pasan a flags en v3. */
const V2_FLAGS = ["drawerOpen","pictureMoved","safeOpen","clockRepaired","panelPowered","doorOpen","plantSearched","noteTaken"];

function initial(){
  return {
    version: SAVE_VERSION,
    scene: startScene(),
    view: "room",
    flags: {},
    dials: {},
    items: [],
    selected: null,
    visited: [startScene()],
    hintIndex: 0,
    hintKey: null,
    hintTier: 0,
    message: TD.data.INTRO_TEXT
  };
}

let current = initial();
let messageRevision = 0; // transitorio: repetir un texto también es un mensaje nuevo
let events = [];          // cola transitoria de eventos (no se guarda)
let context = null;       // contexto de la acción en curso (p. ej. rect del hotspot)

/* ---- migración v2 -> v3 ---- */
function migrateV2(raw){
  const s = {};
  s.flags = {};
  V2_FLAGS.forEach(k=>{ if(k in raw) s.flags[k] = !!raw[k]; });
  s.dials = {};
  if(Array.isArray(raw.safeDigits)) s.dials.safe = raw.safeDigits.slice();
  s.scene = startScene();
  s.view = raw.view;
  s.items = raw.items; s.selected = raw.selected;
  s.hintIndex = raw.hintIndex; s.message = raw.message;
  return s;
}

/* Devuelve un estado válido a partir de datos posiblemente antiguos o corruptos. */
function sanitize(raw){
  const base = initial();
  if(!raw || typeof raw!=="object") return base;
  if(!raw.version || raw.version < 3) raw = migrateV2(raw);
  const s = Object.assign(base, raw);
  s.version = SAVE_VERSION;

  if(typeof s.flags!=="object" || !s.flags) s.flags = {};
  Object.keys(s.flags).forEach(k=>{ s.flags[k] = !!s.flags[k]; });

  if(typeof s.dials!=="object" || !s.dials) s.dials = {};
  Object.keys(s.dials).forEach(k=>{
    const arr = Array.isArray(s.dials[k]) ? s.dials[k] : [];
    s.dials[k] = arr.map(n=>{ n=parseInt(n,10); return isNaN(n)?0:Math.max(0,n); });
  });

  const inPhase = id => !!TD.scenes[id] && (!TD.phase || TD.scenes[id].phase===TD.phase.id);
  if(!inPhase(s.scene)) s.scene = startScene();
  const scene = TD.scenes[s.scene];
  if(s.view!=="room" && !(scene.closeups && scene.closeups[s.view])) s.view = "room";

  if(!Array.isArray(s.items)) s.items=[];
  s.items = s.items.filter((id,i,arr)=>TD.data.ITEMS[id] && arr.indexOf(id)===i);
  if(s.selected!==null && !s.items.includes(s.selected)){
    const groupId = typeof s.selected==="string" && s.selected.indexOf("group:")===0 ? s.selected.slice(6) : null;
    if(!groupId || !(TD.data.GROUPS && TD.data.GROUPS[groupId])) s.selected=null;
  }

  if(!Array.isArray(s.visited)) s.visited=[];
  s.visited = s.visited.filter((id,i,arr)=>inPhase(id) && arr.indexOf(id)===i);
  if(!s.visited.includes(s.scene)) s.visited.push(s.scene);

  s.hintIndex = Math.max(0, parseInt(s.hintIndex,10)||0);
  if(typeof s.hintKey!=="string") s.hintKey = null;
  s.hintTier = Math.max(0, parseInt(s.hintTier,10)||0);
  if(typeof s.message!=="string" || !s.message) s.message=TD.data.INTRO_TEXT;
  return s;
}

function get(){ return current; }
function save(){
  try{ localStorage.setItem(saveKey(), JSON.stringify(current)); return true; }catch(e){ return false; }
}
function load(){
  try{
    const raw = localStorage.getItem(saveKey());
    if(!raw){ current = initial(); return false; }   // sin partida: estado inicial de la fase activa
    current = sanitize(JSON.parse(raw));
    return true;
  }catch(e){ current = initial(); return false; }
}
function reset(){
  current = initial();
  messageRevision++;
  try{ localStorage.removeItem(saveKey()); }catch(e){}
  return current;
}

/* ---- helpers de mutación (API para las acciones de cada escenario) ---- */
function flag(name, value){
  if(value===undefined) return !!current.flags[name];
  current.flags[name] = !!value;
  return current.flags[name];
}
function dial(id, size){
  if(!Array.isArray(current.dials[id]) || current.dials[id].length!==size){
    current.dials[id] = new Array(size).fill(0);
  }
  return current.dials[id];
}
function has(id){ return current.items.includes(id); }
function addItem(id){
  if(TD.data.ITEMS[id] && !has(id)){ current.items.push(id); emit("pickup",{item:id}); }
}
function removeItem(id){
  current.items = current.items.filter(x=>x!==id);
  if(current.selected===id) current.selected=null;
}
function useSelected(id){   // consume el objeto seleccionado si coincide
  if(current.selected!==id) return false;
  removeItem(id);
  emit("use",{item:id});
  return true;
}
/* Selección de una entrada de inventario AGRUPADA (TD.data.GROUPS, p.ej. varias
 * hojas de un mismo derrotero repartidas por la casa): no corresponde a un solo id
 * de item real, así que se guarda como un token aparte ("group:<id>") en vez de en
 * `current.items`. `useSelectedGroup` solo comprueba y limpia la selección — la
 * propia acción de la escena decide qué objetos concretos retirar del inventario. */
const GROUP_PREFIX = "group:";
function groupSelectId(groupId){ return GROUP_PREFIX+groupId; }
function selectedGroup(){
  return typeof current.selected==="string" && current.selected.indexOf(GROUP_PREFIX)===0
    ? current.selected.slice(GROUP_PREFIX.length) : null;
}
function toggleGroupSelected(groupId){
  const id = groupSelectId(groupId);
  current.selected = current.selected===id ? null : id;
  return !!current.selected;
}
function useSelectedGroup(groupId){
  if(selectedGroup()!==groupId) return false;
  current.selected = null;
  emit("use",{item:groupSelectId(groupId)});
  return true;
}
function say(text){ current.message = text; messageRevision++; }
function go(sceneId){
  if(!TD.scenes[sceneId]) return false;
  current.scene = sceneId; current.view = "room"; current.selected = null;
  if(!current.visited.includes(sceneId)) current.visited.push(sceneId);
  emit("travel",{scene:sceneId});
  return true;
}

/* ---- eventos transitorios ---- */
function emit(type, data){
  const ev = Object.assign({type}, data||{});
  if(ev.at===undefined && context && context.rect) ev.at = context.rect;
  events.push(ev);
}
function drain(){ const out = events; events = []; return out; }
function setContext(ctx){ context = ctx; }

const api = { SAVE_VERSION, initial, sanitize, get, save, load, reset,
         flag, dial, has, addItem, removeItem, useSelected, say, go,
         groupSelectId, selectedGroup, toggleGroupSelected, useSelectedGroup,
         emit, drain, setContext };
Object.defineProperty(api, "messageRevision", { get: () => messageRevision });
Object.defineProperty(api, "SAVE_KEY",    { get: saveKey });
Object.defineProperty(api, "START_SCENE", { get: startScene });
return api;
})();
