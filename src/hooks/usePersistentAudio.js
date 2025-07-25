'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/*  // Recuperar posição salva de um vídeo
  const getVideoPosition = useCallback((videoId) => {
    if (typeof window !== 'undefined' && videoId) {
      const positionsKey = 'lofivora-video-positions'; Hook personalizado para áudio persistente que continua tocando mesmo após reload da página
 * Utiliza localStorage para manter o estado de reprodução e posição de cada música
 */
export const usePersistentAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Carregar estado do localStorage quando o componente montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('lofivora-audio-state');
      
      // NUNCA tocar automaticamente ao carregar - sempre aguardar interação do usuário
      // Limpar interação do usuário ao recarregar a página (nova sessão)
      localStorage.removeItem('lofivora-user-interaction');
      setHasUserInteracted(false);
      
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setCurrentVideo(state.currentVideo || 'jfKfPfyJRdk'); // Video padrão
          setVolume(state.volume || 50);
          setIsMuted(state.isMuted || false);
          // SEMPRE iniciar pausado - só tocar após clicar no botão
          setIsPlaying(false);
        } catch (error) {
          console.warn('Erro ao carregar estado do áudio:', error);
          setCurrentVideo('jfKfPfyJRdk'); // Fallback para vídeo padrão
        }
      } else {
        setCurrentVideo('jfKfPfyJRdk'); // Vídeo padrão na primeira visita
      }
    }
  }, []);

  // Salvar estado no localStorage sempre que houver mudanças
  useEffect(() => {
    if (typeof window !== 'undefined' && currentVideo) {
      const state = {
        isPlaying,
        currentVideo,
        volume,
        isMuted,
        lastUpdate: Date.now()
      };
      localStorage.setItem('lofivora-audio-state', JSON.stringify(state));
    }
  }, [isPlaying, currentVideo, volume, isMuted]);

  // Salvar posição atual do vídeo
  const saveVideoPosition = useCallback((videoId, currentTime) => {
    if (typeof window !== 'undefined' && videoId && currentTime > 0) {
      const positionsKey = 'lofivora-video-positions';
      const savedPositions = localStorage.getItem(positionsKey);
      const positions = savedPositions ? JSON.parse(savedPositions) : {};
      
      positions[videoId] = {
        currentTime: currentTime,
        savedAt: Date.now()
      };
      
      localStorage.setItem(positionsKey, JSON.stringify(positions));
    }
  }, []);

  // Recuperar posição salva do vídeo
  const getVideoPosition = useCallback((videoId) => {
    if (typeof window !== 'undefined' && videoId) {
      const positionsKey = 'lofivora-video-positions';
      const savedPositions = localStorage.getItem(positionsKey);
      
      if (savedPositions) {
        const positions = JSON.parse(savedPositions);
        const position = positions[videoId];
        
        if (position && position.currentTime > 0) {
          return position.currentTime;
        }
      }
    }
    return 0;
  }, []);

  // Marcar interação do usuário
  const markUserInteraction = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lofivora-user-interaction', 'true');
      }
    }
  }, [hasUserInteracted]);

  // Configurar player quando ele estiver pronto
  const onPlayerReady = useCallback((player) => {
    console.log('Player pronto, configurando...', { volume, isMuted, currentVideo });
    playerRef.current = player;
    setIsReady(true);
    
    // Aplicar configurações salvas
    if (player) {
      // Aplicar volume
      const actualVolume = isMuted ? 0 : volume;
      player.setVolume(actualVolume);
      console.log('Volume inicial aplicado:', actualVolume);
      
      // Recuperar posição salva para este vídeo
      const savedPosition = getVideoPosition(currentVideo);
      if (savedPosition > 0) {
        player.seekTo(savedPosition, true);
        console.log('Posição restaurada:', savedPosition);
      }
      
      // NUNCA tocar automaticamente - sempre aguardar interação do usuário
      // O player só deve tocar quando o usuário clicar no botão "Entrar no Flow"
    }
  }, [volume, isMuted, currentVideo, getVideoPosition]);

  // Controlar play/pause
  const togglePlayPause = useCallback(() => {
    markUserInteraction(); // Marcar interação
    
    if (playerRef.current && isReady) {
      console.log('Toggle play/pause - Estado atual:', isPlaying, 'Player pronto:', isReady);
      
      if (isPlaying) {
        // Salvar posição atual antes de pausar
        const currentTime = playerRef.current.getCurrentTime();
        saveVideoPosition(currentVideo, currentTime);
        
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        console.log('Pausando player');
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
        console.log('Iniciando player');
      }
    } else {
      console.warn('Player não está pronto ou não existe:', { 
        playerExists: !!playerRef.current, 
        isReady,
        isPlaying 
      });
    }
  }, [isPlaying, isReady, markUserInteraction, saveVideoPosition, currentVideo]);

  // Alterar vídeo
  const changeVideo = useCallback((videoId) => {
    markUserInteraction(); // Marcar interação
    
    if (playerRef.current && isReady) {
      // Salvar posição do vídeo atual antes de trocar
      const currentTime = playerRef.current.getCurrentTime();
      saveVideoPosition(currentVideo, currentTime);
      
      const wasPlaying = isPlaying;
      
      playerRef.current.loadVideoById(videoId);
      setCurrentVideo(videoId);
      
      // Aguardar o vídeo carregar e então recuperar a posição salva
      setTimeout(() => {
        const savedPosition = getVideoPosition(videoId);
        if (savedPosition > 0) {
          playerRef.current.seekTo(savedPosition, true);
        }
        
        if (wasPlaying) {
          setTimeout(() => {
            playerRef.current.playVideo();
          }, 500);
        }
      }, 1000);
    } else {
      setCurrentVideo(videoId);
    }
  }, [isPlaying, isReady, markUserInteraction, saveVideoPosition, getVideoPosition, currentVideo]);

  // Controlar volume
  const changeVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolume(clampedVolume);
    
    if (playerRef.current && isReady) {
      // Se está mutado, não aplicar volume
      if (isMuted) {
        playerRef.current.setVolume(0);
      } else {
        // Aplicar volume diretamente
        playerRef.current.setVolume(clampedVolume);
      }
      console.log('Volume aplicado:', isMuted ? 0 : clampedVolume);
    }
  }, [isMuted, isReady]);

  // Controlar mute
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (playerRef.current && isReady) {
      playerRef.current.setVolume(newMutedState ? 0 : volume);
    }
  }, [isMuted, volume, isReady]);

  // Handler para mudanças de estado do player
  const onPlayerStateChange = useCallback((event) => {
    // Estados do YouTube Player: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    if (event.data === 1) { // Playing
      setIsPlaying(true);
    } else if (event.data === 2) { // Paused
      setIsPlaying(false);
      // Salvar posição quando pausar
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        saveVideoPosition(currentVideo, currentTime);
      }
    } else if (event.data === 0) { // Ended
      setIsPlaying(false);
      // Salvar que terminou (posição 0 ou duração total)
      saveVideoPosition(currentVideo, 0);
      
      // Auto-replay para loop contínuo
      if (playerRef.current) {
        setTimeout(() => {
          playerRef.current.playVideo();
        }, 1000);
      }
    }
  }, [saveVideoPosition, currentVideo]);

  const startPlaying = useCallback(() => {
    markUserInteraction(); // Marcar interação
    
    if (playerRef.current && isReady && !isPlaying) {
      playerRef.current.playVideo();
    }
  }, [isReady, isPlaying, markUserInteraction]);

  return {
    // Estado
    isPlaying,
    currentVideo,
    volume,
    isMuted,
    isReady,
    hasUserInteracted,
    
    // Controles
    togglePlayPause,
    changeVideo,
    changeVolume,
    toggleMute,
    startPlaying,
    markUserInteraction,
    
    // Callbacks para o player
    onPlayerReady,
    onPlayerStateChange,
    
    // Ref do player
    playerRef
  };
};

export default usePersistentAudio;
