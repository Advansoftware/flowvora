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

  // Durante SSR e antes da hidratação, sempre retornar o fallback
  if (!hasMounted) {
    return fallback;
  }

  // Após hidratação, renderizar os filhos
  return children;
}
