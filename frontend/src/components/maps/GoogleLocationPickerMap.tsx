import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript } from '../../services/googleMapsLoader';
import { Navigation, MapPin } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface GoogleLocationPickerMapProps {
  apiKey: string;
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
}

export const GoogleLocationPickerMap: React.FC<GoogleLocationPickerMapProps> = ({
  apiKey,
  lat,
  lng,
  onChange,
  height = '220px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    loadGoogleMapsScript(apiKey)
      .then((googleMaps) => {
        if (!isMounted || !containerRef.current) return;

        const currentPos = { lat, lng };

        const map = new googleMaps.Map(containerRef.current, {
          center: currentPos,
          zoom: 15,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        });

        mapRef.current = map;

        const marker = new google.maps.Marker({
          position: currentPos,
          map,
          draggable: true,
          title: 'Drag or click map to set location',
          animation: google.maps.Animation.DROP,
        });

        marker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onChange(e.latLng.lat(), e.latLng.lng());
          }
        });

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            marker.setPosition(e.latLng);
            onChange(e.latLng.lat(), e.latLng.lng());
          }
        });

        markerRef.current = marker;
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (isMounted) {
          console.error('Google Maps Picker Error:', err);
          setLoadError(err.message || 'Failed to initialize Google Maps.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  // Update marker position when lat/lng change externally
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const pos = { lat, lng };
      markerRef.current.setPosition(pos);
      mapRef.current.panTo(pos);
    }
  }, [lat, lng]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onChange(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (loadError) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-300">
        Google Maps failed to load: {loadError}. Falling back to OpenStreetMap.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-volt-500 dark:text-volt-400" />
          Google Maps: Drag pin to your exact service location:
        </span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="text-volt-600 dark:text-volt-400 hover:text-volt-500 dark:hover:text-volt-300 font-semibold flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors disabled:opacity-50"
        >
          <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Locating...' : 'Use My GPS'}
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/80 shadow-inner relative"
        style={{ height }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10 backdrop-blur-sm">
            <LoadingSpinner label="Loading Google Map..." />
          </div>
        )}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        <div className="absolute bottom-2 left-2 z-[400] bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 text-[10px] text-slate-800 dark:text-slate-300 font-mono shadow-md">
          📌 {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
};
