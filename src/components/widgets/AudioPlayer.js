'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Stack, 
  IconButton, 
  Typography, 
  Slider,
  Select,
  MenuItem,
  FormControl,
  Fade,
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  VolumeUp, 
  VolumeOff,
  VolumeDown,
  Videocam,
  Image,
} from '@mui/icons-material';

const YT_PLAYLISTS = [
  {
    id: 'jfKfPfyJRdk',
    name: 'Lofi Girl Live',
    type: 'stream',
    url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=0&loop=1&playlist=jfKfPfyJRdk'
  },
  {
    id: 'HuFYqnbVbzY',
    name: 'Jazz Lofi Relax',
    type: 'stream',
    url: 'https://www.youtube.com/embed/HuFYqnbVbzY?autoplay=1&mute=1&controls=0&loop=1&playlist=HuFYqnbVbzY'
  },
  {
    id: 'q0ff3e-A7DY',
    name: '2-Hour Lofi Mix',
    type: 'video',
    url: 'https://www.youtube.com/embed/q0ff3e-A7DY?autoplay=1&mute=1&controls=0&loop=1&playlist=q0ff3e-A7DY'
  }
];

export default function AudioPlayer({ 
  onDisplayModeChange = () => {}, 
  onCurrentVideoChange = () => {} 
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(50);
  const [currentSource, setCurrentSource] = useState('jfKfPfyJRdk');
  const [displayMode, setDisplayMode] = useState('video'); // 'video' ou 'image'
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Comunicar mudanças para o componente pai
      onDisplayModeChange(displayMode === 'video');
      if (displayMode === 'video') {
        onCurrentVideoChange(currentSource);
      }
    }
  }, [displayMode, currentSource, mounted, onDisplayModeChange, onCurrentVideoChange]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    // Controlar reprodução do iframe se estiver no modo vídeo
    if (displayMode === 'video') {
      const iframe = document.querySelector('#youtube-iframe');
      if (iframe && iframe.contentWindow) {
        try {
          if (isPlaying) {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          } else {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          }
        } catch (error) {
          console.log('YouTube API não disponível');
        }
      }
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    
    // Controlar volume do iframe se estiver no modo vídeo
    if (displayMode === 'video') {
      const iframe = document.querySelector('#youtube-iframe');
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":"${newValue}"}`, '*');
        } catch (error) {
          console.log('YouTube API não disponível');
        }
      }
    }
  };

  const handleSourceChange = (event) => {
    const value = event.target.value;
    
    if (value === 'static') {
      setDisplayMode('image');
      setIsPlaying(false);
    } else {
      setDisplayMode('video');
      setCurrentSource(value);
      setIsPlaying(true);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0 || displayMode === 'image') return <VolumeOff />;
    if (volume < 50) return <VolumeDown />;
    return <VolumeUp />;
  };

  const getCurrentSelection = () => {
    if (displayMode === 'image') return 'static';
    return currentSource;
  };

  const getCurrentPlaylist = () => {
    return YT_PLAYLISTS.find(p => p.id === currentSource);
  };

  if (!mounted) return null;

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          padding: 3,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          width: '100%',
        }}
      >
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {displayMode === 'video' ? (
              <Videocam sx={{ color: '#64b5f6' }} />
            ) : (
              <Image sx={{ color: '#81c784' }} />
            )}
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              Audio & Visual
            </Typography>
          </Box>

          {/* Seleção de fonte */}
          <FormControl fullWidth>
            <Typography 
              variant="body2" 
              sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}
            >
              Fonte Visual:
            </Typography>
            <Select
              value={getCurrentSelection()}
              onChange={handleSourceChange}
              sx={{
                color: 'white',
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
              <MenuItem value="static" sx={{ color: 'white' }}>
                📷 Imagem Estática
              </MenuItem>
              {YT_PLAYLISTS.map((playlist) => (
                <MenuItem key={playlist.id} value={playlist.id} sx={{ color: 'white' }}>
                  🎵 {playlist.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Controles de reprodução */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={handlePlayPause}
              disabled={displayMode === 'image'}
              sx={{
                backgroundColor: isPlaying ? 'rgba(255, 82, 82, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                border: `2px solid ${isPlaying ? '#ff5252' : '#4caf50'}`,
                color: isPlaying ? '#ff5252' : '#4caf50',
                '&:hover': {
                  backgroundColor: isPlaying ? 'rgba(255, 82, 82, 0.3)' : 'rgba(76, 175, 80, 0.3)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>

            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                minWidth: '60px',
                fontSize: '0.9rem',
              }}
            >
              {displayMode === 'image' ? 'Silêncio' : (isPlaying ? 'Tocando' : 'Pausado')}
            </Typography>
          </Stack>

          {/* Controle de volume */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              size="small"
              disabled={displayMode === 'image'}
              sx={{ 
                color: displayMode === 'image' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.7)' 
              }}
            >
              {getVolumeIcon()}
            </IconButton>
            
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              disabled={displayMode === 'image'}
              sx={{
                color: displayMode === 'image' ? 'rgba(255, 255, 255, 0.3)' : '#64b5f6',
                '& .MuiSlider-track': {
                  border: 'none',
                },
                '& .MuiSlider-thumb': {
                  backgroundColor: displayMode === 'image' ? 'rgba(255, 255, 255, 0.3)' : '#64b5f6',
                  border: '2px solid currentColor',
                  '&:hover': {
                    boxShadow: '0px 0px 0px 8px rgba(100, 181, 246, 0.16)',
                  },
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            />
            
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                minWidth: '30px',
                textAlign: 'right',
              }}
            >
              {volume}%
            </Typography>
          </Stack>

          {/* Info da fonte atual */}
          <Box 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              padding: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              {displayMode === 'image' 
                ? '🌙 Imagem Noturna' 
                : getCurrentPlaylist()?.name || 'Lo-fi Stream'
              }
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                display: 'block',
              }}
            >
              {displayMode === 'image' 
                ? 'Ambiente silencioso para foco profundo'
                : `${getCurrentPlaylist()?.type === 'stream' ? 'Live Stream' : 'Mix de 2 horas'} • YouTube`
              }
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Fade>
  );
}
