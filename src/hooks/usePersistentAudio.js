'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para áudio persistente que continua tocando mesmo após reload da página
 * Utiliza localStorage para manter o estado de reprodução
 */
export const usePersistentAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Carregar estado do localStorage quando o componente montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('flowvora-audio-state');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setCurrentVideo(state.currentVideo || 'jfKfPfyJRdk'); // Video padrão
          setVolume(state.volume || 50);
          setIsMuted(state.isMuted || false);
          setIsPlaying(state.isPlaying || false);
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
      localStorage.setItem('flowvora-audio-state', JSON.stringify(state));
    }
  }, [isPlaying, currentVideo, volume, isMuted]);

  // Configurar player quando ele estiver pronto
  const onPlayerReady = useCallback((player) => {
    playerRef.current = player;
    setIsReady(true);
    
    // Aplicar configurações salvas
    if (player) {
      player.setVolume(isMuted ? 0 : volume);
      
      // Se estava tocando antes do reload, retomar reprodução
      if (isPlaying) {
        setTimeout(() => {
          player.playVideo();
        }, 1000); // Delay para garantir que o player está totalmente carregado
      }
    }
  }, [volume, isMuted, isPlaying]);

  // Controlar play/pause
  const togglePlayPause = useCallback(() => {
    if (playerRef.current && isReady) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  }, [isPlaying, isReady]);

  // Alterar vídeo
  const changeVideo = useCallback((videoId) => {
    if (playerRef.current && isReady) {
      const wasPlaying = isPlaying;
      
      playerRef.current.loadVideoById(videoId);
      setCurrentVideo(videoId);
      
      if (wasPlaying) {
        setTimeout(() => {
          playerRef.current.playVideo();
        }, 1000);
      }
    } else {
      setCurrentVideo(videoId);
    }
  }, [isPlaying, isReady]);

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
    } else if (event.data === 0) { // Ended
      setIsPlaying(false);
      // Auto-replay para loop contínuo
      if (playerRef.current) {
        setTimeout(() => {
          playerRef.current.playVideo();
        }, 1000);
      }
    }
  }, []);

  const startPlaying = useCallback(() => {
    if (playerRef.current && isReady && !isPlaying) {
      playerRef.current.playVideo();
    }
  }, [isReady, isPlaying]);

  return {
    // Estado
    isPlaying,
    currentVideo,
    volume,
    isMuted,
    isReady,
    
    // Controles
    togglePlayPause,
    changeVideo,
    changeVolume,
    toggleMute,
    startPlaying,
    
    // Callbacks para o player
    onPlayerReady,
    onPlayerStateChange,
    
    // Ref do player
    playerRef
  };
};

export default usePersistentAudio;
