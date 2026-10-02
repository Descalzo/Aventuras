# Auditoría en Xiaomi: mensajes y arranque WebAPK

Base remota main: 882dbf1ed7fe52385e18d75d79242e8a4b10d07f. Trabajo en el clon .work/Aventuras, conservando los cambios remotos. Dispositivo Android 16 / HyperOS OS3.0, pantalla 2772×1280 horizontal, DPR 3.25. Brave 1.96.59 (Chromium 154); Chrome 140.0.7339.207.

## Causa de los mensajes, reproducida antes de editar

Una navegación entre aventuras deja 100dvh en 449.846 px aunque html y visualViewport miden 393.846. El mensaje tiene visibility visible, opacity 1, texto correcto y ninguna transformación, pero empieza en y=404.135, fuera de pantalla. El gesto cambia el tamaño de las barras y actualiza las unidades de viewport; el mensaje pasa a y=305.192 y aparece. La causa medida es geométrica; la hipótesis anterior de composición no explica este caso. Capturas físicas ADB antes y después, sin Page.captureScreenshot ni scripts que redimensionen, tomadas a 16:16:50.953 y 16:16:52.703 UTC.

| Medida (CSS px) | Antes del gesto | Después del gesto |
| --- | --- | --- |
| innerWidth | 853 | 806 |
| innerHeight | 394 | 347 |
| clientWidth | 853 | 806 |
| clientHeight | 394 | 347 |
| visualViewport | {"width":852.923095703125,"height":393.8461608886719,"offsetTop":0,"offsetLeft":0,"scale":1} | {"width":805.8461303710938,"height":347.0769348144531,"offsetTop":0,"offsetLeft":0,"scale":1} |
| screen | {"width":853,"height":394,"availWidth":853,"availHeight":394,"orientation":{"type":"landscape-primary","angle":90}} | {"width":853,"height":394,"availWidth":853,"availHeight":394,"orientation":{"type":"landscape-primary","angle":90}} |
| devicePixelRatio | 3.25 | 3.25 |
| fullscreenElement | null | null |
| displayFullscreen | true | true |
| displayStandalone | false | false |
| message.textContent | "Pista: Con los tres fragmentos —ancla, torre y nao— en el inventario, usa la puerta heráldica del salón." | "Pista: Con los tres fragmentos —ancla, torre y nao— en el inventario, usa la puerta heráldica del salón." |
| message.className | "message" | "message" |
| message.style | {"display":"block","visibility":"visible","opacity":"1","position":"absolute","top":"404.135px","bottom":"11.2452px","left":"0px","right":"0px","transform":"none","zIndex":"20","width":"575.49px","height":"34.4615px","overflow":"visible","contain":"none","containerType":"normal","fontSize":"12.3079px"} | {"display":"block","visibility":"visible","opacity":"1","position":"absolute","top":"305.192px","bottom":"8.67308px","left":"0px","right":"0px","transform":"none","zIndex":"20","width":"579.692px","height":"33.2067px","overflow":"visible","contain":"none","containerType":"normal","fontSize":"11.8383px"} |
| message.rect | {"x":138.7163543701172,"y":404.1346435546875,"width":575.4904174804688,"height":34.46154022216797,"top":404.1346435546875,"right":714.2067718505859,"bottom":438.59618377685547,"left":138.7163543701172} | {"x":113.0721206665039,"y":305.19232177734375,"width":579.6923217773438,"height":33.20673370361328,"top":305.19232177734375,"right":692.7644424438477,"bottom":338.39905548095703,"left":113.0721206665039} |
| html | {"x":0,"y":0,"width":852.923095703125,"height":393.8461608886719,"top":0,"right":852.923095703125,"bottom":393.8461608886719,"left":0} | {"x":0,"y":0,"width":805.84619140625,"height":347.0769348144531,"top":0,"right":805.84619140625,"bottom":347.0769348144531,"left":0} |
| body | {"x":0,"y":0,"width":852.923095703125,"height":449.8461608886719,"top":0,"right":852.923095703125,"bottom":449.8461608886719,"left":0} | {"x":0,"y":0,"width":805.84619140625,"height":347.0769348144531,"top":0,"right":805.84619140625,"bottom":347.0769348144531,"left":0} |
| .game | {"x":26.812501907348633,"y":0,"width":799.298095703125,"height":449.84136962890625,"top":0,"right":826.1105976104736,"bottom":449.84136962890625,"left":26.812501907348633} | {"x":94.5721206665039,"y":0,"width":616.6971435546875,"height":347.0721435546875,"top":0,"right":711.2692642211914,"bottom":347.0721435546875,"left":94.5721206665039} |
| .stage | {"x":26.812501907348633,"y":0,"width":799.298095703125,"height":449.84136962890625,"top":0,"right":826.1105976104736,"bottom":449.84136962890625,"left":26.812501907348633} | {"x":94.5721206665039,"y":0,"width":616.6971435546875,"height":347.0721435546875,"top":0,"right":711.2692642211914,"bottom":347.0721435546875,"left":94.5721206665039} |
| .hud | {"x":26.812501907348633,"y":0,"width":799.298095703125,"height":449.84136962890625,"top":0,"right":826.1105976104736,"bottom":449.84136962890625,"left":26.812501907348633} | {"x":94.5721206665039,"y":0,"width":616.6971435546875,"height":347.0721435546875,"top":0,"right":711.2692642211914,"bottom":347.0721435546875,"left":94.5721206665039} |

La medición íntegra, incluidos estilos de stage/game/hud/body/html, figura en geometry-before-after.json. Capturas originales locales: .audit-results/android/broken-derrotero-gesture-before.png y -after.png.

Los insets nativos antes del gesto tenían las barras ocultas: status [0,0][2772,152], navegación [2619,0][2772,1280]. Tras mostrarlas, la ventana web pierde 152 px arriba y 153 px a la derecha. Una sonda CSS posterior dio env(top/right/bottom/left)=0/0/0/47 px; esa sonda se tomó después del par, por lo que no se atribuye ese valor a ambas capturas. No se midieron env antes y después simultáneamente; los 56 px de exceso sí están medidos directamente.

## Corrección y comprobación

body usa altura 100% del bloque inicial real y container-type:size. game limita su anchura con 100cqw y 100cqh, conservando 1672/941. Se eliminan los límites vh/dvh del escenario. No se añaden listeners, temporizadores, transformaciones ni solicitudes de fullscreen. No se modifican escenas, puzzles, guardados, coordenadas ni assets.

Se sirve temporalmente el CSS candidato mediante CDP al WebappActivity de Brave, sin modificar la web publicada, y se navega con los botones del juego. Cada comprobación captura físicamente antes y después del gesto: texto visible, stage dentro de visualViewport, orientación horizontal y display-mode fullscreen. Se comprueba vencimiento tras seis segundos y repetición de la misma pista. La interceptación se retira al terminar; la comprobación definitiva usa los archivos publicados.

Regresión de escritorio: seis aventuras, 39 escenas, 43 primeros planos, persistencia, mensajes, proporción, fullscreen, instalabilidad y recursos. Un caso adicional reduce 56 px el bloque inicial respecto al viewport y comprueba que body, stage y mensaje siguen dentro.

## Chrome: icono real frente a lanzamiento manual

Se instaló desde el menú nativo de Chrome, opción Instalar. WebAPK nuevo org.chromium.webapk.a423b79668eba7933_v2, shell 189; launcher habilitado H2OMainActivity. Manifest extraído del APK: runtimeHost=com.android.chrome, startUrl/id/appKey=https://descalzo.github.io/Aventuras/index.html, scope=https://descalzo.github.io/Aventuras/, displayMode=fullscreen, orientation=landscape. Coincide con el manifest publicado. Brave usa un acceso directo ACTION_START_WEBAPP hacia su WebappActivity, con la misma URL y scope.

Lanzamiento manual de H2OMainActivity: Status ok, LaunchState COLD, actividad final Chrome WebappActivity visible, 270 ms. Pulsación real del icono desde com.miui.home: pasa por H2OMainActivity y WebappLauncherActivity pero vuelve al launcher. Se reproduce también tras detener los procesos, sin borrar datos.

El intento frío de 18:26:09 registra avoidMoveToFront by anim effect, seguido de hasBackToHome return START_ABORTED y result code=102 al abrir WebappActivity. Log limitado a esta secuencia en chrome-launch.txt. Android aborta la transición de actividad: no es una excepción JavaScript de la página. No hay FATAL del juego en esta secuencia. El valor START_ABORTED se documenta en [ActivityManager de AOSP](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/core/java/android/app/ActivityManager.java). Los logs identifican el punto del rechazo, pero no permiten asignar por sí solos toda la responsabilidad a Chrome o HyperOS.

La instalabilidad real de Brave devuelve cero errores y Chrome genera el WebAPK nativo. No hay motivo demostrado para cambiar identidad/scope ni ocultar el fallo con un acceso directo diferente. El parche web corrige los mensajes; no se presenta como solución del rechazo del launcher de Chrome, que sigue siendo una limitación externa pendiente.
