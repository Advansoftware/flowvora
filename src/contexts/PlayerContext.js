'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import playlistsData from '../data/playlists.json';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentPlaylistId, setCurrentPlaylistId] = useState('q0ff3e-A7DY');
  const [displayMode, setDisplayMode] = useState('image'); // 'image' ou 'video'
  const [mounted, setMounted] = useState(false);

  // Carregar dados das playlists
  const playlists = playlistsData.playlists;
  const currentPlaylist = playlists.find(p => p.id === currentPlaylistId) || playlists[0];

  // Verificar se pode mostrar opção de vídeo
  const canShowVideo = currentPlaylist && currentPlaylist.type === 'video';

  useEffect(() => {
    setMounted(true);
    
    // Carregar preferências salvas
    if (typeof window !== 'undefined') {
      const savedPlaylist = localStorage.getItem('flowvora-playlist');
      const savedVolume = localStorage.getItem('flowvora-volume');
      const savedMode = localStorage.getItem('flowvora-display-mode');
      
      if (savedPlaylist) setCurrentPlaylistId(savedPlaylist);
      if (savedVolume) setVolume(parseInt(savedVolume));
      if (savedMode) setDisplayMode(savedMode);
    }
  }, []);

  // Salvar preferências
  const savePreference = (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`flowvora-${key}`, value);
    }
  };

  // Funções de controle
  const togglePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    
    // Enviar comando para iframe
    const iframe = document.querySelector('#youtube-iframe');
    if (iframe && iframe.contentWindow) {
      try {
        const command = newState ? 'playVideo' : 'pauseVideo';
        iframe.contentWindow.postMessage(`{"event":"command","func":"${command}","args":""}`, '*');
      } catch (error) {
        console.log('YouTube API não disponível');
      }
    }
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    savePreference('volume', newVolume);
    
    // Aplicar volume no iframe
    const iframe = document.querySelector('#youtube-iframe');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":"${newVolume}"}`, '*');
      } catch (error) {
        console.log('YouTube API não disponível');
      }
    }
  };

  const changePlaylist = (playlistId) => {
    const newPlaylist = playlists.find(p => p.id === playlistId);
    if (newPlaylist) {
      setCurrentPlaylistId(playlistId);
      savePreference('playlist', playlistId);
      
      // Se for stream, forçar modo imagem
      if (newPlaylist.type === 'stream') {
        setDisplayMode('image');
        savePreference('display-mode', 'image');
      }
      
      // Atualizar iframe
      const iframe = document.querySelector('#youtube-iframe');
      if (iframe) {
        const newUrl = `https://www.youtube.com/embed/${playlistId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${playlistId}&enablejsapi=1&origin=${window.location.origin}`;
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
    }
  };

  const changeDisplayMode = (mode) => {
    if (mode && (mode === 'image' || (mode === 'video' && canShowVideo))) {
      setDisplayMode(mode);
      savePreference('display-mode', mode);
    }
  };

  const value = {
    // Estado
    isPlaying,
    volume,
    currentPlaylistId,
    displayMode,
    mounted,
    playlists,
    currentPlaylist,
    canShowVideo,
    
    // Ações
    togglePlayPause,
    changeVolume,
    changePlaylist,
    changeDisplayMode,
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
