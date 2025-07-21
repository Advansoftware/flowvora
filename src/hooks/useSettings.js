'use client';

import { useState, useEffect } from 'react';
import { storageService } from '../services/storageNew.js';

export const useSettings = () => {
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    playlists: []
  });
  const [loading, setLoading] = useState(true);

  // Valores padrão seguros
  const getDefaultSettings = () => ({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    playlists: []
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await storageService.getSettings();
        // Garantir que sempre temos valores válidos
        const safeSettings = {
          ...getDefaultSettings(),
          ...loadedSettings,
          // Garantir que playlists seja sempre um array
          playlists: Array.isArray(loadedSettings?.playlists) ? loadedSettings.playlists : []
        };
        setSettings(safeSettings);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        // Em caso de erro, usar valores padrão
        setSettings(getDefaultSettings());
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
    
    // Listener para limpeza completa dos dados
    const handleClearAllData = () => {
      console.log('[useSettings] Resetando configurações para padrão');
      const defaultSettings = getDefaultSettings();
      setSettings(defaultSettings);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('clearAllAppData', handleClearAllData);
      
      return () => {
        window.removeEventListener('clearAllAppData', handleClearAllData);
      };
    }
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await storageService.getSettings();
      // Garantir que sempre temos valores válidos
      const safeSettings = {
        ...getDefaultSettings(),
        ...loadedSettings,
        // Garantir que playlists seja sempre um array
        playlists: Array.isArray(loadedSettings?.playlists) ? loadedSettings.playlists : []
      };
      setSettings(safeSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Em caso de erro, usar valores padrão
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await storageService.setSettings(updatedSettings);
      setSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return false;
    }
  };

  const getPomodoroTimes = () => {
    return {
      focus: settings.focusTime,
      shortBreak: settings.shortBreakTime,
      longBreak: settings.longBreakTime
    };
  };

  const setPomodoroTimes = async ({ focus, shortBreak, longBreak }) => {
    return updateSettings({
      focusTime: focus,
      shortBreakTime: shortBreak,
      longBreakTime: longBreak
    });
  };

  const getPlaylists = () => {
    return settings.playlists || [];
  };

  const addPlaylist = async (playlist) => {
    const newPlaylists = [...settings.playlists, playlist];
    return updateSettings({ playlists: newPlaylists });
  };

  const removePlaylist = async (playlistId) => {
    const newPlaylists = settings.playlists.filter(p => p.id !== playlistId);
    return updateSettings({ playlists: newPlaylists });
  };

  const clearAllData = async () => {
    try {
      await storageService.clear();
      setSettings({
        focusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        playlists: []
      });
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    getPomodoroTimes,
    setPomodoroTimes,
    getPlaylists,
    addPlaylist,
    removePlaylist,
    clearAllData,
    reload: loadSettings
  };
};
