'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { motion } from 'framer-motion';
import { usePersistentAudio } from '../hooks/usePersistentAudio';
import scenesData from '../data/scenes.json';

const RoomScene = () => {
  const [isClient, setIsClient] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);
  const { currentVideo } = usePersistentAudio();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Encontrar a cena atual
  const currentScene = scenesData.scenes.find(scene => scene.videoId === currentVideo) || scenesData.scenes[0];

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, [currentVideo]);

  // Partículas animadas baseadas na cena
  const renderAnimations = () => {
    if (!currentScene.animations) return null;

    return currentScene.animations.map((animation, index) => {
      switch (animation.type) {
        case 'rain':
          return <RainAnimation key={index} intensity={animation.intensity} />;
        case 'steam':
          return <SteamAnimation key={index} intensity={animation.intensity} />;
        case 'dust-particles':
          return <DustParticles key={index} intensity={animation.intensity} />;
        case 'fireplace':
          return <FireplaceGlow key={index} intensity={animation.intensity} />;
        case 'ambient-light':
        case 'warm-light':
          return <AmbientLight key={index} color={animation.color} intensity={animation.intensity} />;
        default:
          return null;
      }
    });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: { xs: '300px', lg: '400px' },
        maxHeight: { xs: '400px', lg: '100%' },
        background: `linear-gradient(135deg, 
          ${currentScene.mood === 'relaxing' ? 'rgba(99, 102, 241, 0.1)' : 
            currentScene.mood === 'productive' ? 'rgba(245, 158, 11, 0.1)' :
            currentScene.mood === 'focused' ? 'rgba(16, 185, 129, 0.1)' :
            'rgba(139, 69, 19, 0.1)'} 0%, 
          rgba(15, 15, 35, 0.8) 100%)`,
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Fundo com gradiente animado */}
      <motion.div
        animate={{
          background: [
            `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`,
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      />

      {/* Animações específicas da cena */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2 }}>
        {renderAnimations()}
      </Box>

      {/* Informações da cena */}
      <Fade in={isLoaded} timeout={1000}>
        <Box
          sx={{
            position: 'relative',
            zIndex: 3,
            textAlign: 'center',
            p: 4,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <Typography
              variant="h2"
              component="h1"
              sx={{
                mb: 2,
                fontWeight: 300,
                background: 'linear-gradient(45deg, #6366f1 30%, #f59e0b 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
              }}
            >
              FlowVora
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                fontWeight: 300,
                opacity: 0.8,
              }}
            >
              Your Personal Lo-fi Focus Space
            </Typography>
          </motion.div>
        </Box>
      </Fade>

      {/* Overlay sutil */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 15, 35, 0.3)',
          zIndex: 0,
        }}
      />
    </Box>
  );
};

// Componente de animação de chuva
const RainAnimation = ({ intensity = 'medium' }) => {
  const dropCount = intensity === 'light' ? 50 : intensity === 'medium' ? 100 : 150;
  
  return (
    <>
      {isClient && Array.from({ length: dropCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * dimensions.width,
            y: -10,
            opacity: 0.3,
          }}
          animate={{
            y: dimensions.height + 10,
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: 1,
            height: Math.random() * 20 + 10,
            background: 'linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.6))',
            borderRadius: 1,
          }}
        />
      ))}
    </>
  );
};

// Componente de animação de vapor
const SteamAnimation = ({ intensity = 'low' }) => {
  const steamCount = intensity === 'low' ? 5 : intensity === 'medium' ? 10 : 15;
  
  return (
    <>
      {Array.from({ length: steamCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: '50%',
            y: '80%',
            scale: 0,
            opacity: 0.6,
          }}
          animate={{
            x: `${50 + Math.random() * 20 - 10}%`,
            y: '10%',
            scale: [0, 1, 0],
            opacity: [0.6, 0.3, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: Math.random() * 30 + 20,
            height: Math.random() * 30 + 20,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(5px)',
          }}
        />
      ))}
    </>
  );
};

// Componente de partículas de poeira
const DustParticles = ({ intensity = 'minimal' }) => {
  const particleCount = intensity === 'minimal' ? 20 : intensity === 'low' ? 40 : 60;
  
  return (
    <>
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          animate={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            background: 'rgba(245, 158, 11, 0.4)',
            borderRadius: '50%',
            filter: 'blur(1px)',
          }}
        />
      ))}
    </>
  );
};

// Componente de brilho da lareira
const FireplaceGlow = ({ intensity = 'medium' }) => {
  const glowIntensity = intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.5 : 0.7;
  
  return (
    <motion.div
      animate={{
        opacity: [glowIntensity * 0.8, glowIntensity, glowIntensity * 0.8],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        right: '10%',
        height: '30%',
        background: `radial-gradient(ellipse at bottom, 
          rgba(245, 158, 11, ${glowIntensity}) 0%, 
          rgba(239, 68, 68, ${glowIntensity * 0.5}) 30%, 
          transparent 70%)`,
        filter: 'blur(20px)',
      }}
    />
  );
};

// Componente de luz ambiente
const AmbientLight = ({ color = '#ffd700', intensity = 'low' }) => {
  const lightIntensity = intensity === 'low' ? 0.2 : intensity === 'medium' ? 0.4 : 0.6;
  
  return (
    <motion.div
      animate={{
        opacity: [lightIntensity * 0.7, lightIntensity, lightIntensity * 0.7],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at center, ${color}${Math.floor(lightIntensity * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
        filter: 'blur(30px)',
      }}
    />
  );
};

export default RoomScene;
