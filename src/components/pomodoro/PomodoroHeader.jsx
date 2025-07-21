'use client';

import { Box, Typography, Chip } from '@mui/material';

/**
 * Componente para o cabeçalho do Pomodoro
 * Mostra modo atual, tarefa ativa e contador de ciclos
 */
const PomodoroHeader = ({ 
  currentMode, 
  activeTask, 
  cycles, 
  truncateTaskText 
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {currentMode.emoji} {currentMode.label}
        </Typography>
        {activeTask && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.7rem',
              display: 'block',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={activeTask.text} // Mostrar texto completo no hover
          >
            📋 {truncateTaskText(activeTask.text)}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={`${cycles} ciclos`}
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '0.7rem',
          }}
        />
      </Box>
    </Box>
  );
};

export default PomodoroHeader;
