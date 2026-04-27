import { useEffect, useState } from 'react';
import { fetchGoogleMapsConfig } from '../../api/googleMapsApi';

let googleMapsPromise = null;
let googleMapsConfigPromise = null;
let googleMapsUiStyleInjected = false;

async function getGoogleMapsBrowserKey() {
  if (!googleMapsConfigPromise) {
    googleMapsConfigPromise = fetchGoogleMapsConfig()
      .then((config) => config?.browser_api_key || '')
      .catch((error) => {
        googleMapsConfigPromise = null;
        throw error;
      });
  }

  return googleMapsConfigPromise;
}

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

function ensureGoogleMapsUiStyles() {
  if (typeof document === 'undefined' || googleMapsUiStyleInjected) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'google-maps-ui-fixes';
  style.textContent = `
    .pac-container {
      z-index: 1700 !important;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
      margin-top: 6px;
      overflow: hidden;
    }

    .pac-item {
      padding: 8px 12px;
      font-size: 13px;
      line-height: 1.35;
    }

    .pac-item:hover {
      background: #eff6ff;
    }
  `;

  document.head.appendChild(style);
  googleMapsUiStyleInjected = true;
}

export default function useGoogleMapsLoader(libraries = ['places']) {
  const librariesKey = Array.isArray(libraries) ? libraries.join(',') : 'places';
  const [isLoaded, setIsLoaded] = useState(typeof window !== 'undefined' && Boolean(window.google?.maps));
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getGoogleMapsBrowserKey()
      .then((apiKey) => loadGoogleMaps(apiKey, librariesKey.split(',')))
      .then(() => {
        if (active) {
          ensureGoogleMapsUiStyles();
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
  }, [librariesKey]);

  return { isLoaded, error };
}
