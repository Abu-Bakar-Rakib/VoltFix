import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript, onGoogleMapsAuthFailure } from '../../services/googleMapsLoader';
import { ElectricianProfile } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AlertTriangle, ExternalLink, RefreshCw, Key } from 'lucide-react';

interface GoogleElectricianMapProps {
  apiKey: string;
  center: [number, number];
  radiusKm?: number;
  electricians: ElectricianProfile[];
  onLocationChange?: (lat: number, lng: number) => void;
  selectedId?: string;
  height?: string;
  onSwitchToLeaflet?: () => void;
  onOpenKeyModal?: () => void;
}

// Sleek dark-mode styling for Google Maps
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#020617' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
];

export const GoogleElectricianMap: React.FC<GoogleElectricianMapProps> = ({
  apiKey,
  center,
  radiusKm = 25,
  electricians,
  onLocationChange,
  height = '100%',
  onSwitchToLeaflet,
  onOpenKeyModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const centerMarkerRef = useRef<google.maps.Marker | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Subscribe to Google Maps authentication failure events
  useEffect(() => {
    const unsubscribe = onGoogleMapsAuthFailure((errMsg) => {
      setLoadError(errMsg);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // Observe map container for Google's internal "Oops! Something went wrong" banner
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      const errBox = el.querySelector('.gm-err-container') || el.querySelector('.gm-err-content');
      const textContent = el.innerText || '';
      if (errBox || textContent.includes('Oops! Something went wrong') || textContent.includes("didn't load Google Maps correctly")) {
        setLoadError(
          'Google Maps rejected this API key. Most common causes:\n1. "Maps JavaScript API" is not enabled in Google Cloud Console.\n2. Billing account is not linked to your Google Cloud project.\n3. Key HTTP referrer restrictions block localhost:5173.'
        );
        setIsLoading(false);
      }
    });

    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    loadGoogleMapsScript(apiKey)
      .then((googleMaps) => {
        if (!isMounted || !mapContainerRef.current) return;

        const map = new googleMaps.Map(mapContainerRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom: 12,
          styles: darkMapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new googleMaps.InfoWindow();

        // Click on map to relocate search center
        if (onLocationChange) {
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onLocationChange(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setIsLoading(false);
      })
      .catch((err: any) => {
        if (isMounted) {
          console.error('Google Maps Load Error:', err);
          setLoadError(err.message || 'Failed to load Google Maps.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  // Update center, radius circle, and center marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof google === 'undefined') return;

    const currentCenter = { lat: center[0], lng: center[1] };
    map.panTo(currentCenter);

    // Update or create center pin
    if (!centerMarkerRef.current) {
      centerMarkerRef.current = new google.maps.Marker({
        position: currentCenter,
        map,
        title: 'Search Center (Drag to relocate)',
        draggable: !!onLocationChange,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#38bdf8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      if (onLocationChange) {
        centerMarkerRef.current.addListener('dragend', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onLocationChange(e.latLng.lat(), e.latLng.lng());
          }
        });
      }
    } else {
      centerMarkerRef.current.setPosition(currentCenter);
    }

    // Update or create radius circle
    const radiusMeters = radiusKm * 1000;
    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        strokeColor: '#f59e0b',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#f59e0b',
        fillOpacity: 0.12,
        map,
        center: currentCenter,
        radius: radiusMeters,
      });
    } else {
      circleRef.current.setCenter(currentCenter);
      circleRef.current.setRadius(radiusMeters);
    }
  }, [center, radiusKm, onLocationChange]);

  // Update electrician markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof google === 'undefined') return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    electricians.forEach((elec) => {
      if (!elec.latitude || !elec.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: elec.latitude, lng: elec.longitude },
        map,
        title: elec.user?.name || 'Verified Electrician',
        icon: {
          path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
          fillColor: elec.isOnline ? '#f59e0b' : '#94a3b8',
          fillOpacity: 1,
          strokeColor: '#0f172a',
          strokeWeight: 1.5,
          scale: 1.4,
          anchor: new google.maps.Point(12, 12),
        },
      });

      marker.addListener('click', () => {
        if (!infoWindowRef.current) return;

        const content = `
          <div style="padding: 8px 12px; font-family: sans-serif; color: #0f172a; max-width: 220px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <strong style="font-size: 13px;">${elec.user?.name || 'Electrician'}</strong>
              <span style="font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px;">${elec.isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
              ★ ${elec.ratingAverage.toFixed(1)} (${elec.reviewCount} reviews) • ${elec.experienceYears}y exp
            </div>
            <div style="font-size: 12px; font-weight: bold; color: #0284c7; margin-bottom: 8px;">
              ৳${elec.hourlyRate}/hr
            </div>
            <a href="/electricians/${elec.id}" style="display: block; text-align: center; background: #f59e0b; color: #020617; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
              View Profile & Book
            </a>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [electricians]);

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[420px] rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 p-6 flex flex-col items-center justify-center text-center transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-3 shadow-sm">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1.5">Google Maps Key Needs Activation</h4>
        <p className="text-slate-600 dark:text-slate-400 text-xs max-w-md mb-4 leading-relaxed whitespace-pre-line text-left">
          {loadError}
        </p>

        <div className="w-full max-w-md bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5">
          <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span>⚙️</span> Required on Google Cloud Console:
          </p>
          <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 pl-1">
            <li className="flex items-center justify-between">
              <span>1. Enable <strong>Maps JavaScript API</strong></span>
              <a
                href="https://console.cloud.google.com/marketplace/product/google/maps-backend.googleapis.com"
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                Enable <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
            <li className="flex items-center justify-between">
              <span>2. Link a <strong>Billing Account</strong> (free $200/mo)</span>
              <a
                href="https://console.cloud.google.com/billing"
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                Billing <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
            <li>
              <span>3. If using Website Restrictions, allow: <code>http://localhost:5173/*</code></span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {onSwitchToLeaflet && (
            <button
              type="button"
              onClick={onSwitchToLeaflet}
              className="px-4 py-2 rounded-xl bg-volt-500 hover:bg-volt-400 text-slate-950 font-bold text-xs shadow-glow-volt transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Switch to Free OpenStreetMap
            </button>
          )}
          {onOpenKeyModal && (
            <button
              type="button"
              onClick={onOpenKeyModal}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Re-enter API Key
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <LoadingSpinner label="Loading Google Maps (Satellite & Vector)..." />
        </div>
      )}
      <div ref={mapContainerRef} style={{ width: '100%', height }} />
    </div>
  );
};
