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
  Chip,
} from '@mui/material';
import {
  Add,
  Delete,
  TaskOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finalizar relatório', completed: false, priority: 'high' },
    { id: 2, text: 'Responder emails', completed: true, priority: 'medium' },
    { id: 3, text: 'Organizar mesa', completed: false, priority: 'low' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        priority: newTaskPriority,
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#feca57';
      case 'low':
        return '#48dbfb';
      default:
        return '#feca57';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'Média';
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card
        sx={{
          backgroundColor: 'rgba(30, 30, 60, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minWidth: { xs: '100%', sm: '320px' },
          maxHeight: '500px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <TaskOutlined sx={{ color: 'white', mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              Tarefas
            </Typography>
          </Box>

          {/* Estatísticas */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 3,
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#48dbfb', fontWeight: 600 }}>
                {completedTasks}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Concluídas
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#feca57', fontWeight: 600 }}>
                {totalTasks - completedTasks}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Pendentes
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#ff6b6b', fontWeight: 600 }}>
                {Math.round(completionRate)}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Progresso
              </Typography>
            </Box>
          </Box>

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

          {/* Lista de tarefas com scroll */}
          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <List sx={{ p: 0 }}>
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
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: task.completed 
                          ? 'rgba(72, 219, 251, 0.1)' 
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        py: 1,
                        px: 2,
                        border: task.completed 
                          ? '1px solid rgba(72, 219, 251, 0.3)'
                          : '1px solid transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Checkbox
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        size="small"
                        icon={<CheckCircleOutlined />}
                        checkedIcon={<CheckCircleOutlined />}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          '&.Mui-checked': {
                            color: '#48dbfb',
                          },
                          padding: '4px',
                          mr: 1,
                        }}
                      />
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: task.completed 
                                  ? 'rgba(255, 255, 255, 0.6)' 
                                  : 'rgba(255, 255, 255, 0.9)',
                                fontSize: '0.875rem',
                                textDecoration: task.completed ? 'line-through' : 'none',
                                transition: 'all 0.2s ease',
                                flex: 1,
                              }}
                            >
                              {task.text}
                            </Typography>
                            <Chip
                              label={getPriorityLabel(task.priority)}
                              size="small"
                              sx={{
                                backgroundColor: getPriorityColor(task.priority),
                                color: 'white',
                                fontSize: '0.65rem',
                                height: '20px',
                                opacity: task.completed ? 0.5 : 1,
                              }}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => deleteTask(task.id)}
                          size="small"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.4)',
                            '&:hover': {
                              color: '#ff6b6b',
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
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
                  ✨ Nenhuma tarefa ainda. <br />
                  Adicione uma acima para começar!
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Tasks;
