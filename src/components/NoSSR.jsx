'use client';

import { useEffect, useState } from 'react';

/**
 * Componente que só renderiza no cliente, evitando SSR
 */
export default function NoSSR({ children, fallback = null }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? children : fallback;
}
