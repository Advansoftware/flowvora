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
    togglePlayPause,
    changeVideo,
    changeVolume,
    toggleMute,
    startPlaying,
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
    
    // Carregar modo de display salvo
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('flowvora-display-mode');
      if (savedMode) setDisplayMode(savedMode);
    }
  }, []);

  // Salvar preferências
  const savePreference = (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`flowvora-${key}`, value);
    }
  };

  // Funções de controle adaptadas
  const changePlaylist = (playlistId) => {
    const newPlaylist = playlists.find(p => p.id === playlistId);
    if (newPlaylist) {
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
