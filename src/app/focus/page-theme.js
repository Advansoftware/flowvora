'use client';

import { Box, Typography } from '@mui/material';
import { useTheme } from '../../providers/ThemeProvider';

export default function FocusPage() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/meia-noite.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Typography variant="h4" sx={{ color: 'white' }}>
        Focus Page - Com Theme Provider
      </Typography>
    </Box>
  );
}
