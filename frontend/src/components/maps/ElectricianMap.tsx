import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { ElectricianProfile } from '../../types';
import { Star, ShieldCheck, Zap, Maximize2, Minimize2, Navigation, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

// Fix Leaflet standard marker icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom glowing HTML icon for verified electricians
const createElectricianIcon = (isOnline: boolean) => {
  return L.divIcon({
    className: 'custom-electrician-pin',
    html: `
      <div style="
        position: relative;
        width: 42px;
        height: 42px;
        background: #0f172a;
        border: 2.5px solid ${isOnline ? '#f59e0b' : '#64748b'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 18px ${isOnline ? 'rgba(245, 158, 11, 0.7)' : 'rgba(0,0,0,0.5)'};
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="${isOnline ? '#f59e0b' : '#94a3b8'}" stroke="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        ${
          isOnline
            ? '<span style="position: absolute; top: -1px; right: -1px; width: 11px; height: 11px; background: #10b981; border: 2px solid #0f172a; border-radius: 50%;"></span>'
            : ''
        }
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21],
  });
};

interface ElectricianMapProps {
  center: [number, number];
  radiusKm?: number;
  electricians: ElectricianProfile[];
  onLocationChange?: (lat: number, lng: number) => void;
  selectedId?: string;
  className?: string;
  isLocationFixed?: boolean;
  onSetLocationFixed?: (fixed: boolean) => void;
}

// Map resizer to trigger invalidateSize when viewport or fullscreen changes
const MapResizer: React.FC<{ isFullscreen: boolean }> = ({ isFullscreen }) => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map, isFullscreen]);
  return null;
};

// Controller to smoothly pan map when center changes
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 0.8 });
  }, [center, map]);
  return null;
};

// Map click event listener to update search location
const MapClickHandler: React.FC<{ onClick?: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

export const ElectricianMap: React.FC<ElectricianMapProps> = ({
  center,
  radiusKm = 15,
  electricians,
  onLocationChange,
  selectedId,
  className = '',
  isLocationFixed,
  onSetLocationFixed,
}) => {
  const { t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [localFixed, setLocalFixed] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  const isFixed = isLocationFixed !== undefined ? isLocationFixed : localFixed;

  // Clear any stale provider keys from localStorage so free OSM loads clean
  useEffect(() => {
    localStorage.removeItem('voltfix_google_maps_key');
    localStorage.setItem('voltfix_map_provider', 'leaflet');
  }, []);

  // Listen for Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      setLocationToast(t('locationAccessDenied'));
      setTimeout(() => setLocationToast(null), 5000);
      return;
    }

    setIsLocating(true);
    setLocationToast(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLocalFixed(true);
        if (onSetLocationFixed) {
          onSetLocationFixed(true);
        }
        if (onLocationChange) {
          onLocationChange(pos.coords.latitude, pos.coords.longitude);
        }
        setLocationToast(t('locationFixedSuccess') || 'Device location fixed successfully!');
        setTimeout(() => setLocationToast(null), 4000);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setLocationToast(t('locationAccessDenied'));
        setTimeout(() => setLocationToast(null), 5000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen bg-slate-50 dark:bg-slate-950 flex flex-col'
          : `w-full h-full min-h-[580px] sm:min-h-[660px] rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700/80 shadow-lg dark:shadow-2xl relative flex flex-col ${className}`
      }
    >
      {/* Location Toast Message */}
      {locationToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{locationToast}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none gap-2">
        {/* Left Badges */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/70 text-xs text-slate-800 dark:text-slate-300 flex items-center gap-1.5 shadow-md">
            <Zap className="w-3.5 h-3.5 text-volt-500 dark:text-volt-400" />
            <span className="hidden sm:inline">{t('clickMapToRelocate')}</span>
            <span className="text-volt-600 dark:text-volt-400 font-bold">({radiusKm}km)</span>
          </div>

          <div className="hidden md:flex px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/70 text-xs text-emerald-600 dark:text-emerald-400 font-semibold items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('freeOsmActive')}</span>
          </div>
        </div>

        {/* Right Actions: GPS Device Location Fixed + Fullscreen Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleUseDeviceLocation}
            disabled={isLocating}
            className={`px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-md group cursor-pointer ${
              isFixed
                ? 'bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                : 'bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:text-volt-600 dark:hover:text-volt-400 hover:border-volt-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Set and fix location to your device GPS"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-volt-500' : isFixed ? 'text-white' : 'text-volt-500 dark:text-volt-400'}`} />
            <span>
              {isLocating
                ? t('locating')
                : isFixed
                ? t('deviceLocationFixed')
                : t('useDeviceLocation')}
            </span>
            {isFixed && <Check className="w-3.5 h-3.5 text-white" />}
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 pointer-events-auto shadow-md group cursor-pointer"
            title={isFullscreen ? `${t('exitFullscreen')} (Esc)` : t('fullscreenMap')}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-volt-500 dark:text-volt-400" />
                <span className="font-semibold">{t('exitFullscreen')}</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-volt-500 dark:text-volt-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">{t('fullscreenMap')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Map Body: 100% Free OpenStreetMap with NO watermark and NO key required */}
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full flex-1 z-10"
      >
        <MapResizer isFullscreen={isFullscreen} />
        <MapController center={center} />
        <MapClickHandler onClick={onLocationChange} />

        {/* Official OpenStreetMap Tiles (100% Free, NO API key required, NO watermark) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Search radius circle overlay */}
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: isFixed ? '#10b981' : '#f59e0b',
            fillColor: isFixed ? '#10b981' : '#f59e0b',
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '6, 6',
          }}
        />

        {/* Center search location pin with glowing ping animation */}
        <Marker
          position={center}
          icon={L.divIcon({
            className: 'custom-center-pin',
            html: `
              <div style="position: relative; width: ${isFixed ? '30px' : '24px'}; height: ${isFixed ? '30px' : '24px'};">
                <div style="
                  position: absolute;
                  inset: -8px;
                  border-radius: 50%;
                  background: ${isFixed ? 'rgba(16, 185, 129, 0.45)' : 'rgba(2, 132, 199, 0.35)'};
                  animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>
                <div style="
                  position: relative;
                  width: ${isFixed ? '30px' : '24px'};
                  height: ${isFixed ? '30px' : '24px'};
                  background: ${isFixed ? '#10b981' : '#0284c7'};
                  border: 3px solid #ffffff;
                  border-radius: 50%;
                  box-shadow: 0 0 16px ${isFixed ? 'rgba(16, 185, 129, 0.9)' : 'rgba(2, 132, 199, 0.9)'};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #ffffff;
                  font-size: 13px;
                ">
                  ${isFixed ? '📍' : ''}
                </div>
              </div>
            `,
            iconSize: [isFixed ? 30 : 24, isFixed ? 30 : 24],
            iconAnchor: [isFixed ? 15 : 12, isFixed ? 15 : 12],
          })}
        >
          <Popup className="voltfix-popup" autoPan={false}>
            <div className="p-2 text-center text-xs font-semibold text-slate-900">
              <span className={`block font-bold mb-0.5 ${isFixed ? 'text-emerald-600' : 'text-volt-600'}`}>
                {isFixed ? `✓ ${t('myFixedLocation')}` : t('clickMapToRelocate')}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {center[0].toFixed(4)}, {center[1].toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>

        {/* Electrician Pins */}
        {electricians.map((elec) => (
          <Marker
            key={elec.id}
            position={[elec.latitude, elec.longitude]}
            icon={createElectricianIcon(elec.isOnline)}
          >
            <Popup className="voltfix-popup" autoPan={false}>
              <div className="w-64 p-1 text-slate-900">
                <div className="flex items-center gap-2.5 mb-2">
                  <img
                    src={elec.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${elec.user?.name}`}
                    alt={elec.user?.name}
                    className="w-11 h-11 rounded-xl border border-slate-200 object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      {elec.user?.name}
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
                    </h4>
                    <p className="text-xs text-slate-500">{elec.city || 'Dhaka'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-y border-slate-100 mb-2">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{elec.ratingAverage.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({elec.reviewCount})</span>
                  </div>
                  <span className="font-extrabold text-slate-900">৳{elec.hourlyRate}{t('hourlyRate')}</span>
                </div>

                {typeof elec.distanceKm === 'number' && (
                  <p className="text-[11px] text-slate-500 mb-2">
                    📍 {elec.distanceKm.toFixed(1)} km {t('fromSearchCenter')}
                  </p>
                )}

                <Link
                  to={`/electricians/${elec.id}`}
                  className="block text-center text-xs font-bold py-2 rounded-xl bg-volt-500 text-slate-950 hover:bg-volt-400 transition-colors shadow-sm"
                >
                  {t('viewProfileAndBook')}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
