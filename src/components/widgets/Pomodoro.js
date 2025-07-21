'use client';

import { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  Notifications,
  NotificationsOff,
} from '@mui/icons-material';
import { usePWA } from '../../hooks/usePWA';

const Pomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus');
  const [cycles, setCycles] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [useBackgroundTimer, setUseBackgroundTimer] = useState(true);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [initialTimeLeft, setInitialTimeLeft] = useState(25 * 60);
  
  // Simular tarefa ativa por enquanto (depois será do contexto)
  const activeTask = useMemo(() => ({ 
    text: 'Estudar PWA avançado', 
    id: '1' 
  }), []);
  
  const intervalRef = useRef(null);
  const { 
    sendNotification, 
    requestNotificationPermission, 
    backgroundTimer,
    startBackgroundTimer,
    stopBackgroundTimer,
    updateActiveTask
  } = usePWA();

  const modes = useMemo(() => ({
    focus: { duration: 25 * 60, label: 'Foco', emoji: '🍅', color: '#ff5252' },
    shortBreak: { duration: 5 * 60, label: 'Pausa', emoji: '☕', color: '#4caf50' },
    longBreak: { duration: 15 * 60, label: 'Descanso', emoji: '🌟', color: '#2196f3' },
  }), []);

  // Definir changeMode antes dos useEffects que o utilizam
  const changeMode = useCallback((newMode) => {
    if (useBackgroundTimer) {
      stopBackgroundTimer();
    }
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setInitialTimeLeft(modes[newMode].duration);
    setTimerStartTime(null);
    setIsRunning(false);
  }, [useBackgroundTimer, stopBackgroundTimer, modes]);

  useEffect(() => {
    setMounted(true);
    // Solicitar permissão para notificações ao montar o componente
    if (typeof window !== 'undefined' && 'Notification' in window) {
      requestNotificationPermission();
    }

    // Escutar eventos de notificação para iniciar próximo ciclo
    const handleStartNextCycle = (event) => {
      const { mode: nextMode } = event.detail;
      if (nextMode) {
        const targetMode = nextMode === 'focus' ? 'shortBreak' : 'focus';
        changeMode(targetMode);
        setIsRunning(true);
      }
    };

    // Escutar evento de pausa via notificação
    const handleTimerPaused = () => {
      setIsRunning(false);
      setTimerStartTime(null);
    };

    window.addEventListener('startNextCycle', handleStartNextCycle);
    window.addEventListener('timerPausedFromNotification', handleTimerPaused);
    
    return () => {
      window.removeEventListener('startNextCycle', handleStartNextCycle);
      window.removeEventListener('timerPausedFromNotification', handleTimerPaused);
    };
  }, [requestNotificationPermission, changeMode]);

  // Sincronizar com o timer em background
  useEffect(() => {
    if (useBackgroundTimer && backgroundTimer.isRunning) {
      setTimeLeft(backgroundTimer.timeLeft);
      setMode(backgroundTimer.mode);
      setIsRunning(true);
    }
  }, [backgroundTimer, useBackgroundTimer]);
  
  const currentMode = modes[mode];
  const totalTime = currentMode.duration;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Definir handleTimerComplete antes do useEffect que o utiliza
  const handleTimerComplete = useCallback(() => {
    // Enviar notificação quando o timer terminar
    const notificationTitle = mode === 'focus' 
      ? '🍅 Pomodoro Completo!' 
      : '✨ Pausa Terminada!';
    
    const taskName = activeTask?.text || 'Sem tarefa ativa';
    const notificationBody = mode === 'focus'
      ? `Tarefa: ${taskName}\nParabéns! Você completou uma sessão de foco. Hora da pausa!`
      : `Sua pausa terminou. Pronto para mais uma sessão de foco?\nPróxima tarefa: ${taskName}`;

    sendNotification(notificationTitle, {
      body: notificationBody,
      tag: 'pomodoro-timer',
      requireInteraction: true,
      icon: '/icon-512.svg',
      actions: [
        { action: 'start-next', title: mode === 'focus' ? 'Iniciar Pausa' : 'Continuar Foco' },
        { action: 'view-app', title: 'Ver App' }
      ]
    });

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
  }, [mode, activeTask, sendNotification, cycles, modes]);

  // Timer local (fallback quando background não disponível)
  useEffect(() => {
    if (!useBackgroundTimer && isRunning && timeLeft > 0) {
      if (!timerStartTime) {
        setTimerStartTime(Date.now());
        setInitialTimeLeft(timeLeft);
      }
      
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
        const newTimeLeft = Math.max(0, initialTimeLeft - elapsed);
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft <= 0) {
          handleTimerComplete();
        }
      }, 1000);
    } else if (!useBackgroundTimer) {
      clearInterval(intervalRef.current);
      
      if (timeLeft === 0) {
        handleTimerComplete();
      }
      
      if (!isRunning) {
        setTimerStartTime(null);
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, useBackgroundTimer, handleTimerComplete, timerStartTime, initialTimeLeft]);

  const startTimer = useCallback(() => {
    if (useBackgroundTimer && 'serviceWorker' in navigator) {
      const success = startBackgroundTimer(timeLeft, mode, activeTask);
      if (success) {
        updateActiveTask(activeTask);
        setIsRunning(true);
        setTimerStartTime(Date.now());
        setInitialTimeLeft(timeLeft);
      } else {
        setUseBackgroundTimer(false);
        setTimerStartTime(Date.now());
        setInitialTimeLeft(timeLeft);
        setIsRunning(true);
      }
    } else {
      setTimerStartTime(Date.now());
      setInitialTimeLeft(timeLeft);
      setIsRunning(true);
    }
  }, [useBackgroundTimer, startBackgroundTimer, timeLeft, mode, activeTask, updateActiveTask]);

  const pauseTimer = useCallback(() => {
    if (useBackgroundTimer) {
      stopBackgroundTimer();
    }
    setIsRunning(false);
    setTimerStartTime(null);
  }, [useBackgroundTimer, stopBackgroundTimer]);

  const toggleTimer = () => {
    if (useBackgroundTimer && 'serviceWorker' in navigator) {
      if (isRunning) {
        stopBackgroundTimer();
        setIsRunning(false);
        setTimerStartTime(null);
      } else {
        const success = startBackgroundTimer(timeLeft, mode, activeTask);
        if (success) {
          updateActiveTask(activeTask);
          setIsRunning(true);
          setTimerStartTime(Date.now());
          setInitialTimeLeft(timeLeft);
        } else {
          // Fallback para timer local
          setUseBackgroundTimer(false);
          setTimerStartTime(Date.now());
          setInitialTimeLeft(timeLeft);
          setIsRunning(true);
        }
      }
    } else {
      if (isRunning) {
        setIsRunning(false);
        setTimerStartTime(null);
      } else {
        setTimerStartTime(Date.now());
        setInitialTimeLeft(timeLeft);
        setIsRunning(true);
      }
    }
  };

  const resetTimer = () => {
    if (useBackgroundTimer) {
      stopBackgroundTimer();
    }
    setIsRunning(false);
    setTimerStartTime(null);
    setTimeLeft(currentMode.duration);
    setInitialTimeLeft(currentMode.duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleBackgroundTimer = () => {
    if (isRunning) {
      if (useBackgroundTimer) {
        stopBackgroundTimer();
      }
      setIsRunning(false);
    }
    setUseBackgroundTimer(!useBackgroundTimer);
  };

  // Expor funções globais para controle do Pomodoro pelas tarefas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.lofivoraStartPomodoro = startTimer;
      window.lofivoraPausePomodoro = pauseTimer;
    }
  }, [startTimer, pauseTimer]);

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
                >
                  📋 {activeTask.text}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={useBackgroundTimer ? "Timer em background ativo" : "Timer local"}>
                <IconButton
                  size="small"
                  onClick={toggleBackgroundTimer}
                  sx={{
                    color: useBackgroundTimer ? '#4caf50' : 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {useBackgroundTimer ? <Notifications /> : <NotificationsOff />}
                </IconButton>
              </Tooltip>
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
            {useBackgroundTimer && backgroundTimer.isRunning && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#4caf50',
                  fontSize: '0.7rem',
                  display: 'block',
                }}
              >
                ⚡ Executando em background
              </Typography>
            )}
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
