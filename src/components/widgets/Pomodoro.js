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
  const [useBackgroundTimer, setUseBackgroundTimer] = useState(false); // Iniciar como false
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [initialTimeLeft, setInitialTimeLeft] = useState(25 * 60);
  const [backgroundTimerAvailable, setBackgroundTimerAvailable] = useState(false);
  
  // Buscar tarefa ativa do localStorage
  const [activeTask, setActiveTask] = useState(null);
  
  // Atualizar tarefa ativa
  useEffect(() => {
    const updateActiveTask = () => {
      if (typeof window !== 'undefined') {
        const savedTasks = localStorage.getItem('lofivora-tasks');
        if (savedTasks) {
          try {
            const tasks = JSON.parse(savedTasks);
            const active = tasks.find(task => task.status === 'in-progress' && !task.completed);
            setActiveTask(active || null);
          } catch (error) {
            console.error('Erro ao carregar tarefa ativa:', error);
          }
        } else {
          setActiveTask(null);
        }
      }
    };

    // Atualizar imediatamente
    updateActiveTask();

    // Verificar mudanças no localStorage
    const interval = setInterval(updateActiveTask, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
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

    // Verificar disponibilidade do Service Worker
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Aguardar o service worker estar realmente pronto
          const registration = await navigator.serviceWorker.ready;
          
          // Dar um tempo para o controller ser definido no mobile
          let attempts = 0;
          const maxAttempts = 10;
          
          const waitForController = async () => {
            if (navigator.serviceWorker.controller || attempts >= maxAttempts) {
              if (navigator.serviceWorker.controller) {
                console.log('[Pomodoro] Service Worker disponível');
                setBackgroundTimerAvailable(true);
                setUseBackgroundTimer(true);
              } else {
                console.log('[Pomodoro] Service Worker sem controller após tentativas, usando timer local');
                setBackgroundTimerAvailable(false);
                setUseBackgroundTimer(false);
              }
              return;
            }
            
            attempts++;
            setTimeout(waitForController, 100);
          };
          
          waitForController();
          
        } catch (error) {
          console.error('[Pomodoro] Erro ao verificar Service Worker:', error);
          setBackgroundTimerAvailable(false);
          setUseBackgroundTimer(false);
        }
      } else {
        console.log('[Pomodoro] Service Worker não suportado');
        setBackgroundTimerAvailable(false);
        setUseBackgroundTimer(false);
      }
    };

    checkServiceWorker();

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

  // Timer local (sempre ativo como fallback)
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (!timerStartTime) {
        setTimerStartTime(Date.now());
        setInitialTimeLeft(timeLeft);
      }
      
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
        const newTimeLeft = Math.max(0, initialTimeLeft - elapsed);
        
        // SEMPRE atualizar timeLeft no timer local (background timer override isso se necessário)
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft <= 0) {
          handleTimerComplete();
          return;
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      
      if (timeLeft === 0) {
        handleTimerComplete();
      }
      
      if (!isRunning) {
        setTimerStartTime(null);
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, handleTimerComplete, timerStartTime, initialTimeLeft]);

  const startTimer = useCallback(() => {
    console.log('[Pomodoro] Iniciando timer...', { 
      useBackgroundTimer, 
      hasServiceWorker: 'serviceWorker' in navigator,
      timeLeft,
      mode 
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

    // Sempre configurar o estado local primeiro
    setTimerStartTime(Date.now());
    setInitialTimeLeft(timeLeft);
    setIsRunning(true);

    // Tentar usar background timer se disponível
    if (useBackgroundTimer && 'serviceWorker' in navigator) {
      const success = startBackgroundTimer(timeLeft, mode, activeTask);
      if (success) {
        updateActiveTask(activeTask);
        console.log('[Pomodoro] Timer em background iniciado');
      } else {
        console.warn('[Pomodoro] Fallback para timer local - SW não disponível');
        // Continua com timer local já configurado acima
      }
    } else {
      console.log('[Pomodoro] Usando timer local');
    }
  }, [useBackgroundTimer, startBackgroundTimer, timeLeft, mode, activeTask, updateActiveTask, sendNotification]);

  const pauseTimer = useCallback(() => {
    if (useBackgroundTimer) {
      stopBackgroundTimer();
    }
    setIsRunning(false);
    setTimerStartTime(null);
  }, [useBackgroundTimer, stopBackgroundTimer]);

    const toggleTimer = () => {
    console.log('[Pomodoro] Toggle timer:', { isRunning, useBackgroundTimer });

    if (isRunning) {
      // Pausar timer
      if (useBackgroundTimer) {
        stopBackgroundTimer();
      }
      setIsRunning(false);
      setTimerStartTime(null);
    } else {
      // Iniciar timer - SEMPRE usar a função startTimer para garantir que funcione
      startTimer();
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
    if (!backgroundTimerAvailable) {
      console.warn('[Pomodoro] Service Worker não disponível, não é possível alternar');
      return;
    }

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
              <Tooltip title={
                !backgroundTimerAvailable 
                  ? "Service Worker indisponível - Timer local ativo"
                  : useBackgroundTimer 
                    ? "Timer em background ativo" 
                    : "Timer local ativo"
              }>
                <IconButton
                  size="small"
                  onClick={toggleBackgroundTimer}
                  disabled={!backgroundTimerAvailable}
                  sx={{
                    color: !backgroundTimerAvailable 
                      ? 'rgba(255, 152, 0, 0.7)'
                      : useBackgroundTimer 
                        ? '#4caf50' 
                        : 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:disabled': {
                      color: 'rgba(255, 152, 0, 0.5)',
                    },
                  }}
                >
                  {!backgroundTimerAvailable 
                    ? <NotificationsOff /> 
                    : useBackgroundTimer 
                      ? <Notifications /> 
                      : <NotificationsOff />}
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
