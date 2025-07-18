'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  
  const intervalRef = useRef(null);
  const totalTime = isBreak ? 5 * 60 : 25 * 60;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      
      if (timeLeft === 0) {
        // Timer acabou
        if (!isBreak) {
          setCycles(prev => prev + 1);
          setIsBreak(true);
          setTimeLeft(5 * 60); // 5 minutos de pausa
        } else {
          setIsBreak(false);
          setTimeLeft(25 * 60); // Volta para 25 minutos
        }
        setIsRunning(false);
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, isBreak]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
    clearInterval(intervalRef.current);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

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
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          {/* Timer Display grande */}
          <motion.div
            animate={{
              scale: isRunning ? [1, 1.02, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isRunning ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 300,
                color: 'white',
                mb: 3,
                fontFamily: 'monospace',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                letterSpacing: '2px',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {formatTime(timeLeft)}
            </Typography>
          </motion.div>

          {/* Controles como no protótipo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                minWidth: '80px',
              }}
            >
              {isRunning ? 'PAUSE' : 'START'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.8)',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                minWidth: '80px',
              }}
            >
              RESET
            </motion.button>
          </Box>

          {/* Status do timer */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: isBreak ? 'rgba(100, 255, 100, 0.8)' : 'rgba(255, 255, 255, 0.7)', 
              fontSize: '0.875rem',
              mb: 2,
              fontWeight: 500,
            }}
          >
            {isBreak ? '☕ Pausa' : '🍅 Foco'}
          </Typography>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              mb: 2,
              '& .MuiLinearProgress-bar': {
                backgroundColor: isBreak ? '#4caf50' : '#ff6b6b',
                borderRadius: 2,
              },
            }}
          />

          {/* Ciclos completados compacto */}
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
            Ciclos: {cycles}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PomodoroTimer;
