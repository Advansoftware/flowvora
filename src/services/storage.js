'use client';

/**
 * Serviço para gerenciar localStorage do aplicativo
 */
class StorageService {
  constructor() {
    this.keys = {
      DISPLAY_MODE: 'lofivora_display_mode',
      CURRENT_PLAYLIST: 'lofivora_current_playlist',
      VOLUME: 'lofivora_volume',
      IS_PLAYING: 'lofivora_is_playing'
    };
  }

  /**
   * Verifica se o localStorage está disponível
   */
  isAvailable() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
    
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Salva um valor no localStorage
   */
  set(key, value) {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
      return false;
    }
  }

  /**
   * Recupera um valor do localStorage
   */
  get(key, defaultValue = null) {
    if (!this.isAvailable()) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Erro ao recuperar do localStorage:', e);
      return defaultValue;
    }
  }

  /**
   * Remove um valor do localStorage
   */
  remove(key) {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Erro ao remover do localStorage:', e);
      return false;
    }
  }

  /**
   * Limpa todo o localStorage do app
   */
  clear() {
    if (!this.isAvailable()) return false;
    
    try {
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (e) {
      console.warn('Erro ao limpar localStorage:', e);
      return false;
    }
  }

  // Métodos específicos do player
  setDisplayMode(mode) {
    return this.set(this.keys.DISPLAY_MODE, mode);
  }

  getDisplayMode() {
    return this.get(this.keys.DISPLAY_MODE, 'image'); // Padrão: imagem
  }

  setCurrentPlaylist(playlistId) {
    return this.set(this.keys.CURRENT_PLAYLIST, playlistId);
  }

  getCurrentPlaylist() {
    return this.get(this.keys.CURRENT_PLAYLIST, 'q0ff3e-A7DY'); // Padrão: primeiro video
  }

  setVolume(volume) {
    return this.set(this.keys.VOLUME, volume);
  }

  getVolume() {
    return this.get(this.keys.VOLUME, 50); // Padrão: 50%
  }

  setIsPlaying(isPlaying) {
    return this.set(this.keys.IS_PLAYING, isPlaying);
  }

  getIsPlaying() {
    return this.get(this.keys.IS_PLAYING, true); // Padrão: tocando
  }
}

// Instância única do serviço
const storageService = new StorageService();

export default storageService;
