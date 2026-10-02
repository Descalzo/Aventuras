// Sin dependencias: Chromium real mediante Chrome DevTools Protocol.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {spawn} = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const delay = ms => new Promise(r => setTimeout(r, ms));
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server = http.createServer((req,res)=>{
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file = path.resolve(root, '.'+pathname.replace(/^\/Aventuras/, '').replace(/\/$/, '/index.html'));
  if(!file.startsWith(root+path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file,(err,data)=>{ res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}); res.end(err?'Missing':data); });
});
let chrome, socket;
const pending = new Map(); let serial=0;
const errors=[];
const failedResources=[];
async function command(method,params={}) {
  const id=++serial;
  const result=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));
  socket.send(JSON.stringify({id,method,params})); return result;
}
async function evaluate(expression) {
  const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
const snapshot = `(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};const m=document.querySelector('.message'),c=getComputedStyle(m);return {text:m.textContent,className:m.className,opacity:c.opacity,visibility:c.visibility,display:c.display,zIndex:c.zIndex,message:rect(m),stage:rect(document.querySelector('.stage')),game:rect(document.querySelector('.game')),hud:rect(document.querySelector('.hud')),innerWidth,innerHeight,visualViewport:{width:visualViewport.width,height:visualViewport.height},devicePixelRatio,standalone:matchMedia('(display-mode: standalone)').matches,fullscreen:matchMedia('(display-mode: fullscreen)').matches,orientation:screen.orientation.type}})()`;
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const port=server.address().port;
  chrome=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=9337','--user-data-dir='+path.join(root,'.test-browser'),'about:blank'],{windowsHide:true,stdio:'ignore'});
  let tabs;
  for(let i=0;i<60;i++){try{tabs=await (await fetch('http://127.0.0.1:9337/json')).json();break;}catch{await delay(100);}}
  assert(tabs,'Chromium no arrancó');
  socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  socket.addEventListener('message',ev=>{const m=JSON.parse(ev.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(m.params.type))errors.push(m.params);else if(m.method==='Network.responseReceived'&&m.params.response.status>=400)failedResources.push({url:m.params.response.url,status:m.params.response.status});});
  await command('Runtime.enable');await command('Page.enable');await command('Network.enable');
  await command('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2.75,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}});
  const url=`http://127.0.0.1:${port}/Aventuras/`;
  await command('Page.navigate',{url});
  for(let i=0;i<100;i++){if(await evaluate('!!window.trickyDoors'))break;await delay(100);}
  await delay(300);
  const before=await evaluate(snapshot);
  await evaluate("TD.state.say('Mensaje repetido');TD.refresh()");await delay(6500);
  await evaluate("TD.state.say('Mensaje repetido');TD.refresh()");await delay(100);
  const repeated=await evaluate(snapshot);
  await command('Emulation.setDeviceMetricsOverride',{width:844,height:360,deviceScaleFactor:2.75,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}});
  await delay(100);const afterResize=await evaluate(snapshot);
  fs.mkdirSync(path.join(root,'.audit-results'),{recursive:true});
  fs.writeFileSync(path.join(root,'.audit-results',process.env.BASELINE?'before.json':'after.json'),JSON.stringify({before,repeated,afterResize,errors},null,2));
  console.log(JSON.stringify({repeated,afterResize,errors},null,2));
  if(!process.env.BASELINE){assert.equal(repeated.visibility,'visible');assert.equal(repeated.opacity,'1');}
  if(!process.env.BASELINE) await require('./phases.cjs')({command,evaluate,delay,url,snapshot,assert,fs,path,root,errors,failedResources});
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{socket?.close();chrome?.kill();server.close();});
