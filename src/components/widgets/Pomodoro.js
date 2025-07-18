'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
  Fade,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
} from '@mui/icons-material';

const Pomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus');
  const [cycles, setCycles] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  const intervalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const modes = useMemo(() => ({
    focus: { duration: 25 * 60, label: 'Foco', emoji: '🍅', color: '#ff5252' },
    shortBreak: { duration: 5 * 60, label: 'Pausa', emoji: '☕', color: '#4caf50' },
    longBreak: { duration: 15 * 60, label: 'Descanso', emoji: '🌟', color: '#2196f3' },
  }), []);

  const currentMode = modes[mode];
  const totalTime = currentMode.duration;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      
      if (timeLeft === 0) {
        if (mode === 'focus') {
          setCycles(prev => prev + 1);
          const nextMode = cycles > 0 && cycles % 4 === 3 ? 'longBreak' : 'shortBreak';
          setMode(nextMode);
          setTimeLeft(modes[nextMode].duration);
          
          // Adicionar pomodoro à tarefa ativa
          if (typeof window !== 'undefined' && window.lofivoraAddPomodoro) {
            window.lofivoraAddPomodoro();
          }
        } else {
          setMode('focus');
          setTimeLeft(modes.focus.duration);
        }
        setIsRunning(false);
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, mode, cycles, modes]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(currentMode.duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setIsRunning(false);
  };

  // Expor funções globais para controle do Pomodoro pelas tarefas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.lofivoraStartPomodoro = startTimer;
      window.lofivoraPausePomodoro = pauseTimer;
    }
  }, []);

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
          {/* Header compacto */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

          {/* Timer display */}
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

          {/* Progress bar */}
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

          {/* Controles compactos */}
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton
              onClick={toggleTimer}
              sx={{
                backgroundColor: `${currentMode.color}20`,
                border: `2px solid ${currentMode.color}`,
                color: currentMode.color,
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: `${currentMode.color}30`,
                },
              }}
            >
              {isRunning ? <Pause /> : <PlayArrow />}
            </IconButton>

            <IconButton
              onClick={resetTimer}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.7)',
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Stack>

          {/* Seleção de modo */}
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
        </Stack>
      </Box>
    </Fade>
  );
};

export default Pomodoro;
