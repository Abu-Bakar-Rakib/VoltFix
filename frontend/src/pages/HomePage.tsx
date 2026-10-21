import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { electricianService } from '../services/electrician.service';
import { ElectricianProfile, Category } from '../types';
import { StarRating } from '../components/common/StarRating';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Zap,
  Search,
  ShieldCheck,
  Clock,
  Award,
  PhoneCall,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Wrench,
  Cpu,
  Home,
  Sun,
  BatteryCharging,
  ArrowUpRight,
  Layers,
  MessageSquare,
  Navigation,
  Check,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [topElectricians, setTopElectricians] = useState<ElectricianProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'residential' | 'emergency' | 'greentech' | 'commercial'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    electricianService.getCategories().then(setCategories).catch(() => {});
    electricianService.search({ sort: 'rating_desc', limit: 4 }).then((res) => {
      setTopElectricians(res.electricians);
    }).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (selectedCategory) params.set('categoryId', selectedCategory);
    navigate(`/search?${params.toString()}`);
  };

  const categoryMeta: Record<string, {
    badge: { en: string; bn: string };
    priceTag: { en: string; bn: string };
    group: 'emergency' | 'residential' | 'greentech' | 'commercial';
    icon: any;
    image: string;
    symptom: { en: string; bn: string };
  }> = {
    'emergency-repairs': {
      badge: { en: '24/7 Priority Emergency', bn: '২৪/৭ জরুরি রেসপন্স' },
      priceTag: { en: '৳450', bn: '৳৪৫০' },
      group: 'emergency',
      icon: Zap,
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      symptom: { en: 'Sparking / Outage / Short Circuit', bn: 'স্পার্কিং / বিদ্যুৎ বিভ্রাট / শর্ট সার্কিট' },
    },
    'residential-wiring': {
      badge: { en: 'Most Requested', bn: 'সর্বাধিক জনপ্রিয়' },
      priceTag: { en: '৳350', bn: '৳৩৫০' },
      group: 'residential',
      icon: Home,
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      symptom: { en: 'Full House Wiring & Switchboards', bn: 'সম্পূর্ণ ওয়্যারিং ও সুইচবোর্ড' },
    },
    'panel-breaker-upgrades': {
      badge: { en: 'Safety Code Certified', bn: 'নিরাপত্তা সার্টিফাইড' },
      priceTag: { en: '৳800', bn: '৳৮০০' },
      group: 'residential',
      icon: Cpu,
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      symptom: { en: 'Frequent Tripping / Modern RCBO', bn: 'বারবার ব্রেকার ট্রিপ / আধুনিক আরসিবিও' },
    },
    'lighting-ceiling-fans': {
      badge: { en: 'Architectural & Fixtures', bn: 'ফিক্সচার ও লাইটিং' },
      priceTag: { en: '৳300', bn: '৳৩০০' },
      group: 'residential',
      icon: Sun,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      symptom: { en: 'Chandeliers, LED & Ceiling Fans', bn: 'ঝাড়বাতি, এলইডি ও সিলিং ফ্যান' },
    },
    'ev-charger-installation': {
      badge: { en: 'Tesla & Level 2 Fast EV', bn: 'লেভেল ২ ফাস্ট ইভি' },
      priceTag: { en: '৳1,200', bn: '৳১,২০০' },
      group: 'greentech',
      icon: BatteryCharging,
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      symptom: { en: 'Dedicated High-Amp Wall Connector', bn: 'উচ্চ ক্ষমতাসম্পন্ন ওয়াল চার্জার' },
    },
    'solar-inverter-setup': {
      badge: { en: 'Hybrid Solar & IPS', bn: 'আইপিএস ও সোলার' },
      priceTag: { en: '৳1,500', bn: '৳১,৫০০' },
      group: 'greentech',
      icon: ShieldCheck,
      image: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=800&q=80',
      symptom: { en: 'Battery Backup & Transfer Switch', bn: 'ব্যাটারি ব্যাংক ও চেঞ্জওভার' },
    },
    'appliance-hvac-circuits': {
      badge: { en: 'Heavy Appliance Lines', bn: 'এসি ও ভারী যন্ত্রপাতি' },
      priceTag: { en: '৳500', bn: '৳৫০০' },
      group: 'residential',
      icon: Wrench,
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      symptom: { en: 'AC Compressor, Geyser & Induction', bn: 'এসি কম্প্রেসর, গিজার ও ইন্ডাকশন' },
    },
    'commercial-industrial': {
      badge: { en: '3-Phase Heavy Duty', bn: '৩-ফেজ ইন্ডাস্ট্রিয়াল' },
      priceTag: { en: '৳1,000', bn: '৳১,০০০' },
      group: 'commercial',
      icon: Layers,
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      symptom: { en: 'Factory Wiring & Load Balancing', bn: 'ফ্যাক্টরি ওয়্যারিং ও ব্যালেন্সিং' },
    },
  };

  const filteredCategories = categories.filter((cat) => {
    if (activeCategoryFilter === 'all') return true;
    const meta = categoryMeta[cat.slug];
    return meta?.group === activeCategoryFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080C14] text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-10 overflow-hidden w-full bg-grid-pattern">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-amber-500/12 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[320px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-6xl mx-auto text-center relative z-10">
          {/* Emergency badge */}
          <Link
            to="/search?emergencyOnly=true"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-black mb-6 hover:bg-amber-500/20 transition-all hover:scale-105 shadow-md shadow-amber-500/10"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{t('heroBadge')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
            {t('heroTitlePrefix')}{' '}
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 dark:from-amber-400 dark:via-yellow-300 dark:to-cyan-300 bg-clip-text text-transparent">
              {t('heroTitleHighlight')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {t('heroSubtitle')}
          </p>

          {/* Search Form Card */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-3 sm:p-4 rounded-3xl glass-panel glow-dual-border w-full max-w-4xl mx-auto shadow-2xl flex flex-col md:flex-row gap-3 items-center"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700/60">
              <Search className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('heroSearchPlaceholder')}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="w-full md:w-56 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700/60">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-glow-volt flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <span>{t('heroFindButton')}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>

          {/* Social Proof chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              {t('footerGuar1Title')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              {t('footerGuar3Title')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              {t('footerGuar2Title')}
            </span>
          </div>
        </div>
      </section>

      {/* 2. VERIFIED ELECTRICAL SERVICES SECTION */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-10 w-full overflow-hidden">
        {/* Soft Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-gradient-to-r from-amber-500/5 via-cyan-500/5 to-amber-500/5 blur-[140px] rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-8 gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-black tracking-wide mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('navCategories')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              {t('topCategories')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl font-medium">
              {t('topCategoriesSub')}
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-amber-500 text-slate-800 hover:text-slate-950 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-amber-500 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-extrabold transition-all shadow-sm hover:shadow-glow-volt group shrink-0"
          >
            <span>{t('viewAllServices')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Quick Issue Diagnoser Bar */}
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-md relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {t('symptomsTitle')}
              </span>
            </div>

            {/* Trust credentials badges in header */}
            <div className="hidden lg:flex items-center gap-6 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{t('licensedGuarantee')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-500" />
                <span>{t('avgResponseTime')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{t('straightforwardPricing')}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Symptom Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { label: t('symptomBreaker'), query: 'breaker', icon: Cpu },
              { label: t('symptomSpark'), query: 'spark', icon: Zap },
              { label: t('symptomLighting'), query: 'lighting', icon: Sun },
              { label: t('symptomSwitchboard'), query: 'wiring', icon: Home },
              { label: t('symptomEV'), query: 'ev', icon: BatteryCharging },
              { label: t('symptomSolar'), query: 'solar', icon: ShieldCheck },
              { label: t('symptomAC'), query: 'ac', icon: Wrench },
              { label: t('symptomCommercial'), query: 'commercial', icon: Layers },
            ].map((symptom, idx) => {
              const SymptomIcon = symptom.icon;
              return (
                <Link
                  key={idx}
                  to={`/search?query=${encodeURIComponent(symptom.query)}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-amber-500 text-slate-700 hover:text-slate-950 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-xs font-bold transition-all duration-200 shrink-0 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md hover:scale-[1.02] group"
                >
                  <SymptomIcon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 group-hover:text-slate-950 dark:group-hover:text-slate-950 transition-colors" />
                  <span>{symptom.label}</span>
                  <ArrowRight className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Trust Credentials Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 lg:hidden relative z-10">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">{t('licensedGuarantee')}</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-cyan-500 shrink-0" />
            <span className="truncate">{t('avgResponseTime')}</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">{t('straightforwardPricing')}</span>
          </div>
        </div>

        {/* Category Scope Filter Tabs */}
        <div className="flex items-center justify-between gap-4 mb-8 relative z-10 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: t('allServicesTab'), count: categories.length },
              { id: 'residential', label: t('residentialTab'), count: 4 },
              { id: 'emergency', label: t('emergencyTab'), count: 1 },
              { id: 'greentech', label: t('greenTechTab'), count: 2 },
              { id: 'commercial', label: t('commercialTab'), count: 1 },
            ].map((tab) => {
              const isActive = activeCategoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black shadow-glow-volt scale-[1.02]'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 backdrop-blur-sm'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{language === 'bn' ? 'সকল মূল্য চূড়ান্ত ও কোনো বাড়তি হিডেন ফি নেই' : 'Itemized rates guaranteed upon completion'}</span>
          </div>
        </div>

        {/* 4x2 Symmetrical Modern Compact & Stylish Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {filteredCategories.map((cat) => {
            const meta = categoryMeta[cat.slug] || {
              badge: { en: 'Verified Service', bn: 'ভেরিফাইড সেবা' },
              priceTag: { en: '৳350', bn: '৳৩৫০' },
              group: 'residential' as const,
              icon: Zap,
              image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
              symptom: { en: 'Expert Diagnostic & Repairs', bn: 'অভিজ্ঞ ডায়াগনস্টিক ও মেরামত' },
            };
            const IconComponent = meta.icon;

            return (
              <Link
                key={cat.id}
                to={`/search?categoryId=${cat.id}`}
                className="group relative rounded-2xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-amber-400/50 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between p-4 overflow-hidden"
              >
                {/* Top Image Preview Banner */}
                <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3.5 bg-slate-950 shrink-0">
                  <img
                    src={meta.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Subtle Gradient Shade for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />

                  {/* Top Category Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/70 backdrop-blur-md border border-white/20 text-amber-300 tracking-wide shadow-sm">
                      {language === 'bn' ? meta.badge.bn : meta.badge.en}
                    </span>
                  </div>

                  {/* Floating Frosted Glass Icon (Bottom-Left) */}
                  <div className="absolute bottom-2.5 left-2.5 z-10 w-9 h-9 rounded-xl bg-white/20 dark:bg-slate-950/75 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md group-hover:bg-amber-500 group-hover:border-amber-400 group-hover:text-slate-950 group-hover:scale-105 transition-all duration-300">
                    <IconComponent className="w-5 h-5 transition-transform group-hover:rotate-6" />
                  </div>

                  {/* Starting Price Pill (Bottom-Right) */}
                  <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/20 text-right">
                    <span className="text-[11px] font-black text-amber-300">
                      {language === 'bn' ? meta.priceTag.bn : meta.priceTag.en}
                    </span>
                  </div>
                </div>

                {/* Card Body: Title, Symptom & Description */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title with Arrow Micro-interaction */}
                    <h3 className="text-sm font-extrabold font-heading text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between gap-1.5 leading-snug">
                      <span className="truncate">{cat.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </h3>

                    {/* Symptom / Diagnostic Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1.5 max-w-full truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="truncate">{language === 'bn' ? meta.symptom.bn : meta.symptom.en}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed min-h-[32px]">
                      {cat.description}
                    </p>
                  </div>

                  {/* Card Bottom: Starting From & Action CTA */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
                      {t('startingFrom')}{' '}
                      <strong className="text-slate-900 dark:text-white font-extrabold ml-1">
                        {language === 'bn' ? meta.priceTag.bn : meta.priceTag.en}
                      </strong>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 group-hover:underline">
                      <span>{t('exploreCategory')}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED TOP ELECTRICIANS */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-10 w-full border-t border-slate-200 dark:border-slate-800/80 overflow-hidden">
        {/* Soft Ambient Background Glow */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-amber-500/5 via-cyan-500/5 to-amber-500/5 blur-[140px] rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-10 gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-black tracking-wide mb-3">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'bn' ? 'শীর্ষ প্রত্যয়িত ইলেকট্রিশিয়ান' : 'Certified Master Electricians'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              {t('featuredElectricians')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl font-medium">
              {t('featuredElectriciansSub')}
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-amber-500 text-slate-800 hover:text-slate-950 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-amber-500 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-extrabold transition-all shadow-sm hover:shadow-glow-volt group shrink-0"
          >
            <span>{t('navFind')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Modern Compact & Stylish Electrician Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {topElectricians.map((elec, idx) => {
            const specialtyBadges = [
              { en: '24/7 Rapid Emergency', bn: '২৪/৭ জরুরি রেসপন্স' },
              { en: 'EV & Smart Systems', bn: 'ইভি ও স্মার্ট প্যানেল' },
              { en: 'Solar & Inverter Specialist', bn: 'সোলার ও ইনভার্টার' },
              { en: '3-Phase Industrial Pro', bn: '৩-ফেজ ইন্ডাস্ট্রিয়াল' },
            ];

            const formatBnNum = (n: number | string) => {
              if (language !== 'bn') return String(n);
              const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
              return String(n).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
            };

            const specialty = specialtyBadges[idx % specialtyBadges.length];

            return (
              <div
                key={elec.id}
                className="group relative rounded-2xl bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-amber-400/50 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 p-4 flex flex-col justify-between overflow-hidden"
              >
                {/* 1. Card Header: Avatar + Identity + Hourly Rate */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {/* Left: Avatar with Status Dot */}
                    <div className="relative shrink-0">
                      <img
                        src={elec.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${elec.user?.name}`}
                        alt={elec.user?.name}
                        className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform duration-300"
                      />
                      {elec.isOnline ? (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-xs"
                          title="Active & Available"
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </span>
                      ) : (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-xs"
                          title="Offline"
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                        </span>
                      )}
                    </div>

                    {/* Right: Hourly Rate Pill */}
                    <div className="text-right px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 dark:border-amber-500/25 shrink-0">
                      <div className="flex items-baseline gap-0.5 justify-end">
                        <span className="text-xs font-black text-amber-500 dark:text-amber-400">৳</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {formatBnNum(elec.hourlyRate)}
                        </span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block -mt-0.5">
                        {language === 'bn' ? 'ঘণ্টা' : '/ hr'}
                      </span>
                    </div>
                  </div>

                  {/* Name & Verified Badge */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Link
                        to={`/electricians/${elec.id}`}
                        className="text-sm font-extrabold font-heading text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate"
                      >
                        {elec.user?.name}
                      </Link>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                    </div>

                    {/* Location & Experience */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate">{elec.city || 'Dhaka Metro'}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatBnNum(elec.experienceYears)} {t('yearsExp')}
                      </span>
                    </div>

                    {/* Specialty Pill */}
                    <div className="mt-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20 truncate max-w-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="truncate">{language === 'bn' ? specialty.bn : specialty.en}</span>
                      </span>
                    </div>
                  </div>

                  {/* Social Proof & Metrics Strip */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 my-2.5">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={elec.ratingAverage} showText={false} />
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {formatBnNum(elec.ratingAverage?.toFixed(1) || '5.0')}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {formatBnNum(elec.reviewCount || 1)} {t('reviews')}
                    </span>
                  </div>

                  {/* Pro Bio Snippet */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2.5 min-h-[32px]">
                    {elec.bio}
                  </p>

                  {/* Skills Badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {elec.skills?.slice(0, 2).map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium border border-slate-200/50 dark:border-slate-700/50"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dual Action CTAs */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <Link
                    to={`/electricians/${elec.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-glow-volt transition-all group/btn"
                  >
                    <span>{t('bookDirect')}</span>
                    <ArrowRight className="w-3 h-3 text-slate-950 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    to={`/electricians/${elec.id}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-all shrink-0"
                    title={language === 'bn' ? 'প্রোফাইল দেখুন' : 'View Profile'}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. COMPACT & UNIQUE CONNECTED HOW IT WORKS WORKFLOW */}
      <section id="how-it-works" className="relative py-14 sm:py-16 px-4 sm:px-6 lg:px-10 bg-slate-100/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800/80 transition-colors w-full overflow-hidden">
        {/* Soft Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-black tracking-wide mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'bn' ? 'সহজ ও নিরাপদ ৩টি ধাপ' : 'Effortless 3-Step Process'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
              {t('howItWorksSub')}
            </p>
          </div>

          {/* Desktop Interconnected Glowing Circuit Pipeline */}
          <div className="hidden lg:flex items-center justify-between max-w-4xl mx-auto mb-7 relative px-6">
            {/* Glowing power circuit line connecting all nodes */}
            <div className="absolute top-1/2 left-12 right-12 -translate-y-1/2 h-0.5 bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-500 opacity-40 dark:opacity-60" />

            {/* Step 1 Circuit Node */}
            <div className="relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-cyan-500/40 shadow-sm text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>01 • {language === 'bn' ? 'ম্যাপে রেডার' : 'Map Radar'}</span>
            </div>

            {/* Step 2 Circuit Node */}
            <div className="relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-amber-500/40 shadow-sm text-xs font-bold text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>02 • {language === 'bn' ? 'স্বচ্ছ প্রাইস লক' : 'Price Protection'}</span>
            </div>

            {/* Step 3 Circuit Node */}
            <div className="relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-sm text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>03 • {language === 'bn' ? 'লাইভ ডিসপ্যাচ' : 'Live Tracking'}</span>
            </div>
          </div>

          {/* 3 Compact High-Tech Workflow Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
            {/* STEP 01: Interactive Map Radar */}
            <div className="group relative rounded-2xl bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-cyan-500/60 dark:hover:border-cyan-400/50 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col justify-between overflow-hidden">
              <div>
                {/* Header: Icon + Step Pill */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 tracking-wider">
                    01 / STEP
                  </span>
                </div>

                <h3 className="text-base font-extrabold font-heading text-slate-900 dark:text-white mb-1.5 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                  {t('step1Title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {t('step1Desc')}
                </p>

                {/* Unique Micro-Telemetry Pill Widget: Live GPS Radar */}
                <div className="p-2.5 rounded-xl bg-slate-950 text-white border border-cyan-500/25 shadow-inner flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 truncate">
                    <div className="relative shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-white truncate">
                        {language === 'bn' ? 'ধানমন্ডি, ঢাকা ১২০৯' : 'Dhanmondi, Dhaka'}
                      </div>
                      <div className="text-[9px] text-cyan-400 font-medium">
                        {language === 'bn' ? '৮ জন মিস্ত্রি সক্রিয়' : '8 Pros within 5km'}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-black shrink-0">
                    {language === 'bn' ? '~১৫ মিনিট' : '~15m ETA'}
                  </span>
                </div>
              </div>

              {/* Action Link */}
              <Link
                to="/search"
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-cyan-500 text-slate-800 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-cyan-400 dark:hover:text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs group/btn"
              >
                <span>{language === 'bn' ? 'ম্যাপে লাইভ সার্চ করুন' : 'Explore Interactive Map'}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* STEP 02: Transparent Price Protection */}
            <div className="group relative rounded-2xl bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-amber-500/60 dark:hover:border-amber-400/50 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col justify-between overflow-hidden">
              <div>
                {/* Header: Icon + Step Pill */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 tracking-wider">
                    02 / STEP
                  </span>
                </div>

                <h3 className="text-base font-extrabold font-heading text-slate-900 dark:text-white mb-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {t('step2Title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {t('step2Desc')}
                </p>

                {/* Unique Micro-Telemetry Pill Widget: Itemized Price Lock */}
                <div className="p-2.5 rounded-xl bg-slate-950 text-white border border-amber-500/25 shadow-inner flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 truncate">
                    <div className="relative shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-white truncate">
                        {language === 'bn' ? 'অর্ডার #VF-৮৯২১ • ৳৩৫০+' : 'Order #VF-8921 • ৳350+'}
                      </div>
                      <div className="text-[9px] text-emerald-400 font-medium">
                        {language === 'bn' ? '০ হিডেন চার্জ • ফিক্সড রেট' : '৳0 Hidden Fees • Locked'}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black shrink-0">
                    {language === 'bn' ? 'গ্যারান্টিযুক্ত' : 'Protected'}
                  </span>
                </div>
              </div>

              {/* Action Link */}
              <Link
                to="/search"
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs group/btn"
              >
                <span>{language === 'bn' ? 'স্বচ্ছ মূল্য তালিকা দেখুন' : 'View Itemized Pricing'}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* STEP 03: Live Tracking & Instant Communication */}
            <div className="group relative rounded-2xl bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/60 dark:hover:border-emerald-400/50 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col justify-between overflow-hidden">
              <div>
                {/* Header: Icon + Step Pill */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 tracking-wider">
                    03 / STEP
                  </span>
                </div>

                <h3 className="text-base font-extrabold font-heading text-slate-900 dark:text-white mb-1.5 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                  {t('step3Title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {t('step3Desc')}
                </p>

                {/* Unique Micro-Telemetry Pill Widget: En-Route Status */}
                <div className="p-2.5 rounded-xl bg-slate-950 text-white border border-emerald-500/25 shadow-inner flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 truncate">
                    <div className="relative shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-white truncate">
                        {language === 'bn' ? 'মোটরবাইক পথে রয়েছে' : 'En-Route on Motorbike'}
                      </div>
                      <div className="text-[9px] text-cyan-400 font-medium">
                        {language === 'bn' ? '৭৫% পথ সম্পন্ন' : '75% Dispatched • Live'}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black shrink-0">
                    {language === 'bn' ? '১২ মিনিটে' : 'ETA: 12m'}
                  </span>
                </div>
              </div>

              {/* Action Link */}
              <Link
                to="/search?emergencyOnly=true"
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-600 text-slate-800 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-600 dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs group/btn"
              >
                <span>{language === 'bn' ? 'জরুরি ডিসপ্যাচ ট্র্যাকার' : 'Emergency Dispatch Live'}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Bottom Conversion Strip: Ready to Book Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 dark:border-amber-400/25 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-850 border border-amber-500/40 flex items-center justify-center shadow-glow-volt shrink-0">
                <Zap className="w-7 h-7 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {language === 'bn' ? 'বাসা বা অফিসে জরুরি ইলেকট্রিক সমস্যা?' : 'Need safe, certified electrical repairs right now?'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                  {language === 'bn'
                    ? '১০০% ব্যাকগ্রাউন্ড-যাচাইকৃত লোকাল ইলেকট্রিশিয়ান মাত্র ৩০-৪৫ মিনিটে আপনার দরজায়।'
                    : '100% background-checked master electricians ready for dispatch in 30-45 minutes.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/search"
                className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-glow-volt transition-all"
              >
                <span>{language === 'bn' ? 'ইলেক্ট্রিশিয়ান খুঁজুন' : 'Find Electricians Now'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
