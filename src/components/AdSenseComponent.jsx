'use client';

import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const AdSenseComponent = ({ 
  adSlot = "1234567890", 
  adClient = "ca-pub-1234567890123456",
  style = {},
  placement = "bottom",
  size = "responsive"
}) => {
  useEffect(() => {
    // Carregar script do AdSense
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + adClient;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Inicializar anúncio após carregamento
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.log('AdSense não disponível');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [adClient]);

  const getAdStyle = () => {
    const baseStyle = {
      display: 'block',
      ...style
    };

    switch (size) {
      case 'responsive':
        return { ...baseStyle, width: '100%', height: 'auto' };
      case 'banner':
        return { ...baseStyle, width: '728px', height: '90px' };
      case 'square':
        return { ...baseStyle, width: '300px', height: '250px' };
      case 'sidebar':
        return { ...baseStyle, width: '160px', height: '600px' };
      default:
        return baseStyle;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 1,
        opacity: 0.8,
        transition: 'opacity 0.3s ease',
        '&:hover': {
          opacity: 1,
        },
        ...style.container
      }}
    >
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={size === 'responsive' ? 'auto' : undefined}
        data-full-width-responsive={size === 'responsive' ? 'true' : undefined}
      />
    </Box>
  );
};

export default AdSenseComponent;
