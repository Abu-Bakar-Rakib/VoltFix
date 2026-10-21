import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Phone, MessageSquare, Play, Pause, RotateCcw, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { BookingStatus } from '../../types';

interface LiveTrackingMapProps {
  electricianLocation: [number, number];
  customerLocation: [number, number];
  electricianName: string;
  electricianPhone?: string;
  electricianAvatar?: string;
  customerAddress: string;
  bookingStatus: BookingStatus;
  isEmergency?: boolean;
  onOpenChat?: () => void;
  className?: string;
}

// Calculate Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.2, R * c * 1.25); // 1.25 road curvature multiplier
}

// Map bounds adjuster
const BoundsAdjuster: React.FC<{ p1: [number, number]; p2: [number, number] }> = ({ p1, p2 }) => {
  const map = useMap();
  useEffect(() => {
    try {
      const bounds = L.latLngBounds([p1, p2]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } catch {
      // ignore
    }
  }, [map, p1[0], p1[1], p2[0], p2[1]]);
  return null;
};

// Create custom icons
const createElectricianMotorbikeIcon = (avatarUrl?: string) => {
  return L.divIcon({
    className: 'custom-pro-tracking-icon',
    html: `
      <div style="position: relative; width: 44px; height: 44px;">
        <div style="
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: rgba(245, 158, 11, 0.35);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid #f59e0b;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.6);
          overflow: hidden;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${
            avatarUrl
              ? `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`
              : `<span style="font-size: 20px;">🛵</span>`
          }
        </div>
        <div style="
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        ">⚡</div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const createHomeIcon = () => {
  return L.divIcon({
    className: 'custom-home-tracking-icon',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        background: #0284c7;
        color: #ffffff;
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.7);
      ">
        <svg style="transform: rotate(45deg); width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  electricianLocation,
  customerLocation,
  electricianName,
  electricianPhone = '+8801700112233',
  electricianAvatar,
  customerAddress,
  bookingStatus,
  isEmergency = false,
  onOpenChat,
  className = '',
}) => {
  const { t } = useLanguage();

  // Progress along the route from 0 (start) to 1 (arrived)
  const initialProgress = bookingStatus === 'IN_PROGRESS' || bookingStatus === 'COMPLETED' ? 1 : 0.15;
  const [progress, setProgress] = useState<number>(initialProgress);
  const [isSimulating, setIsSimulating] = useState<boolean>(bookingStatus === 'ON_THE_WAY');
  const timerRef = useRef<any>(null);

  const totalDistanceKm = calculateDistanceKm(
    electricianLocation[0],
    electricianLocation[1],
    customerLocation[0],
    customerLocation[1]
  );

  // Average city traffic speed ~18 km/h in Dhaka
  const baseMinutes = Math.max(3, Math.round((totalDistanceKm / 18) * 60));
  const remainingDistance = Math.max(0, totalDistanceKm * (1 - progress));
  const remainingMinutes = Math.max(1, Math.round(baseMinutes * (1 - progress)));
  const hasArrived = progress >= 0.98 || bookingStatus === 'IN_PROGRESS' || bookingStatus === 'COMPLETED';

  // Live interpolated location of the moving technician
  const currentProLat =
    electricianLocation[0] + (customerLocation[0] - electricianLocation[0]) * progress;
  const currentProLng =
    electricianLocation[1] + (customerLocation[1] - electricianLocation[1]) * progress;

  // Real-time animation stepper
  useEffect(() => {
    if (isSimulating && !hasArrived) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 0.98) {
            clearInterval(timerRef.current);
            setIsSimulating(false);
            return 1.0;
          }
          return Math.min(1.0, prev + 0.04);
        });
      }, 1800);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating, hasArrived]);

  const toggleSimulation = () => {
    if (hasArrived) {
      setProgress(0.1);
      setIsSimulating(true);
    } else {
      setIsSimulating((prev) => !prev);
    }
  };

  const handleReset = () => {
    setProgress(0.1);
    setIsSimulating(true);
  };

  return (
    <div className={`rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl flex flex-col ${className}`}>
      {/* Top Status Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={electricianAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${electricianName}`}
              alt={electricianName}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-volt-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{electricianName}</h3>
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              {isEmergency && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30 text-[10px] font-extrabold animate-pulse">
                  EMERGENCY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {bookingStatus === 'IN_PROGRESS'
                ? t('technicianWorking')
                : hasArrived
                ? t('technicianArrived')
                : t('technicianEnRoute')}
            </p>
          </div>
        </div>

        {/* ETA & Distance Card */}
        <div className="flex items-center gap-2 sm:self-center w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-left sm:text-right px-3 py-1.5 rounded-xl bg-volt-500/10 border border-volt-500/30">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              {hasArrived ? 'Status' : 'Est. Arrival'}
            </span>
            <span className="text-sm font-extrabold text-volt-600 dark:text-volt-400">
              {hasArrived
                ? 'Arrived On Site'
                : t('etaMinutes', { mins: remainingMinutes.toString() })}
            </span>
          </div>

          <div className="text-left sm:text-right px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Distance</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {hasArrived ? '0.0 km' : `${remainingDistance.toFixed(1)} km`}
            </span>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-100 dark:bg-slate-950">
        <MapContainer
          center={currentProLat && currentProLng ? [currentProLat, currentProLng] : customerLocation}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <BoundsAdjuster p1={electricianLocation} p2={customerLocation} />

          {/* Dotted Route Polyline */}
          <Polyline
            positions={[
              [currentProLat, currentProLng],
              customerLocation,
            ]}
            pathOptions={{
              color: '#0284c7',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.8,
            }}
          />

          {/* Customer House Marker */}
          <Marker position={customerLocation} icon={createHomeIcon()} />

          {/* Moving Electrician Motorbike Marker */}
          <Marker
            position={[currentProLat, currentProLng]}
            icon={createElectricianMotorbikeIcon(electricianAvatar)}
          />
        </MapContainer>

        {/* Live Simulation Floating Controls */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-md pointer-events-auto">
            <Navigation className="w-3.5 h-3.5 text-volt-500 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{t('travelMode')}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-emerald-500 font-bold">GPS Active</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={toggleSimulation}
              className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-md transition-all"
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">{t('pauseSimulation')}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">{t('simulateMovement')}</span>
                </>
              )}
            </button>

            {hasArrived && (
              <button
                onClick={handleReset}
                title="Re-run movement simulation"
                className="p-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-volt-500 shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[220px] sm:max-w-xs">{customerAddress}</span>
        </div>

        <div className="flex items-center gap-2">
          {electricianPhone && (
            <a
              href={`tel:${electricianPhone}`}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t('callTechnician')}</span>
            </a>
          )}

          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold flex items-center gap-1.5 transition-all border border-slate-300 dark:border-slate-700"
            >
              <MessageSquare className="w-3.5 h-3.5 text-volt-500" />
              <span>Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
