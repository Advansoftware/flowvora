'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Fade,
  Slide,
  useTheme,
  alpha,
} from '@mui/material';
import {
  GetApp,
  Close,
  PhoneAndroid,
  Computer,
} from '@mui/icons-material';
import { usePWA } from '../hooks/usePWA';

export default function InstallBanner() {
  const theme = useTheme();
  const { isInstallable, installPrompt, installPWA } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      // Método 1: verificar se foi iniciado como PWA
      const urlParams = new URLSearchParams(window.location.search);
      const isFromPWA = urlParams.get('source') === 'pwa';
      
      // Método 2: verificar display-mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      // Método 3: verificar se é mobile app webview
      const isInWebAppiOS = window.navigator.standalone === true;
      
      return isFromPWA || isStandalone || isFullscreen || isMinimalUI || isInWebAppiOS;
    };

    // Verificar se foi dismissado anteriormente
    const wasDismissed = localStorage.getItem('lofivora-install-banner-dismissed') === 'true';
    
    const installed = checkIfInstalled();
    setIsInstalled(installed);
    setDismissed(wasDismissed);

    // Mostrar banner apenas se:
    // 1. PWA é instalável
    // 2. Não está instalado
    // 3. Não foi dismissado
    // 4. Aguardar um pouco para não aparecer imediatamente
    if (isInstallable && !installed && !wasDismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 5000); // 5 segundos após carregar

      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowBanner(false);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('lofivora-install-banner-dismissed', 'true');
  };

  const getDeviceIcon = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile ? <PhoneAndroid /> : <Computer />;
  };

  const getInstallText = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile 
      ? 'Instale como App no seu celular' 
      : 'Instale como App no seu computador';
  };

  // Não mostrar se não deve aparecer
  if (!showBanner || isInstalled || dismissed || !isInstallable) {
    return null;
  }

  return (
    <Slide direction="up" in={showBanner} timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.secondary.main, 0.95)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          boxShadow: `0 -8px 32px ${alpha(theme.palette.common.black, 0.3)}`,
          padding: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Ícone e Texto */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: alpha(theme.palette.common.white, 0.1),
              color: theme.palette.common.white,
            }}
          >
            {getDeviceIcon()}
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.common.white,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {getInstallText()}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.common.white, 0.8),
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Acesso rápido, funciona offline e sem ocupar espaço no navegador
            </Typography>
          </Box>
        </Box>

        {/* Botões */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleInstall}
            sx={{
              background: alpha(theme.palette.common.white, 0.2),
              color: theme.palette.common.white,
              padding: { xs: 1.5, sm: 2 },
              '&:hover': {
                background: alpha(theme.palette.common.white, 0.3),
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <GetApp />
          </IconButton>

          <IconButton
            onClick={handleDismiss}
            size="small"
            sx={{
              color: alpha(theme.palette.common.white, 0.7),
              '&:hover': {
                color: theme.palette.common.white,
                background: alpha(theme.palette.common.white, 0.1),
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Slide>
  );
}
