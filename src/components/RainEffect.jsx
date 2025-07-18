'use client';

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

const RainEffect = () => {
  const [raindrops, setRaindrops] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const drops = [];
    const numberOfDrops = 50;

    for (let i = 0; i < numberOfDrops; i++) {
      drops.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: Math.random() * 2 + 2,
        animationDelay: Math.random() * 2,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    setRaindrops(drops);
  }, [mounted]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {raindrops.map((drop) => (
        <Box
          key={drop.id}
          sx={{
            position: 'absolute',
            left: `${drop.left}%`,
            top: '-10px',
            width: '2px',
            height: '20px',
            background: 'linear-gradient(transparent, rgba(255,255,255,0.3))',
            borderRadius: '1px',
            animation: `fall ${drop.animationDuration}s linear infinite`,
            animationDelay: `${drop.animationDelay}s`,
            opacity: drop.opacity,
            '@keyframes fall': {
              '0%': {
                transform: 'translateY(-100vh)',
              },
              '100%': {
                transform: 'translateY(100vh)',
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default RainEffect;
