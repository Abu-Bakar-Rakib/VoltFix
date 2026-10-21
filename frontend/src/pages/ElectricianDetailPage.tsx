import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { electricianService } from '../services/electrician.service';
import { ElectricianProfile, Service } from '../types';
import { StarRating } from '../components/common/StarRating';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BookingWizardModal } from '../components/booking/BookingWizardModal';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  Zap,
  Phone,
  MessageSquare,
  Wrench,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const ElectricianDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [electrician, setElectrician] = useState<ElectricianProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);

  useEffect(() => {
    if (id) {
      electricianService
        .getProfile(id)
        .then((data) => setElectrician(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <LoadingSpinner label="Loading electrician profile & credentials..." />
      </div>
    );
  }

  if (!electrician) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4">
        <h2 className="text-xl font-bold mb-2">Electrician Profile Not Found</h2>
        <button
          onClick={() => navigate('/search')}
          className="px-4 py-2 rounded-xl bg-volt-500 text-slate-950 font-bold text-xs"
        >
          Return to Search
        </button>
      </div>
    );
  }

  const handleBookService = (service?: Service) => {
    setSelectedService(service);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (bookingId: string) => {
    setBookingModalOpen(false);
    navigate(`/bookings/${bookingId}?showDispatch=true`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      {/* Profile Header Hero */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-10 pb-12 px-4 sm:px-6 lg:px-10 transition-colors w-full">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <img
                src={electrician.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${electrician.user?.name}`}
                alt={electrician.user?.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xl"
              />
              {electrician.isOnline && (
                <span
                  className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-3 border-white dark:border-slate-900"
                  title="Available for immediate dispatch"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {electrician.user?.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Contractor
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <StarRating rating={electrician.ratingAverage} showText reviewCount={electrician.reviewCount} />
                <span>•</span>
                <span>{electrician.experienceYears} Years Licensed Experience</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  {electrician.addressText || electrician.city}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {electrician.skills?.map((sk, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Price & Action Card */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-3 p-4 sm:p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none shrink-0">
            <div className="text-left sm:text-right">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">৳{electrician.hourlyRate}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Standard Hourly Rate</span>
            </div>
            <button
              onClick={() => handleBookService()}
              className="px-6 py-3 rounded-xl bg-volt-600 hover:bg-volt-500 text-white font-bold text-xs shadow-glow-volt transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              Book Electrician
            </button>
          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Bio, Services, Reviews */}
        <div className="lg:col-span-2 space-y-10">
          {/* About */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-volt-600 dark:text-volt-400" />
              About & Experience
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {electrician.bio || 'Licensed and insured master electrician.'}
            </p>
          </div>

          {/* Services Catalog */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-volt-600 dark:text-volt-400" />
              Services & Standard Pricing
            </h3>

            <div className="space-y-3">
              {electrician.services && electrician.services.length > 0 ? (
                electrician.services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{srv.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{srv.description}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                        ⏱️ Estimated ~{srv.estimatedDurationMin} mins ({srv.pricingType})
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-volt-600 dark:text-volt-400 block mb-1.5">
                        ৳{srv.basePrice}
                      </span>
                      <button
                        onClick={() => handleBookService(srv)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-volt-600 hover:text-white dark:hover:bg-volt-600 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">General service available at base hourly rate.</p>
              )}
            </div>
          </div>

          {/* Portfolio Photos */}
          {electrician.portfolioPhotos && electrician.portfolioPhotos.length > 0 && (
            <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
                Recent Job Photos
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {electrician.portfolioPhotos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`Portfolio ${i + 1}`}
                    className="rounded-2xl h-32 w-full object-cover border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Verified Customer Reviews */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Verified Reviews
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submitted only after completed service calls</p>
              </div>
              <div className="flex items-center gap-1.5">
                <StarRating rating={electrician.ratingAverage} showText reviewCount={electrician.reviewCount} />
              </div>
            </div>

            <div className="space-y-4">
              {electrician.reviews && electrician.reviews.length > 0 ? (
                electrician.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.customer?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.customer?.name}`}
                          alt={rev.customer?.name}
                          className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800"
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.customer?.name || 'Homeowner'}</span>
                      </div>
                      <StarRating rating={rev.rating} />
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>

                    {/* Electrician Reply */}
                    {rev.replyComment && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border-l-2 border-volt-500 text-xs text-slate-700 dark:text-slate-300">
                        <strong className="text-volt-600 dark:text-volt-400 text-[11px] block mb-0.5">Electrician Reply:</strong>
                        <p>{rev.replyComment}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No reviews yet for this electrician.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Availability & Credentials */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-volt-600 dark:text-volt-400" />
              Weekly Working Hours
            </h3>

            <div className="space-y-2 text-xs">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
                (dayName, dayIndex) => (
                  <div key={dayName} className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-400">{dayName}</span>
                    <span className="text-slate-900 dark:text-slate-200 font-semibold">
                      {dayIndex === 0 ? 'Off' : '08:00 AM - 08:00 PM'}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              VoltFix Guarantee
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                Licensed & insured background check
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                90-day warranty on installed work
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                Payment released only after customer approval
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Booking Wizard Modal */}
      <BookingWizardModal
        electrician={electrician}
        initialService={selectedService}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};
