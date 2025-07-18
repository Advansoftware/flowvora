'use client';

import { Box, Container, IconButton, Tooltip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import PomodoroTimer from '../../components/PomodoroTimer';
import AudioPlayer from '../../components/AudioPlayer';
import TaskList from '../../components/TaskList';
import RainEffect from '../../components/RainEffect';
import QuoteRotator from '../../components/QuoteRotator';
import RoomScene from '../../components/RoomScene';
import { useTheme } from '../../providers/ThemeProvider';

export default function FocusPage() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        // Fundo com a imagem meia-noite.png
        backgroundImage: 'url(/meia-noite.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        // Overlay para controlar a opacidade
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkMode 
            ? 'rgba(15, 15, 35, 0.4)' // Overlay escuro sutil
            : 'rgba(248, 250, 252, 0.3)', // Overlay claro sutil
          zIndex: 0,
        }
      }}
    >
      {/* Rain Effect */}
      <RainEffect />
      
      {/* Theme Toggle Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <Tooltip title={isDarkMode ? 'Tema Claro' : 'Tema Escuro'}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                transform: 'scale(1.05)',
              },
            }}
          >
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Main Content Container */}
      <Container
        maxWidth={false}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          position: 'relative',
          zIndex: 2,
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, lg: 4 },
          height: '100vh',
          gap: { xs: 2, lg: 4 },
        }}
      >
        {/* Left Panel - Controls */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            width: { xs: '100%', lg: '320px' },
            minWidth: { lg: '320px' },
            maxWidth: { xs: '100%', lg: '320px' },
          }}
        >
          {/* Audio Player */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <AudioPlayer />
          </motion.div>

          {/* Pomodoro Timer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <PomodoroTimer />
          </motion.div>

          {/* Task List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <TaskList />
          </motion.div>

          {/* Motivational Quote - Left Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(30, 30, 60, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                p: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontStyle: 'italic',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  textAlign: 'left',
                }}
              >
                Stay focused and keep going
              </Typography>
            </Box>
          </motion.div>
        </Box>

        {/* Right Panel - Room Scene */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            minHeight: { xs: '300px', lg: '100%' },
          }}
        >
          {/* Room Scene Component */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ 
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <RoomScene />
          </motion.div>
        </Box>
      </Container>

      {/* Bottom Quote - Main Message */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 20, lg: 40 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          textAlign: 'center',
          width: '100%',
          px: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 300,
              fontSize: { xs: '1.2rem', sm: '1.5rem', lg: '1.75rem' },
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.5px',
            }}
          >
            Stay focused and keep going.
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
}
