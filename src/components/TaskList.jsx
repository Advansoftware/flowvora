'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Box,
} from '@mui/material';
import {
  Add,
  Delete,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask,
        completed: false,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card 
        sx={{
          backgroundColor: 'rgba(30, 30, 60, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          height: 'fit-content',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              mb: 2,
              fontSize: '1.1rem',
              fontWeight: 500,
            }}
          >
            Tarefas
          </Typography>

          {/* Input para nova tarefa */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nova tarefa..."
              size="small"
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '0.875rem',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                },
              }}
            />
            <IconButton
              onClick={addTask}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Box>

          {/* Lista de tarefas */}
          <List sx={{ p: 0, maxHeight: '200px', overflowY: 'auto' }}>
            <AnimatePresence>
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      backgroundColor: task.completed ? 'rgba(255,255,255,0.05)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.08)',
                      },
                      py: 0.5,
                      px: 1,
                    }}
                  >
                    <Checkbox
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      size="small"
                      sx={{
                        color: 'rgba(255,255,255,0.5)',
                        '&.Mui-checked': {
                          color: 'rgba(255,255,255,0.8)',
                        },
                        padding: '4px',
                        mr: 1,
                      }}
                    />
                    <ListItemText
                      primary={task.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: task.completed ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.9)',
                          fontSize: '0.875rem',
                          textDecoration: task.completed ? 'line-through' : 'none',
                          transition: 'all 0.2s ease',
                        },
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => deleteTask(task.id)}
                        size="small"
                        sx={{
                          color: 'rgba(255,255,255,0.4)',
                          '&:hover': {
                            color: 'rgba(255,100,100,0.8)',
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>

          {tasks.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                Nenhuma tarefa ainda. Adicione uma acima!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskList;
