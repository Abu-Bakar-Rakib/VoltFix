import React, { useState } from 'react';
import { X, MessageSquare, Send, Check, Copy, ExternalLink, ShieldAlert, PhoneCall } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DispatchNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingNumber: string;
  isEmergency: boolean;
  electricianName: string;
  electricianPhone: string;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  problemDescription: string;
  estimatedFee?: number;
}

export const DispatchNotificationModal: React.FC<DispatchNotificationModalProps> = ({
  isOpen,
  onClose,
  bookingNumber,
  isEmergency,
  electricianName,
  electricianPhone,
  customerName,
  customerPhone,
  serviceAddress,
  problemDescription,
  estimatedFee = 450,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Formatted WhatsApp text
  const cleanPhone = electricianPhone.replace(/[^0-9]/g, '');
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const whatsappMessage = language === 'bn'
    ? `🚨 *ভোল্টফিক্স ${isEmergency ? 'জরুরি ডিসপ্যাচ' : 'নতুন বুকিং'} সতর্কতা*
📋 *বুকিং নং:* #${bookingNumber}
👤 *গ্রাহক:* ${customerName} (${customerPhone})
📍 *ঠিকানা:* ${serviceAddress}
🔧 *সমস্যা:* ${problemDescription}
⏱️ *সাড়া দেওয়ার সময়:* ৩০-৪৫ মিনিট
💰 *আনুমানিক ডায়াগনস্টিক ফি:* ৳${estimatedFee}

⚡ *বুকিং বিস্তারিত দেখতে ও নেভিগেশন শুরু করতে নিচের লিংকে ক্লিক করুন:*
https://voltfix.bd/bookings/${bookingNumber}`
    : `🚨 *VOLTFIX ${isEmergency ? 'URGENT 24/7 EMERGENCY' : 'NEW BOOKING'} DISPATCH*
📋 *Booking:* #${bookingNumber}
👤 *Customer:* ${customerName} (${customerPhone})
📍 *Location:* ${serviceAddress}
🔧 *Problem:* ${problemDescription}
⏱️ *Response Window:* Immediate (< 30-45 mins)
💰 *Estimated Diagnostic Fee:* ৳${estimatedFee}

⚡ *Open booking & start GPS navigation:*
https://voltfix.bd/bookings/${bookingNumber}`;

  const smsMessage = language === 'bn'
    ? `[VoltFix] ${isEmergency ? 'জরুরি' : 'নতুন'} বুকিং #${bookingNumber}! গ্রাহক: ${customerName}, ঠিকানা: ${serviceAddress}. সমস্যা: ${problemDescription.substring(0, 50)}... ফি: ৳${estimatedFee}. অ্যাপে লগইন করুন বা কল করুন: ${customerPhone}`
    : `[VoltFix Alert] ${isEmergency ? 'URGENT EMERGENCY' : 'New'} Dispatch #${bookingNumber}! Customer: ${customerName}, Address: ${serviceAddress}. Issue: ${problemDescription.substring(0, 50)}... Fee: ৳${estimatedFee}. View in app or call: ${customerPhone}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              isEmergency ? 'bg-rose-500/10 text-rose-500' : 'bg-volt-500/10 text-volt-500'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('dispatchAlertsTitle')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('alertSentTo')} <span className="font-semibold text-slate-900 dark:text-white">{electricianName}</span> ({electricianPhone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-slate-100/60 dark:bg-slate-950/60 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('whatsappTab')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'sms'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t('smsTab')}</span>
            <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
          </button>
        </div>

        {/* Tab 1: WhatsApp Preview */}
        {activeTab === 'whatsapp' && (
          <div className="p-5 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 overflow-hidden shadow-inner bg-[#ece5dd] dark:bg-[#0b141a]">
              {/* WhatsApp App Bar */}
              <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs">
                    ⚡
                  </div>
                  <div>
                    <span className="block leading-tight">VoltFix Dispatch Bot</span>
                    <span className="text-[10px] text-emerald-200 font-normal">Official Business Account ✓</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-200">Online</span>
              </div>

              {/* Chat Bubble */}
              <div className="p-4">
                <div className="max-w-[92%] rounded-2xl p-3.5 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-[#1f2c34] shadow-sm space-y-1.5 leading-relaxed font-sans border border-slate-200/50 dark:border-slate-700/50">
                  <div className="whitespace-pre-line text-[11px] font-mono leading-relaxed">
                    {whatsappMessage}
                  </div>
                  <div className="flex justify-end items-center gap-1 text-[10px] text-slate-400 mt-1">
                    <span>{timestamp}</span>
                    <span className="text-sky-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleCopy(whatsappMessage)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('copiedText') : t('copyAlertText')}</span>
              </button>

              <a
                href={openWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>{t('openInWhatsApp')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: SMS Preview */}
        {activeTab === 'sms' && (
          <div className="p-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span>Sender: <strong className="text-slate-900 dark:text-white">VoltFix-BD</strong></span>
                <span className="text-emerald-500 font-semibold">Delivered ✓</span>
              </div>
              <p className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {smsMessage}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Carrier: Grameenphone / Robi / Banglalink</span>
                <span>{timestamp}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopy(smsMessage)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('copiedText') : t('copyAlertText')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Note */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live automated dispatch gateway active
          </span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 dark:text-slate-300 hover:underline"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
