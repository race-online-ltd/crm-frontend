import { useEffect, useState } from 'react';

export default function useInitialTableLoading(delay = 1000) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay]);

  return isLoading;
}
