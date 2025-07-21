'use client';

import { Stack, Chip } from '@mui/material';

/**
 * Componente para seleção de modos do Pomodoro
 * Permite alternar entre Focus, Pausa Curta e Descanso Longo
 */
const PomodoroModes = ({ 
  modes, 
  mode, 
  changeMode 
}) => {
  return (
    <Stack direction="row" spacing={1} justifyContent="center">
      {Object.entries(modes).map(([key, modeData]) => (
        <Chip
          key={key}
          label={modeData.emoji}
          size="small"
          onClick={() => changeMode(key)}
          sx={{
            backgroundColor: mode === key ? `${modeData.color}30` : 'rgba(255, 255, 255, 0.1)',
            color: mode === key ? modeData.color : 'rgba(255, 255, 255, 0.7)',
            border: mode === key ? `1px solid ${modeData.color}` : '1px solid transparent',
            cursor: 'pointer',
            minWidth: '32px',
            '&:hover': {
              backgroundColor: `${modeData.color}20`,
            },
          }}
        />
      ))}
    </Stack>
  );
};

export default PomodoroModes;
