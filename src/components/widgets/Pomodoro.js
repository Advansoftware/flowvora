'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
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
import { usePWA } from '../../hooks/usePWA';
import { useSettings } from '../../hooks/useSettings';
import { storageService } from '../../services/storageNew.js';
import ActionButton from '../ui/ActionButton.jsx';

const Pomodoro = () => {
  const { getPomodoroTimes } = useSettings();
  const [pomodoroTimes, setPomodoroTimes] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15
  });
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus');
  const [cycles, setCycles] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [initialTimeLeft, setInitialTimeLeft] = useState(25 * 60);
  
  // Buscar tarefa ativa do storage
  const [activeTask, setActiveTask] = useState(null);

  // Carregar configurações do Pomodoro uma vez
  useEffect(() => {
    const loadPomodoroTimes = async () => {
      const times = getPomodoroTimes();
      setPomodoroTimes(times);
      
      // Definir tempo inicial para o modo focus (padrão)
      const focusTime = times.focus || 25;
      setTimeLeft(focusTime * 60);
      setInitialTimeLeft(focusTime * 60);
    };
    
    loadPomodoroTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez na inicialização
  
  // Atualizar tarefa ativa
  useEffect(() => {
    const updateActiveTask = async () => {
      try {
        const tasks = await storageService.getTasks();
        const active = tasks.find(task => task.status === 'in-progress' && !task.completed);
        setActiveTask(active || null);
      } catch (error) {
        console.error('Erro ao carregar tarefa ativa:', error);
      }
    };

    // Atualizar imediatamente
    updateActiveTask();

    // Verificar mudanças periodicamente
    const interval = setInterval(updateActiveTask, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const intervalRef = useRef(null);
  const { 
    sendNotification, 
    requestNotificationPermission
  } = usePWA();

  const modes = useMemo(() => ({
    focus: { duration: pomodoroTimes.focus * 60, label: 'Foco', emoji: '🍅', color: '#ff5252' },
    shortBreak: { duration: pomodoroTimes.shortBreak * 60, label: 'Pausa', emoji: '☕', color: '#4caf50' },
    longBreak: { duration: pomodoroTimes.longBreak * 60, label: 'Descanso', emoji: '🌟', color: '#2196f3' },
  }), [pomodoroTimes]);

  // Definir changeMode antes dos useEffects que o utilizam
  const changeMode = useCallback((newMode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setInitialTimeLeft(modes[newMode].duration);
    setTimerStartTime(null);
    setIsRunning(false);
  }, [modes]);

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
  
  const currentMode = modes[mode];
  const totalTime = currentMode.duration;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Definir handleTimerComplete antes do useEffect que o utiliza
  const handleTimerComplete = useCallback(() => {
    let nextMode = 'focus';
    let notificationTitle = '';
    let notificationBody = '';
    
    if (mode === 'focus') {
      // Completou um pomodoro
      const newCycles = cycles + 1;
      setCycles(newCycles);
      
      // A cada 4 pomodoros, descanso longo
      nextMode = newCycles > 0 && newCycles % 4 === 0 ? 'longBreak' : 'shortBreak';
      
      notificationTitle = '🍅 Pomodoro Completo!';
      const taskName = activeTask?.text || 'Tarefa';
      notificationBody = `Tarefa: ${taskName}\n⏰ Hora da pausa!`;
      
      // Adicionar pomodoro à tarefa ativa
      if (typeof window !== 'undefined' && window.lofivoraAddPomodoro) {
        window.lofivoraAddPomodoro();
      }
    } else if (mode === 'shortBreak') {
      nextMode = 'focus';
      notificationTitle = '☕ Pausa Curta Terminada!';
      notificationBody = `Pausa de 5 minutos concluída!\n🍅 Pronto para focar?`;
    } else if (mode === 'longBreak') {
      nextMode = 'focus';
      notificationTitle = '🌟 Descanso Prolongado Terminado!';
      notificationBody = `Descanso de 15 minutos concluído!\n🍅 Vamos focar novamente?`;
    }

    // Enviar notificação apenas quando completar um ciclo
    sendNotification(notificationTitle, {
      body: notificationBody,
      tag: 'pomodoro-complete',
      requireInteraction: true,
      icon: '/icon-512.svg',
      vibrate: [200, 100, 200, 100, 200],
      actions: [
        { 
          action: 'start-next', 
          title: nextMode === 'focus' ? '🍅 Iniciar Foco' : 
                 nextMode === 'shortBreak' ? '☕ Iniciar Pausa' : 
                 '🌟 Iniciar Descanso'
        },
        { action: 'view-app', title: '👁️ Ver App' }
      ]
    });

    // Mudar para o próximo modo
    setMode(nextMode);
    setTimeLeft(modes[nextMode].duration);
    setInitialTimeLeft(modes[nextMode].duration);
    setIsRunning(false);
    setTimerStartTime(null);
  }, [mode, activeTask, sendNotification, modes, cycles]);

  // Timer principal - totalmente front-end, precisão de segundo
  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('[Pomodoro Debug] Timer effect triggered:', {
      isRunning,
      timeLeft,
      timerStartTime,
      isAndroid,
      isPWA,
      hasUserActivation: navigator.userActivation?.hasBeenActive || false
    });

    if (isRunning && timeLeft > 0) {
      if (!timerStartTime) {
        const startTime = Date.now();
        setTimerStartTime(startTime);
        setInitialTimeLeft(timeLeft);
        console.log('[Pomodoro Debug] Timer started at:', new Date(startTime).toISOString());
      }
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - timerStartTime) / 1000);
        const newTimeLeft = Math.max(0, initialTimeLeft - elapsed);
        
        console.log('[Pomodoro Debug] Timer tick:', {
          now: new Date(now).toISOString(),
          elapsed,
          newTimeLeft,
          initialTimeLeft,
          timerStartTime: new Date(timerStartTime).toISOString()
        });
        
        // Atualizar timeLeft com precisão
        setTimeLeft(newTimeLeft);
        
        // Verificar se terminou
        if (newTimeLeft <= 0) {
          console.log('[Pomodoro Debug] Timer completo');
          handleTimerComplete();
          return;
        }
      }, 1000); // Mudei para 1 segundo para debug mais claro
    } else {
      if (intervalRef.current) {
        console.log('[Pomodoro Debug] Clearing interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Se parou e chegou a zero, executar callback
      if (timeLeft === 0 && !isRunning) {
        console.log('[Pomodoro Debug] Timer reached zero, completing');
        handleTimerComplete();
      }
      
      // Reset timer start se não estiver rodando
      if (!isRunning) {
        setTimerStartTime(null);
      }
    }

    return () => {
      if (intervalRef.current) {
        console.log('[Pomodoro Debug] Cleanup: clearing interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft, handleTimerComplete, timerStartTime, initialTimeLeft]);

  const startTimer = useCallback(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('[Pomodoro Debug] Starting timer:', { 
      timeLeft,
      mode,
      isAndroid,
      isPWA,
      hasUserActivation: navigator.userActivation?.hasBeenActive || false,
      visibilityState: document.visibilityState,
      hasFocus: document.hasFocus()
    });

    // Enviar notificação de início
    const taskName = activeTask?.text || 'Tarefa';
    const modeText = mode === 'focus' ? 'Foco' : mode === 'shortBreak' ? 'Pausa' : 'Descanso Prolongado';
    const modeEmoji = mode === 'focus' ? '🍅' : mode === 'shortBreak' ? '☕' : '🌟';
    
    sendNotification(`${modeEmoji} ${modeText} Iniciado`, {
      body: `${taskName} • ${formatTime(timeLeft)}`,
      tag: 'pomodoro-start',
      requireInteraction: false,
      icon: '/icon-512.svg',
      silent: true
    });

    // Configurar o estado local
    const startTime = Date.now();
    setTimerStartTime(startTime);
    setInitialTimeLeft(timeLeft);
    setIsRunning(true);
    
    console.log('[Pomodoro Debug] Timer state set:', {
      timerStartTime: new Date(startTime).toISOString(),
      initialTimeLeft: timeLeft,
      isRunning: true
    });
  }, [timeLeft, mode, activeTask, sendNotification]);

  const pauseTimer = useCallback(() => {
    console.log('[Pomodoro Debug] Pausando timer front-end...');
    setIsRunning(false);
    setTimerStartTime(null);
  }, []);

  const toggleTimer = () => {
    console.log('[Pomodoro Debug] Toggle timer:', { 
      isRunning, 
      timeLeft,
      hasIntervalRef: !!intervalRef.current 
    });

    if (isRunning) {
      // Pausar timer
      pauseTimer();
    } else {
      // Iniciar timer
      startTimer();
    }
  };

  const resetTimer = () => {
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

  // Expor funções globais para controle do Pomodoro pelas tarefas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.lofivoraStartPomodoro = startTimer;
      window.lofivoraPausePomodoro = pauseTimer;
    }
  }, [startTimer, pauseTimer]);

  if (!mounted) return null;

  // Função para truncar texto da tarefa no Pomodoro
  const truncateTaskText = (text, maxLength = 25) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

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
