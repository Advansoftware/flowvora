'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Modal, 
  Backdrop,
  Fade,
} from '@mui/material';
import { PlayArrow, MusicNote } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { usePlayer } from '../contexts/PlayerContext';

const WelcomeModal = ({ open, onStart }) => {
  const { isPlaying, startPlaying } = usePlayer();
  const [isClient, setIsClient] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  const handleStart = () => {
    // Iniciar a reprodução da música
    if (!isPlaying) {
      startPlaying();
    }
    // Fechar o modal
    onStart();
  };

  return (
    <Modal
      open={open}
      onClose={() => {}} // Não permitir fechar clicando fora
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
        },
      }}
    >
      <Fade in={open}>
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
          }}
        >
          {/* Efeito de fundo animado */}
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}
          />

          {/* Partículas flutuantes */}
          {isClient && Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                opacity: 0.1,
              }}
              animate={{
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                background: i % 2 === 0 ? '#6366f1' : '#f59e0b',
                borderRadius: '50%',
                filter: 'blur(1px)',
                zIndex: 2,
              }}
            />
          ))}

          {/* Conteúdo principal */}
          <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              {/* Ícone e Logo */}
              <Box sx={{ mb: 6 }}>
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <MusicNote 
                    sx={{ 
                      fontSize: 80, 
                      color: 'primary.main',
                      mb: 2,
                      filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))'
                    }} 
                  />
                </motion.div>
                
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontSize: { xs: '3rem', md: '4.5rem' },
                    fontWeight: 300,
                    background: 'linear-gradient(45deg, #6366f1 30%, #f59e0b 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
                    mb: 2,
                    letterSpacing: '-0.02em',
                  }}
                >
                  FlowVora
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 300,
                    opacity: 0.9,
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                  }}
                >
                  Your Personal Lo-fi Focus Space
                </Typography>
              </Box>

              {/* Descrição */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    mb: 6,
                    color: 'text.secondary',
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    maxWidth: 500,
                    mx: 'auto',
                  }}
                >
                  Mergulhe em um ambiente tranquilo e relaxante, projetado para maximizar 
                  seu foco e produtividade com música lo-fi e cenários inspiradores.
                </Typography>
              </motion.div>

              {/* Botão de Entrada */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1, ease: 'easeOut' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleStart}
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  sx={{
                    fontSize: '1.2rem',
                    py: 2,
                    px: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                    textTransform: 'none',
                    fontWeight: 500,
                    minWidth: 200,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5856eb 30%, #7c3aed 90%)',
                      boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Entrar no Flow
                </Button>
              </motion.div>

              {/* Indicadores de recursos */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
              >
                <Box 
                  sx={{ 
                    mt: 8, 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: 4,
                    flexWrap: 'wrap',
                  }}
                >
                  {[
                    { text: 'Música Lo-fi', icon: '🎵' },
                    { text: 'Ambiente Imersivo', icon: '🌙' },
                    { text: 'Foco Total', icon: '⚡' },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.7 + index * 0.2 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{feature.icon}</span>
                        {feature.text}
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </motion.div>
          </Container>
        </Box>
      </Fade>
    </Modal>
  );
};

export default WelcomeModal;
