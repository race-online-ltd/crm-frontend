import { useEffect, useState } from 'react';

export default function useInitialTableLoading() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsLoading(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return isLoading;
}
