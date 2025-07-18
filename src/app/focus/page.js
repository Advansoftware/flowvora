'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Stack,
  useTheme,
  Fade,
} from '@mui/material';
import { motion } from 'framer-motion';

// Widgets
import Pomodoro from '../../components/widgets/Pomodoro';
import Tasks from '../../components/widgets/Tasks';

// Componentes visuais
import VisualFrame from '../../components/VisualFrame';
import RainEffect from '../../components/RainEffect';
import ActiveTaskStatus from '../../components/ActiveTaskStatus';
import WelcomeModal from '../../components/WelcomeModal';
import ClientOnly from '../../components/ClientOnly';

export default function FocusPage() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false); // Iniciar como false
  const visualFrameRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // Verificar se é primeira visita para mostrar modal
    const hasVisited = localStorage.getItem('lofivora-focus-visited');
    if (!hasVisited) {
      setShowWelcome(true);
    }
    
    // Configurar responsividade
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < theme.breakpoints.values.lg);
    };
    
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, [theme.breakpoints.values.lg]);

  const handleStartExperience = () => {
    // Marcar que o usuário visitou a página de foco
    localStorage.setItem('lofivora-focus-visited', 'true');
    
    setShowWelcome(false);
    
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
        window.lofivoraStartVideo = true;
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
    <ClientOnly fallback={
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
          🧘‍♀️ Carregando modo foco...
        </Box>
      </Box>
    }>
      {!mounted ? (
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
      ) : (
        <>
          {/* Modal de boas-vindas */}
          <WelcomeModal 
            open={showWelcome} 
            onStart={handleStartExperience}
          />

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
          </Stack>
        ) : (
          // Layout Desktop - Grid otimizado
          <Grid container spacing={3} sx={{ height: '100%', width: '100%' }}>
            {/* Sidebar esquerda com widgets - mais estreita */}
            <Grid item xs={12} lg={3} xl={2.5}>
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

            {/* Área central - Quadro visual expandido e centralizado */}
            <Grid item xs={12} lg={9} xl={9.5}>
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
      )}
    </ClientOnly>
  );
}
