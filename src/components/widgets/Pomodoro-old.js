'use client';

import { useState, useEffect, useRef } from 'react';
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
  
  const intervalRef = useRef(null);
  
  const modes = {
    focus: { duration: 25 * 60, label: 'Foco', emoji: '🍅', color: '#ff5252' },
    shortBreak: { duration: 5 * 60, label: 'Pausa', emoji: '☕', color: '#4caf50' },
    longBreak: { duration: 15 * 60, label: 'Descanso', emoji: '🌟', color: '#2196f3' },
  };

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
        // Timer acabou - lógica de transição entre modos
        if (mode === 'focus') {
          setCycles(prev => prev + 1);
          const newCycles = cycles + 1;
          
          // A cada 4 ciclos de foco, pausa longa. Caso contrário, pausa curta
          if (newCycles % 4 === 0) {
            setMode('longBreak');
            setTimeLeft(modes.longBreak.duration);
          } else {
            setMode('shortBreak');
            setTimeLeft(modes.shortBreak.duration);
          }
        } else {
          // Voltando para modo foco após qualquer pausa
          setMode('focus');
          setTimeLeft(modes.focus.duration);
        }
        setIsRunning(false);
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, mode, cycles, modes.focus.duration, modes.longBreak.duration, modes.shortBreak.duration]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode('focus');
    setTimeLeft(modes.focus.duration);
    clearInterval(intervalRef.current);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorByMode = () => {
    switch (mode) {
      case 'focus':
        return '#ff6b6b'; // Vermelho
      case 'shortBreak':
        return '#4ecdc4'; // Verde água
      case 'longBreak':
        return '#45b7d1'; // Azul
      default:
        return '#ff6b6b';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card
        sx={{
          backgroundColor: 'rgba(30, 30, 60, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minWidth: { xs: '100%', sm: '280px' },
          maxHeight: '400px',
          overflow: 'auto',
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          {/* Header com ícone e modo atual */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <TimerOutlined sx={{ color: 'white', mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              Pomodoro
            </Typography>
          </Box>

          {/* Modo atual */}
          <Chip
            label={`${currentMode.emoji} ${currentMode.label}`}
            sx={{
              backgroundColor: getColorByMode(),
              color: 'white',
              fontWeight: 500,
              mb: 3,
              fontSize: '0.875rem',
            }}
          />

          {/* Timer display */}
          <motion.div
            animate={{
              scale: isRunning ? [1, 1.02, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isRunning ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 300,
                color: 'white',
                mb: 2,
                fontFamily: 'monospace',
                fontSize: { xs: '2.5rem', sm: '3rem' },
                letterSpacing: '2px',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {formatTime(timeLeft)}
            </Typography>
          </motion.div>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              mb: 3,
              '& .MuiLinearProgress-bar': {
                backgroundColor: getColorByMode(),
                borderRadius: 3,
              },
            }}
          />

          {/* Controles */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={toggleTimer}
                sx={{
                  backgroundColor: getColorByMode(),
                  color: 'white',
                  width: 50,
                  height: 50,
                  '&:hover': {
                    backgroundColor: getColorByMode(),
                    opacity: 0.8,
                  },
                }}
              >
                {isRunning ? <Pause /> : <PlayArrow />}
              </IconButton>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={resetTimer}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  width: 50,
                  height: 50,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </motion.div>
          </Box>

          {/* Estatísticas */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              mt: 2,
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: getColorByMode(), fontWeight: 600 }}>
                {cycles}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Ciclos
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                {Math.floor(cycles * 25)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Minutos
              </Typography>
            </Box>
          </Box>

          {/* Status */}
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              mt: 2,
              display: 'block',
              fontStyle: 'italic',
            }}
          >
            {isRunning ? '⏱️ Em andamento' : '⏸️ Pausado'}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Pomodoro;
