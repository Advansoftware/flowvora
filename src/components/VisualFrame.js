'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Fade, 
  IconButton, 
  Typography, 
  Slider,
  Select,
  MenuItem,
  FormControl,
  Stack,
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
  },
  {
    id: 'HuFYqnbVbzY',
    name: 'Jazz Lofi Relax',
    type: 'stream',
  },
  {
    id: 'q0ff3e-A7DY',
    name: '2-Hour Lofi Mix',
    type: 'video',
  }
];

export default function VisualFrame({ showVideo = true, videoId = 'jfKfPfyJRdk' }) {
  const [currentVideo, setCurrentVideo] = useState(videoId);
  const [fadeKey, setFadeKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(50);
  const [displayMode, setDisplayMode] = useState('video');
  const [showControls, setShowControls] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Atualizar vídeo quando o videoId mudar
  useEffect(() => {
    if (videoId !== currentVideo) {
      setFadeKey(prev => prev + 1);
      setCurrentVideo(videoId);
    }
  }, [videoId, currentVideo]);

  // Sincronizar estado com props
  useEffect(() => {
    setDisplayMode(showVideo ? 'video' : 'image');
    setCurrentVideo(videoId);
  }, [showVideo, videoId]);

  // Configurar volume inicial quando o vídeo carrega
  useEffect(() => {
    if (displayMode === 'video' && currentVideo) {
      const timer = setTimeout(() => {
        const iframe = document.querySelector('#youtube-iframe');
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":"${volume}"}`, '*');
          } catch (error) {
            console.log('YouTube API não disponível ainda');
          }
        }
      }, 2000); // Aguarda 2 segundos para o iframe carregar

      return () => clearTimeout(timer);
    }
  }, [displayMode, currentVideo, volume]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
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
      setCurrentVideo(value);
      setIsPlaying(true);
      setFadeKey(prev => prev + 1);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0 || displayMode === 'image') return <VolumeOff />;
    if (volume < 50) return <VolumeDown />;
    return <VolumeUp />;
  };

  const getCurrentSelection = () => {
    if (displayMode === 'image') return 'static';
    return currentVideo;
  };

  const getCurrentPlaylist = () => {
    return YT_PLAYLISTS.find(p => p.id === currentVideo);
  };

  const getYouTubeEmbedUrl = (id) => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=0&loop=1&playlist=${id}&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
  };

  if (!mounted) return null;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#0f0f23',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover .controls-overlay': {
          opacity: 1,
        },
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {displayMode === 'video' ? (
        <Fade in timeout={1000} key={`video-${fadeKey}`}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <iframe
              id="youtube-iframe"
              src={getYouTubeEmbedUrl(currentVideo)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                pointerEvents: 'none',
                borderRadius: '16px',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            
            {/* Overlay para garantir que não haja interação */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'transparent',
                pointerEvents: 'none',
                zIndex: 1,
                borderRadius: 4,
              }}
            />
          </Box>
        </Fade>
      ) : (
        <Fade in timeout={1000} key="image">
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundImage: 'url(/meia-noite.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Overlay sutil para melhor integração */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.1) 0%, rgba(30, 30, 60, 0.1) 100%)',
                pointerEvents: 'none',
              }}
            />
          </Box>
        </Fade>
      )}

      {/* Controles integrados - aparecem no hover */}
      <Fade in={showControls} timeout={300}>
        <Box
          className="controls-overlay"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 70%, transparent 100%)',
            backdropFilter: 'blur(10px)',
            padding: 3,
            zIndex: 10,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: showControls ? 'auto' : 'none',
          }}
        >
          <Stack spacing={2}>
            {/* Linha superior - Seleção de fonte e indicador */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                {displayMode === 'video' ? (
                  <Videocam sx={{ color: '#64b5f6', fontSize: '1.2rem' }} />
                ) : (
                  <Image sx={{ color: '#81c784', fontSize: '1.2rem' }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }}
                >
                  {displayMode === 'image' 
                    ? '🌙 Imagem Noturna' 
                    : getCurrentPlaylist()?.name || 'Lo-fi Stream'
                  }
                </Typography>
              </Box>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={getCurrentSelection()}
                  onChange={handleSourceChange}
                  sx={{
                    color: 'white',
                    fontSize: '0.85rem',
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
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
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      },
                    },
                  }}
                >
                  <MenuItem value="static" sx={{ color: 'white', fontSize: '0.85rem' }}>
                    📷 Imagem Estática
                  </MenuItem>
                  {YT_PLAYLISTS.map((playlist) => (
                    <MenuItem key={playlist.id} value={playlist.id} sx={{ color: 'white', fontSize: '0.85rem' }}>
                      🎵 {playlist.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Linha inferior - Controles de reprodução e volume */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Play/Pause */}
              <IconButton
                onClick={handlePlayPause}
                disabled={displayMode === 'image'}
                sx={{
                  backgroundColor: isPlaying ? 'rgba(255, 82, 82, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                  border: `2px solid ${isPlaying ? '#ff5252' : '#4caf50'}`,
                  color: isPlaying ? '#ff5252' : '#4caf50',
                  width: 44,
                  height: 44,
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

              {/* Status */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.8rem',
                  minWidth: '60px',
                }}
              >
                {displayMode === 'image' ? 'Silêncio' : (isPlaying ? 'Tocando' : 'Pausado')}
              </Typography>

              {/* Volume */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <IconButton
                  size="small"
                  disabled={displayMode === 'image'}
                  sx={{ 
                    color: displayMode === 'image' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    padding: '6px',
                  }}
                >
                  {getVolumeIcon()}
                </IconButton>
                
                <Slider
                  value={volume}
                  onChange={handleVolumeChange}
                  disabled={displayMode === 'image'}
                  size="small"
                  sx={{
                    color: displayMode === 'image' ? 'rgba(255, 255, 255, 0.3)' : '#64b5f6',
                    '& .MuiSlider-track': {
                      border: 'none',
                    },
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
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
                    fontSize: '0.75rem',
                  }}
                >
                  {volume}%
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Fade>

      {/* Borda interna decorativa */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          right: 8,
          bottom: 8,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 3,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
    </Box>
  );
}
