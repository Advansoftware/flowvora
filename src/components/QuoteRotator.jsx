'use client';

import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { quotes } from '../data/quotes';

const QuoteRotator = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Inicializar com uma frase aleatória
    setCurrentQuoteIndex(Math.floor(Math.random() * quotes.length));

    // Configurar intervalo para trocar frases a cada 30 segundos
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => 
        prevIndex === quotes.length - 1 ? 0 : prevIndex + 1
      );
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[currentQuoteIndex];

  return (
    <Box sx={{ 
      width: '100%',
      textAlign: 'center',
      minHeight: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="body2"
            sx={{
              fontStyle: 'italic',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.9)',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              lineHeight: 1.4,
              maxWidth: '250px',
            }}
          >
            &quot;{currentQuote}&quot;
          </Typography>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default QuoteRotator;
