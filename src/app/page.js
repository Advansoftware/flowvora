'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar imediatamente para /focus
    router.replace('/focus');
  }, [router]);

  // Loading screen while redirecting
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '1.1rem',
        fontWeight: 500,
      }}
    >
      🧘‍♀️ Carregando FlowVora...
    </Box>
  );
}
