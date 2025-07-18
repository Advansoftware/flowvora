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

// Widgets
import Pomodoro from '../components/widgets/Pomodoro';
import Tasks from '../components/widgets/Tasks';

// Componentes visuais
import VisualFrame from '../components/VisualFrame';
import RainEffect from '../components/RainEffect';
import ActiveTaskStatus from '../components/ActiveTaskStatus';
import WelcomeModal from '../components/WelcomeModal';
import AdSenseComponent from '../components/AdSenseComponent';
import { ADSENSE_CONFIG } from '../config/adsense';

export default function Home() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const visualFrameRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < theme.breakpoints.values.lg);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < theme.breakpoints.values.lg);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme.breakpoints.values.lg]);

  // Verificar se o vídeo já está tocando
  useEffect(() => {
    const checkVideoPlaying = () => {
      const iframe = document.querySelector('#youtube-iframe');
      if (iframe && iframe.contentWindow) {
        try {
          // Solicitar estado do player
          iframe.contentWindow.postMessage('{"event":"command","func":"getPlayerState","args":""}', '*');
        } catch (error) {
          console.log('YouTube API não disponível ainda');
        }
      }
    };

    // Escutar mensagens do YouTube
    const handleMessage = (event) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        // Se o player state for 1 (playing), esconder o modal
        if (data.info && data.info.playerState === 1) {
          setVideoPlaying(true);
          setShowWelcome(false);
        }
        // Se o player state for diferente de 1 (pausado, parado, etc), mostrar o modal
        else if (data.info && data.info.playerState !== 1) {
          setVideoPlaying(false);
          setShowWelcome(true);
        }
      } catch (e) {
        // Ignora erros de parsing
      }
    };

    if (mounted) {
      window.addEventListener('message', handleMessage);
      
      // Verificar após um delay para dar tempo do iframe carregar
      const timer = setTimeout(checkVideoPlaying, 2000);
      
      // Verificar periodicamente se o vídeo ainda está tocando
      const interval = setInterval(checkVideoPlaying, 5000);
      
      return () => {
        window.removeEventListener('message', handleMessage);
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [mounted]);

  const handleStartExperience = () => {
    setShowWelcome(false);
    setVideoPlaying(true);
    
    // Aguardar um pouco para o modal fechar e então iniciar o vídeo
    setTimeout(() => {
      // Enviar comando para o VisualFrame iniciar o vídeo
      const iframe = document.querySelector('#youtube-iframe');
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        } catch (error) {
          console.log('YouTube API não disponível ainda');
        }
      }
      
      // Também definir função global para o VisualFrame usar
      if (typeof window !== 'undefined') {
        window.flowvoraStartVideo = true;
      }
    }, 500);
  };

  if (!mounted) {
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
        <Box
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.1rem',
            fontWeight: 500,
          }}
        >
          🧘‍♀️ Preparando ambiente...
        </Box>
      </Box>
    );
  }

  return (
    <>
      {/* Modal de boas-vindas */}
      <WelcomeModal 
        open={showWelcome} 
        onStart={handleStartExperience}
      />

      <Box
        suppressHydrationWarning
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
            py: { xs: 2, sm: 3, lg: 4 },
            px: { xs: 2, sm: 3, lg: 4 },
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
                    height: { xs: '280px', sm: '350px' },
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
                  
                  {/* Tasks - com scroll */}
                  <Box 
                    sx={{ 
                      flex: 1,
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
                    minHeight: '600px',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ 
                      width: '95%',
                      height: '90%',
                      minWidth: '600px',
                      minHeight: '400px',
                      maxWidth: '1200px',
                      maxHeight: '700px',
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

          {/* Banner AdSense sutil no fundo (apenas quando modal não estiver aberto) */}
          {!showWelcome && (
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
          )}
        </Container>

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
