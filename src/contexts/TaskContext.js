'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [activeTask, setActiveTask] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Carregar dados salvos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('lofivora-tasks');
      const savedActiveTask = localStorage.getItem('lofivora-active-task');
      
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (error) {
          console.error('Erro ao carregar tarefas:', error);
        }
      }
      
      if (savedActiveTask) {
        try {
          setActiveTask(JSON.parse(savedActiveTask));
        } catch (error) {
          console.error('Erro ao carregar tarefa ativa:', error);
        }
      }
      
      // Listener para limpeza completa dos dados
      const handleClearAllData = () => {
        console.log('[TaskContext] Limpando todos os dados do contexto');
        setTasks([]);
        setActiveTask(null);
      };
      
      window.addEventListener('clearAllAppData', handleClearAllData);
      
      return () => {
        window.removeEventListener('clearAllAppData', handleClearAllData);
      };
    }
  }, []);

  // Salvar dados quando mudarem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activeTask) {
        localStorage.setItem('lofivora-active-task', JSON.stringify(activeTask));
      } else {
        localStorage.removeItem('lofivora-active-task');
      }
    }
  }, [activeTask]);

  const setActiveTaskById = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setActiveTask(task || null);
  }, [tasks]);

  const clearActiveTask = useCallback(() => {
    setActiveTask(null);
  }, []);

  const updateActiveTask = useCallback((updates) => {
    if (activeTask) {
      const updatedTask = { ...activeTask, ...updates };
      setActiveTask(updatedTask);
      
      // Também atualizar na lista de tarefas
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    }
  }, [activeTask]);

  const addPomodoroToActiveTask = useCallback(() => {
    if (activeTask) {
      const updatedTask = {
        ...activeTask,
        pomodoros: (activeTask.pomodoros || 0) + 1,
        lastPomodoro: new Date().toISOString()
      };
      updateActiveTask(updatedTask);
      return updatedTask;
    }
    return null;
  }, [activeTask, updateActiveTask]);

  const value = {
    activeTask,
    tasks,
    setTasks,
    setActiveTask,
    setActiveTaskById,
    clearActiveTask,
    updateActiveTask,
    addPomodoroToActiveTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask deve ser usado dentro de TaskProvider');
  }
  return context;
}
