'use client';

import React from 'react';
import { 
  Box, 
  Stack, 
  IconButton, 
  Typography, 
  Slider,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  VolumeUp, 
  VolumeOff,
  VolumeDown,
  Videocam,
  Headphones,
} from '@mui/icons-material';
import { usePlayer } from '../contexts/PlayerContext';

export default function PlayerControls() {
  const {
    mounted,
    isPlaying,
    volume,
    currentVideo,
    displayMode,
    playlists,
    currentPlaylist,
    canShowVideo,
    togglePlayPause,
    changeVolume,
    changePlaylist,
    changeDisplayMode,
  } = usePlayer();

  const handleVolumeChange = (event, newValue) => {
    changeVolume(newValue);
    console.log('Volume alterado para:', newValue);
  };

  const handleSourceChange = (event) => {
    changePlaylist(event.target.value);
  };

  const handleDisplayModeChange = (newMode) => {
    changeDisplayMode(newMode);
  };

  const handlePlayPauseClick = () => {
    togglePlayPause();
    console.log('Play/Pause clicado, estado atual:', isPlaying);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeOff />;
    if (volume < 50) return <VolumeDown />;
    return <VolumeUp />;
  };

  if (!mounted) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.85))',
        backdropFilter: 'blur(10px)',
        padding: '20px 24px 24px 24px',
        zIndex: 10,
      }}
    >
      <Stack spacing={2}>
        {/* Header com switch */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {displayMode === 'video' ? (
              <Videocam sx={{ color: '#64b5f6', fontSize: '1rem' }} />
            ) : (
              <Headphones sx={{ color: '#81c784', fontSize: '1rem' }} />
            )}
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {currentPlaylist?.name || 'Player'}
            </Typography>
          </Box>

          {/* Switch estilo "Música | Vídeo" */}
          <Box
            sx={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <Box
              onClick={() => canShowVideo ? handleDisplayModeChange('image') : null}
              sx={{
                padding: '4px 12px',
                borderRadius: '18px',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: canShowVideo ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                backgroundColor: displayMode === 'image' ? 'rgba(129, 199, 132, 0.3)' : 'transparent',
                color: displayMode === 'image' ? '#81c784' : 'rgba(255, 255, 255, 0.7)',
                border: displayMode === 'image' ? '1px solid #81c784' : '1px solid transparent',
                opacity: canShowVideo ? 1 : 0.6,
                '&:hover': canShowVideo ? {
                  backgroundColor: displayMode === 'image' ? 'rgba(129, 199, 132, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                } : {},
              }}
            >
              Música
            </Box>
            
            {canShowVideo && (
              <Box
                onClick={() => handleDisplayModeChange('video')}
                sx={{
                  padding: '4px 12px',
                  borderRadius: '18px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: displayMode === 'video' ? 'rgba(100, 181, 246, 0.3)' : 'transparent',
                  color: displayMode === 'video' ? '#64b5f6' : 'rgba(255, 255, 255, 0.7)',
                  border: displayMode === 'video' ? '1px solid #64b5f6' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: displayMode === 'video' ? 'rgba(100, 181, 246, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Vídeo
              </Box>
            )}
          </Box>
        </Box>

        {/* Controles principais */}
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Play/Pause */}
          <IconButton
            onClick={handlePlayPauseClick}
            size="small"
            sx={{
              backgroundColor: isPlaying ? 'rgba(255, 82, 82, 0.2)' : 'rgba(76, 175, 80, 0.2)',
              border: `1px solid ${isPlaying ? '#ff5252' : '#4caf50'}`,
              color: isPlaying ? '#ff5252' : '#4caf50',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: isPlaying ? 'rgba(255, 82, 82, 0.3)' : 'rgba(76, 175, 80, 0.3)',
              },
            }}
          >
            {isPlaying ? <Pause sx={{ fontSize: '1rem' }} /> : <PlayArrow sx={{ fontSize: '1rem' }} />}
          </IconButton>

          {/* Seleção de playlist */}
          <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
            <Select
              value={currentVideo}
              onChange={handleSourceChange}
              sx={{
                color: 'white',
                fontSize: '0.8rem',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#64b5f6',
                },
                '.MuiSelect-icon': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: 'rgba(30, 30, 60, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                },
              }}
            >
              {playlists.map((playlist) => (
                <MenuItem key={playlist.id} value={playlist.id} sx={{ color: 'white', fontSize: '0.8rem' }}>
                  {playlist.type === 'stream' ? '🔴' : '🎵'} {playlist.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Volume */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 120 }}>
            <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.7)', padding: '4px' }}>
              {getVolumeIcon()}
            </IconButton>
            
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              size="small"
              sx={{
                color: '#64b5f6',
                '& .MuiSlider-track': {
                  border: 'none',
                  height: 3,
                },
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  backgroundColor: '#64b5f6',
                  border: '2px solid currentColor',
                  '&:hover': {
                    boxShadow: '0px 0px 0px 8px rgba(100, 181, 246, 0.16)',
                  },
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  height: 3,
                },
              }}
            />
            
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                minWidth: '28px',
                textAlign: 'right',
                fontSize: '0.7rem',
              }}
            >
              {volume}%
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
