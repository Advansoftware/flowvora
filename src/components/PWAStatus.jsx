'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  WifiOff,
  Wifi,
  GetApp,
  Notifications,
  NotificationsOff,
  Settings,
} from '@mui/icons-material';
import { usePWA } from '../hooks/usePWA';

export default function PWAStatus({ hideOfflineMessage = false, onOpenSettings }) {
  const {
    isOnline,
    isInstallable,
    isInstalled,
    notificationPermission,
    showOnlineMessage,
    showOfflineMessage,
    installPWA,
    requestNotificationPermission,
    canInstall,
  } = usePWA();

  const [storageStatus, setStorageStatus] = useState('checking');

  useEffect(() => {
    const checkStorageStatus = async () => {
      try {
        if (typeof window !== 'undefined' && 'indexedDB' in window) {
          setStorageStatus('indexeddb');
        } else {
          setStorageStatus('localstorage');
        }
      } catch (error) {
        setStorageStatus('localstorage');
      }
    };

    checkStorageStatus();
  }, []);

  const getStorageIcon = () => {
    switch (storageStatus) {
      case 'indexeddb':
        return '💾';
      case 'localstorage':
        return '💿';
      default:
        return '⌛';
    }
  };

  const getStorageTooltip = () => {
    switch (storageStatus) {
      case 'indexeddb':
        return 'Usando IndexedDB (armazenamento avançado)';
      case 'localstorage':
        return 'Usando LocalStorage (armazenamento básico)';
      default:
        return 'Verificando tipo de armazenamento...';
    }
  };

  return (
    <>
      {/* Indicador de status offline - não mostrar durante welcome */}
      <Snackbar
        open={showOfflineMessage && !hideOfflineMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          severity="warning"
          icon={<WifiOff />}
          sx={{
            backgroundColor: 'rgba(255, 152, 0, 0.9)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          <Typography variant="body2">
            Sem conexão - Modo offline ativo
          </Typography>
          <Typography variant="caption" display="block">
            Player e anúncios indisponíveis
          </Typography>
        </Alert>
      </Snackbar>

      {/* Indicador de status online */}
      <Snackbar
        open={showOnlineMessage}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          severity="success"
          icon={<Wifi />}
          sx={{
            backgroundColor: 'rgba(76, 175, 80, 0.9)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          <Typography variant="body2">
            Conexão restaurada
          </Typography>
        </Alert>
      </Snackbar>

      {/* Status bar no canto superior direito */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '20px',
          padding: '4px 8px',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Status de conexão */}
        <Tooltip title={isOnline ? 'Online' : 'Offline'}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: isOnline ? '#4caf50' : '#ff9800',
            }}
          >
            {isOnline ? <Wifi sx={{ fontSize: 16 }} /> : <WifiOff sx={{ fontSize: 16 }} />}
          </Box>
        </Tooltip>

        {/* Status de instalação PWA */}
        <Tooltip title={isInstalled ? 'Instalado como App' : 'Executando no navegador'}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: isInstalled ? '#4caf50' : '#ff9800',
              fontSize: '14px',
            }}
          >
            {isInstalled ? '📱' : '🌐'}
          </Box>
        </Tooltip>

        {/* Status do armazenamento */}
        <Tooltip title={getStorageTooltip()}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: storageStatus === 'indexeddb' ? '#4caf50' : '#ff9800',
              fontSize: '14px',
            }}
          >
            {getStorageIcon()}
          </Box>
        </Tooltip>

        {/* Status de notificações */}
        {typeof window !== 'undefined' && 'Notification' in window && (
          <Tooltip title={
            notificationPermission === 'granted' 
              ? 'Notificações ativadas' 
              : 'Notificações desativadas'
          }>
            <IconButton
              size="small"
              onClick={requestNotificationPermission}
              sx={{
                color: notificationPermission === 'granted' ? '#4caf50' : '#757575',
                padding: '2px',
              }}
            >
              {notificationPermission === 'granted' ? (
                <Notifications sx={{ fontSize: 16 }} />
              ) : (
                <NotificationsOff sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        )}

        {/* Botão de configurações */}
        {onOpenSettings && (
          <Tooltip title="Configurações">
            <IconButton
              size="small"
              onClick={onOpenSettings}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                padding: '2px',
                '&:hover': {
                  color: '#6366f1',
                }
              }}
            >
              <Settings sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Botão de instalação PWA */}
      {canInstall && (
        <Fab
          color="primary"
          onClick={installPWA}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000,
            background: 'linear-gradient(45deg, #64b5f6, #81c784)',
            '&:hover': {
              background: 'linear-gradient(45deg, #42a5f5, #66bb6a)',
            },
          }}
        >
          <GetApp />
        </Fab>
      )}
    </>
  );
}
