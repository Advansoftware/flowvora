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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await storageService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
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
