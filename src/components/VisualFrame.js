'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Fade } from '@mui/material';
import YouTube from 'react-youtube';
import { usePlayer } from '../contexts/PlayerContext';
import scenes from '../data/scenes.json';
import PlayerControls from './PlayerControls';

export default function VisualFrame() {
  const {
    currentPlaylistId,
    displayMode,
    volume,
    isPlaying,
    currentPlaylist,
    mounted,
  } = usePlayer();

  const [currentScene, setCurrentScene] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  // Refs para controlar os players YouTube
  const videoPlayerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Opções do YouTube player
  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      loop: 1,
      playlist: currentPlaylistId,
      rel: 0,
      showinfo: 0,
      fs: 0,
      iv_load_policy: 3,
    },
  };

  // Eventos do YouTube player
  const onReady = (event, isAudio = false) => {
    const player = event.target;
    if (isAudio) {
      audioPlayerRef.current = player;
      window.youtubeAudioPlayer = player;
    } else {
      videoPlayerRef.current = player;
      window.youtubeVideoPlayer = player;
    }
    
    // Configurar volume inicial
    player.setVolume(volume);
    player.playVideo();
    console.log(`Player ${isAudio ? 'áudio' : 'vídeo'} carregado`);
  };

  const onStateChange = (event) => {
    // 1 = playing, 2 = paused, 0 = ended
    const playerState = event.data;
    console.log('Estado do player:', playerState);
    
    // Atualizar estado no contexto através do window
    if (typeof window !== 'undefined' && window.updatePlayerState) {
      window.updatePlayerState(playerState === 1);
    }
  };

  // Determinar qual imagem usar
  const getBackgroundImage = () => {
    if (imageError || !scenes.scenes[currentScene]?.image) {
      return '/meia-noite.png'; // Imagem padrão
    }
    return scenes.scenes[currentScene]?.image;
  };

  useEffect(() => {
    if (mounted) {
      // Rotacionar cenas quando estiver no modo imagem
      if (displayMode === 'image') {
        const interval = setInterval(() => {
          setCurrentScene(prev => (prev + 1) % scenes.scenes.length);
        }, 10000); // Trocar cena a cada 10 segundos

        return () => clearInterval(interval);
      }
    }
  }, [displayMode, mounted]);

  // Expor funções de controle para o contexto
  useEffect(() => {
    if (mounted) {
      // Adicionar referências dos players ao window para que o hook possa acessá-los
      window.youtubeVideoPlayer = videoPlayerRef.current;
      window.youtubeAudioPlayer = audioPlayerRef.current;
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* YouTube Player para modo vídeo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: displayMode === 'video' ? 1 : 0,
          pointerEvents: displayMode === 'video' ? 'auto' : 'none',
          transition: 'opacity 0.5s ease',
          '& iframe': {
            width: '100%',
            height: '100%',
          },
        }}
      >
        <YouTube
          videoId={currentPlaylistId}
          opts={youtubeOpts}
          onReady={(event) => onReady(event, false)}
          onStateChange={onStateChange}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      {/* YouTube Player oculto para modo áudio */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          pointerEvents: 'none',
          visibility: displayMode === 'image' ? 'visible' : 'hidden',
          '& iframe': {
            width: '100%',
            height: '100%',
          },
        }}
      >
        <YouTube
          videoId={currentPlaylistId}
          opts={youtubeOpts}
          onReady={(event) => onReady(event, true)}
          onStateChange={onStateChange}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      {/* Imagem de fundo - visível apenas em modo imagem */}
      <Fade in={displayMode === 'image'} timeout={1000}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${getBackgroundImage()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: displayMode === 'image' ? 1 : 0,
            transition: 'all 1s ease',
          }}
          onError={() => setImageError(true)}
        />
      </Fade>

      {/* Overlay gradiente para melhor legibilidade */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
          pointerEvents: 'none',
        }}
      />

      {/* Controles do Player */}
      <PlayerControls />
    </Box>
  );
}
