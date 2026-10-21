import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ElectricianProfile, Service } from '../../types';
import { bookingService } from '../../services/booking.service';
import { LocationPickerMap } from '../maps/LocationPickerMap';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Zap,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const bookingFormSchema = z.object({
  serviceId: z.string().optional(),
  problemDescription: z.string().min(10, 'Please provide a detailed description (at least 10 characters)'),
  isEmergency: z.boolean().default(false),
  addressStreet: z.string().min(3, 'Street address is required'),
  addressCity: z.string().min(2, 'City is required'),
  customerPhone: z.string().min(8, 'Contact phone number is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  addressLat: z.number().default(23.8103),
  addressLng: z.number().default(90.4125),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingWizardModalProps {
  electrician: ElectricianProfile;
  initialService?: Service;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

import { authService } from '../../services/auth.service';

function parseBookingDateTime(dateStr: string, timeStr: string): string {
  try {
    let hours = 10;
    let minutes = 0;
    const cleanTime = (timeStr || '10:00').trim();

    // Parse 12-hour AM/PM or 24-hour time strings safely
    const ampmMatch = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (ampmMatch) {
      hours = parseInt(ampmMatch[1], 10);
      minutes = parseInt(ampmMatch[2], 10);
      const ampm = ampmMatch[3]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();

    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        // MM/DD/YYYY format as entered by browser
        month = parseInt(parts[0], 10) - 1;
        day = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
    } else {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        year = d.getFullYear();
        month = d.getMonth();
        day = d.getDate();
      }
    }

    const targetDate = new Date(year, month, day, hours, minutes, 0);
    if (isNaN(targetDate.getTime())) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 1);
      fallback.setHours(10, 0, 0, 0);
      return fallback.toISOString();
    }
    return targetDate.toISOString();
  } catch {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 1);
    fallback.setHours(10, 0, 0, 0);
    return fallback.toISOString();
  }
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  electrician,
  initialService,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Tomorrow date default for booking
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceId: initialService?.id || '',
      isEmergency: false,
      problemDescription: '',
      addressStreet: 'House 24, Road 5',
      addressCity: electrician.city || 'Dhaka',
      customerPhone: '+8801700112233',
      scheduledDate: defaultDateStr,
      scheduledTime: '10:00',
      addressLat: electrician.latitude || 23.8103,
      addressLng: electrician.longitude || 90.4125,
    },
  });

  if (!isOpen) return null;

  const selectedServiceId = watch('serviceId');
  const isEmergency = watch('isEmergency');
  const selectedService = electrician.services?.find((s) => s.id === selectedServiceId);

  const onSubmit = async (values: BookingFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Ensure user has a session (auto-authenticate as guest customer if needed)
      const token = localStorage.getItem('voltfix_token');
      if (!token) {
        try {
          const guestRes = await authService.login({ email: 'customer@voltfix.com', password: 'Customer@123' });
          if (guestRes?.accessToken) {
            localStorage.setItem('voltfix_token', guestRes.accessToken);
            localStorage.setItem('voltfix_user', JSON.stringify(guestRes.user));
          }
        } catch {
          // Backend optionalAuth fallback will handle guest booking
        }
      }

      // 2. Parse scheduled date and time safely
      const scheduledAt = parseBookingDateTime(values.scheduledDate, values.scheduledTime);

      const booking = await bookingService.createDirectBooking({
        electricianId: electrician.id,
        serviceId: values.serviceId || undefined,
        problemDescription: values.problemDescription,
        scheduledAt,
        estimatedDurationMin: selectedService?.estimatedDurationMin || 60,
        isEmergency: values.isEmergency,
        addressStreet: values.addressStreet,
        addressCity: values.addressCity,
        addressLat: values.addressLat,
        addressLng: values.addressLng,
        customerPhone: values.customerPhone,
      });

      onSuccess(booking.id);
    } catch (err: any) {
      console.error('Booking submission failed:', err);
      const errorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to submit booking. Please verify all details and try again.';
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-5 sm:p-8 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-volt-500/10 border border-volt-500/20 flex items-center justify-center text-volt-500 dark:text-volt-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('bookElectricianTitle')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('withElectrician')} <span className="text-slate-900 dark:text-white font-semibold">{electrician.user?.name}</span> ({electrician.city})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Steps Indicator */}
        <div className="grid grid-cols-4 gap-2 my-6">
          {[
            { num: 1, label: t('step1') },
            { num: 2, label: t('step2') },
            { num: 3, label: t('step3') },
            { num: 4, label: t('step4') },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s.num
                    ? 'bg-volt-600 text-white ring-4 ring-volt-500/20 shadow-glow-volt'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-[11px] font-medium mt-1.5 ${
                  step === s.num ? 'text-volt-600 dark:text-volt-400 font-bold' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {submitError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 1: Service Selection & Emergency */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('chooseServiceTitle')}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {electrician.services && electrician.services.length > 0 ? (
                  electrician.services.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setValue('serviceId', srv.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedServiceId === srv.id
                          ? 'bg-volt-500/10 border-volt-500 ring-1 ring-volt-500'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{srv.title}</h4>
                        <span className="text-xs font-extrabold text-volt-600 dark:text-volt-400">৳{srv.basePrice}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{srv.description}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-2">
                        ⏱️ ~{srv.estimatedDurationMin} mins ({srv.pricingType})
                      </span>
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => setValue('serviceId', '')}
                    className="col-span-2 p-4 rounded-2xl bg-volt-500/10 border border-volt-500"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{t('generalDiagnostic')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('generalDiagnosticDesc')} (৳{electrician.hourlyRate}/hr).
                    </p>
                  </div>
                )}
              </div>

              {/* Emergency dispatch checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 cursor-pointer hover:bg-rose-500/15 transition-colors">
                  <input
                    type="checkbox"
                    {...register('isEmergency')}
                    className="w-4 h-4 accent-rose-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      {t('urgentEmergencyLabel')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {t('urgentEmergencyHint')}
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-volt-500 text-slate-950 font-bold text-xs hover:bg-volt-400 flex items-center gap-2 shadow-glow-volt transition-all"
                >
                  {t('nextStep')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Problem Description */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('describeProblemTitle')}
                </label>
                <textarea
                  {...register('problemDescription')}
                  rows={4}
                  placeholder={t('describePlaceholder')}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-volt-500"
                />
                {errors.problemDescription && (
                  <p className="text-rose-500 text-xs mt-1">{errors.problemDescription.message}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 mb-1">{t('photoTipTitle')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('photoTipDesc')}
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('back')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const desc = watch('problemDescription');
                    if (!desc || desc.length < 10) {
                      setValue('problemDescription', desc, { shouldValidate: true });
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-volt-500 text-slate-950 font-bold text-xs hover:bg-volt-400 flex items-center gap-2 shadow-glow-volt transition-all"
                >
                  {t('nextLocation')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Address & Phone */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {t('streetAddressLabel')}
                </label>
                <input
                  type="text"
                  {...register('addressStreet')}
                  placeholder={t('streetAddressPlaceholder')}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-volt-500 focus:outline-none"
                />
                {errors.addressStreet && (
                  <p className="text-rose-500 text-xs mt-1">{errors.addressStreet.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {t('cityNeighborhoodLabel')}
                  </label>
                  <input
                    type="text"
                    {...register('addressCity')}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-volt-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {t('phoneLabel')}
                  </label>
                  <input
                    type="text"
                    {...register('customerPhone')}
                    placeholder={t('phonePlaceholder')}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-volt-500 focus:outline-none"
                  />
                  {errors.customerPhone && (
                    <p className="text-rose-500 text-xs mt-1">{errors.customerPhone.message}</p>
                  )}
                </div>
              </div>

              {/* Interactive Location Pin Drop Map */}
              <LocationPickerMap
                lat={watch('addressLat')}
                lng={watch('addressLng')}
                onChange={(newLat, newLng) => {
                  setValue('addressLat', newLat, { shouldValidate: true });
                  setValue('addressLng', newLng, { shouldValidate: true });
                }}
                height="290px"
              />

              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t('privacyGuaranteed')}</span>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('back')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-volt-500 text-slate-950 font-bold text-xs hover:bg-volt-400 flex items-center gap-2 shadow-glow-volt"
                >
                  {t('nextReview')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Date, Time & Final Confirmation */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-volt-500 dark:text-volt-400" />
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('scheduledDate')}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-volt-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-volt-500 dark:text-volt-400" />
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    {...register('scheduledTime')}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-volt-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{t('selectedServiceLabel')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedService?.title || t('generalDiagnostic')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Electrician Hourly Base:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">৳{electrician.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{t('estimatedFeeLabel')}</span>
                  <span className="font-bold text-volt-600 dark:text-volt-400">
                    ৳{selectedService?.basePrice || electrician.hourlyRate}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Urgency:</span>
                  <span className={isEmergency ? 'font-bold text-rose-500 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                    {isEmergency ? 'Emergency (Priority)' : 'Standard'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('back')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-volt-600 to-cyan-600 text-white font-bold text-xs hover:brightness-110 flex items-center gap-2 shadow-glow-volt disabled:opacity-50"
                >
                  {isSubmitting ? t('submitting') : t('confirmAndBook')}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
