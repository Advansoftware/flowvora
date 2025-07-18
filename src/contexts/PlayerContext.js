'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePersistentAudio } from '../hooks/usePersistentAudio';
import playlistsData from '../data/playlists.json';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  // Usar o hook usePersistentAudio como base
  const {
    isPlaying,
    currentVideo,
    volume,
    isMuted,
    isReady,
    hasUserInteracted,
    togglePlayPause,
    changeVideo,
    changeVolume,
    toggleMute,
    startPlaying,
    markUserInteraction,
    onPlayerReady,
    onPlayerStateChange,
    playerRef
  } = usePersistentAudio();

  // Estados adicionais específicos do app
  const [displayMode, setDisplayMode] = useState('image'); // 'image' ou 'video'
  const [mounted, setMounted] = useState(false);

  // Carregar dados das playlists
  const playlists = playlistsData.playlists;
  const currentPlaylist = playlists.find(p => p.id === currentVideo) || playlists[0];

  // Verificar se pode mostrar opção de vídeo
  const canShowVideo = currentPlaylist && currentPlaylist.type === 'video';

  useEffect(() => {
    setMounted(true);
    
    // Carregar modo de display salvo apenas no cliente
    const savedMode = localStorage.getItem('lofivora-display-mode');
    if (savedMode) setDisplayMode(savedMode);
  }, []);

  // Salvar preferências
  const savePreference = (key, value) => {
    localStorage.setItem(`lofivora-${key}`, value);
  };

  // Funções de controle adaptadas
  const changePlaylist = (playlistId) => {
    const newPlaylist = playlists.find(p => p.id === playlistId);
    if (newPlaylist) {
      markUserInteraction(); // Marcar interação ao trocar playlist
      changeVideo(playlistId);
      
      // Se for stream, forçar modo imagem
      if (newPlaylist.type === 'stream') {
        setDisplayMode('image');
        savePreference('display-mode', 'image');
      }
    }
  };

  const changeDisplayMode = (mode) => {
    if (mode && (mode === 'image' || (mode === 'video' && canShowVideo))) {
      markUserInteraction(); // Marcar interação ao trocar modo
      setDisplayMode(mode);
      savePreference('display-mode', mode);
    }
  };

  const value = {
    // Estado do hook usePersistentAudio
    isPlaying,
    currentVideo,
    volume,
    isMuted,
    isReady,
    hasUserInteracted,
    
    // Estados específicos do app
    displayMode,
    mounted,
    playlists,
    currentPlaylist,
    canShowVideo,
    
    // Funções do hook
    togglePlayPause,
    changeVideo,
    changeVolume,
    toggleMute,
    startPlaying,
    markUserInteraction,
    onPlayerReady,
    onPlayerStateChange,
    playerRef,
    
    // Funções específicas do app
    changePlaylist,
    changeDisplayMode,
    
    // Alias para compatibilidade
    currentPlaylistId: currentVideo,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer deve ser usado dentro de PlayerProvider');
  }
  return context;
}
