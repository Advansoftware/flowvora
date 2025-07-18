'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Fade,
  IconButton,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Add,
  Remove,
} from '@mui/icons-material';

const ActiveTaskStatus = () => {
  const [activeTask, setActiveTask] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateActiveTask = () => {
      const savedTasks = localStorage.getItem('lofivora-tasks');
      if (savedTasks) {
        try {
          const tasks = JSON.parse(savedTasks);
          const active = tasks.find(task => task.status === 'in-progress' && !task.completed);
          setActiveTask(active || null);
        } catch (error) {
          console.error('Erro ao carregar tarefa ativa:', error);
        }
      }
    };

    // Atualizar imediatamente
    updateActiveTask();

    // Verificar mudanças no localStorage
    const interval = setInterval(updateActiveTask, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const addPomodoroToActiveTask = () => {
    if (activeTask && typeof window !== 'undefined' && window.lofivoraAddPomodoro) {
      window.lofivoraAddPomodoro();
    }
  };

  const removePomodoroFromActiveTask = () => {
    if (activeTask && typeof window !== 'undefined' && window.lofivoraRemovePomodoro) {
      window.lofivoraRemovePomodoro();
    }
  };

  if (!mounted || !activeTask) return null;

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.85) 0%, rgba(20, 20, 40, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          padding: '12px 20px',
          border: '1px solid rgba(226, 232, 240, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minWidth: '300px',
          maxWidth: '500px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateX(-50%) translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Ícone de status */}
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)',
                },
                '70%': {
                  boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)',
                },
              },
            }}
          />

          {/* Informações da tarefa */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(226, 232, 240, 0.9)',
                fontWeight: 600,
                fontSize: '0.9rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {activeTask.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(226, 232, 240, 0.6)',
                fontSize: '0.75rem',
              }}
            >
              Foco ativo
            </Typography>
          </Box>

          {/* Contador de pomodoros */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={`🍅 ${activeTask.pomodoros}`}
              size="small"
              sx={{
                height: '24px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            />
            
            {/* Botão remover pomodoro */}
            <IconButton
              onClick={removePomodoroFromActiveTask}
              disabled={activeTask.pomodoros <= 0}
              size="small"
              sx={{
                width: 28,
                height: 28,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                opacity: activeTask.pomodoros <= 0 ? 0.3 : 1,
                '&:hover': {
                  backgroundColor: activeTask.pomodoros > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
                  transform: activeTask.pomodoros > 0 ? 'scale(1.05)' : 'none',
                },
                '&:disabled': {
                  color: 'rgba(239, 68, 68, 0.3)',
                },
                transition: 'all 0.2s ease',
              }}
              title="Remover Pomodoro"
            >
              <Remove sx={{ fontSize: '1rem' }} />
            </IconButton>
            
            {/* Botão adicionar pomodoro */}
            <IconButton
              onClick={addPomodoroToActiveTask}
              size="small"
              sx={{
                width: 28,
                height: 28,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(16, 185, 129, 0.3)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
              title="Adicionar Pomodoro"
            >
              <Add sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Fade>
  );
};

export default ActiveTaskStatus;
