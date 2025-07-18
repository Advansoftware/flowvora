'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Fade } from '@mui/material';
import YouTube from 'react-youtube';
import { usePlayer } from '../contexts/PlayerContext';
import scenes from '../data/scenes.json';
import PlayerControls from './PlayerControls';

export default function VisualFrame() {
  const {
    currentVideo,
    displayMode,
    volume,
    isPlaying,
    currentPlaylist,
    mounted,
    onPlayerReady,
    onPlayerStateChange,
  } = usePlayer();

  const [currentScene, setCurrentScene] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  // Refs para controlar os players YouTube
  const videoPlayerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Opções do YouTube player - removendo opções que causam problemas
  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,      // Desabilitar controles do YouTube
      loop: 1,
      playlist: currentVideo,
      rel: 0,           // Não mostrar vídeos relacionados
      showinfo: 0,      // Não mostrar informações do vídeo
      fs: 0,            // Desabilitar fullscreen
      iv_load_policy: 3, // Desabilitar anotações
      modestbranding: 1, // Remover logo do YouTube
      disablekb: 1,     // Desabilitar controles do teclado
      cc_load_policy: 0, // Desabilitar legendas
      end: null,        // Não definir fim do vídeo para evitar sugestões
    },
  };

  // Eventos do YouTube player
  const handlePlayerReady = (event, isAudio = false) => {
    const player = event.target;
    if (isAudio) {
      audioPlayerRef.current = player;
    } else {
      videoPlayerRef.current = player;
    }
    
    onPlayerReady(player);
    console.log(`Player ${isAudio ? 'áudio' : 'vídeo'} carregado`);
  };

  const handleStateChange = (event) => {
    onPlayerStateChange(event);
    
    // Quando o vídeo terminar, recarregar para evitar sugestões
    if (event.data === 0) { // 0 = ended
      setTimeout(() => {
        const player = displayMode === 'video' ? videoPlayerRef.current : audioPlayerRef.current;
        if (player) {
          player.playVideo();
        }
      }, 1000);
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
          pointerEvents: 'none', // Tornar não clicável
          transition: 'opacity 0.5s ease',
          '& iframe': {
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // Garantir que o iframe não seja clicável
          },
        }}
      >
        <YouTube
          videoId={currentVideo}
          opts={youtubeOpts}
          onReady={(event) => handlePlayerReady(event, false)}
          onStateChange={handleStateChange}
          style={{ 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none'
          }}
        />
      </Box>

      {/* YouTube Player oculto para modo áudio */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          visibility: displayMode === 'image' ? 'visible' : 'hidden',
          overflow: 'hidden',
          '& iframe': {
            width: '1px',
            height: '1px',
          },
        }}
      >
        <YouTube
          videoId={currentVideo}
          opts={{
            ...youtubeOpts,
            height: '1',
            width: '1',
          }}
          onReady={(event) => handlePlayerReady(event, true)}
          onStateChange={handleStateChange}
          style={{ 
            width: '1px', 
            height: '1px',
            position: 'absolute',
            top: '-9999px',
            left: '-9999px',
          }}
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
