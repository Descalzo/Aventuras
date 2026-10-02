# Auditoría de mensajes y PWA — 2 de octubre de 2026

## Base y alcance

Se clonó `https://github.com/Descalzo/Aventuras.git` en `.work/Aventuras`.
Base remota: rama `main`, commit `e18d7f05b6aa14781c207dc6aef465a2776d5a19`.
Se comprobó que el parche se aplicaba sobre esa misma revisión. Los cambios
posteriores de GitHub respecto de la copia antigua local se conservan.

## Causas y evidencia

**Confirmado: los mensajes repetidos quedaban ocultos.** El render comparaba
solo el texto. Después de seis segundos añadía `faded`; otra acción que producía
el mismo texto no retiraba esa clase ni reiniciaba el plazo. Chromium real mostró
textContent correcto, clase `message faded`, opacity 0, visibility hidden y un
rectángulo normal. Un resize NO lo hizo visible. Este defecto no explica por sí
solo la aparición del mensaje al hacer el gesto de Android.

**Confirmado por inspección:** el primer pointerdown solicitaba Fullscreen API y
bloqueo de orientación incluso dentro de la app fullscreen del manifest. El click
podía actualizar el mensaje durante esa transición asíncrona. El plazo empezaba
durante el telón, sin comprobar layout ni visibilidad de la página.

**Pendiente en Xiaomi:** la invalidación de composición durante fullscreen y
orientación es una hipótesis plausible para el síntoma del gesto. El mensaje tenía
transform 3D, will-change, backface-visibility, transición de opacity y un observer
que reescribía transform. No se reprodujo en Chromium de escritorio la aparición
provocada por el gesto de HyperOS. No se puede certificar ese fallo resuelto, ni
atribuir definitivamente el cierre del WebAPK a Chrome/HyperOS sin logs del móvil.

## Correcciones

- Cada `say()` y reset tiene una revisión transitoria distinta del texto. No cambia
  el formato ni las claves de las partidas. Un render por carga de imagen no revive
  un mensaje vencido.
- Un único ciclo en render arranca el plazo después del telón y dos frames con
  geometría válida, con la página visible. ResizeObserver permite arrancar el plazo
  si el mensaje llegó con escenario de tamaño cero. Ocultar la app suspende el
  plazo; al volver el mensaje activo recibe un nuevo periodo de lectura.
- La PWA usa fullscreen y landscape del manifest, evitando una segunda solicitud
  por pointerdown. Se conserva la entrada fullscreen del navegador normal.
- El mensaje se centra con márgenes, sin capa 3D, promociones de composición ni fade
  de opacity. Conserva posición, tamaño, colores y duración; visibility oculta la
  caja completamente y pointer-events none deja libres los hotspots.
- Se retiran bloques inline de viewport/repaint, múltiples timeouts/listeners,
  variables de viewport sin uso y MutationObserver. Se conserva dvh, con fallback
  vh, y proporción 1672/941. No queda instrumentación de diagnóstico en el juego.

## Instalación y caché

Ambos iconos del manifest publicado apuntaban a un PNG de **1254×1254**, declarado
como 192 y 512. Se redimensionó la ilustración existente a dos PNG reales de 192×192
y 512×512. El id explícito `/Aventuras/index.html` coincide con la identidad anterior
deducida de start_url. Se conservan scope, start_url, fullscreen, landscape y colores.
No se necesita display_override. Se conserva viewport-fit y se permite zoom.

No había listener que cancelase beforeinstallprompt; no se añade botón ni se
intercepta la instalación nativa. Chromium devuelve cero errores de instalabilidad
en `Page.getInstallabilityErrors`. El momento de la promoción depende del navegador:
[criterios oficiales de Chrome](https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest).

El SW publicado no tenía fetch ni Cache Storage. El nuevo SW solicita GET del mismo
origen con `cache: no-store`, sin precarga ni copia offline. Fallo de conexión: 503.
Registro en un archivo, sin query, con updateViaCache none y errores tratados.
No borra localStorage. Se retiran todos los parámetros v=12; no hay contador manual.
La primera visita depende de la caché HTTP hasta que el SW toma control. Después de
publicar hay que cerrar/abrir o recargar para ejecutar el nuevo código.

En la publicación anterior: página, manifest, SW e icono devolvían 200 por HTTPS,
sin redirección de ruta, con MIME text/html, application/json,
application/javascript e image/png. Los nuevos archivos requieren verificación
tras terminar el despliegue de Pages.

## Archivos de la corrección

| Archivo | Motivo |
| --- | --- |
| `index.html` | Eliminar parches inline y parámetros; registro PWA, favicon y zoom. |
| `css/style.css` | Mensaje sin composición forzada y fallback vh. |
| `js/engine/state.js` | Identidad transitoria de cada notificación. |
| `js/engine/render.js` | Repetición y ciclo de vida del plazo. |
| `js/engine/main.js` | Evitar fullscreen adicional en PWA. |
| `js/pwa.js` | Registro y actualización centralizados. |
| `manifest.json` | Identidad explícita e icono 512 correcto. |
| `sw.js` | Red sin caché, priorizando actualizaciones. |
| `icons/icon-192.png`, `icons/icon-512.png` | Tamaños reales de instalación. |
| `.gitignore` | Excluir perfiles y resultados temporales. |
| `tests/browser.cjs`, `tests/phases.cjs` | Regresión en Chromium sin dependencias npm. |
| `AUDITORIA.md`, `README.md` | Evidencia, límites y prueba Android. |

No hay cambios en escenas, puzzles, datos de fases, imágenes de escenas,
rectángulos de hotspots, acciones, sonido ni crónica respecto de la base remota.

## Pruebas

Ejecutar `node tests/browser.cjs` con Chrome instalado; CHROME_PATH permite elegir
otro Chromium. Perfil exclusivo `.test-browser`, servidor bajo `/Aventuras/`.
No usa el perfil personal. BASELINE=1 permite medir una versión antigua.

- Seis fases, 39 escenas y 43 primeros planos: render, visibilidad y proporción.
- Botón Pista; persistencia por fase.
- Repetir mensaje tras seis segundos; resize 844×390 a 844×360 con DPR 2.75.
- Refresh incidental sin revivir un mensaje vencido; mensaje después del telón.
- Más de seis segundos de layout de ancho cero: plazo pendiente hasta recuperarse.
- Fullscreen real de Chromium: texto visible; captura inspeccionada visualmente.
- SW activo, controlando scope correcto; instalabilidad sin errores.
- Tamaños PNG coincidentes con manifest; sintaxis de 54 JS.
- Comprobación de excepciones, errores/avisos de consola y recursos HTTP ausentes.

Resultados y captura: `.audit-results/`, excluido de Git. Las mediciones incluyen
textContent, clases, opacity, visibility, display, z-index, boundingClientRect,
stage/game/hud, innerWidth/Height, visualViewport, DPR, display-mode y orientación.
No se ha hecho un recorrido manual completo resolviendo todos los puzzles ni una
prueba de Brave/WebAPK en el Xiaomi. Fullscreen de escritorio no equivale a HyperOS.

## Prueba específica en Android

1. Esperar al despliegue de Pages. Con conexión, abrir la web, esperar unos segundos
   y recargar. Cerrar del todo la PWA y abrirla desde su icono. No borrar datos del sitio.
2. Confirmar landscape desde el arranque. En cada aventura pulsar Pista y un hotspot
   informativo: texto visible sin gesto del borde.
3. Esperar siete segundos y repetir el mismo hotspot. El mismo texto debe reaparecer.
   Para pistas por niveles, repetir la última pista.
4. Cambiar de escena, abrir/cerrar primeros planos; texto visible tras el telón.
   Confirmar hotspots conocidos contra las imágenes.
5. Con el texto visible, hacer el gesto que antes lo revelaba: debe seguir visible
   y ajustarse al escenario. Mandar la app al fondo y volver; comprobar partida.
6. Revisar opción nativa de instalación en Chrome/Brave. Una app ya instalada puede
   no ofrecer nueva promoción. Reinstalar solo para validar metadatos si es necesario,
   conservando datos del sitio.
7. Si Chrome vuelve al launcher, recoger logs Android/WebAPK; un manifest válido
   por sí solo no demuestra que el cierre sea externo al proyecto.
