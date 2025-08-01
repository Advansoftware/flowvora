'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Chip,
  Stack,
  Fade,
  InputAdornment,
  Button,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add,
  Delete,
  Circle,
  CheckCircle,
  PlayArrow,
  Pause,
  Timer,
  CloudOff,
  Sync,
} from '@mui/icons-material';
import { usePWA } from '../../hooks/usePWA';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [mounted, setMounted] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);
  
  const { isOnline, syncTasks, sendNotification, isFeatureAvailableOffline } = usePWA();

  // Carregar tarefas do localStorage
  useEffect(() => {
    setMounted(true);
    const savedTasks = localStorage.getItem('lofivora-tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
        
        // Verificar se há tarefas pendentes de sincronização
        const hasPendingTasks = parsedTasks.some(task => task.pendingSync);
        setPendingSync(hasPendingTasks);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      }
    }
  }, []);

  // Salvar tarefas no localStorage
  useEffect(() => {
    if (mounted && tasks.length >= 0) {
      localStorage.setItem('lofivora-tasks', JSON.stringify(tasks));
    }
  }, [tasks, mounted]);

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        status: 'pending', // pending, in-progress, completed
        pomodoros: 0,
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            status: !task.completed ? 'completed' : task.pomodoros > 0 ? 'in-progress' : 'pending'
          }
        : task
    ));
  };

  const startTask = (id) => {
    const currentTask = tasks.find(task => task.id === id);
    const isStarting = currentTask && currentTask.status !== 'in-progress';
    
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, status: 'in-progress' }
        : task.status === 'in-progress' 
          ? { ...task, status: 'pending' } // Para apenas uma tarefa ativa
          : task
    ));

    // Controlar o Pomodoro quando iniciar/pausar tarefa
    if (typeof window !== 'undefined') {
      if (isStarting) {
        // Iniciar tarefa - iniciar Pomodoro
        if (window.lofivoraStartPomodoro) {
          window.lofivoraStartPomodoro();
        }
      } else {
        // Pausar tarefa - pausar Pomodoro
        if (window.lofivoraPausePomodoro) {
          window.lofivoraPausePomodoro();
        }
      }
    }
  };

  const addPomodoro = useCallback((id) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { 
            ...task, 
            pomodoros: task.pomodoros + 1,
            status: task.status === 'pending' ? 'in-progress' : task.status
          }
        : task
    ));
  }, [tasks]);

  const removePomodoro = useCallback((id) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { 
            ...task, 
            pomodoros: Math.max(0, task.pomodoros - 1),
            status: task.pomodoros <= 1 ? 'pending' : task.status
          }
        : task
    ));
  }, [tasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return '#f59e0b'; // warning do tema
      case 'completed': return '#10b981'; // success do tema
      default: return 'rgba(226, 232, 240, 0.7)'; // text.primary do tema com transparência
    }
  };

  const getStatusIcon = (status, completed) => {
    if (completed) return <CheckCircle sx={{ color: '#10b981', fontSize: '1.2rem' }} />;
    if (status === 'in-progress') return <Circle sx={{ color: '#f59e0b', fontSize: '1.2rem' }} />;
    return <Circle sx={{ color: 'rgba(226, 232, 240, 0.3)', fontSize: '1.2rem' }} />;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const activeTask = tasks.find(task => task.status === 'in-progress' && !task.completed);

  // Função para ordenar tarefas: em progresso -> pendentes -> concluídas
  const getSortedTasks = useCallback((tasks) => {
    return [...tasks].sort((a, b) => {
      // Primeiro critério: status
      const statusOrder = {
        'in-progress': 0,
        'pending': 1,
        'completed': 2
      };
      
      // Se uma está completed e outra não, completed vai para o final
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Se ambas não estão completed, ordenar por status
      if (!a.completed && !b.completed) {
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
      }
      
      // Segundo critério: ordem de criação (mais recentes primeiro para pendentes)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, []);

  // Aplicar ordenação sempre que as tarefas mudarem
  const sortedTasks = getSortedTasks(tasks);

  // Expor funções globais para controle das tarefas e pomodoro
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.lofivoraAddPomodoro = () => {
        if (activeTask) {
          addPomodoro(activeTask.id);
        }
      };

      window.lofivoraRemovePomodoro = () => {
        if (activeTask) {
          removePomodoro(activeTask.id);
        }
      };
    }
  }, [activeTask, addPomodoro, removePomodoro]);

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
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={2} sx={{ height: '100%' }}>
          {/* Header */}
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
              ✅ Tarefas
            </Typography>
            {totalCount > 0 && (
              <Chip
                label={`${completedCount}/${totalCount}`}
                size="small"
                sx={{
                  backgroundColor: completedCount === totalCount ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                  color: completedCount === totalCount ? '#10b981' : '#94a3b8',
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>

          {/* Input para nova tarefa */}
          <TextField
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nova tarefa..."
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={addTask}
                    disabled={!newTask.trim()}
                    size="small"
                    sx={{
                      color: newTask.trim() ? '#10b981' : 'rgba(226, 232, 240, 0.3)',
                    }}
                  >
                    <Add />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                color: 'white',
                fontSize: '0.9rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981',
                },
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  opacity: 1,
                },
              },
            }}
          />

          {/* Lista de tarefas */}
          <Box 
            sx={{ 
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '2px',
              },
            }}
          >
            {tasks.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 3,
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  Nenhuma tarefa ainda.
                  <br />
                  Adicione uma acima! 👆
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {sortedTasks.map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      px: 1,
                      py: 1,
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: task.completed 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : task.status === 'in-progress'
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(226, 232, 240, 0.05)',
                      border: '1px solid',
                      borderColor: task.completed 
                        ? 'rgba(16, 185, 129, 0.3)' 
                        : task.status === 'in-progress'
                          ? 'rgba(245, 158, 11, 0.3)'
                          : 'rgba(226, 232, 240, 0.1)',
                      '&:hover': {
                        backgroundColor: task.completed 
                          ? 'rgba(16, 185, 129, 0.15)' 
                          : task.status === 'in-progress'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(226, 232, 240, 0.1)',
                      },
                    }}
                  >
                    {/* Linha única com todos os elementos */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Checkbox
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        size="small"
                        icon={getStatusIcon(task.status, false)}
                        checkedIcon={getStatusIcon(task.status, true)}
                        sx={{
                          color: getStatusColor(task.status),
                          padding: '4px',
                          '&.Mui-checked': {
                            color: '#10b981',
                          },
                        }}
                      />
                      
                      {/* Texto da tarefa com truncate */}
                      <Tooltip title={task.text} placement="top">
                        <Typography
                          variant="body2"
                          sx={{
                            flex: 1,
                            color: task.completed 
                              ? 'rgba(226, 232, 240, 0.6)' 
                              : 'rgba(226, 232, 240, 0.9)',
                            textDecoration: task.completed ? 'line-through' : 'none',
                            fontSize: '0.85rem',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            minWidth: 0,
                          }}
                        >
                          {task.text}
                        </Typography>
                      </Tooltip>

                      {/* Controles à direita */}
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {/* Contador de pomodoros */}
                        {task.pomodoros > 0 && (
                          <Chip
                            label={`🍅${task.pomodoros}`}
                            size="small"
                            sx={{
                              height: '20px',
                              fontSize: '0.7rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              minWidth: 'auto',
                            }}
                          />
                        )}
                        
                        {/* Botão iniciar/pausar */}
                        {!task.completed && (
                          <Tooltip title={task.status === 'in-progress' ? 'Pausar tarefa' : 'Iniciar tarefa'}>
                            <IconButton
                              onClick={() => startTask(task.id)}
                              size="small"
                              sx={{
                                color: task.status === 'in-progress' ? '#f59e0b' : '#10b981',
                                backgroundColor: task.status === 'in-progress' 
                                  ? 'rgba(245, 158, 11, 0.1)' 
                                  : 'rgba(16, 185, 129, 0.1)',
                                border: `1px solid ${task.status === 'in-progress' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                width: 24,
                                height: 24,
                                '&:hover': {
                                  backgroundColor: task.status === 'in-progress' 
                                    ? 'rgba(245, 158, 11, 0.2)' 
                                    : 'rgba(16, 185, 129, 0.2)',
                                },
                              }}
                            >
                              {task.status === 'in-progress' ? <Pause sx={{ fontSize: '0.8rem' }} /> : <PlayArrow sx={{ fontSize: '0.8rem' }} />}
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Botão deletar */}
                        <IconButton
                          onClick={() => deleteTask(task.id)}
                          size="small"
                          sx={{
                            color: 'rgba(226, 232, 240, 0.4)',
                            width: 24,
                            height: 24,
                            '&:hover': {
                              color: '#ef4444',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            },
                          }}
                        >
                          <Delete sx={{ fontSize: '0.8rem' }} />
                        </IconButton>
                      </Stack>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Dica para o usuário */}
          {tasks.length > 0 && !activeTask && (
            <Box
              sx={{
                textAlign: 'center',
                py: 1,
                px: 2,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#10b981',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                💡 Clique no ícone ▶️ para iniciar uma tarefa
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Fade>
  );
};

export default Tasks;
