'use client';

import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
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
        backgroundImage: 'url(/meia-noite.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
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
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Focus Page - Com RoomScene
        </Typography>
        <RoomScene />
      </Container>
    </Box>
  );
}
