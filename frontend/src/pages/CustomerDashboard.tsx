import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { Booking } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'open-request'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Open request form state
  const [openProblem, setOpenProblem] = useState('');
  const [openStreet, setOpenStreet] = useState('House 10, Road 4, Banani');
  const [openCity, setOpenCity] = useState('Dhaka');
  const [openPhone, setOpenPhone] = useState('+8801711223344');
  const [openDate, setOpenDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isEmergency, setIsEmergency] = useState(false);
  const [submittingOpen, setSubmittingOpen] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    bookingService
      .getMyBookings()
      .then(setBookings)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePostOpenRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openProblem || openProblem.length < 10) return;

    setSubmittingOpen(true);
    try {
      const scheduledAt = new Date(`${openDate}T10:00:00`).toISOString();
      await bookingService.createOpenRequest({
        problemDescription: openProblem,
        scheduledAt,
        isEmergency,
        addressStreet: openStreet,
        addressCity: openCity,
        addressLat: 23.7925,
        addressLng: 90.4078,
        customerPhone: openPhone,
      });

      setOpenSuccess(true);
      setOpenProblem('');
      fetchBookings();
      setTimeout(() => {
        setOpenSuccess(false);
        setActiveTab('bookings');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingOpen(false);
    }
  };

  const handleAcceptQuote = async (bookingId: string, quoteId: string) => {
    try {
      await bookingService.acceptQuote(bookingId, quoteId);
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-10 transition-colors">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Customer Portal</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage active electrical service appointments and open requests</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/40 dark:border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-white dark:bg-slate-800 text-volt-600 dark:text-white shadow-sm font-bold border border-slate-200/60 dark:border-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              My Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('open-request')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'open-request'
                  ? 'bg-white dark:bg-slate-800 text-volt-600 dark:text-white shadow-sm font-bold border border-slate-200/60 dark:border-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Post Open Request
            </button>
          </div>
        </div>

        {/* TAB 1: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            {loading ? (
              <LoadingSpinner label="Fetching your appointments..." />
            ) : bookings.length === 0 ? (
              <EmptyState
                title="No Bookings Found"
                description="You haven't requested any electrical services yet. Find a local verified electrician or post an open request to receive competitive quotes."
                action={
                  <Link
                    to="/search"
                    className="px-5 py-2.5 rounded-xl bg-volt-600 hover:bg-volt-500 text-white font-bold text-xs shadow-sm hover:shadow-glow-volt transition-all"
                  >
                    Find Electricians Nearby
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 sm:p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">#{b.bookingNumber}</span>
                        <StatusBadge status={b.status} />
                        {b.type === 'OPEN_REQUEST' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            OPEN BID ({b.quotes?.length || 0} quotes)
                          </span>
                        )}
                        {b.isEmergency && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            EMERGENCY
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {b.problemDescription}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        {b.electrician ? (
                          <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                            {b.electrician.user?.name}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">Awaiting Electrician Assignment</span>
                        )}
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

                      {/* Quotes Section for Open Requests */}
                      {b.type === 'OPEN_REQUEST' && b.quotes && b.quotes.length > 0 && b.status === 'PENDING' && (
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                          <p className="text-xs font-bold text-volt-600 dark:text-volt-400">Received Quotes:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {b.quotes.map((q) => (
                              <div
                                key={q.id}
                                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                    {q.electrician?.user?.name}
                                  </span>
                                  <span className="text-xs text-volt-600 dark:text-volt-400 font-extrabold">
                                    ৳{q.estimatedPrice}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleAcceptQuote(b.id, q.id)}
                                  className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                                >
                                  Accept Bid
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-end">
                      <Link
                        to={`/bookings/${b.id}`}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-all shadow-sm"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 text-volt-600 dark:text-volt-400" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POST OPEN REQUEST */}
        {activeTab === 'open-request' && (
          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Post an Open Service Request</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Local certified electricians in your city will review your requirements and submit price quotes.
              </p>
            </div>

            {openSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Request successfully broadcast! Electricians are now reviewing your job.
              </div>
            )}

            <form onSubmit={handlePostOpenRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Describe Problem & Needs
                </label>
                <textarea
                  rows={4}
                  required
                  value={openProblem}
                  onChange={(e) => setOpenProblem(e.target.value)}
                  placeholder="e.g. Rewire 3 rooms in home with dedicated lines for AC compressor and modern RCBO breakers."
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-volt-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={openStreet}
                    onChange={(e) => setOpenStreet(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    City / Neighborhood
                  </label>
                  <input
                    type="text"
                    required
                    value={openCity}
                    onChange={(e) => setOpenCity(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={openPhone}
                    onChange={(e) => setOpenPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={openDate}
                    onChange={(e) => setOpenDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <span className="text-xs font-bold text-rose-600 dark:text-rose-300">
                  Mark as High Priority Emergency
                </span>
              </label>

              <button
                type="submit"
                disabled={submittingOpen}
                className="w-full py-3 rounded-xl bg-volt-600 text-white font-bold text-xs hover:bg-volt-500 shadow-glow-volt transition-all disabled:opacity-50"
              >
                {submittingOpen ? 'Posting...' : 'Post Request & Collect Quotes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
