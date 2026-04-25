import { useEffect, useState } from 'react';

let googleMapsPromise = null;

function loadGoogleMaps(apiKey, libraries) {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (window.google?.maps) {
    return Promise.resolve(true);
  }

  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is missing.'));
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-maps-js');

    if (existingScript) {
      if (window.google?.maps) {
        resolve(true);
        return;
      }

      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Google Maps.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=${libraries.join(',')}&v=weekly`;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Unable to load Google Maps.'));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export default function useGoogleMapsLoader(libraries = ['places']) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const librariesKey = Array.isArray(libraries) ? libraries.join(',') : 'places';
  const [isLoaded, setIsLoaded] = useState(typeof window !== 'undefined' && Boolean(window.google?.maps));
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    loadGoogleMaps(apiKey, librariesKey.split(','))
      .then(() => {
        if (active) {
          setIsLoaded(true);
          setError('');
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError?.message || 'Unable to load Google Maps.');
        }
      });

    return () => {
      active = false;
    };
  }, [apiKey, librariesKey]);

  return { isLoaded, error };
}
