'use client';

import { Box, Stack, Fade } from '@mui/material';
import { usePomodoro } from '../../hooks/usePomodoro';
import {
  PomodoroHeader,
  PomodoroDisplay,
  PomodoroProgress,
  PomodoroControls,
  PomodoroModes
} from '../pomodoro';

/**
 * Componente principal do Pomodoro
 * Orquestra todos os subcomponentes usando o hook usePomodoro
 */
const Pomodoro = () => {
  const {
    // Estado
    timeLeft,
    isRunning,
    mode,
    cycles,
    mounted,
    activeTask,
    
    // Dados computados
    currentMode,
    progress,
    modes,
    
    // Funções de controle
    toggleTimer,
    resetTimer,
    changeMode,
    
    // Utilitários
    formatTime,
    truncateTaskText
  } = usePomodoro();

  if (!mounted) return null;

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          padding: 2.5,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          width: '100%',
        }}
      >
        <Stack spacing={2}>
          {/* Header com informações da tarefa ativa */}
          <PomodoroHeader 
            currentMode={currentMode}
            activeTask={activeTask}
            cycles={cycles}
            truncateTaskText={truncateTaskText}
          />

          {/* Timer display */}
          <PomodoroDisplay 
            timeLeft={timeLeft}
            currentMode={currentMode}
            formatTime={formatTime}
          />

          {/* Progress bar */}
          <PomodoroProgress 
            progress={progress}
            currentMode={currentMode}
          />

          {/* Controles compactos */}
          <PomodoroControls 
            isRunning={isRunning}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            currentMode={currentMode}
          />

          {/* Seleção de modo */}
          <PomodoroModes 
            modes={modes}
            mode={mode}
            changeMode={changeMode}
          />
        </Stack>
      </Box>
    </Fade>
  );
};

export default Pomodoro;
