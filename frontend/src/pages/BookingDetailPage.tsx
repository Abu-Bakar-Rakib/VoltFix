import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Booking, BookingStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import { InvoiceModal } from '../components/invoice/InvoiceModal';
import { ReviewModal } from '../components/review/ReviewModal';
import { LiveTrackingMap } from '../components/maps/LiveTrackingMap';
import { DispatchNotificationModal } from '../components/notifications/DispatchNotificationModal';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  FileText,
  Star,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Truck,
  Wrench,
  Check,
  Smartphone,
  Navigation,
  Home,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

const STATUS_STEPS: BookingStatus[] = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'];

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user, isCustomer, isElectrician } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState<boolean>(
    searchParams.get('showDispatch') === 'true'
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchBooking = () => {
    if (id) {
      bookingService
        .getBookingById(id)
        .then(setBooking)
        .catch((err: any) => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <LoadingSpinner label="Loading booking details & live status..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 transition-colors">
        <h2 className="text-xl font-bold mb-2">Booking Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-volt-600 text-white font-bold text-xs hover:bg-volt-500 shadow-glow-volt transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.indexOf(booking.status);
  const isCompleted = booking.status === 'COMPLETED';
  const isCancelled = booking.status === 'CANCELLED';

  const counterpartName = isCustomer
    ? booking.electrician?.user?.name || 'Assigned Electrician'
    : booking.customer?.name || 'Customer';

  // Handle status update
  const handleUpdateStatus = async (toStatus: string, reason?: string) => {
    setActionError(null);
    try {
      await bookingService.updateStatus(booking.id, toStatus, reason);
      fetchBooking();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to update status.');
    }
  };

  const handleCancelBooking = async () => {
    const reason = window.prompt('Please provide a reason for cancelling this booking:');
    if (!reason) return;
    try {
      await bookingService.cancelBooking(booking.id, reason);
      fetchBooking();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-10 transition-colors">
      <div className="w-full space-y-6">
        {/* Navigation Breadcrumb & Back Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-volt-600 dark:hover:text-volt-400 transition-colors font-semibold"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('navHome')}</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link
              to={isElectrician ? '/electrician/dashboard' : '/dashboard'}
              className="hover:text-volt-600 dark:hover:text-volt-400 transition-colors font-medium"
            >
              {t('navDashboard')}
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-semibold">
              #{booking.bookingNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Home className="w-3.5 h-3.5 text-volt-500" />
              <span>{t('backToHome')}</span>
            </Link>
            <Link
              to={isElectrician ? '/electrician/dashboard' : '/dashboard'}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('backToDashboard')}</span>
            </Link>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm dark:shadow-none">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Booking #{booking.bookingNumber}
              </h1>
              <StatusBadge status={booking.status} />
              {booking.isEmergency && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-extrabold animate-pulse">
                  EMERGENCY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Created on {new Date(booking.createdAt).toLocaleDateString()} • {booking.type}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDispatchModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <Smartphone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>{t('viewAlertsBtn')}</span>
            </button>

            <button
              onClick={() => setChatOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-volt-500 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-volt-500 dark:text-volt-400" />
              <span>Chat</span>
            </button>
          </div>
        </div>

        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Status Stepper Timeline */}
        {!isCancelled ? (
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm dark:shadow-none">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
              Live Job Progress Tracker
            </h3>
            <div className="flex items-center justify-between min-w-[500px]">
              {STATUS_STEPS.map((stepName, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <React.Fragment key={stepName}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                          isCurrent
                            ? 'bg-volt-600 text-white ring-4 ring-volt-500/20 shadow-glow-volt scale-110'
                            : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] font-semibold mt-2 whitespace-nowrap ${
                          isCurrent
                            ? 'text-volt-600 dark:text-volt-400 font-bold'
                            : isPassed
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {stepName.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                          currentStepIdx > idx ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-sm">
            <strong>Booking Cancelled:</strong> {booking.cancellationReason || 'No reason provided.'}
          </div>
        )}

        {/* Live Technician Arrival GPS Tracking Map */}
        {!isCancelled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-volt-500 dark:text-volt-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{t('liveTrackingTitle')}</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                {t('liveTrackingSub')}
              </span>
            </div>

            <LiveTrackingMap
              customerLocation={[booking.addressLat || 23.8103, booking.addressLng || 90.4125]}
              electricianLocation={[
                booking.electrician?.latitude || (booking.addressLat ? booking.addressLat + 0.018 : 23.7925),
                booking.electrician?.longitude || (booking.addressLng ? booking.addressLng - 0.015 : 90.4078),
              ]}
              electricianName={booking.electrician?.user?.name || counterpartName}
              electricianPhone={booking.electrician?.user?.phone || '+8801700112233'}
              electricianAvatar={booking.electrician?.user?.avatarUrl}
              customerAddress={`${booking.addressStreet}, ${booking.addressCity}`}
              bookingStatus={booking.status}
              isEmergency={booking.isEmergency}
              onOpenChat={() => setChatOpen(true)}
            />
          </div>
        )}

        {/* Details Grid: Left Information & Right Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Service & Location Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem Details */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-none">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Job Request Details
              </h3>
              <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed bg-slate-100/90 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 font-medium">
                {booking.problemDescription}
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Appointment Scheduled:</span>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-volt-600 dark:text-volt-400" />
                    {new Date(booking.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Estimated Duration:</span>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-volt-600 dark:text-volt-400" />
                    ~{booking.estimatedDurationMin} minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Address & Privacy Contact Card */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-none">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Service Location & Contact
              </h3>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                <MapPin className="w-4 h-4 text-volt-600 dark:text-volt-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{booking.addressStreet}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">{booking.addressCity}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-600 dark:text-slate-400 block text-[10px] font-medium">Customer Phone:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{booking.customerPhone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Billing */}
          <div className="space-y-6">
            {/* Electrician Controls */}
            {isElectrician && !isCancelled && (
              <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-none">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Job Management
                </h3>

                {booking.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus('ACCEPTED', 'Accepted by pro')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Booking
                  </button>
                )}

                {booking.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus('ON_THE_WAY', 'En route to customer')}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    Mark On The Way
                  </button>
                )}

                {booking.status === 'ON_THE_WAY' && (
                  <button
                    onClick={() => handleUpdateStatus('IN_PROGRESS', 'Arrived and started diagnostic')}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    Start Work (In Progress)
                  </button>
                )}

                {booking.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateStatus('COMPLETED', 'Electrical work completed and tested')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Job Completed
                  </button>
                )}

                <button
                  onClick={() => setInvoiceModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-volt-600 dark:text-volt-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {booking.invoice ? 'View / Manage Invoice' : 'Create Invoice'}
                </button>
              </div>
            )}

            {/* Customer Controls */}
            {isCustomer && !isCancelled && (
              <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-none">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Customer Actions
                </h3>

                {booking.invoice && (
                  <button
                    onClick={() => setInvoiceModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-volt-600 hover:bg-volt-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-volt transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    {booking.invoice.status === 'PAID' ? 'View Paid Receipt' : 'Approve & Pay Invoice'}
                  </button>
                )}

                {isCompleted && !booking.review && (
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-volt-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-volt"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    Leave Verified Review
                  </button>
                )}

                {!['COMPLETED', 'IN_PROGRESS'].includes(booking.status) && (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full py-2.5 rounded-xl border border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-bold transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Chat Drawer */}
      <ChatDrawer
        bookingId={booking.id}
        counterpartName={counterpartName}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        bookingId={booking.id}
        invoice={booking.invoice || null}
        isElectrician={isElectrician}
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSuccess={() => {
          setInvoiceModalOpen(false);
          fetchBooking();
        }}
      />

      {/* Review Modal */}
      <ReviewModal
        bookingId={booking.id}
        electricianName={counterpartName}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {
          setReviewModalOpen(false);
          fetchBooking();
        }}
      />

      {/* Instant Dispatch Notification Modal (SMS & WhatsApp Simulation) */}
      <DispatchNotificationModal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        bookingNumber={booking.bookingNumber}
        isEmergency={booking.isEmergency}
        electricianName={booking.electrician?.user?.name || counterpartName}
        electricianPhone={booking.electrician?.user?.phone || '+8801700112233'}
        customerName={booking.customer?.name || user?.name || 'Customer'}
        customerPhone={booking.customerPhone || user?.phone || '+8801811223344'}
        serviceAddress={`${booking.addressStreet}, ${booking.addressCity}`}
        problemDescription={booking.problemDescription}
        estimatedFee={booking.electrician?.hourlyRate || 450}
      />
    </div>
  );
};
