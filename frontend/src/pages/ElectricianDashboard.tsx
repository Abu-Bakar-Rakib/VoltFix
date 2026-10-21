import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { electricianService } from '../services/electrician.service';
import { bookingService } from '../services/booking.service';
import { invoiceService } from '../services/invoice.service';
import { ElectricianProfile, Booking } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TakaIcon } from '../components/common/TakaIcon';
import {
  Wrench,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldCheck,
  Send,
  Power,
} from 'lucide-react';

export const ElectricianDashboard: React.FC = () => {
  const [profile, setProfile] = useState<ElectricianProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [openRequests, setOpenRequests] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingOnline, setTogglingOnline] = useState<boolean>(false);

  // Quote submission state
  const [selectedRequest, setSelectedRequest] = useState<Booking | null>(null);
  const [quotePrice, setQuotePrice] = useState<number>(100);
  const [quoteNote, setQuoteNote] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profData, bookData, openData, earnData] = await Promise.all([
        electricianService.getMyProfile(),
        bookingService.getMyBookings(),
        bookingService.getOpenRequests(),
        invoiceService.getEarnings().catch(() => null),
      ]);
      setProfile(profData);
      setBookings(bookData);
      setOpenRequests(openData);
      setEarnings(earnData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleOnline = async () => {
    if (!profile) return;
    setTogglingOnline(true);
    try {
      const updated = await electricianService.toggleOnline(!profile.isOnline);
      setProfile((prev) => (prev ? { ...prev, isOnline: updated.isOnline } : null));
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await bookingService.updateStatus(bookingId, 'ACCEPTED', 'Confirmed by pro');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmittingQuote(true);
    try {
      await bookingService.submitQuote(selectedRequest.id, {
        estimatedPrice: quotePrice,
        note: quoteNote,
      });
      setSelectedRequest(null);
      setQuoteNote('');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner label="Loading electrician workbench & schedule..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-10 transition-colors">
      <div className="w-full space-y-8">
        {/* Header with Online/Offline toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Electrician Dashboard</h1>
              {profile?.verificationStatus === 'APPROVED' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  APPROVED
                </span>
              ) : (
                <StatusBadge status={profile?.verificationStatus || 'PENDING'} />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, {profile?.user?.name}. Manage jobs, quotes, and your live availability.
            </p>
          </div>

          {/* Online Toggle Switch */}
          <button
            onClick={handleToggleOnline}
            disabled={togglingOnline}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all shadow-lg ${
              profile?.isOnline
                ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{profile?.isOnline ? 'Online for Dispatch' : 'Offline / On Break'}</span>
          </button>
        </div>

        {/* Verification Status Warning if not approved */}
        {profile?.verificationStatus !== 'APPROVED' && (
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Verification In Progress</h4>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                Your electrician documents are currently under review by our admin verification desk. You can still test features and prepare your service catalog.
              </p>
            </div>
          </div>
        )}

        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Net Earnings
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ৳{earnings?.totalNet ? earnings.totalNet.toFixed(2) : '0.00'}
              </span>
              <TakaIcon size="lg" className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {earnings?.completedPayouts || 0} completed payouts
            </span>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Average Rating
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {profile?.ratingAverage?.toFixed(1) || '5.0'}
              </span>
              <Star className="w-5 h-5 text-amber-500 dark:text-amber-400 fill-current" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {profile?.reviewCount || 0} verified customer reviews
            </span>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Total Assigned Jobs
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{bookings.length}</span>
              <Wrench className="w-5 h-5 text-volt-500 dark:text-volt-400" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Direct and open bids
            </span>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Hourly Base Rate
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">৳{profile?.hourlyRate}/hr</span>
              <Clock className="w-5 h-5 text-electric-500 dark:text-electric-400" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Radius: {profile?.serviceRadiusKm} km
            </span>
          </div>
        </div>

        {/* 2 Main Sections: Direct Bookings & Open Request Marketplace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Direct Appointments */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>My Booking Appointments</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({bookings.length})</span>
            </h2>

            {bookings.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                No active appointments currently assigned.
              </p>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">#{b.bookingNumber}</span>
                    <StatusBadge status={b.status} />
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                    {b.problemDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="text-slate-900 dark:text-white font-semibold">{b.customer?.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {new Date(b.scheduledAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {b.addressCity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80">
                    {b.status === 'PENDING' ? (
                      <button
                        onClick={() => handleAcceptBooking(b.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                      >
                        Accept Appointment
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Accepted by you</span>
                    )}

                    <Link
                      to={`/bookings/${b.id}`}
                      className="text-xs font-bold text-volt-600 dark:text-volt-400 hover:text-volt-500 flex items-center gap-1"
                    >
                      Manage Job <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Open Bidding Marketplace */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Open Requests Available to Bid</span>
              <span className="text-xs text-volt-600 dark:text-volt-400 font-normal">({openRequests.length})</span>
            </h2>

            {openRequests.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                No open electrical requests waiting for bids right now.
              </p>
            ) : (
              openRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-volt-600 dark:text-volt-400">#{req.bookingNumber}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Target: {new Date(req.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{req.problemDescription}</p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                    <span>📍 {req.addressCity}</span>
                    <span>{req.quotes?.length || 0} quotes received</span>
                  </div>

                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-volt-600 hover:text-white dark:hover:bg-volt-600 dark:hover:text-white text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Price Quote
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal for Submitting Quote on Open Request */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-in fade-in text-slate-900 dark:text-slate-100">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Quote for #{selectedRequest.bookingNumber}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{selectedRequest.problemDescription}</p>

              <form onSubmit={handleSubmitQuote} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Your Total Estimated Price (৳)
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Note for Homeowner
                  </label>
                  <textarea
                    rows={3}
                    value={quoteNote}
                    onChange={(e) => setQuoteNote(e.target.value)}
                    placeholder="e.g. Can complete job in 2 hours with certified heavy gauge wiring included."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="px-5 py-2 rounded-xl bg-volt-600 text-white font-bold text-xs hover:bg-volt-500 shadow-glow-volt"
                  >
                    {submittingQuote ? 'Submitting...' : 'Send Quote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
