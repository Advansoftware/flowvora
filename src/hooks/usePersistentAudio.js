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
      
      // Limpar interação do usuário ao recarregar a página (nova sessão)
      // Mas manter se a música estava tocando (indicando que houve interação prévia)
      const wasPlaying = savedState ? JSON.parse(savedState).isPlaying : false;
      if (!wasPlaying) {
        localStorage.removeItem('lofivora-user-interaction');
        setHasUserInteracted(false);
      } else {
        const userInteraction = localStorage.getItem('lofivora-user-interaction');
        if (userInteraction) {
          setHasUserInteracted(true);
        }
      }
      
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setCurrentVideo(state.currentVideo || 'jfKfPfyJRdk'); // Video padrão
          setVolume(state.volume || 50);
          setIsMuted(state.isMuted || false);
          // Só restaurar o estado de playing se houve interação prévia
          const userInteraction = localStorage.getItem('lofivora-user-interaction');
          setIsPlaying(userInteraction ? (state.isPlaying || false) : false);
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
    playerRef.current = player;
    setIsReady(true);
    
    // Aplicar configurações salvas
    if (player) {
      player.setVolume(isMuted ? 0 : volume);
      
      // Recuperar posição salva para este vídeo
      const savedPosition = getVideoPosition(currentVideo);
      if (savedPosition > 0) {
        player.seekTo(savedPosition, true);
      }
      
      // Se estava tocando antes do reload E houve interação do usuário, retomar reprodução
      if (isPlaying && hasUserInteracted) {
        setTimeout(() => {
          player.playVideo();
        }, 1000); // Delay para garantir que o player está totalmente carregado
      }
    }
  }, [volume, isMuted, isPlaying, currentVideo, hasUserInteracted, getVideoPosition]);

  // Controlar play/pause
  const togglePlayPause = useCallback(() => {
    markUserInteraction(); // Marcar interação
    
    if (playerRef.current && isReady) {
      if (isPlaying) {
        // Salvar posição atual antes de pausar
        const currentTime = playerRef.current.getCurrentTime();
        saveVideoPosition(currentVideo, currentTime);
        
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
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
      playerRef.current.setVolume(isMuted ? 0 : clampedVolume);
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
