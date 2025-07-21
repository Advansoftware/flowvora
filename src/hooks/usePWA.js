'use client';

import { useEffect, useState, useCallback } from 'react';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [swRegistration, setSwRegistration] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  
  // Estados para mensagens temporárias
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [previousOnlineState, setPreviousOnlineState] = useState(true);

  // Estados do timer em background
  const [backgroundTimer, setBackgroundTimer] = useState({
    isRunning: false,
    timeLeft: 0,
    mode: 'focus',
    activeTask: null
  });

  // Handler para mensagens do Service Worker
  const handleSWMessage = useCallback((event) => {
    const { type, data } = event.data || {};
    
    switch (type) {
      case 'TIMER_UPDATE':
        setBackgroundTimer(data);
        break;
        
      case 'START_NEXT_CYCLE':
        // App foi aberta via notificação para iniciar próximo ciclo
        window.dispatchEvent(new CustomEvent('startNextCycle', { 
          detail: data 
        }));
        break;
        
      case 'TIMER_PAUSED_FROM_NOTIFICATION':
        // Timer foi pausado via notificação
        window.dispatchEvent(new CustomEvent('timerPausedFromNotification'));
        break;
        
      case 'SYNC_COMPLETE':
        console.log('[PWA] Sincronização completa:', data);
        break;
    }
  }, []);

  // Verificar estado atual do timer no SW
  const checkBackgroundTimer = useCallback(async () => {
    if (!navigator.serviceWorker?.controller) return;
    
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      setBackgroundTimer(event.data);
    };
    
    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_TIMER_STATE' },
      [messageChannel.port2]
    );
  }, []);

  // Registrar Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registrado:', registration.scope);
          setSwRegistration(registration);
          
          // Escutar mensagens do SW
          navigator.serviceWorker.addEventListener('message', handleSWMessage);
          
          // Verificar estado do timer quando registrar
          checkBackgroundTimer();
          
          // Atualizar Service Worker quando disponível
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Novo Service Worker disponível
                  console.log('[PWA] Nova versão disponível');
                  if (confirm('Nova versão disponível! Deseja atualizar?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Erro ao registrar Service Worker:', error);
        });
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
    };
  }, [handleSWMessage, checkBackgroundTimer]);

  // Iniciar timer em background
  const startBackgroundTimer = useCallback((timeLeft, mode, activeTask) => {
    if (!navigator.serviceWorker?.controller) {
      console.warn('[PWA] Service Worker não disponível para timer em background');
      return false;
    }
    
    navigator.serviceWorker.controller.postMessage({
      type: 'START_POMODORO_BACKGROUND',
      data: { timeLeft, mode, activeTask }
    });
    
    return true;
  }, []);

  // Parar timer em background
  const stopBackgroundTimer = useCallback(() => {
    if (!navigator.serviceWorker?.controller) return;
    
    navigator.serviceWorker.controller.postMessage({
      type: 'STOP_POMODORO_BACKGROUND'
    });
  }, []);

  // Atualizar tarefa ativa no background
  const updateActiveTask = useCallback((activeTask) => {
    if (!navigator.serviceWorker?.controller) return;
    
    navigator.serviceWorker.controller.postMessage({
      type: 'UPDATE_ACTIVE_TASK',
      data: { activeTask }
    });
  }, []);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Só mostrar mensagem se estava offline antes
      if (!previousOnlineState) {
        setShowOnlineMessage(true);
        setShowOfflineMessage(false);
        // Esconder mensagem após 3 segundos
        setTimeout(() => setShowOnlineMessage(false), 3000);
      }
      setPreviousOnlineState(true);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      setShowOnlineMessage(false);
      setPreviousOnlineState(false);
    };

    // Estado inicial
    const initialState = navigator.onLine;
    setIsOnline(initialState);
    setPreviousOnlineState(initialState);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [previousOnlineState]);

  // Detectar prompt de instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setInstallPrompt(null);
      console.log('[PWA] App instalado!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Verificar permissão de notificações
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      console.log('[PWA] Resultado da instalação:', result.outcome);
      setInstallPrompt(null);
      setIsInstallable(false);
    }
  }, [installPrompt]);

  // Solicitar permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Enviar notificação local
  const sendNotification = useCallback((title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Separar opções que são suportadas pela API Notification padrão
      const { actions, ...standardOptions } = options;
      
      if (navigator.serviceWorker && navigator.serviceWorker.ready && actions) {
        // Se tem actions, usar Service Worker notification
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            icon: '/icon-512.svg',
            badge: '/favicon.svg',
            vibrate: options.silent ? undefined : [200, 100, 200],
            ...options
          });
        });
      } else {
        // Usar notificação padrão sem actions
        const notification = new Notification(title, {
          icon: '/icon-512.svg',
          badge: '/favicon.svg',
          vibrate: standardOptions.silent ? undefined : [200, 100, 200],
          ...standardOptions
        });
        
        return notification;
      }
    }
  }, []);

  // Agendar notificação de Pomodoro (deprecated - agora usamos background timer)
  const schedulePomodorNotification = useCallback((title, delay = 25 * 60 * 1000) => {
    setTimeout(() => {
      sendNotification(title, {
        body: 'Sua sessão Pomodoro terminou! Que tal fazer uma pausa?',
        tag: 'pomodoro',
        requireInteraction: true
      });
    }, delay);
  }, [sendNotification]);

  // Background Sync para tarefas
  const syncTasks = useCallback(async () => {
    if (swRegistration && 'sync' in swRegistration) {
      try {
        await swRegistration.sync.register('sync-tasks');
        console.log('[PWA] Background sync registrado para tarefas');
      } catch (error) {
        console.error('[PWA] Erro ao registrar background sync:', error);
      }
    }
  }, [swRegistration]);

  // Verificar se funcionalidades específicas estão disponíveis offline
  const isFeatureAvailableOffline = useCallback((feature) => {
    const offlineFeatures = ['tasks', 'pomodoro', 'scenes', 'storage'];
    return offlineFeatures.includes(feature);
  }, []);

  return {
    // Estados
    isOnline,
    isInstallable,
    notificationPermission,
    
    // Estados das mensagens
    showOnlineMessage,
    showOfflineMessage,
    
    // Estados do timer em background
    backgroundTimer,
    
    // Funções básicas
    installPWA,
    requestNotificationPermission,
    sendNotification,
    schedulePomodorNotification, // mantido para compatibilidade
    syncTasks,
    isFeatureAvailableOffline,
    
    // Funções do timer em background
    startBackgroundTimer,
    stopBackgroundTimer,
    updateActiveTask,
    checkBackgroundTimer,
    
    // Componentes de status
    showOfflineIndicator: showOfflineMessage,
    canUseNotifications: 'Notification' in window,
    canInstall: isInstallable,
  };
};

export default usePWA;
