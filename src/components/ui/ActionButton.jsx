'use client';

import { IconButton } from '@mui/material';

const ActionButton = ({ 
  onClick, 
  children, 
  color, 
  backgroundColor,
  variant = 'default',
  size = 'medium',
  disabled = false,
  sx = {},
  ...props 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return { width: 32, height: 32 };
      case 'large': return { width: 48, height: 48 };
      default: return { width: 40, height: 40 };
    }
  };

  const getVariantStyles = () => {
    const baseSize = getSize();
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: `${color}20`,
          border: `2px solid ${color}`,
          color: color,
          ...baseSize,
          '&:hover': {
            backgroundColor: `${color}30`,
          },
        };
      
      case 'secondary':
        return {
          backgroundColor: backgroundColor || 'rgba(255, 255, 255, 0.1)',
          color: color || 'rgba(255, 255, 255, 0.7)',
          ...baseSize,
          '&:hover': {
            backgroundColor: backgroundColor ? `${backgroundColor}40` : 'rgba(255, 255, 255, 0.2)',
          },
        };
      
      case 'minimal':
        return {
          backgroundColor: 'transparent',
          color: color || 'rgba(255, 255, 255, 0.7)',
          ...baseSize,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        };
      
      default:
        return {
          backgroundColor: backgroundColor || 'rgba(255, 255, 255, 0.1)',
          color: color || 'white',
          ...baseSize,
          '&:hover': {
            backgroundColor: backgroundColor ? `${backgroundColor}40` : 'rgba(255, 255, 255, 0.2)',
          },
        };
    }
  };

  const handleClick = (e) => {
    // Prevenir múltiplos cliques rápidos
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick && !disabled) {
      console.log('[ActionButton] Click triggered:', { 
        disabled,
        timestamp: Date.now(),
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      });
      onClick(e);
    }
  };

  const handleTouchStart = (e) => {
    // Para mobile, garantir que o touch seja reconhecido
    if (!disabled) {
      console.log('[ActionButton] Touch start:', Date.now());
    }
  };

  return (
    <IconButton
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      disabled={disabled}
      sx={{
        ...getVariantStyles(),
        // Melhorar responsividade no mobile
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...sx,
      }}
      {...props}
    >
      {children}
    </IconButton>
  );
};

export default ActionButton;
