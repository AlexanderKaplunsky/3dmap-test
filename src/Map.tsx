import styles from "./index.module.scss";
import React, {useEffect, useRef, useState} from "react";
import {ensureGoogleMapsLoaded} from "./App";

const Map = () => {
    const [ready, setReady] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const polylineRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

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
    )
}

export default Map;
