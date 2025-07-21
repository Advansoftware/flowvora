'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Stack,
  Divider,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close,
  Add,
  Delete,
  Restore,
} from '@mui/icons-material';
import { storageService } from '../../services/storageNew.js';

const SettingsModal = ({ open, onClose }) => {
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    playlists: []
  });
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    try {
      const loadedSettings = await storageService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage('Erro ao carregar configurações');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await storageService.setSettings(settings);
      setMessage('Configurações salvas com sucesso!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados do aplicativo? Esta ação não pode ser desfeita.')) {
      setLoading(true);
      try {
        await storageService.clear();
        setMessage('Todos os dados foram limpos!');
        setSettings({
          focusTime: 25,
          shortBreakTime: 5,
          longBreakTime: 15,
          playlists: []
        });
        setTimeout(() => {
          setMessage('');
          window.location.reload(); // Recarregar para aplicar mudanças
        }, 1500);
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
        setMessage('Erro ao limpar dados');
      } finally {
        setLoading(false);
      }
    }
  };

  const addPlaylist = () => {
    if (newPlaylistUrl && newPlaylistName) {
      const newPlaylist = {
        id: Date.now().toString(),
        name: newPlaylistName.trim(),
        url: newPlaylistUrl.trim()
      };
      
      setSettings(prev => ({
        ...prev,
        playlists: [...prev.playlists, newPlaylist]
      }));
      
      setNewPlaylistUrl('');
      setNewPlaylistName('');
    }
  };

  const removePlaylist = (playlistId) => {
    setSettings(prev => ({
      ...prev,
      playlists: prev.playlists.filter(p => p.id !== playlistId)
    }));
  };

  const handleTimeChange = (field, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 120) {
      setSettings(prev => ({
        ...prev,
        [field]: numValue
      }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(20, 20, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        ⚙️ Configurações
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3}>
          {/* Mensagem de feedback */}
          {message && (
            <Alert severity={message.includes('Erro') ? 'error' : 'success'} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {/* Configurações do Pomodoro */}
          <Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              🍅 Tempos do Pomodoro (minutos)
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <TextField
                label="Foco"
                type="number"
                value={settings.focusTime}
                onChange={(e) => handleTimeChange('focusTime', e.target.value)}
                inputProps={{ min: 1, max: 120 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#ff5252' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
              
              <TextField
                label="Pausa Curta"
                type="number"
                value={settings.shortBreakTime}
                onChange={(e) => handleTimeChange('shortBreakTime', e.target.value)}
                inputProps={{ min: 1, max: 120 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#4caf50' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
              
              <TextField
                label="Pausa Longa"
                type="number"
                value={settings.longBreakTime}
                onChange={(e) => handleTimeChange('longBreakTime', e.target.value)}
                inputProps={{ min: 1, max: 120 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Stack>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Configurações de Playlists */}
          <Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              🎵 Playlists Personalizadas
            </Typography>
            
            {/* Adicionar nova playlist */}
            <Stack spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Nome da Playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Ex: Música Clássica"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="URL da Playlist/Vídeo do YouTube"
                  value={newPlaylistUrl}
                  onChange={(e) => setNewPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                />
                
                <IconButton
                  onClick={addPlaylist}
                  disabled={!newPlaylistUrl || !newPlaylistName}
                  sx={{
                    backgroundColor: '#6366f1',
                    color: 'white',
                    '&:hover': { backgroundColor: '#5855eb' },
                    '&:disabled': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  <Add />
                </IconButton>
              </Box>
            </Stack>

            {/* Lista de playlists */}
            <Stack spacing={1}>
              {settings.playlists.map((playlist) => (
                <Chip
                  key={playlist.id}
                  label={playlist.name}
                  onDelete={() => removePlaylist(playlist.id)}
                  deleteIcon={<Delete />}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& .MuiChip-deleteIcon': { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />
              ))}
              {settings.playlists.length === 0 && (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                  Nenhuma playlist personalizada adicionada
                </Typography>
              )}
            </Stack>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Limpar dados */}
          <Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              🗑️ Dados do Aplicativo
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<Restore />}
              onClick={clearAllData}
              disabled={loading}
              sx={{
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': {
                  borderColor: '#d32f2f',
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                }
              }}
            >
              Limpar Todos os Dados
            </Button>
            
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 1 }}>
              Remove todas as configurações, tarefas e playlists salvas
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Cancelar
        </Button>
        <Button 
          onClick={saveSettings} 
          disabled={loading}
          sx={{ 
            backgroundColor: '#6366f1', 
            color: 'white',
            '&:hover': { backgroundColor: '#5855eb' }
          }}
        >
          Salvar Configurações
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;
