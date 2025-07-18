'use client';

import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import RainEffect from '../../components/RainEffect';
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
        backgroundImage: 'url(/meia-noite.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkMode 
            ? 'rgba(15, 15, 35, 0.4)'
            : 'rgba(248, 250, 252, 0.3)',
          zIndex: 0,
        }
      }}
    >
      <RainEffect />
      
      <Container
        maxWidth={false}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ color: 'white' }}>
          Focus Page - Com RainEffect
        </Typography>
      </Container>
    </Box>
  );
}
