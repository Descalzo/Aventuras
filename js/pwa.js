/* Instalación nativa: no interceptar beforeinstallprompt ni crear botones. */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        updateViaCache: 'none'
      });
      await registration.update();
    } catch (error) {
      console.warn('No se pudo actualizar la PWA:', error);
    }
  });
}
