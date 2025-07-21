import { IndexedDBAdapter } from '../adapters/storage/IndexedDBAdapter.js';
import { LocalStorageAdapter } from '../adapters/storage/LocalStorageAdapter.js';

class StorageService {
  constructor() {
    this.adapter = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    // Tentar usar IndexedDB primeiro, fallback para localStorage
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        this.adapter = new IndexedDBAdapter();
        await this.adapter.init();
        console.log('[Storage] Usando IndexedDB');
        
        // Migrar dados do localStorage para IndexedDB se necessário
        await this.migrateFromLocalStorage();
      } else {
        throw new Error('IndexedDB not available');
      }
    } catch (error) {
      console.warn('[Storage] IndexedDB falhou, usando localStorage:', error);
      this.adapter = new LocalStorageAdapter();
    }
    
    this.initialized = true;
  }

  async migrateFromLocalStorage() {
    try {
      if (typeof window === 'undefined') return;
      
      const keysToMigrate = ['lofivora-tasks', 'lofivora-settings'];
      
      for (const key of keysToMigrate) {
        const localStorageValue = localStorage.getItem(key);
        if (localStorageValue) {
          try {
            const parsedValue = JSON.parse(localStorageValue);
            const existingValue = await this.adapter.get(key);
            
            if (!existingValue) {
              await this.adapter.set(key, parsedValue);
              console.log(`[Storage] Migrado ${key} do localStorage para IndexedDB`);
              
              // Remover do localStorage após migração bem-sucedida
              localStorage.removeItem(key);
            }
          } catch (parseError) {
            console.error(`[Storage] Erro ao migrar ${key}:`, parseError);
          }
        }
      }
    } catch (error) {
      console.error('[Storage] Erro durante migração:', error);
    }
  }

  async get(key) {
    await this.init();
    return this.adapter.get(key);
  }

  async set(key, value) {
    await this.init();
    return this.adapter.set(key, value);
  }

  async remove(key) {
    await this.init();
    return this.adapter.remove(key);
  }

  async clear() {
    await this.init();
    
    try {
      // Limpar IndexedDB
      const indexedResult = await this.adapter.clear();
      
      // Limpar também localStorage como backup (dados antigos)
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        const lofivoraKeys = keys.filter(key => 
          key.startsWith('lofivora-') || 
          key.startsWith('lofivoraSettings-') ||
          key.includes('pomodoro') ||
          key.includes('tasks') ||
          key.includes('playlists')
        );
        
        lofivoraKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log('[Storage] Removido do localStorage:', key);
        });
      }
      
      console.log('[Storage] Limpeza completa realizada');
      return indexedResult;
    } catch (error) {
      console.error('[Storage] Erro ao limpar dados:', error);
      return false;
    }
  }

  async keys() {
    await this.init();
    return this.adapter.keys();
  }

  // Métodos específicos da aplicação
  async getTasks() {
    const tasks = await this.get('lofivora-tasks');
    return tasks || [];
  }

  async setTasks(tasks) {
    return this.set('lofivora-tasks', tasks);
  }

  async getSettings() {
    const settings = await this.get('lofivora-settings');
    return {
      focusTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      playlists: [],
      ...settings
    };
  }

  async setSettings(settings) {
    return this.set('lofivora-settings', settings);
  }

  async getPlaylists() {
    const settings = await this.getSettings();
    return settings.playlists || [];
  }

  async setPlaylists(playlists) {
    const settings = await this.getSettings();
    settings.playlists = playlists;
    return this.setSettings(settings);
  }

  async getPomodoroTimes() {
    const settings = await this.getSettings();
    return {
      focus: settings.focusTime || 25,
      shortBreak: settings.shortBreakTime || 5,
      longBreak: settings.longBreakTime || 15
    };
  }

  async setPomodoroTimes({ focus, shortBreak, longBreak }) {
    const settings = await this.getSettings();
    settings.focusTime = focus;
    settings.shortBreakTime = shortBreak;
    settings.longBreakTime = longBreak;
    return this.setSettings(settings);
  }

  // Manter compatibilidade com código legado
  setItem(key, value) {
    return this.set(key, value);
  }

  getItem(key, defaultValue = null) {
    return this.get(key).then(result => result !== null ? result : defaultValue);
  }

  removeItem(key) {
    return this.remove(key);
  }
}

// Singleton instance
export const storageService = new StorageService();

// Export para compatibilidade
export const storage = storageService;
