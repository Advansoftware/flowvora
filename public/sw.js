// Service Worker para LofiVora PWA - Versão Avançada
const CACHE_NAME = 'lofivora-pwa-v5'; // Incrementando versão para forçar atualização
const API_CACHE_NAME = 'lofivora-api-v3';

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

// Controle de atualização
let updateAvailable = false;

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nova versão do Service Worker...');
  
  // Enviar progresso da instalação
  const broadcastProgress = (progress, status) => {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_PROGRESS',
          data: { progress, status }
        });
      });
    });
  };

  event.waitUntil(
    (async () => {
      try {
        // Fase 1: Abrir cache (10%)
        broadcastProgress(10, 'installing');
        const cache = await caches.open(CACHE_NAME);
        
        // Fase 2: Cachear arquivos (50%)
        broadcastProgress(50, 'installing');
        console.log('[SW] Cacheando arquivos estáticos...');
        await cache.addAll(STATIC_ASSETS);
        
        // Fase 3: Finalizar instalação (80%)
        broadcastProgress(80, 'installing');
        console.log('[SW] Nova versão instalada e pronta para ativação');
        
        // Pular espera e ativar imediatamente
        await self.skipWaiting();
        
        // Fase 4: Conclusão (100%)
        broadcastProgress(100, 'installed');
        
      } catch (error) {
        console.error('[SW] Erro durante instalação:', error);
      }
    })()
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  // Enviar progresso da ativação
  const broadcastProgress = (progress, status) => {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_PROGRESS',
          data: { progress, status }
        });
      });
    });
  };

  event.waitUntil(
    (async () => {
      try {
        // Fase 1: Limpeza de cache antigo (20%)
        broadcastProgress(20, 'activating');
        const cacheNames = await caches.keys();
        
        await Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
        
        // Fase 2: Assumir controle (60%)
        broadcastProgress(60, 'activating');
        await self.clients.claim();
        
        // Fase 3: Notificar conclusão (100%)
        broadcastProgress(100, 'completed');
        console.log('[SW] Service Worker ativado e assumiu controle');
        
        // Enviar sinal de atualização completa
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_COMPLETED'
          });
        });
        
      } catch (error) {
        console.error('[SW] Erro durante ativação:', error);
      }
    })()
  );
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
  
  console.log('[SW] Mensagem recebida:', { type, data });
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'START_POMODORO_BACKGROUND':
      console.log('[SW] Iniciando timer em background:', data);
      startBackgroundTimer(data);
      break;
      
    case 'STOP_POMODORO_BACKGROUND':
      console.log('[SW] Parando timer em background');
      stopBackgroundTimer();
      break;
      
    case 'GET_TIMER_STATE':
      const state = getTimerState();
      console.log('[SW] Enviando estado do timer:', state);
      event.ports[0].postMessage(state);
      break;
      
    case 'UPDATE_ACTIVE_TASK':
      console.log('[SW] Atualizando tarefa ativa:', data.activeTask);
      timerState.activeTask = data.activeTask;
      break;
  }
});

// Funções do timer em background
function startBackgroundTimer(data) {
  const { timeLeft, mode, activeTask } = data;
  
  console.log('[SW] Configurando timer em background:', {
    timeLeft,
    mode,
    activeTask: activeTask?.text || 'N/A'
  });

  // Limpar timer anterior se existir
  if (backgroundTimer) {
    console.log('[SW] Limpando timer anterior');
    clearInterval(backgroundTimer);
  }
  
  timerState = {
    isRunning: true,
    timeLeft: timeLeft,
    mode: mode,
    activeTask: activeTask,
    startTime: Date.now(),
    realStartTime: Date.now(), // Tempo real de início
    initialDuration: timeLeft  // Duração inicial para evitar bugs
  };
  
  // Mostrar notificação inicial (silenciosa)
  showPersistentNotification();
  
  // Iniciar novo timer
  backgroundTimer = setInterval(() => {
    // Calcular tempo baseado no tempo real decorrido para evitar bugs de precisão
    const realElapsed = Math.floor((Date.now() - timerState.realStartTime) / 1000);
    timerState.timeLeft = Math.max(0, timerState.initialDuration - realElapsed);
    
    // Log de debug a cada 30 segundos
    if (realElapsed % 30 === 0) {
      console.log('[SW] Timer executando:', {
        elapsed: realElapsed,
        timeLeft: timerState.timeLeft,
        mode: timerState.mode
      });
    }
    
    // Quando terminar
    if (timerState.timeLeft <= 0) {
      console.log('[SW] Timer completo, executando callback');
      handleTimerComplete();
      return;
    }
    
    // Enviar updates para a app se estiver aberta
    broadcastTimerUpdate();
    
  }, 1000);
  
  console.log('[SW] Timer iniciado em background com sucesso:', timerState);
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
  
  const title = isPomodoro ? `🍅 Pomodoro Iniciado` : `☕ Pausa Iniciada`;
  const body = `${taskName} • ${isPomodoro ? 'Modo Foco' : 'Modo Pausa'} • ${timeFormatted}`;
  
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
  // Removido - não precisamos atualizar a notificação a cada segundo
  // A notificação inicial já mostra o status correto
  console.log('[SW] Timer executando - tempo restante:', formatTime(timerState.timeLeft));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getTimerState() {
  if (timerState.isRunning && timerState.realStartTime) {
    // Calcular tempo restante baseado no tempo real decorrido
    const elapsed = Math.floor((Date.now() - timerState.realStartTime) / 1000);
    const actualTimeLeft = Math.max(0, timerState.initialDuration - elapsed);
    
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
  
  // Definir próximo modo baseado na lógica do Pomodoro
  let nextMode = 'focus';
  let title = '';
  let body = '';
  let emoji = '';
  
  if (isPomodoro) {
    // Terminou um pomodoro - calcular qual pausa
    // Por simplicidade, vamos usar shortBreak (deveria vir do estado global dos ciclos)
    nextMode = 'shortBreak';
    title = '🍅 Pomodoro Completo!';
    body = `Tarefa concluída: ${taskName}\n⏰ Hora da pausa de 5 minutos`;
    emoji = '☕';
  } else if (timerState.mode === 'shortBreak') {
    // Terminou pausa curta
    nextMode = 'focus';
    title = '☕ Pausa Curta Terminada!';
    body = `Pausa concluída!\n🍅 Pronto para mais uma sessão de foco?`;
    emoji = '🍅';
  } else if (timerState.mode === 'longBreak') {
    // Terminou pausa longa
    nextMode = 'focus';
    title = '🌟 Descanso Prolongado Terminado!';
    body = `Descanso concluído!\n🍅 Hora de focar novamente`;
    emoji = '🍅';
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
      nextMode: nextMode,
      taskId: timerState.activeTask?.id
    },
    actions: [
      {
        action: 'start-next',
        title: `${emoji} Iniciar ${nextMode === 'focus' ? 'Foco' : nextMode === 'shortBreak' ? 'Pausa' : 'Descanso'}`
      },
      {
        action: 'view-app',
        title: '👁️ Ver App'
      },
      {
        action: 'dismiss',
        title: '✋ Mais tarde'
      }
    ]
  };
  
  // Enviar notificação
  self.registration.showNotification(title, options);
  
  // Resetar estado
  timerState = {
    isRunning: false,
    timeLeft: 0,
    mode: nextMode,
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
