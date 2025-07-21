'use client';

import { usePWA } from '../hooks/usePWA';
import UpdateScreen from './UpdateScreen';

const PWAUpdateManager = () => {
  const { updateStatus, completeUpdate } = usePWA();

  return (
    <UpdateScreen
      isVisible={updateStatus.isUpdating}
      progress={updateStatus.progress}
      status={updateStatus.status === 'completed' ? 'completed' : 'updating'}
      onComplete={completeUpdate}
    />
  );
};

export default PWAUpdateManager;
