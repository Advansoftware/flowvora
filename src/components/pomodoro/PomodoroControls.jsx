'use client';

import { Stack } from '@mui/material';
import { PlayArrow, Pause, Refresh } from '@mui/icons-material';
import ActionButton from '../ui/ActionButton.jsx';

/**
 * Componente para os controles do Pomodoro
 * Botões de play/pause e reset
 */
const PomodoroControls = ({ 
  isRunning, 
  toggleTimer, 
  resetTimer, 
  currentMode 
}) => {
  return (
    <Stack direction="row" spacing={1} justifyContent="center">
      <ActionButton
        onClick={toggleTimer}
        variant="primary"
        color={currentMode.color}
      >
        {isRunning ? <Pause /> : <PlayArrow />}
      </ActionButton>

      <ActionButton
        onClick={resetTimer}
        variant="secondary"
      >
        <Refresh />
      </ActionButton>
    </Stack>
  );
};

export default PomodoroControls;
