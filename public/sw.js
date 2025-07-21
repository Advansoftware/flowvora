// Service Worker para LofiVora PWA - Versão Avançada
const CACHE_NAME = 'flowvora-pwa-v3';
const API_CACHE_NAME = 'lofivora-api-v2';

// Arquivos para cache offline (tudo exceto player/AdSense)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-512.svg',
  '/meia-noite.png',
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

// Timer global para Pomodoro em background
let backgroundTimer = null;
let timerState = {
  isRunning: false,
  timeLeft: 0,
  mode: 'focus',
  activeTask: null,
  startTime: null
};

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

// Click handler para notificações
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.data);
  
  event.notification.close();
  
  const { action } = event;
  const notificationData = event.notification.data || {};
  
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window' });
      
      switch (action) {
        case 'pause':
          // Pausar timer em background
          stopBackgroundTimer();
          
          // Comunicar para a app que foi pausado
          if (clients.length > 0) {
            clients[0].postMessage({
              type: 'TIMER_PAUSED_FROM_NOTIFICATION'
            });
            clients[0].focus();
          }
          break;
          
        case 'start-next':
          // Comunicar para a app iniciar próximo ciclo
          if (clients.length > 0) {
            clients[0].postMessage({
              type: 'START_NEXT_CYCLE',
              data: { mode: notificationData.mode }
            });
            clients[0].focus();
          } else {
            // Abrir app se não estiver aberta
            self.clients.openWindow('/');
          }
          break;
          
        case 'view-app':
          if (clients.length > 0) {
            clients[0].focus();
          } else {
            self.clients.openWindow('/');
          }
          break;
          
        case 'dismiss':
        default:
          // Para notificações persistentes, apenas fecha
          if (notificationData.type === 'persistent') {
            // Não fazer nada, apenas fechou a notificação
          }
          break;
      }
    })()
  );
});

// Background sync para quando voltar online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sincronizar dados quando voltar online
      syncDataWhenOnline()
    );
  }
});

async function syncDataWhenOnline() {
  try {
    console.log('[SW] Sincronizando dados em background...');
    
    // Aqui poderia sincronizar dados de tarefas, estatísticas, etc.
    // Por enquanto apenas log
    
    // Notificar clients que sincronização foi completa
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { timestamp: Date.now() }
      });
    });
    
  } catch (error) {
    console.error('[SW] Erro na sincronização:', error);
  }
}

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
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'START_POMODORO_BACKGROUND':
      startBackgroundTimer(data);
      break;
      
    case 'STOP_POMODORO_BACKGROUND':
      stopBackgroundTimer();
      break;
      
    case 'GET_TIMER_STATE':
      event.ports[0].postMessage(getTimerState());
      break;
      
    case 'UPDATE_ACTIVE_TASK':
      timerState.activeTask = data.activeTask;
      break;
  }
});

// Funções do timer em background
function startBackgroundTimer(data) {
  const { timeLeft, mode, activeTask } = data;
  
  timerState = {
    isRunning: true,
    timeLeft: timeLeft,
    mode: mode,
    activeTask: activeTask,
    startTime: Date.now(),
    realStartTime: Date.now() // Tempo real de início
  };
  
  // Limpar timer anterior se existir
  if (backgroundTimer) {
    clearInterval(backgroundTimer);
  }
  
  // Mostrar notificação persistente durante execução
  showPersistentNotification();
  
  // Iniciar novo timer
  backgroundTimer = setInterval(() => {
    // Calcular tempo baseado no tempo real decorrido para evitar bugs
    const realElapsed = Math.floor((Date.now() - timerState.realStartTime) / 1000);
    timerState.timeLeft = Math.max(0, timeLeft - realElapsed);
    
    // Atualizar notificação persistente
    updatePersistentNotification();
    
    // Quando terminar
    if (timerState.timeLeft <= 0) {
      handleTimerComplete();
    }
    
    // Enviar updates para a app se estiver aberta
    broadcastTimerUpdate();
    
  }, 1000);
  
  console.log('[SW] Timer iniciado em background:', timerState);
}

function stopBackgroundTimer() {
  if (backgroundTimer) {
    clearInterval(backgroundTimer);
    backgroundTimer = null;
  }
  timerState.isRunning = false;
  
  // Remover notificação persistente
  self.registration.getNotifications({ tag: 'pomodoro-running' }).then(notifications => {
    notifications.forEach(notification => notification.close());
  });
  
  console.log('[SW] Timer parado');
}

function showPersistentNotification() {
  const isPomodoro = timerState.mode === 'focus';
  const taskName = timerState.activeTask?.text || 'Tarefa';
  const timeFormatted = formatTime(timerState.timeLeft);
  
  const title = isPomodoro ? `🍅 ${timeFormatted} - Focando` : `☕ ${timeFormatted} - Pausando`;
  const body = `${taskName}${isPomodoro ? ' • Modo Foco' : ' • Modo Pausa'}`;
  
  const options = {
    body: body,
    icon: '/icon-512.svg',
    badge: '/favicon.svg',
    tag: 'pomodoro-running',
    requireInteraction: false,
    silent: true,
    persistent: true,
    data: {
      type: 'persistent',
      timeLeft: timerState.timeLeft,
      mode: timerState.mode,
      taskName: taskName
    },
    actions: [
      {
        action: 'pause',
        title: '⏸️ Pausar'
      },
      {
        action: 'view-app',
        title: '👁️ Ver App'
      }
    ]
  };
  
  self.registration.showNotification(title, options);
}

function updatePersistentNotification() {
  // Fechar notificação anterior
  self.registration.getNotifications({ tag: 'pomodoro-running' }).then(notifications => {
    notifications.forEach(notification => notification.close());
  });
  
  // Mostrar nova notificação atualizada
  if (timerState.isRunning) {
    showPersistentNotification();
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getTimerState() {
  if (timerState.isRunning && timerState.startTime) {
    // Calcular tempo restante baseado no tempo real decorrido
    const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
    const actualTimeLeft = Math.max(0, timerState.timeLeft - elapsed);
    
    return {
      ...timerState,
      timeLeft: actualTimeLeft
    };
  }
  return timerState;
}

function handleTimerComplete() {
  stopBackgroundTimer();
  
  const isPomodoro = timerState.mode === 'focus';
  const taskName = timerState.activeTask?.text || 'Sem tarefa ativa';
  
  // Definir títulos e mensagens
  const title = isPomodoro ? '🍅 Pomodoro Completo!' : '✨ Pausa Terminada!';
  
  let body = '';
  if (isPomodoro) {
    body = `Tarefa: ${taskName}\nParabéns! Você completou uma sessão de foco. Hora da pausa!`;
  } else {
    body = `Sua pausa terminou. Pronto para mais uma sessão de foco?\nPróxima tarefa: ${taskName}`;
  }
  
  const options = {
    body: body,
    icon: '/icon-512.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    tag: 'pomodoro-complete',
    data: {
      url: '/',
      mode: timerState.mode,
      taskId: timerState.activeTask?.id
    },
    actions: [
      {
        action: 'start-next',
        title: isPomodoro ? 'Iniciar Pausa' : 'Continuar Foco'
      },
      {
        action: 'view-app',
        title: 'Ver App'
      },
      {
        action: 'dismiss',
        title: 'Ok'
      }
    ]
  };
  
  // Enviar notificação
  self.registration.showNotification(title, options);
  
  // Resetar estado
  timerState = {
    isRunning: false,
    timeLeft: 0,
    mode: isPomodoro ? 'shortBreak' : 'focus',
    activeTask: timerState.activeTask,
    startTime: null
  };
}

function broadcastTimerUpdate() {
  // Enviar update para todas as janelas abertas
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'TIMER_UPDATE',
        data: getTimerState()
      });
    });
  });
}
