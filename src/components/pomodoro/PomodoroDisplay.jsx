'use client';

import { Box, Typography } from '@mui/material';

/**
 * Componente para exibir o tempo do Pomodoro
 * Mostra o timer formatado com estilo
 */
const PomodoroDisplay = ({ 
  timeLeft, 
  currentMode, 
  formatTime 
}) => {
  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      <Typography
        variant="h3"
        sx={{
          color: currentMode.color,
          fontWeight: 700,
          fontSize: '2.2rem',
          fontFamily: 'monospace',
        }}
      >
        {formatTime(timeLeft)}
      </Typography>
    </Box>
  );
};

export default PomodoroDisplay;
