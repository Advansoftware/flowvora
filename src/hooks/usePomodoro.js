'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePWA } from './usePWA';
import { useSettings } from './useSettings';
import { storageService } from '../services/storageNew.js';

/**
 * Hook customizado para gerenciar toda a lógica do Pomodoro
 * Segue o padrão de separação de responsabilidades
 */
export const usePomodoro = () => {
  // ============== STATE ==============
  const { getPomodoroTimes } = useSettings();
  const { sendNotification, requestNotificationPermission } = usePWA();
  
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
  const [activeTask, setActiveTask] = useState(null);
  
  const intervalRef = useRef(null);

  // ============== COMPUTED VALUES ==============
  const modes = useMemo(() => ({
    focus: { duration: pomodoroTimes.focus * 60, label: 'Foco', emoji: '🍅', color: '#ff5252' },
    shortBreak: { duration: pomodoroTimes.shortBreak * 60, label: 'Pausa', emoji: '☕', color: '#4caf50' },
    longBreak: { duration: pomodoroTimes.longBreak * 60, label: 'Descanso', emoji: '🌟', color: '#2196f3' },
  }), [pomodoroTimes]);

  const currentMode = modes[mode];
  const totalTime = currentMode.duration;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // ============== UTILITY FUNCTIONS ==============
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const truncateTaskText = useCallback((text, maxLength = 25) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }, []);

  // ============== CORE TIMER LOGIC ==============
  const changeMode = useCallback((newMode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setInitialTimeLeft(modes[newMode].duration);
    setTimerStartTime(null);
    setIsRunning(false);
  }, [modes]);

  const startTimer = useCallback(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('[Pomodoro Hook] Starting timer:', { 
      timeLeft,
      mode,
      isAndroid,
      isMobile,
      isPWA,
      hasUserActivation: navigator.userActivation?.hasBeenActive || false,
      visibilityState: document.visibilityState,
      hasFocus: document.hasFocus(),
      currentTime: Date.now()
    });

    try {
      // Configurar o estado local PRIMEIRO (crítico para mobile)
      const startTime = Date.now();
      console.log('[Pomodoro Hook] Setting timer state immediately...');
      
      setTimerStartTime(startTime);
      setInitialTimeLeft(timeLeft);
      setIsRunning(true);
      
      console.log('[Pomodoro Hook] Timer state set successfully:', {
        timerStartTime: new Date(startTime).toISOString(),
        initialTimeLeft: timeLeft,
        isRunning: true
      });

      // Enviar notificação de início (após definir o estado)
      const taskName = activeTask?.text || 'Tarefa';
      const modeText = mode === 'focus' ? 'Foco' : mode === 'shortBreak' ? 'Pausa' : 'Descanso Prolongado';
      const modeEmoji = mode === 'focus' ? '🍅' : mode === 'shortBreak' ? '☕' : '🌟';
      
      // No mobile, notificação pode falhar silenciosamente sem afetar o timer
      try {
        sendNotification(`${modeEmoji} ${modeText} Iniciado`, {
          body: `${taskName} • ${formatTime(timeLeft)}`,
          tag: 'pomodoro-start',
          requireInteraction: false,
          icon: '/icon-512.svg',
          silent: true
        });
      } catch (notificationError) {
        console.log('[Pomodoro Hook] Notification failed (non-critical):', notificationError);
      }

    } catch (error) {
      console.error('[Pomodoro Hook] Error starting timer:', error);
    }
  }, [timeLeft, mode, activeTask, sendNotification, formatTime]);

  const pauseTimer = useCallback(() => {
    console.log('[Pomodoro Hook] Pausando timer front-end...');
    setIsRunning(false);
    setTimerStartTime(null);
  }, []);

  const toggleTimer = useCallback(() => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log('[Pomodoro Hook] Toggle timer called:', { 
      isRunning, 
      timeLeft,
      hasIntervalRef: !!intervalRef.current,
      isMobile,
      timestamp: Date.now(),
      event: 'user-interaction'
    });

    try {
      if (isRunning) {
        console.log('[Pomodoro Hook] Calling pauseTimer...');
        pauseTimer();
      } else {
        console.log('[Pomodoro Hook] Calling startTimer...');
        startTimer();
      }
    } catch (error) {
      console.error('[Pomodoro Hook] Error in toggleTimer:', error);
    }
  }, [isRunning, timeLeft, pauseTimer, startTimer]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimerStartTime(null);
    setTimeLeft(currentMode.duration);
    setInitialTimeLeft(currentMode.duration);
  }, [currentMode.duration]);

  // ============== TIMER COMPLETION LOGIC ==============
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
      notificationBody = `Pausa de ${pomodoroTimes.shortBreak} minutos concluída!\n🍅 Pronto para focar?`;
    } else if (mode === 'longBreak') {
      nextMode = 'focus';
      notificationTitle = '🌟 Descanso Prolongado Terminado!';
      notificationBody = `Descanso de ${pomodoroTimes.longBreak} minutos concluído!\n🍅 Vamos focar novamente?`;
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
  }, [mode, activeTask, sendNotification, modes, cycles, pomodoroTimes]);

  // ============== EFFECTS ==============
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

  // Inicialização e eventos
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

  // Timer principal - totalmente front-end, precisão de segundo
  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('[Pomodoro Hook] Timer effect triggered:', {
      isRunning,
      timeLeft,
      timerStartTime,
      initialTimeLeft,
      isAndroid,
      isMobile,
      isPWA,
      hasUserActivation: navigator.userActivation?.hasBeenActive || false
    });

    if (isRunning && timeLeft > 0) {
      // Garantir que timerStartTime está definido
      if (!timerStartTime) {
        console.log('[Pomodoro Hook] WARNING: timerStartTime not set, using current time');
        const startTime = Date.now();
        setTimerStartTime(startTime);
        setInitialTimeLeft(timeLeft);
        console.log('[Pomodoro Hook] Timer started at (fallback):', new Date(startTime).toISOString());
        return; // Retornar para aguardar o próximo ciclo com o timerStartTime definido
      }
      
      console.log('[Pomodoro Hook] Creating interval with timerStartTime:', new Date(timerStartTime).toISOString());
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - timerStartTime) / 1000);
        const newTimeLeft = Math.max(0, initialTimeLeft - elapsed);
        
        console.log('[Pomodoro Hook] Timer tick:', {
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
          console.log('[Pomodoro Hook] Timer completo');
          handleTimerComplete();
          return;
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        console.log('[Pomodoro Hook] Clearing interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Se parou e chegou a zero, executar callback
      if (timeLeft === 0 && !isRunning) {
        console.log('[Pomodoro Hook] Timer reached zero, completing');
        handleTimerComplete();
      }
      
      // Reset timer start se não estiver rodando
      if (!isRunning) {
        setTimerStartTime(null);
      }
    }

    return () => {
      if (intervalRef.current) {
        console.log('[Pomodoro Hook] Cleanup: clearing interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft, handleTimerComplete, timerStartTime, initialTimeLeft]);

  // Expor funções globais para controle do Pomodoro pelas tarefas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.lofivoraStartPomodoro = startTimer;
      window.lofivoraPausePomodoro = pauseTimer;
    }
  }, [startTimer, pauseTimer]);

  // ============== RETURN INTERFACE ==============
  return {
    // Estado
    timeLeft,
    isRunning,
    mode,
    cycles,
    mounted,
    activeTask,
    
    // Dados computados
    currentMode,
    totalTime,
    progress,
    modes,
    
    // Funções de controle
    toggleTimer,
    resetTimer,
    changeMode,
    startTimer,
    pauseTimer,
    
    // Utilitários
    formatTime,
    truncateTaskText
  };
};
