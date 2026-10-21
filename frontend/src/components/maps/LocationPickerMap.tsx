import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// Custom glowing pin icon for location picker
const createPickerPinIcon = () => {
  return L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        background: #f59e0b;
        color: #020617;
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.6);
        cursor: grab;
      ">
        <svg style="transform: rotate(45deg); width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="#020617" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
};

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
}

// Invalidate size on mount so Leaflet tiles render seamlessly inside modals
const MapResizer: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// Handle clicks on map to drop/move pin
const MapClickHandler: React.FC<{ onChange: (lat: number, lng: number) => void }> = ({ onChange }) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Pan when coordinates change externally
const PanController: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true });
  }, [lat, lng, map]);
  return null;
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  lat,
  lng,
  onChange,
  height = '280px',
}) => {
  const { t } = useLanguage();
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onChange(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsLocating(false);
        setLocateError(err.message || 'Unable to retrieve location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-volt-500 dark:text-volt-400" />
          {t('clickDragPin')}
        </span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="text-volt-600 dark:text-volt-400 hover:text-volt-500 dark:hover:text-volt-300 font-semibold flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors disabled:opacity-50"
        >
          <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? t('locating') : t('useMyGps')}
        </button>
      </div>

      {locateError && (
        <p className="text-rose-500 text-[11px]">{locateError}</p>
      )}

      <div
        className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/80 shadow-inner relative"
        style={{ height }}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizer />
          <MapClickHandler onChange={onChange} />
          <PanController lat={lat} lng={lng} />

          <Marker
            position={[lat, lng]}
            icon={createPickerPinIcon()}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                onChange(position.lat, position.lng);
              },
            }}
          />
        </MapContainer>

        <div className="absolute bottom-2 left-2 z-[400] bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 text-[10px] text-slate-800 dark:text-slate-300 font-mono shadow-md">
          📌 {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
};
