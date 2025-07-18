'use client';

import { useState, useEffect } from 'react';
import { Box, Fade } from '@mui/material';
import { usePlayer } from '../contexts/PlayerContext';
import scenes from '../data/scenes.json';

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
  },
  {
    id: 'DWcJFNfaw9c',
    name: 'Chill Lofi Beats',
    type: 'video',
  },
  {
    id: '4xDzrJKXOOY',
    name: 'Study Music',
    type: 'video',
  }
];

export default function VisualFrame({ showVideo = true, videoId = 'q0ff3e-A7DY' }) {
  const [currentVideo, setCurrentVideo] = useState(videoId);
  const [fadeKey, setFadeKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(50);
  const [displayMode, setDisplayMode] = useState('image'); // Padrão sempre imagem
  const [showControls, setShowControls] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Carregar configurações do localStorage
    if (typeof window !== 'undefined') {
      const savedDisplayMode = storageService.getDisplayMode();
      const savedPlaylist = storageService.getCurrentPlaylist();
      const savedVolume = storageService.getVolume();
      const savedIsPlaying = storageService.getIsPlaying();
      
      setDisplayMode(savedDisplayMode);
      setCurrentVideo(savedPlaylist);
      setVolume(savedVolume);
      setIsPlaying(savedIsPlaying);
    }
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
    if (displayMode === 'video' && currentVideo && videoReady) {
      const iframe = document.querySelector('#youtube-iframe');
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":"${volume}"}`, '*');
          
          // Verificar se deve iniciar automaticamente
          if (typeof window !== 'undefined' && window.flowvoraStartVideo) {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            setIsPlaying(true);
            window.flowvoraStartVideo = false; // Reset flag
          }
        } catch (error) {
          console.log('YouTube API não disponível ainda');
        }
      }
    }
  }, [displayMode, currentVideo, volume, videoReady]);

  // Escutar eventos do YouTube para saber quando está pronto
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'video-ready' || data.info?.playerState === 1) {
          setVideoReady(true);
        }
      } catch (e) {
        // Ignora erros de parsing
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    storageService.setIsPlaying(newPlayingState);
    
    const iframeId = displayMode === 'video' ? '#youtube-iframe' : '#youtube-iframe-hidden';
    const iframe = document.querySelector(iframeId);
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
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    storageService.setVolume(newValue);
    
    const iframeId = displayMode === 'video' ? '#youtube-iframe' : '#youtube-iframe-hidden';
    const iframe = document.querySelector(iframeId);
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":"${newValue}"}`, '*');
      } catch (error) {
        console.log('YouTube API não disponível');
      }
    }
  };

  const handleSourceChange = (event) => {
    const newSource = event.target.value;
    setCurrentVideo(newSource);
    setIsPlaying(true);
    setVideoReady(false);
    setFadeKey(prev => prev + 1);
    storageService.setCurrentPlaylist(newSource);
    
    // Verificar se a nova playlist é do tipo stream e ajustar o modo automaticamente
    const newPlaylist = YT_PLAYLISTS.find(p => p.id === newSource);
    if (newPlaylist && newPlaylist.type === 'stream') {
      const newMode = 'image'; // Streams só suportam modo imagem
      setDisplayMode(newMode);
      storageService.setDisplayMode(newMode);
    }
    
    // Atualizar iframe principal se visível
    setTimeout(() => {
      const iframe = document.querySelector('#youtube-iframe');
      if (iframe) {
        const newUrl = getYouTubeEmbedUrl(newSource);
        iframe.src = newUrl;
        
        setTimeout(() => {
          if (iframe.contentWindow) {
            try {
              iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
              iframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":"${volume}"}`, '*');
            } catch (error) {
              console.log('YouTube API não disponível ainda');
            }
          }
        }, 1000);
      }
      
      // Atualizar iframe oculto se existir
      const hiddenIframe = document.querySelector('#youtube-iframe-hidden');
      if (hiddenIframe) {
        const newUrl = getYouTubeEmbedUrl(newSource);
        hiddenIframe.src = newUrl;
        
        setTimeout(() => {
          if (hiddenIframe.contentWindow) {
            try {
              hiddenIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
              hiddenIframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":"${volume}"}`, '*');
            } catch (error) {
              console.log('YouTube API não disponível ainda');
            }
          }
        }, 1000);
      }
    }, 100);
  };

  const handleDisplayModeChange = (event, newMode) => {
    if (newMode !== null) {
      setDisplayMode(newMode);
      storageService.setDisplayMode(newMode);
      
      // A música continua tocando mesmo ao trocar o modo de exibição
      // Garantir que está na playlist correta
      setTimeout(() => {
        const iframeId = newMode === 'video' ? '#youtube-iframe' : '#youtube-iframe-hidden';
        const iframe = document.querySelector(iframeId);
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            iframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":"${volume}"}`, '*');
          } catch (error) {
            console.log('YouTube API não disponível ainda');
          }
        }
      }, 500);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeOff />;
    if (volume < 50) return <VolumeDown />;
    return <VolumeUp />;
  };

  const getCurrentSelection = () => {
    return currentVideo;
  };

  const getCurrentPlaylist = () => {
    return YT_PLAYLISTS.find(p => p.id === currentVideo);
  };

  const canShowVideoOption = () => {
    const playlist = getCurrentPlaylist();
    return playlist && playlist.type === 'video';
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

      {/* Iframe oculto para manter música quando em modo imagem */}
      {displayMode === 'image' && (
        <Box
          sx={{
            position: 'absolute',
            top: -1000,
            left: -1000,
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <iframe
            id="youtube-iframe-hidden"
            src={getYouTubeEmbedUrl(currentVideo)}
            style={{
              width: '1px',
              height: '1px',
              border: 'none',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </Box>
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
            {/* Seleção de playlist */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }}
                >
                  Playlist:
                </Typography>
              </Box>

              <FormControl size="small" sx={{ minWidth: 180 }}>
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
                  {YT_PLAYLISTS.map((playlist) => (
                    <MenuItem key={playlist.id} value={playlist.id} sx={{ color: 'white', fontSize: '0.85rem' }}>
                      🎵 {playlist.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Modo de exibição - só aparece para playlists do tipo 'video' */}
            {canShowVideoOption() && (
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                    }}
                  >
                    Exibição:
                  </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select
                    value={displayMode}
                    onChange={handleDisplayModeChange}
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
                    <MenuItem value="image" sx={{ color: 'white', fontSize: '0.85rem' }}>
                      �️ Apenas Áudio (Imagem)
                    </MenuItem>
                    <MenuItem value="video" sx={{ color: 'white', fontSize: '0.85rem' }}>
                      📺 Áudio + Vídeo
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}

            {/* Status atual */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                {displayMode === 'video' ? (
                  <Videocam sx={{ color: '#64b5f6', fontSize: '1.2rem' }} />
                ) : (
                  <Image sx={{ color: '#81c784', fontSize: '1.2rem' }} alt="" />
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
                    ? '🌙 Modo Áudio (Imagem)' 
                    : getCurrentPlaylist()?.name || 'Lo-fi Stream'
                  }
                </Typography>
              </Box>
            </Stack>

            {/* Linha inferior - Controles de reprodução e volume */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Play/Pause */}
              <IconButton
                onClick={handlePlayPause}
                sx={{
                  backgroundColor: isPlaying ? 'rgba(255, 82, 82, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                  border: `2px solid ${isPlaying ? '#ff5252' : '#4caf50'}`,
                  color: isPlaying ? '#ff5252' : '#4caf50',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    backgroundColor: isPlaying ? 'rgba(255, 82, 82, 0.3)' : 'rgba(76, 175, 80, 0.3)',
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
                {isPlaying ? 'Tocando' : 'Pausado'}
              </Typography>

              {/* Volume */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <IconButton
                  size="small"
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: '6px',
                  }}
                >
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
                    },
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      backgroundColor: '#64b5f6',
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
