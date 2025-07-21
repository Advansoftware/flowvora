import { IStorageAdapter } from './IStorageAdapter.js';

export class LocalStorageAdapter extends IStorageAdapter {
  async get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  }

  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  }

  async remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }

  async clear() {
    try {
      // Limpar apenas dados do LofiVora
      const keys = Object.keys(localStorage);
      const lofivoraKeys = keys.filter(key => 
        key.startsWith('lofivora-') || 
        key.startsWith('lofivoraSettings-') ||
        key.includes('pomodoro') ||
        key.includes('tasks') ||
        key.includes('playlists')
      );
      
      lofivoraKeys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  async keys() {
    try {
      return Object.keys(localStorage).filter(key => 
        key.startsWith('lofivora-') || 
        key.startsWith('lofivoraSettings-')
      );
    } catch (error) {
      console.error('Error getting keys from localStorage:', error);
      return [];
    }
  }
}
