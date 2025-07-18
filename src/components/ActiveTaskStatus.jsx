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
} from '@mui/icons-material';

const ActiveTaskStatus = () => {
  const [activeTask, setActiveTask] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateActiveTask = () => {
      const savedTasks = localStorage.getItem('flowvora-tasks');
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
    if (activeTask && typeof window !== 'undefined' && window.flowvoraAddPomodoro) {
      window.flowvoraAddPomodoro();
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
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.95) 0%, rgba(255, 193, 7, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          padding: '12px 20px',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          boxShadow: '0 8px 32px rgba(255, 152, 0, 0.4)',
          minWidth: '300px',
          maxWidth: '500px',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Ícone de status */}
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)',
                },
                '70%': {
                  boxShadow: '0 0 0 6px rgba(76, 175, 80, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
                },
              },
            }}
          />

          {/* Informações da tarefa */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(0, 0, 0, 0.8)',
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
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '0.75rem',
              }}
            >
              Tarefa em andamento
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
                backgroundColor: 'rgba(255, 99, 71, 0.2)',
                color: '#d32f2f',
                border: '1px solid rgba(255, 99, 71, 0.4)',
              }}
            />
            
            <IconButton
              onClick={addPomodoroToActiveTask}
              size="small"
              sx={{
                width: 28,
                height: 28,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                color: '#2e7d32',
                border: '1px solid rgba(76, 175, 80, 0.4)',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.3)',
                },
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
