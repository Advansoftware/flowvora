'use client';

import { useState, useEffect } from 'react';
import { Box, Fade } from '@mui/material';
import { usePlayer } from '../contexts/PlayerContext';
import scenes from '../data/scenes.json';

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

  // Controlar YouTube iframe quando houver mudanças
  useEffect(() => {
    if (mounted && currentPlaylist) {
      const iframe = document.querySelector('#youtube-iframe');
      if (iframe) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const newUrl = `https://www.youtube.com/embed/${currentPlaylistId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${currentPlaylistId}&enablejsapi=1&origin=${origin}`;
        
        if (iframe.src !== newUrl) {
          iframe.src = newUrl;
          
          // Aplicar configurações após carregar
          setTimeout(() => {
            if (iframe.contentWindow) {
              try {
                iframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":"${volume}"}`, '*');
                if (isPlaying) {
                  iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                } else {
                  iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                }
              } catch (error) {
                console.log('YouTube API não disponível ainda');
              }
            }
          }, 1000);
        }
      }
    }
  }, [currentPlaylistId, mounted, currentPlaylist, volume, isPlaying]);

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
      {/* Iframe do YouTube - sempre presente mas visível apenas em modo vídeo */}
      <iframe
        id="youtube-iframe"
        src={`https://www.youtube.com/embed/${currentPlaylistId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${currentPlaylistId}&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          opacity: displayMode === 'video' ? 1 : 0,
          pointerEvents: displayMode === 'video' ? 'auto' : 'none',
          transition: 'opacity 0.5s ease',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={currentPlaylist?.name || 'YouTube Player'}
      />

      {/* Imagem de fundo - visível apenas em modo imagem */}
      <Fade in={displayMode === 'image'} timeout={1000}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${scenes.scenes[currentScene]?.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: displayMode === 'image' ? 1 : 0,
            transition: 'all 1s ease',
          }}
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
    </Box>
  );
}
