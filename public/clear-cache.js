// Script para forçar limpeza de cache PWA
// Execute no console do navegador se os botões não aparecerem

(function() {
  console.log('[PWA-Debug] Iniciando limpeza de cache...');
  
  // 1. Limpar todos os caches do Service Worker
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      console.log('[PWA-Debug] Caches encontrados:', cacheNames);
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('[PWA-Debug] Deletando cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('[PWA-Debug] Todos os caches deletados');
    });
  }
  
  // 2. Desregistrar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      console.log('[PWA-Debug] Service Workers encontrados:', registrations.length);
      for(let registration of registrations) {
        console.log('[PWA-Debug] Desregistrando SW:', registration.scope);
        registration.unregister();
      }
    });
  }
  
  // 3. Limpar localStorage
  console.log('[PWA-Debug] Limpando localStorage...');
  localStorage.clear();
  
  // 4. Limpar sessionStorage
  console.log('[PWA-Debug] Limpando sessionStorage...');
  sessionStorage.clear();
  
  // 5. Aguardar e recarregar
  setTimeout(function() {
    console.log('[PWA-Debug] Recarregando página...');
    window.location.reload(true);
  }, 2000);
})();
