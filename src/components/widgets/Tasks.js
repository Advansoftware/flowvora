'use client';

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add,
  Delete,
  Circle,
  CheckCircle,
} from '@mui/icons-material';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [mounted, setMounted] = useState(false);

  // Carregar tarefas do localStorage
  useEffect(() => {
    setMounted(true);
    const savedTasks = localStorage.getItem('flowvora-tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      }
    }
  }, []);

  // Salvar tarefas no localStorage
  useEffect(() => {
    if (mounted && tasks.length >= 0) {
      localStorage.setItem('flowvora-tasks', JSON.stringify(tasks));
    }
  }, [tasks, mounted]);

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
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
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

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
                  backgroundColor: completedCount === totalCount ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: completedCount === totalCount ? '#4caf50' : 'white',
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
                      color: newTask.trim() ? '#4caf50' : 'rgba(255, 255, 255, 0.3)',
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
                  borderColor: '#4caf50',
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
                {tasks.map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: task.completed 
                        ? 'rgba(76, 175, 80, 0.1)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid',
                      borderColor: task.completed 
                        ? 'rgba(76, 175, 80, 0.3)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: task.completed 
                          ? 'rgba(76, 175, 80, 0.15)' 
                          : 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <Checkbox
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      size="small"
                      icon={<Circle sx={{ fontSize: '1.2rem' }} />}
                      checkedIcon={<CheckCircle sx={{ fontSize: '1.2rem', color: '#4caf50' }} />}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        mr: 1,
                        p: 0.5,
                      }}
                    />
                    <ListItemText
                      primary={task.text}
                      primaryTypographyProps={{
                        sx: {
                          color: task.completed ? 'rgba(255, 255, 255, 0.6)' : 'white',
                          textDecoration: task.completed ? 'line-through' : 'none',
                          fontSize: '0.85rem',
                          fontWeight: task.completed ? 400 : 500,
                        },
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => deleteTask(task.id)}
                        size="small"
                        sx={{
                          color: 'rgba(255, 82, 82, 0.7)',
                          '&:hover': {
                            color: '#ff5252',
                            backgroundColor: 'rgba(255, 82, 82, 0.1)',
                          },
                        }}
                      >
                        <Delete sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Stack>
      </Box>
    </Fade>
  );
};

export default Tasks;
