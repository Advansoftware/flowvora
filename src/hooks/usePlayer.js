'use client';

import { useState, useEffect, useCallback } from 'react';
import playlistsData from '../data/playlists.json';

export const usePlayer = () => {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); // Assume que está tocando por padrão
  const [volume, setVolume] = useState(50);
  const [currentPlaylistId, setCurrentPlaylistId] = useState('q0ff3e-A7DY');
  const [displayMode, setDisplayMode] = useState('image'); // 'image' ou 'video'

  // Inicializar após a montagem do componente
  useEffect(() => {
    setMounted(true);
    
    // Carregar preferências salvas
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('lofivora-volume');
      const savedPlaylist = localStorage.getItem('lofivora-playlist');
      const savedMode = localStorage.getItem('lofivora-display-mode');
      
      if (savedVolume) setVolume(parseInt(savedVolume));
      if (savedPlaylist) setCurrentPlaylistId(savedPlaylist);
      if (savedMode) setDisplayMode(savedMode);

      // Expor função para atualizar estado do player
      window.updatePlayerState = (playing) => {
        setIsPlaying(playing);
      };
    }
  }, []);

  // Detectar automaticamente se está tocando após um delay
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        // Assumir que está tocando após 3 segundos se autoplay está ativo
        setIsPlaying(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [mounted, currentPlaylistId]);

  // Salvar preferências no localStorage
  const saveToStorage = useCallback((key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`lofivora-${key}`, value);
    }
  }, []);

  // Comandos para o YouTube player usando react-youtube
  const sendYouTubeCommand = useCallback((command, args = '') => {
    const videoPlayer = window.youtubeVideoPlayer;
    const audioPlayer = window.youtubeAudioPlayer;
    
    const executeCommand = (player) => {
      if (player && typeof player[command] === 'function') {
        try {
          if (args !== '') {
            player[command](args);
          } else {
            player[command]();
          }
        } catch (error) {
          console.log('Erro ao executar comando YouTube:', error);
        }
      }
    };

    // Executar comando no player apropriado baseado no modo de exibição
    if (displayMode === 'video' && videoPlayer) {
      executeCommand(videoPlayer);
    } else if (displayMode === 'image' && audioPlayer) {
      executeCommand(audioPlayer);
    }
  }, [displayMode]);

  // Controles do player
  const togglePlayPause = useCallback(() => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    const videoPlayer = window.youtubeVideoPlayer;
    const audioPlayer = window.youtubeAudioPlayer;
    
    const executeCommand = (player) => {
      if (player) {
        try {
          if (newPlayingState) {
            player.playVideo();
          } else {
            player.pauseVideo();
          }
        } catch (error) {
          console.log('Erro no controle play/pause:', error);
        }
      }
    };

    // Executar no player apropriado
    if (displayMode === 'video' && videoPlayer) {
      executeCommand(videoPlayer);
    } else if (displayMode === 'image' && audioPlayer) {
      executeCommand(audioPlayer);
    }

    console.log(`Player ${newPlayingState ? 'tocando' : 'pausado'}`);
  }, [isPlaying, displayMode]);

  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    saveToStorage('volume', newVolume.toString());
    
    const videoPlayer = window.youtubeVideoPlayer;
    const audioPlayer = window.youtubeAudioPlayer;
    
    const setPlayerVolume = (player) => {
      if (player && typeof player.setVolume === 'function') {
        try {
          player.setVolume(newVolume);
          console.log('Volume alterado para:', newVolume);
        } catch (error) {
          console.log('Erro ao alterar volume:', error);
        }
      }
    };

    // Aplicar volume em ambos os players
    setPlayerVolume(videoPlayer);
    setPlayerVolume(audioPlayer);
  }, [saveToStorage]);

  const changePlaylist = useCallback((playlistId) => {
    setCurrentPlaylistId(playlistId);
    saveToStorage('playlist', playlistId);
    
    // Encontrar a nova playlist
    const newPlaylist = playlistsData.playlists.find(p => p.id === playlistId);
    
    // Se for stream, forçar modo imagem
    if (newPlaylist && newPlaylist.type === 'stream') {
      setDisplayMode('image');
      saveToStorage('display-mode', 'image');
    }
    
    const videoPlayer = window.youtubeVideoPlayer;
    const audioPlayer = window.youtubeAudioPlayer;
    
    const loadNewVideo = (player) => {
      if (player && typeof player.loadVideoById === 'function') {
        try {
          player.loadVideoById(playlistId);
          // Configurar volume após carregar
          setTimeout(() => {
            player.setVolume(volume);
            player.playVideo();
          }, 1000);
        } catch (error) {
          console.log('Erro ao carregar nova playlist:', error);
        }
      }
    };

    // Carregar nova playlist em ambos os players
    loadNewVideo(videoPlayer);
    loadNewVideo(audioPlayer);
    
    // Assumir que está tocando após trocar playlist
    setIsPlaying(true);
  }, [saveToStorage, volume]);

  const changeDisplayMode = useCallback((mode) => {
    setDisplayMode(mode);
    saveToStorage('display-mode', mode);
    
    // Sincronizar reprodução entre players
    setTimeout(() => {
      const videoPlayer = window.youtubeVideoPlayer;
      const audioPlayer = window.youtubeAudioPlayer;
      
      if (mode === 'video' && videoPlayer) {
        videoPlayer.playVideo();
        videoPlayer.setVolume(volume);
      } else if (mode === 'image' && audioPlayer) {
        audioPlayer.playVideo();
        audioPlayer.setVolume(volume);
      }
    }, 500);
  }, [saveToStorage, volume]);

  // Dados computados
  const playlists = playlistsData.playlists;
  const currentPlaylist = playlists.find(p => p.id === currentPlaylistId);
  const canShowVideo = currentPlaylist && currentPlaylist.type === 'video';

  return {
    // Estado
    mounted,
    isPlaying,
    volume,
    currentPlaylistId,
    displayMode,
    playlists,
    currentPlaylist,
    canShowVideo,
    
    // Ações
    togglePlayPause,
    changeVolume,
    changePlaylist,
    changeDisplayMode,
    sendYouTubeCommand,
  };
};
