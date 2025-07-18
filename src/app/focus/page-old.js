'use client';

import { useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import { motion } from 'framer-motion';

// Widgets
import AudioPlayer from '../../components/widgets/AudioPlayer';
import Pomodoro from '../../components/widgets/Pomodoro';
import Tasks from '../../components/widgets/Tasks';

// Componentes visuais
import VisualFrame from '../../components/VisualFrame';
import RainEffect from '../../components/RainEffect';

export default function FocusPage() {
  const [showVideo, setShowVideo] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState('jfKfPfyJRdk');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const handleDisplayModeChange = (isVideo) => {
    setShowVideo(isVideo);
  };

  const handleCurrentVideoChange = (videoId) => {
    setCurrentVideoId(videoId);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      {/* Efeito de chuva de fundo */}
      <RainEffect />

      {/* Container principal */}
      <Container
        maxWidth="xl"
        sx={{
          height: '100vh',
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
                  height: { xs: '250px', sm: '300px' },
                  mb: 2,
                }}
              >
                <VisualFrame 
                  showVideo={showVideo} 
                  videoId={currentVideoId}
                />
              </Box>
            </motion.div>

            {/* Widgets empilhados verticalmente */}
            <AudioPlayer 
              onDisplayModeChange={handleDisplayModeChange}
              onCurrentVideoChange={handleCurrentVideoChange}
            />
            <Pomodoro />
            <Tasks />
          </Stack>
        ) : (
          // Layout Desktop - Grid
          <Grid container spacing={4} sx={{ height: '100%' }}>
            {/* Sidebar esquerda com widgets */}
            <Grid item xs={12} lg={4} xl={3}>
              <Stack
                spacing={3}
                sx={{
                  height: '100%',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '3px',
                  },
                }}
              >
                <AudioPlayer 
                  onDisplayModeChange={handleDisplayModeChange}
                  onCurrentVideoChange={handleCurrentVideoChange}
                />
                <Pomodoro />
                <Tasks />
              </Stack>
            </Grid>

            {/* Área central - Quadro visual */}
            <Grid item xs={12} lg={8} xl={9}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{ 
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: { lg: '80%', xl: '85%' },
                    maxWidth: '900px',
                    maxHeight: '600px',
                    position: 'relative',
                  }}
                >
                  <VisualFrame 
                    showVideo={showVideo} 
                    videoId={currentVideoId}
                  />

                  {/* Overlay sutil com gradiente para integração */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(15, 15, 35, 0.1) 70%)',
                      pointerEvents: 'none',
                      borderRadius: 4,
                    }}
                  />
                </Box>
              </motion.div>
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
  );
}
