'use client';

import { useEffect, useState, useCallback } from 'react';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [swRegistration, setSwRegistration] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Registrar Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registrado:', registration.scope);
          setSwRegistration(registration);
          
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
  }, []);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
      const notification = new Notification(title, {
        icon: '/icon-512.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        ...options
      });
      
      return notification;
    }
  }, []);

  // Agendar notificação de Pomodoro
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
    
    // Funções
    installPWA,
    requestNotificationPermission,
    sendNotification,
    schedulePomodorNotification,
    syncTasks,
    isFeatureAvailableOffline,
    
    // Componentes de status
    showOfflineIndicator: !isOnline,
    canUseNotifications: 'Notification' in window,
    canInstall: isInstallable,
  };
};

export default usePWA;
