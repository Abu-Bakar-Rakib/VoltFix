import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { electricianService } from '../services/electrician.service';
import { ElectricianProfile, Category } from '../types';
import { ElectricianMap } from '../components/maps/ElectricianMap';
import { StarRating } from '../components/common/StarRating';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { BookingWizardModal } from '../components/booking/BookingWizardModal';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Search,
  Filter,
  MapPin,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  ArrowUpDown,
  PhoneCall,
  Check,
  Columns,
  Map,
  ListFilter,
  ArrowRight,
  Navigation,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Search state
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [lat, setLat] = useState<number>(parseFloat(searchParams.get('lat') || '23.8103'));
  const [lng, setLng] = useState<number>(parseFloat(searchParams.get('lng') || '90.4125'));
  const [radius, setRadius] = useState<number>(parseInt(searchParams.get('radius') || '25', 10));
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [minRating, setMinRating] = useState<number | undefined>(
    searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined
  );
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(
    searchParams.get('emergencyOnly') === 'true'
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'distance_asc');

  // Data state
  const [electricians, setElectricians] = useState<ElectricianProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Booking modal state
  const [bookingElectrician, setBookingElectrician] = useState<ElectricianProfile | null>(null);

  // Load categories
  useEffect(() => {
    electricianService.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Fetch search results
  useEffect(() => {
    setLoading(true);
    const params: any = {
      lat,
      lng,
      radius,
      sort,
    };
    if (query) params.query = query;
    if (categoryId) params.categoryId = categoryId;
    if (minRating) params.minRating = minRating;
    if (emergencyOnly) params.emergencyOnly = true;

    electricianService
      .search(params)
      .then((res) => {
        setElectricians(res.electricians);
        setTotal(res.total);
      })
      .catch((err) => {
        console.error('Search failed:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lat, lng, radius, categoryId, minRating, emergencyOnly, sort, query]);

  const [isDeviceLocationFixed, setIsDeviceLocationFixed] = useState<boolean>(false);

  const handleMapLocationChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  };

  const handleBookingSuccess = (bookingId: string) => {
    setBookingElectrician(null);
    navigate(`/bookings/${bookingId}?showDispatch=true`);
  };

  // Render the Electrician List item card
  const renderElectricianCard = (elec: ElectricianProfile) => (
    <div
      key={elec.id}
      className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row gap-4 items-start justify-between group"
    >
      <div className="flex items-start gap-4 flex-1">
        <div className="relative shrink-0">
          <img
            src={elec.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${elec.user?.name}`}
            alt={elec.user?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
          />
          {elec.isOnline && (
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
              title={t('online')}
            />
          )}
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-volt-600 dark:group-hover:text-volt-400 transition-colors truncate">
              {elec.user?.name}
            </h3>
            <ShieldCheck className="w-4 h-4 text-blue-500 dark:text-blue-400 fill-blue-500/20 shrink-0" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <StarRating rating={elec.ratingAverage} showText reviewCount={elec.reviewCount} />
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-500 dark:text-slate-400">{elec.experienceYears}{t('yearsExp')}</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {elec.bio}
          </p>

          <div className="flex flex-wrap gap-1 pt-1">
            {elec.skills?.slice(0, 3).map((sk, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                {sk}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              {elec.city}
              {typeof elec.distanceKm === 'number' && ` (~${elec.distanceKm.toFixed(1)} km)`}
            </span>
            {elec.emergencyAvailable && (
              <span className="text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {t('emergencyDispatch')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions column */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
        <div className="text-left sm:text-right">
          <span className="text-base font-extrabold text-slate-900 dark:text-white">৳{elec.hourlyRate}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('hourlyRate')}</span>
        </div>

        <button
          onClick={() => setBookingElectrician(elec)}
          className="px-5 py-2.5 rounded-xl bg-volt-600 hover:bg-volt-500 text-white font-bold text-xs shadow-sm hover:shadow-glow-volt transition-all"
        >
          {t('bookDirect')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Search & Filter Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 px-4 py-3 sm:px-6 lg:px-10 transition-colors">
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-volt-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-volt-500 cursor-pointer transition-colors"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Direct KM Stepper & Input */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 gap-1.5 transition-colors">
            <button
              type="button"
              onClick={() => setRadius((prev) => Math.max(1, prev - 5))}
              className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-xs"
              title="-5 km"
            >
              −
            </button>
            <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-0.5 focus-within:border-volt-500 shadow-inner">
              <input
                type="number"
                min="1"
                max="200"
                value={radius}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    setRadius(Math.min(200, val));
                  } else if (e.target.value === '') {
                    setRadius(1);
                  }
                }}
                className="w-9 bg-transparent text-center font-extrabold text-xs text-slate-900 dark:text-white focus:outline-none"
                title="Enter radius in km"
              />
              <span className="text-[11px] font-bold text-volt-600 dark:text-volt-400">
                {t('kmUnit')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRadius((prev) => Math.min(200, prev + 5))}
              className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-xs"
              title="+5 km"
            >
              +
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="distance_asc" className="bg-white dark:bg-slate-900">{t('sortDistance')}</option>
              <option value="rating_desc" className="bg-white dark:bg-slate-900">{t('sortRating')}</option>
              <option value="price_asc" className="bg-white dark:bg-slate-900">{t('sortPriceAsc')}</option>
              <option value="price_desc" className="bg-white dark:bg-slate-900">{t('sortPriceDesc')}</option>
              <option value="experience_desc" className="bg-white dark:bg-slate-900">{t('sortExperience')}</option>
            </select>
          </div>

          {/* Emergency Toggle */}
          <button
            type="button"
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              emergencyOnly
                ? 'bg-rose-500 text-white shadow-glow-volt'
                : 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t('emergency247')}</span>
          </button>

          {/* View Mode Switcher (Split, Big Map, List) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl p-1 gap-1 transition-colors">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-volt-600 dark:text-white shadow-sm font-bold border border-slate-200/60 dark:border-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t('viewSplit')}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t('viewSplit')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-700 text-volt-600 dark:text-white shadow-sm font-bold border border-slate-200/60 dark:border-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t('viewFullMap')}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{t('viewFullMap')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-volt-600 dark:text-white shadow-sm font-bold border border-slate-200/60 dark:border-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t('viewList')}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t('viewList')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 w-full">
        {/* VIEW 1: Split View (Map gets dominant width: 60-65%) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Electrician Results List */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col order-2 lg:order-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('foundElectricians', { count: total, radius })}
                </p>
              </div>

              {loading ? (
                <LoadingSpinner label={t('searchingElectricians')} className="my-16" />
              ) : electricians.length === 0 ? (
                <EmptyState
                  title={t('noElectriciansFound')}
                  description={t('noElectriciansDesc')}
                  action={
                    <button
                      onClick={() => {
                        setRadius(50);
                        setEmergencyOnly(false);
                        setCategoryId('');
                        setQuery('');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-volt-600 text-white font-bold text-xs hover:bg-volt-500 shadow-sm"
                    >
                      {t('resetFilters')}
                    </button>
                  }
                />
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
                  {electricians.map(renderElectricianCard)}
                </div>
              )}
            </div>

            {/* Right Column: Big Interactive Map (Responsive mobile height, dominant desktop 60%-67% width) */}
            <div className="lg:col-span-7 xl:col-span-8 h-[340px] sm:h-[450px] lg:h-[calc(100vh-140px)] min-h-[300px] lg:min-h-[600px] relative lg:sticky lg:top-36 order-1 lg:order-2">
              <ElectricianMap
                center={[lat, lng]}
                radiusKm={radius}
                electricians={electricians}
                onLocationChange={handleMapLocationChange}
                isLocationFixed={isDeviceLocationFixed}
                onSetLocationFixed={setIsDeviceLocationFixed}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: Full Map View (100% full width and height with floating electrician quick-cards) */}
        {viewMode === 'map' && (
          <div className="relative w-full h-[calc(100dvh-180px)] sm:h-[calc(100vh-140px)] min-h-[420px] sm:min-h-[680px]">
            <ElectricianMap
              center={[lat, lng]}
              radiusKm={radius}
              electricians={electricians}
              onLocationChange={handleMapLocationChange}
              isLocationFixed={isDeviceLocationFixed}
              onSetLocationFixed={setIsDeviceLocationFixed}
            />

            {/* Floating Bottom Quick-Cards Rail */}
            {electricians.length > 0 && (
              <div className="absolute bottom-6 left-4 right-4 z-20 pointer-events-none">
                <div className="max-w-4xl mx-auto flex items-center gap-3 overflow-x-auto pb-2 px-2 scrollbar-none pointer-events-auto">
                  {electricians.slice(0, 6).map((elec) => (
                    <div
                      key={elec.id}
                      className="shrink-0 w-72 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={elec.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${elec.user?.name}`}
                          alt={elec.user?.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{elec.user?.name}</h4>
                          <div className="flex items-center gap-1 text-[11px] text-amber-500">
                            <span>★ {elec.ratingAverage.toFixed(1)}</span>
                            <span className="text-slate-400 dark:text-slate-400">• ৳{elec.hourlyRate}{t('hourlyRate')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setBookingElectrician(elec)}
                        className="px-3 py-1.5 rounded-xl bg-volt-600 text-white font-bold text-[11px] hover:bg-volt-500 shrink-0 shadow-sm"
                      >
                        {t('bookDirect')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: List Only View */}
        {viewMode === 'list' && (
          <div className="max-w-4xl mx-auto flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('foundElectricians', { count: total, radius })}
              </p>
            </div>

            {loading ? (
              <LoadingSpinner label={t('searchingElectricians')} className="my-16" />
            ) : electricians.length === 0 ? (
              <EmptyState
                title={t('noElectriciansFound')}
                description={t('noElectriciansDesc')}
              />
            ) : (
              <div className="space-y-4">
                {electricians.map(renderElectricianCard)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4-Step Booking Modal */}
      {bookingElectrician && (
        <BookingWizardModal
          electrician={bookingElectrician}
          isOpen={!!bookingElectrician}
          onClose={() => setBookingElectrician(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
