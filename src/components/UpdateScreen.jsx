'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  SystemUpdateAlt,
  CheckCircle,
} from '@mui/icons-material';
import Image from 'next/image';

const UpdateScreen = ({ 
  isVisible = false, 
  progress = 0, 
  status = 'updating', // 'updating', 'completed'
  onComplete = () => {} 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000); // 2 segundos para mostrar a conclusão
      
      return () => clearTimeout(timer);
    }
  }, [status, onComplete]);

  if (!mounted || !isVisible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        height: '100dvh', // Dynamic viewport height para mobile
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Efeito de fundo animado */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 82, 82, 0.05) 0%, transparent 50%)
          `,
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.8 },
            '50%': { opacity: 1 },
          },
        }}
      />

      <Fade in={isVisible} timeout={800}>
        <Stack
          spacing={4}
          alignItems="center"
          sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            width: '100%',
            maxWidth: 400,
            px: 3,
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              position: 'relative',
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 69, 19, 0.2) 100%)',
              borderRadius: '50%',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2)',
              animation: status === 'updating' ? 'rotate 3s linear infinite' : 'none',
              '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          >
            {status === 'completed' ? (
              <CheckCircle 
                sx={{ 
                  fontSize: 60, 
                  color: '#4caf50',
                  animation: 'checkmark 0.6s ease-in-out',
                  '@keyframes checkmark': {
                    '0%': { transform: 'scale(0)' },
                    '50%': { transform: 'scale(1.2)' },
                    '100%': { transform: 'scale(1)' },
                  },
                }} 
              />
            ) : (
              <SystemUpdateAlt 
                sx={{ 
                  fontSize: 60, 
                  color: '#6366f1',
                }} 
              />
            )}
          </Box>

          {/* Título */}
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: '#e2e8f0',
                fontWeight: 700,
                fontSize: { xs: '2rem', sm: '2.5rem' },
                mb: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b4513 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              LofiVora
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: status === 'completed' ? '#4caf50' : '#6366f1',
                fontWeight: 500,
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
              }}
            >
              {status === 'completed' ? 'Atualização Concluída!' : 'Atualizando...'}
            </Typography>
          </Box>

          {/* Barra de Progresso */}
          {status === 'updating' && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #6366f1 0%, #8b4513 100%)',
                    borderRadius: 4,
                  },
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  color: '#6366f1',
                  fontWeight: 600,
                  fontSize: '1.5rem',
                  mt: 2,
                  fontFamily: 'monospace',
                }}
              >
                {Math.round(progress)}%
              </Typography>
            </Box>
          )}

          {/* Loading indicator para etapas sem progresso */}
          {status === 'updating' && progress === 0 && (
            <CircularProgress 
              size={40}
              sx={{
                color: '#6366f1',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
          )}

          {/* Mensagem de Status */}
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(226, 232, 240, 0.8)',
              fontSize: '1rem',
              maxWidth: 300,
              lineHeight: 1.5,
            }}
          >
            {status === 'completed' 
              ? 'Sua experiência foi aprimorada com as últimas melhorias!'
              : 'Aprimorando sua experiência com as últimas melhorias...'
            }
          </Typography>

          {/* Indicador visual adicional para conclusão */}
          {status === 'completed' && (
            <Box
              sx={{
                width: 60,
                height: 4,
                background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
                borderRadius: 2,
                animation: 'expand 0.8s ease-out',
                '@keyframes expand': {
                  '0%': { width: 0 },
                  '100%': { width: 60 },
                },
              }}
            />
          )}
        </Stack>
      </Fade>
    </Box>
  );
};

export default UpdateScreen;
