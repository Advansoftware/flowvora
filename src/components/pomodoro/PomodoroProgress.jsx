'use client';

import { LinearProgress } from '@mui/material';

/**
 * Componente para a barra de progresso do Pomodoro
 * Mostra o progresso visual do timer
 */
const PomodoroProgress = ({ 
  progress, 
  currentMode 
}) => {
  return (
    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        '& .MuiLinearProgress-bar': {
          backgroundColor: currentMode.color,
          borderRadius: 3,
        },
      }}
    />
  );
};

export default PomodoroProgress;
