import React, {useState} from 'react';
import styles from './index.module.scss';
import './App.css';
import Map from './Map';

declare global {
  interface Window {
    google: any;
    __gmapsLoadingPromise?: Promise<void>;
  }
}

const GMAPS_SCRIPT_ID = 'google-maps-js';

export function ensureGoogleMapsLoaded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if (window.google?.maps?.importLibrary) return Promise.resolve();

  if (window.__gmapsLoadingPromise) return window.__gmapsLoadingPromise;

  window.__gmapsLoadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GMAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any)._loaded) return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')), { once: true });
      return;
    }

    const apiKey = 'AIzaSyDsoZfoY75xr-6bUPgVNrsgFsJ59u0Yohw'
    if (!apiKey) {
      console.error('REACT_APP_GOOGLE_API_KEY is not set; Google Maps cannot initialize.');
    }

    const script = document.createElement('script');
    script.id = GMAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey || ''}&v=alpha&libraries=places,geometry,maps3d,marker`;
    (script as any)._loaded = false;
    script.onload = () => {
      (script as any)._loaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });

  return window.__gmapsLoadingPromise;
}

function App() {
  const [isVisibleMap, setIsVisibleMap] = useState(true);



  const refreshMap = () => {
    setIsVisibleMap(false)
    setTimeout(() => {
      setIsVisibleMap(true)
    }, 1000)
  }



return (
      <div className={styles.mapContainer}>
        <button onClick={refreshMap}>Toggle</button>
        {isVisibleMap && <Map />}
      </div>
  );
}

export default App;
