'use client';

import { Box, Typography } from '@mui/material';

export default function FocusPage() {
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
        Focus Page - Em construção
      </Typography>
    </Box>
  );
}
