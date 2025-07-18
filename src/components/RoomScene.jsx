'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const RoomScene = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Previne problemas de SSR
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', lg: '600px' },
        height: { xs: '300px', lg: '400px' },
        backgroundColor: 'rgba(30, 30, 60, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          mb: 2,
        }}
      >
        Cena do Quarto
      </Typography>
      
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          fontSize: '0.875rem',
        }}
      >
        Ambiente de foco e concentração
      </Typography>

      {/* Simulação de elementos do quarto */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 40,
          height: 40,
          backgroundColor: 'rgba(255, 200, 100, 0.3)',
          borderRadius: '50%',
          border: '2px solid rgba(255, 200, 100, 0.5)',
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: 30,
          left: 30,
          width: 30,
          height: 60,
          backgroundColor: 'rgba(100, 200, 100, 0.3)',
          borderRadius: '15px 15px 0 0',
          border: '2px solid rgba(100, 200, 100, 0.5)',
        }}
      />
    </Box>
  );
};

export default RoomScene;
