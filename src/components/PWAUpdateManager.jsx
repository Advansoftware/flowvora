'use client';

import { usePWA } from '../hooks/usePWA';
import UpdateScreen from './UpdateScreen';
import UpdatePopover from './UpdatePopover';

const PWAUpdateManager = () => {
  const { updateStatus, completeUpdate } = usePWA();

  return (
    <>
      {/* Popover para mostrar atualização disponível */}
      <UpdatePopover />
      
      {/* Tela fullscreen durante a atualização */}
      <UpdateScreen
        isVisible={updateStatus.isUpdating}
        progress={updateStatus.progress}
        status={updateStatus.status === 'completed' ? 'completed' : 'updating'}
        onComplete={completeUpdate}
      />
    </>
  );
};

export default PWAUpdateManager;
