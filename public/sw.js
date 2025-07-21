// Service Worker para LofiVora PWA
const CACHE_NAME = 'lofivora-v1';
const API_CACHE_NAME = 'lofivora-api-v1';

// Arquivos para cache offline (tudo exceto player/AdSense)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-512.svg',
  '/meia-noite.png',
  '/_next/static/css/',
  '/_next/static/js/',
];

// URLs que NÃO devem ser cachadas (requerem internet)
const NETWORK_ONLY_URLs = [
  '/youtube-api',
  '/www.youtube.com',
  '/i.ytimg.com',
  '/googleads',
  '/googlesyndication',
  '/doubleclick.net',
  '/adsystem.google',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando arquivos estáticos...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Ativar imediatamente sem esperar
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assumir controle de todas as páginas
  self.clients.claim();
});

// Interceptação de requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Não cachear URLs específicas (YouTube, AdSense, etc.)
  const isNetworkOnly = NETWORK_ONLY_URLs.some(pattern => 
    request.url.includes(pattern)
  );
  
  if (isNetworkOnly) {
    // Apenas rede - não usar cache
    event.respondWith(fetch(request));
    return;
  }
  
  // Para outros recursos, usar estratégia cache-first
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          // Não cachear se não for uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar response para cache
          const responseClone = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          
          return response;
        }).catch(() => {
          // Se estiver offline e não tiver cache, retornar página offline
          if (request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
    );
  }
});

// Background Sync para tarefas
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

// Notificações Push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon-512.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'Ver'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clique em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  const url = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Se já existe uma janela aberta, focar nela
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Caso contrário, abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Função para sincronizar tarefas
async function syncTasks() {
  try {
    // Aqui você pode implementar lógica para sincronizar tarefas
    // Por exemplo, enviar tarefas pendentes para um servidor
    console.log('[SW] Sincronizando tarefas...');
    
    // Simular sincronização
    const tasks = JSON.parse(localStorage.getItem('lofivora-tasks') || '[]');
    console.log('[SW] Tarefas para sincronizar:', tasks.length);
    
  } catch (error) {
    console.error('[SW] Erro ao sincronizar tarefas:', error);
  }
}

// Message handling para comunicação com a app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
