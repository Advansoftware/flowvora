'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Popover,
  Stack,
  IconButton,
  Fade,
  Chip,
} from '@mui/material';
import {
  SystemUpdateAlt,
  Close,
  Download,
  Refresh,
} from '@mui/icons-material';
import { usePWA } from '../hooks/usePWA';

const UpdatePopover = () => {
  const { updateStatus, startUpdate, dismissUpdate } = usePWA();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (updateStatus.status === 'available' && mounted) {
      // Criar um elemento virtual para posicionar o popover
      const virtualEl = {
        getBoundingClientRect: () => ({
          top: window.innerHeight - 100,
          left: window.innerWidth / 2,
          right: window.innerWidth / 2,
          bottom: window.innerHeight - 80,
          width: 0,
          height: 0,
        }),
      };
      setAnchorEl(virtualEl);
    } else {
      setAnchorEl(null);
    }
  }, [updateStatus.status, mounted]);

  const handleUpdate = () => {
    startUpdate();
  };

  const handleDismiss = () => {
    dismissUpdate();
    setAnchorEl(null);
  };

  if (!mounted) return null;

  const isOpen = Boolean(anchorEl) && updateStatus.status === 'available';

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={handleDismiss}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 69, 19, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: 320,
          animation: 'slideUp 0.3s ease-out',
          '@keyframes slideUp': {
            from: {
              opacity: 0,
              transform: 'translateY(20px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      }}
    >
      <Box sx={{ p: 3, position: 'relative' }}>
        {/* Botão fechar */}
        <IconButton
          onClick={handleDismiss}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'rgba(255, 255, 255, 0.7)',
            width: 32,
            height: 32,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>

        <Stack spacing={2.5} alignItems="center" sx={{ pt: 1 }}>
          {/* Ícone animado */}
          <Box
            sx={{
              width: 56,
              height: 56,
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
              },
            }}
          >
            <SystemUpdateAlt 
              sx={{ 
                fontSize: 28, 
                color: 'white',
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-4px)' },
                },
              }} 
            />
          </Box>

          {/* Nova versão disponível badge */}
          <Chip
            label="NOVA VERSÃO"
            size="small"
            sx={{
              backgroundColor: 'rgba(76, 175, 80, 0.9)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              px: 1,
            }}
          />

          {/* Título */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
                mb: 0.5,
              }}
            >
              Atualização Disponível! 🚀
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.9rem',
                lineHeight: 1.4,
              }}
            >
              Uma nova versão do LofiVora está pronta com melhorias e correções
            </Typography>
          </Box>

          {/* Botões */}
          <Stack direction="row" spacing={1} sx={{ width: '100%', pt: 1 }}>
            <Button
              variant="text"
              onClick={handleDismiss}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.8rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                },
              }}
            >
              Mais tarde
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdate}
              startIcon={<Refresh />}
              sx={{
                background: 'linear-gradient(45deg, #4caf50 0%, #8bc34a 100%)',
                color: 'white',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #45a049 0%, #7cb342 100%)',
                  boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Atualizar Agora
            </Button>
          </Stack>

          {/* Indicador de features */}
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.7rem',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            ✨ Melhor desempenho e correções
          </Typography>
        </Stack>
      </Box>
    </Popover>
  );
};

export default UpdatePopover;
