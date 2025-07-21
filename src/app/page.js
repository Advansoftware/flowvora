'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Grid,
  Stack,
  useTheme,
  Fade,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';

// Context
import { PlayerProvider, usePlayer } from '../contexts/PlayerContext';

// Widgets
import Pomodoro from '../components/widgets/Pomodoro';
import Tasks from '../components/widgets/Tasks';

// Componentes visuais
import VisualFrame from '../components/VisualFrame';
import RainEffect from '../components/RainEffect';
import ActiveTaskStatus from '../components/ActiveTaskStatus';
import WelcomeModal from '../components/WelcomeModal';
import AdSenseComponent from '../components/AdSenseComponent';
import PWAStatus from '../components/PWAStatus';
import PWAUpdateManager from '../components/PWAUpdateManager';
import NoSSR from '../components/NoSSR';
import { ADSENSE_CONFIG } from '../config/adsense';

// Componente principal que utiliza o contexto
function HomeContent() {
  const { isPlaying, mounted: playerMounted, hasUserInteracted, isReady, startPlaying, togglePlayPause } = usePlayer();
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true); // SEMPRE mostrar o modal inicialmente
  const [showMainContent, setShowMainContent] = useState(false);
  const [hasStartedExperience, setHasStartedExperience] = useState(false);
  const visualFrameRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // Configurar responsividade
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < theme.breakpoints.values.lg);
    };
    
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, [theme.breakpoints.values.lg]);

  // Sempre pausar o player quando a página carregar (antes do usuário interagir)
  useEffect(() => {
    if (mounted && playerMounted && isReady && !hasStartedExperience) {
      // Se o player estiver tocando, pausar até o usuário clicar no botão
      if (isPlaying) {
        togglePlayPause(); // Pausar
      }
    }
  }, [mounted, playerMounted, isReady, isPlaying, hasStartedExperience, togglePlayPause]);

  // Lógica do modal: SEMPRE mostrar na primeira interação (início da sessão)
  useEffect(() => {
    if (mounted && playerMounted) {
      // Modal sempre aparece no início - só desaparece quando usuário clica "Entrar no Flow"
      // showWelcome já inicia como true, então não precisamos fazer nada aqui
      // O modal só será fechado pela função handleStartExperience
    }
  }, [mounted, playerMounted]);

  const handleStartExperience = () => {
    setHasStartedExperience(true);
    
    // Recuperar o estado anterior do player e iniciar se estava tocando
    const savedState = localStorage.getItem('lofivora-audio-state');
    let shouldPlay = false;
    
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        shouldPlay = state.isPlaying || false;
      } catch (error) {
        console.warn('Erro ao recuperar estado do player:', error);
      }
    }
    
    // Iniciar ou continuar reprodução baseado no estado anterior
    // Só tentar tocar se o player estiver pronto (online) E se deveria estar tocando
    if (isReady && shouldPlay) {
      startPlaying();
    }
    
    setShowWelcome(false);
    setShowMainContent(true);
  };

  if (!mounted || !playerMounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.1rem',
            fontWeight: 500,
          }}
        >
          🧘‍♀️ Preparando ambiente...
        </Typography>
      </Box>
    );
  }

  // SEMPRE mostrar o modal primeiro quando a página carrega
  if (showWelcome) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          position: 'relative',
        }}
      >
        <WelcomeModal 
          open={true} 
          onStart={handleStartExperience}
        />
        {/* Player invisível para carregar em background */}
        <Box sx={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}>
          <VisualFrame />
        </Box>
      </Box>
    );
  }

  return (
    <>
      {/* Gerenciador de atualizações PWA */}
      <PWAUpdateManager />
      
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        }}
      >
        {/* Status da tarefa ativa */}
        <ActiveTaskStatus />

        {/* Efeito de chuva de fundo */}
        <RainEffect />

        {/* Container principal */}
        <Container
          maxWidth="xl"
          sx={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 2,
            py: { xs: 0, sm: 1, lg: 2 }, // Reduzido padding vertical, zero no mobile
            px: { xs: 1, sm: 2, lg: 4 }, // Reduzido padding horizontal no mobile
          }}
        >
          {isMobile ? (
            // Layout Mobile - Stack Vertical
            <Stack
              direction="column"
              spacing={3}
              sx={{
                height: '100%',
                width: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '2px',
                },
              }}
            >
              {/* Quadro visual no mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: { xs: '50vh', sm: '55vh' }, // Altura baseada na viewport no mobile
                    maxHeight: { xs: '400px', sm: '500px' }, // Altura máxima no mobile
                    mb: 2,
                  }}
                >
                  <VisualFrame />
                </Box>
              </motion.div>

              {/* Widgets empilhados verticalmente */}
              <Pomodoro />
              <Tasks />
              
              {/* AdSense discreto no mobile */}
              <Box sx={{ flexShrink: 0, display: { lg: 'none' } }}>
                <AdSenseComponent
                  adSlot={ADSENSE_CONFIG.SLOTS.MOBILE_BANNER}
                  adClient={ADSENSE_CONFIG.CLIENT_ID}
                  size="responsive"
                  style={{
                    container: {
                      background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.6) 0%, rgba(20, 20, 40, 0.6) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      maxHeight: '120px',
                      overflow: 'hidden',
                      marginTop: 2,
                    }
                  }}
                />
              </Box>
            </Stack>
          ) : (
            // Layout Desktop - Grid otimizado (layout original)
            <Grid container spacing={3} sx={{ height: '100%', width: '100%' }}>
              {/* Sidebar esquerda com widgets - mais estreita */}
              <Grid size={{ xs: 12, lg: 3, xl: 2.5 }}>
                <Stack
                  spacing={2}
                  sx={{
                    height: '100%',
                    overflow: 'hidden',
                    pr: 1,
                  }}
                >
                  {/* Pomodoro - sem scroll */}
                  <Box sx={{ flexShrink: 0 }}>
                    <Pomodoro />
                  </Box>
                  
                  {/* Tasks - com scroll e altura limitada */}
                  <Box 
                    sx={{ 
                      flex: 1,
                      maxHeight: '45vh', // Altura máxima reduzida para evitar passar da tela em desktops pequenos
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '2px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '2px',
                      },
                    }}
                  >
                    <Tasks />
                  </Box>
                </Stack>
              </Grid>

              {/* Área central - Player */}
              <Grid size={{ xs: 12, lg: 6, xl: 7 }}>
                <Box
                  sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    minHeight: '70vh', // Altura mínima baseada na viewport
                    maxHeight: '85vh', // Altura máxima baseada na viewport
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ 
                      width: '95%',
                      height: '95%',
                      minWidth: '600px',
                      minHeight: '400px',
                      maxWidth: '1200px',
                      maxHeight: '600px', // Altura máxima fixa
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                      }}
                    >
                      <VisualFrame ref={visualFrameRef} />
                    </Box>
                  </motion.div>
                </Box>
              </Grid>

              {/* AdSense à direita do player */}
              <Grid size={{ xs: 12, lg: 3, xl: 2.5 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pl: 2,
                  }}
                >
                  <AdSenseComponent
                    adSlot={ADSENSE_CONFIG.SLOTS.SIDEBAR}
                    adClient={ADSENSE_CONFIG.CLIENT_ID}
                    size="sidebar"
                    style={{
                      container: {
                        background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.7) 0%, rgba(20, 20, 40, 0.7) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        maxHeight: '400px',
                        overflow: 'hidden',
                      }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Indicador de modo no canto inferior direito */}
          <Fade in timeout={1000}>
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 16, lg: 24 },
                right: { xs: 16, lg: 24 },
                zIndex: 10,
                backgroundColor: 'rgba(30, 30, 60, 0.9)',
                backdropFilter: 'blur(20px)',
                padding: '8px 16px',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Box
                component="span"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                🧘‍♀️ Modo Foco Lo-fi
              </Box>
            </Box>
          </Fade>

          {/* Banner AdSense sutil no fundo */}
          <Fade in timeout={2000}>
            <Box
              sx={{
                position: 'absolute',
                bottom: 80, // Muito mais distante do fundo
                right: 20, // Posicionado à direita, fora da área central
                zIndex: 1,
                width: '300px', // Largura fixa pequena
                display: { xs: 'none', xl: 'block' }, // Só em telas muito grandes
              }}
            >
              <AdSenseComponent
                adSlot={ADSENSE_CONFIG.SLOTS.BOTTOM_BANNER}
                adClient={ADSENSE_CONFIG.CLIENT_ID}
                size="compact-banner" // Usando tamanho compacto
                style={{
                  container: {
                    background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.2) 0%, rgba(20, 20, 40, 0.2) 100%)', // Ainda mais transparente
                    backdropFilter: 'blur(10px)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.01)',
                    padding: '4px',
                    opacity: 0.4, // Muito sutil
                    transition: 'opacity 0.3s ease',
                    maxHeight: '50px', // Altura muito restrita
                    overflow: 'hidden',
                  }
                }}
              />
            </Box>
          </Fade>
        </Container>

        {/* Status PWA - esconder mensagem offline durante welcome */}
        <PWAStatus hideOfflineMessage={showWelcome} />

        {/* Overlay de fundo para criar profundidade */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at center, transparent 20%, rgba(15, 15, 35, 0.3) 80%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </Box>
    </>
  );
}

// Wrapper principal que fornece o contexto
export default function Home() {
  return (
    <NoSSR fallback={
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.1rem',
            fontWeight: 500,
          }}
        >
          🧘‍♀️ Carregando LofiVora...
        </Typography>
      </Box>
    }>
      <PlayerProvider>
        <HomeContent />
      </PlayerProvider>
    </NoSSR>
  );
}
