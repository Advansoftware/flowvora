'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  IconButton,
  Slider,
  Typography,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  VolumeDown,
  Settings,
} from '@mui/icons-material';
import YouTube from 'react-youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersistentAudio } from '@/hooks/usePersistentAudio';
import scenesData from '@/data/scenes.json';

const AudioPlayer = () => {
  const {
    isPlaying,
    currentVideo,
    volume,
    isMuted,
    isReady,
    togglePlayPause,
    changeVideo,
    changeVolume,
    toggleMute,
    onPlayerReady,
    onPlayerStateChange,
  } = usePersistentAudio();

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  // Encontrar a cena atual
  const currentScene = scenesData.scenes.find(scene => scene.videoId === currentVideo) || scenesData.scenes[0];

  const handleVolumeChange = (event, newValue) => {
    changeVolume(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSceneChange = (videoId) => {
    changeVideo(videoId);
    handleMenuClose();
  };

  // Configurações do player do YouTube
  const youtubeOpts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
      loop: 1,
      playlist: currentVideo,
    },
  };

  return (
    <>
      {/* Player do YouTube (invisível) */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <YouTube
          videoId={currentVideo}
          opts={youtubeOpts}
          onReady={(event) => onPlayerReady(event.target)}
          onStateChange={onPlayerStateChange}
        />
      </div>

      {/* Interface do Player - Compacta como na imagem */}
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
            {/* Header compacto */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 400, 
                  color: 'white', 
                  fontSize: '1.1rem',
                  letterSpacing: '0.5px'
                }}
              >
                lo-fi beats
              </Typography>
              <Tooltip title="Escolher Ambiente">
                <IconButton 
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Controle de volume compacto */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton 
                  onClick={toggleMute} 
                  size="small" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeOff fontSize="small" />
                  ) : volume < 50 ? (
                    <VolumeDown fontSize="small" />
                  ) : (
                    <VolumeUp fontSize="small" />
                  )}
                </IconButton>
                
                <Slider
                  size="small"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  disabled={!isReady}
                  sx={{ 
                    flexGrow: 1,
                    color: 'rgba(255,255,255,0.8)',
                    '& .MuiSlider-thumb': {
                      width: 14,
                      height: 14,
                      backgroundColor: 'white',
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(255,255,255,0.1)',
                      },
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: 'rgba(255,255,255,0.6)',
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                  }}
                  min={0}
                  max={100}
                />
              </Box>
            </Box>

            {/* Status compacto */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 0.5,
                cursor: 'pointer',
                borderRadius: 1,
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }
              }}
              onClick={togglePlayPause}
            >
              <motion.div
                animate={{
                  scale: isPlaying ? [1, 1.03, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isPlaying ? 'playing' : 'paused'}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isPlaying ? (
                      <Pause sx={{ fontSize: 16, color: 'primary.main' }} />
                    ) : (
                      <PlayArrow sx={{ fontSize: 16, color: 'primary.main' }} />
                    )}
                  </motion.div>
                </AnimatePresence>
                
                <Typography 
                  variant="body2" 
                  color="white"
                  sx={{ fontWeight: 500, fontSize: '0.8rem' }}
                >
                  {!isReady ? 'Carregando...' : isPlaying ? 'Tocando' : 'Pausado'}
                </Typography>
              </motion.div>
            </Box>

            {/* Ambiente atual compacto */}
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                {currentScene.name}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu de seleção de ambiente */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 250,
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        {scenesData.scenes.map((scene) => (
          <MenuItem
            key={scene.id}
            onClick={() => handleSceneChange(scene.videoId)}
            selected={scene.videoId === currentVideo}
            sx={{
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemText
              primary={scene.name}
              secondary={scene.description}
              secondaryTypographyProps={{
                sx: { 
                  color: 'inherit', 
                  opacity: 0.7,
                  fontSize: '0.75rem',
                },
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default AudioPlayer;
