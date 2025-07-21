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
  
  // Apenas uma ref para o player ativo
  const activePlayerRef = useRef(null);

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
  const handlePlayerReady = (event) => {
    const player = event.target;
    activePlayerRef.current = player;
    onPlayerReady(player);
  };

  const handleStateChange = (event) => {
    onPlayerStateChange(event);
    
    // Quando o vídeo terminar, recarregar para evitar sugestões
    if (event.data === 0) { // 0 = ended
      setTimeout(() => {
        if (activePlayerRef.current) {
          activePlayerRef.current.playVideo();
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
      {/* YouTube Player único que muda de posição conforme o modo */}
      <Box
        sx={{
          position: 'absolute',
          top: displayMode === 'video' ? 0 : '-9999px',
          left: displayMode === 'video' ? 0 : '-9999px',
          width: displayMode === 'video' ? '100%' : '1px',
          height: displayMode === 'video' ? '100%' : '1px',
          opacity: displayMode === 'video' ? 1 : 0,
          pointerEvents: 'none', // Tornar não clicável
          transition: displayMode === 'video' ? 'opacity 0.5s ease' : 'none',
          overflow: 'hidden',
          '& iframe': {
            width: displayMode === 'video' ? '100%' : '1px',
            height: displayMode === 'video' ? '100%' : '1px',
            pointerEvents: 'none', // Garantir que o iframe não seja clicável
          },
        }}
      >
        <YouTube
          key={`${currentVideo}-${displayMode}`} // Force re-render quando mudar modo ou vídeo
          videoId={currentVideo}
          opts={{
            ...youtubeOpts,
            height: displayMode === 'video' ? '100%' : '1',
            width: displayMode === 'video' ? '100%' : '1',
          }}
          onReady={handlePlayerReady}
          onStateChange={handleStateChange}
          style={{ 
            width: displayMode === 'video' ? '100%' : '1px', 
            height: displayMode === 'video' ? '100%' : '1px',
            pointerEvents: 'none'
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
