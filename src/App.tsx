import React, {useEffect, useRef, useState} from 'react';
import logo from './logo.svg';
import styles from './index.module.scss';
import './App.css';

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

    const apiKey = ''
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
  const containerRef = useRef<HTMLDivElement>(null);
  const polylineRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  const createMapElement = (centerCoord: any): HTMLElement => {
    const mapEl = document.createElement('gmp-map-3d') as any;
    mapEl.mode = 'HYBRID';
    mapEl.range = 2500;
    mapEl.tilt = 45;
    mapEl.heading = 25;
    mapEl.center = {
      lat: centerCoord.lat,
      lng: centerCoord.lon,
      altitude: centerCoord.ele,
    };

    return mapEl;
  };

  const waitFor3DMapLoaded = (mapEl: HTMLElement): Promise<void> =>
      new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (!done) {
            done = true;
            resolve();
          }
        };

        ['gmp-ready', 'gmp-viewready', 'gmp-stable', 'load'].forEach((ev) => {
          mapEl.addEventListener?.(ev, finish, { once: true });
        });

        const tick = () => {
          const canvas = (mapEl as any).shadowRoot?.querySelector?.('canvas');
          if (canvas && canvas.width > 0 && canvas.height > 0) {
            requestAnimationFrame(finish);
          } else {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);

        setTimeout(finish, 5000);
      });

  const initMap = async () => {

    const parent = containerRef.current;
      const mapEl = createMapElement({
        ele
            :
            34.64,
        lat
            :
            40.60177,
        lon
            :
            -74.06111,
      });
      mapRef.current = mapEl;
      parent?.appendChild(mapEl);

      waitFor3DMapLoaded(mapEl).then(() => setMapLoading(false));

      // mapEl.appendChild(polylineEl);
      // const path = getMappedPath(gpx.tracks[0]);
      // customElements.whenDefined('gmp-polyline-3d').then(() => {
      //   (polylineEl as any).coordinates = path;
      // });

      setMapLoading(false);

  };

  useEffect(() => {
    let cancelled = false;
    ensureGoogleMapsLoaded()
        .then(() => customElements.whenDefined('gmp-map-3d'))
        .then(() => {
          if (!cancelled) setReady(true);
        })
        .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    setMapLoading(true);
    initMap();
  }, [ready]);



return (
      <div className={styles.mapContainer}>
        <div className={styles.mapWrapper}>
          <div className={styles.map} ref={containerRef}>
            <div ref={polylineRef}></div>
          </div>

          {mapLoading && (
              <div
                  className={styles.spinnerOverlay}
                  aria-busy="true"
                  aria-live="polite"
              >
                <div className={styles.spinner} />
              </div>
          )}

        </div>
      </div>
  );
}

export default App;
