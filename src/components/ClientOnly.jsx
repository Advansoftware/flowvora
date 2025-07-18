'use client';

import { useState, useEffect } from 'react';

/**
 * Componente que só renderiza os filhos após a hidratação do cliente
 * Evita erros de hidratação quando há diferenças entre servidor e cliente
 */
export default function ClientOnly({ children, fallback = null }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
}
