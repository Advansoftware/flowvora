'use client';

import { useEffect, useState, useCallback } from 'react';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [swRegistration, setSwRegistration] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  
    // Estados das mensagens
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [previousOnlineState, setPreviousOnlineState] = useState(true);

  // Estados de atualização do PWA
  const [updateStatus, setUpdateStatus] = useState({
    isUpdating: false,
    progress: 0,
    status: 'idle', // 'idle', 'checking', 'downloading', 'installing', 'completed'
  });

  // Estados do timer em background
  const [backgroundTimer, setBackgroundTimer] = useState({
    isRunning: false,
    timeLeft: 0,
    mode: 'focus',
    activeTask: null
  });

  // Função para revalidar permissão de notificação
  const revalidateNotificationPermission = useCallback(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setNotificationPermission(currentPermission);
      console.log('[PWA] Revalidando permissão de notificação:', currentPermission);
      return currentPermission;
    }
    return 'default';
  }, []);

  // Revalidar permissão quando o app ganha foco
  useEffect(() => {
    const handleFocus = () => {
      revalidateNotificationPermission();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        revalidateNotificationPermission();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [revalidateNotificationPermission]);

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
        
      case 'UPDATE_AVAILABLE':
        // Nova versão disponível - não usar alert, apenas setState
        setUpdateStatus({
          isUpdating: false,
          progress: 0,
          status: 'available'
        });
        console.log('[PWA] Nova versão detectada - popover será exibido');
        break;
      case 'UPDATE_PROGRESS':
        // Progresso da atualização
        setUpdateStatus(prev => ({
          ...prev,
          progress: data.progress,
          status: data.status,
          isUpdating: true
        }));
        break;
        
      case 'UPDATE_COMPLETED':
        // Atualização concluída
        setUpdateStatus({
          isUpdating: true,
          progress: 100,
          status: 'completed'
        });
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
              console.log('[PWA] Nova versão detectada');
              
              // Mostrar popover de atualização disponível
              setUpdateStatus({
                isUpdating: false,
                progress: 0,
                status: 'available'
              });

              newWorker.addEventListener('statechange', () => {
                console.log('[PWA] Estado do novo worker:', newWorker.state);
                
                switch (newWorker.state) {
                  case 'installing':
                    setUpdateStatus(prev => ({
                      ...prev,
                      progress: 25,
                      status: 'installing',
                      isUpdating: true
                    }));
                    break;
                    
                  case 'installed':
                    setUpdateStatus(prev => ({
                      ...prev,
                      progress: 75,
                      status: 'installing'
                    }));
                    
                    if (navigator.serviceWorker.controller) {
                      // Aguardar comando do usuário para ativar
                      console.log('[PWA] Nova versão pronta, aguardando ativação do usuário');
                    }
                    break;
                    
                  case 'activated':
                    setUpdateStatus({
                      isUpdating: true,
                      progress: 100,
                      status: 'completed'
                    });
                    
                    // Recarregar após mostrar conclusão
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                    break;
                }
              });
            }
          });

          // Listener para quando o Service Worker for atualizado
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] Controller mudou, preparando reload');
            setUpdateStatus(prev => ({
              ...prev,
              progress: 90,
              status: 'installing'
            }));
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
    console.log('[PWA] Tentando iniciar timer em background...', {
      hasServiceWorker: 'serviceWorker' in navigator,
      hasController: !!navigator.serviceWorker?.controller,
      timeLeft,
      mode
    });

    if (!navigator.serviceWorker?.controller) {
      console.warn('[PWA] Service Worker não disponível para timer em background');
      return false;
    }
    
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'START_POMODORO_BACKGROUND',
        data: { timeLeft, mode, activeTask }
      });
      
      console.log('[PWA] Mensagem enviada para Service Worker');
      return true;
    } catch (error) {
      console.error('[PWA] Erro ao enviar mensagem para Service Worker:', error);
      return false;
    }
  }, []);

  // Parar timer em background
  const stopBackgroundTimer = useCallback(() => {
    console.log('[PWA] Parando timer em background...', {
      hasController: !!navigator.serviceWorker?.controller
    });

    if (!navigator.serviceWorker?.controller) {
      console.warn('[PWA] Service Worker não disponível para parar timer');
      return;
    }
    
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'STOP_POMODORO_BACKGROUND'
      });
      console.log('[PWA] Comando de parada enviado para Service Worker');
    } catch (error) {
      console.error('[PWA] Erro ao parar timer em background:', error);
    }
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
      setIsInstalled(true);
      console.log('[PWA] App instalado!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Detectar se o PWA está instalado
  const checkIsInstalled = useCallback(() => {
    // Método 1: verificar se foi iniciado como PWA via URL
    const urlParams = new URLSearchParams(window.location.search);
    const isFromPWA = urlParams.get('source') === 'pwa';
    
    // Método 2: verificar display-mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
    
    // Método 3: verificar se é mobile app webview (iOS)
    const isInWebAppiOS = window.navigator.standalone === true;
    
    // Método 4: verificar user agent para alguns casos específicos
    const isTwitterInApp = navigator.userAgent.includes('Twitter');
    const isFacebookInApp = navigator.userAgent.includes('FBAN') || navigator.userAgent.includes('FBAV');
    
    const installed = (isFromPWA || isStandalone || isFullscreen || isMinimalUI || isInWebAppiOS) && !isTwitterInApp && !isFacebookInApp;
    
    console.log('[PWA] Status de instalação:', {
      isFromPWA,
      isStandalone, 
      isFullscreen,
      isMinimalUI,
      isInWebAppiOS,
      isTwitterInApp,
      isFacebookInApp,
      installed
    });
    
    setIsInstalled(installed);
    return installed;
  }, []);

  // Verificar status de instalação no carregamento
  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkIsInstalled();
      
      // Revalidar quando o display mode mudar
      const mediaQueries = [
        '(display-mode: fullscreen)',
        '(display-mode: standalone)', 
        '(display-mode: minimal-ui)'
      ];
      
      const handleDisplayModeChange = () => {
        setTimeout(checkIsInstalled, 100);
      };
      
      const mediaQueryLists = mediaQueries.map(query => {
        const mql = window.matchMedia(query);
        mql.addEventListener('change', handleDisplayModeChange);
        return mql;
      });
      
      return () => {
        mediaQueryLists.forEach(mql => {
          mql.removeEventListener('change', handleDisplayModeChange);
        });
      };
    }
  }, [checkIsInstalled]);
  
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

  // Fechar tela de atualização
  const completeUpdate = useCallback(() => {
    setUpdateStatus({
      isUpdating: false,
      progress: 0,
      status: 'idle'
    });
  }, []);

  // Forçar verificação de atualização
  const checkForUpdates = useCallback(async () => {
    if (swRegistration) {
      console.log('[PWA] Verificando atualizações...');
      await swRegistration.update();
    }
  }, [swRegistration]);

  // Iniciar atualização manualmente
  const startUpdate = useCallback(() => {
    if (swRegistration && swRegistration.waiting) {
      console.log('[PWA] Iniciando atualização...');
      
      setUpdateStatus({
        isUpdating: true,
        progress: 0,
        status: 'downloading'
      });

      // Enviar comando para ativar nova versão
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [swRegistration]);

  // Dispensar notificação de atualização
  const dismissUpdate = useCallback(() => {
    setUpdateStatus({
      isUpdating: false,
      progress: 0,
      status: 'idle'
    });
  }, []);

  // Verificar se funcionalidades específicas estão disponíveis offline
  const isFeatureAvailableOffline = useCallback((feature) => {
    const offlineFeatures = ['tasks', 'pomodoro', 'scenes', 'storage'];
    return offlineFeatures.includes(feature);
  }, []);

  return {
    // Estados
    isOnline,
    isInstallable,
    isInstalled,
    notificationPermission,
    
    // Estados das mensagens
    showOnlineMessage,
    showOfflineMessage,
    
    // Estados do timer em background
    backgroundTimer,
    
    // Estados de atualização
    updateStatus,
    
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
    
    // Funções de atualização
    completeUpdate,
    checkForUpdates,
    startUpdate,
    dismissUpdate,
    
    // Componentes de status
    showOfflineIndicator: showOfflineMessage,
    canUseNotifications: 'Notification' in window,
    canInstall: isInstallable,
    
    // Nova função para revalidar status de instalação
    checkIsInstalled,
  };
};

export default usePWA;
