module.exports=async ({command,evaluate,delay,url,snapshot,assert,fs,path,root,errors,failedResources})=>{
  const phases=['clockmaker','sevilla','derrotero','faro','negado','piloto'];
  const results=[];
  let totalCloseups=0;
  for(const phase of phases){
    await command('Page.navigate',{url:url+'?phase='+phase});
    for(let i=0;i<100;i++){if(await evaluate(`!!window.trickyDoors && trickyDoors.phase.id==='${phase}'`))break;await delay(50);}
    const scenes=await evaluate('Object.keys(TD.phaseScenes())');
    for(const scene of scenes){
      await evaluate(`TD.state.go(${JSON.stringify(scene)});TD.state.drain();TD.refresh()`);
      await delay(50);
      const closeups=await evaluate(`Object.keys(TD.scenes[${JSON.stringify(scene)}].closeups)`);
      totalCloseups+=closeups.length;
      for(const view of ['room',...closeups]){
        await evaluate(`TD.state.get().view=${JSON.stringify(view)};TD.refresh()`);
        await delay(20);
        const geometry=await evaluate(`(()=>{const s=document.querySelector('.stage').getBoundingClientRect();const v=document.querySelector('[data-slot="'+(TD.state.get().view==='room'?'room':'closeup')+'"]');return {ratio:s.width/s.height,visible:!v.hidden,base:!!v.querySelector('.layer.base')}})()`);
        assert(geometry.visible&&geometry.base,phase+'/'+scene+'/'+view);
        assert(Math.abs(geometry.ratio-1672/941)<.002,'Aspect ratio');
      }
      await evaluate("TD.state.get().view='room';TD.refresh();document.querySelector('[data-action=hint]').click()");await delay(50);
      const message=await evaluate(snapshot);assert.equal(message.visibility,'visible');assert(message.text.startsWith('Pista:'));
    }
    // Persistencia con carga real del motor, sin modificar los guardados del usuario.
    await evaluate('TD.state.flag("auditMarker",true);TD.state.save();TD.state.load()');
    assert(await evaluate('TD.state.flag("auditMarker")'));
    results.push({phase,scenes:scenes.length});
  }
  // Una carga incidental no debe revivir un mensaje ya vencido.
  await evaluate("TD.state.say('Duración');TD.refresh()");await delay(6300);
  await evaluate('TD.refresh()');assert.equal((await evaluate(snapshot)).visibility,'hidden');
  await evaluate("TD.state.say('Tras telón');TD.render.transition(()=>TD.render.update(TD.state.get()))");
  await delay(900);assert.equal((await evaluate(snapshot)).visibility,'visible');
  // No gastar el plazo mientras el escenario no tiene geometría válida.
  await evaluate("document.querySelector('.game').style.width='0px';TD.state.say('Layout pendiente');TD.refresh()");
  await delay(6300);
  await evaluate("document.querySelector('.game').style.removeProperty('width')");await delay(150);
  assert.equal((await evaluate(snapshot)).visibility,'visible');
  // Fullscreen real de Chromium; no equivale a un WebAPK en HyperOS.
  await command('Runtime.evaluate',{expression:'document.documentElement.requestFullscreen()',userGesture:true,awaitPromise:true});
  await evaluate("TD.state.say('Mensaje en fullscreen');TD.refresh()");await delay(150);
  const fullscreen=await evaluate(snapshot);assert(fullscreen.fullscreen);assert.equal(fullscreen.visibility,'visible');
  const screenshot=await command('Page.captureScreenshot',{format:'png'});
  fs.writeFileSync(path.join(root,'.audit-results','fullscreen.png'),Buffer.from(screenshot.data,'base64'));
  await evaluate('document.exitFullscreen()');
  const sw=await evaluate(`(async()=>{const r=await navigator.serviceWorker.ready;return {scope:r.scope,script:r.active.scriptURL,controlled:!!navigator.serviceWorker.controller}})()`);
  assert(sw.scope.endsWith('/Aventuras/'));assert(sw.controlled);
  await command('Page.navigate',{url});await delay(300);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  assert.equal(manifest.display,'fullscreen');assert.equal(manifest.orientation,'landscape');
  for(const icon of manifest.icons){const data=fs.readFileSync(path.join(root,icon.src.replace('/Aventuras/','')));assert.equal(`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`,icon.sizes);}
  const install=await command('Page.getInstallabilityErrors');
  assert.deepEqual(install.installabilityErrors,[],'Instalabilidad Chromium');
  assert.deepEqual(errors,[],'Excepciones JavaScript');
  assert.deepEqual(failedResources,[],'Recursos HTTP ausentes');
  fs.writeFileSync(path.join(root,'.audit-results','phases.json'),JSON.stringify({results,totalCloseups,sw,install,fullscreen,errors,failedResources},null,2));
  console.log(JSON.stringify({results,totalCloseups,sw,install,errors,failedResources},null,2));
};
