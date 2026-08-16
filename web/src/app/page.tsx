'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useLanguage } from '@/lib/i18n';
import {
  CalendarCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Star,
  Users,
  MessageSquare,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  vehicleName: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function HomePage() {
  const { t, getServiceName, getServiceDesc, formatPrice } = useLanguage();
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { data: services, isLoading: isLoadingServices } = useQuery<ServiceItem[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data;
    },
  });

  const { data: publicReviews } = useQuery<ReviewItem[]>({
    queryKey: ['public-reviews'],
    queryFn: async () => {
      const res = await api.get('/reviews');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const defaultTestimonials = [
    {
      id: 'demo-1',
      rating: 5,
      comment: t.testi1Comment,
      user: { name: t.testi1User },
      vehicleName: t.testi1Vehicle,
    },
    {
      id: 'demo-2',
      rating: 5,
      comment: t.testi2Comment,
      user: { name: t.testi2User },
      vehicleName: t.testi2Vehicle,
    },
    {
      id: 'demo-3',
      rating: 5,
      comment: t.testi3Comment,
      user: { name: t.testi3User },
      vehicleName: t.testi3Vehicle,
    },
  ];

  const allReviews =
    publicReviews && publicReviews.length > 0
      ? [...publicReviews, ...defaultTestimonials]
      : defaultTestimonials;

  const displayedReviews = showAllReviews ? allReviews : allReviews.slice(0, 6);

  return (
    <div className="space-y-20 pb-16">
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            {t.heroBadge}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            {t.heroTitle1} <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              {t.heroTitle2}
            </span>
          </h1>

          <p className="mt-6 text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/booking"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <CalendarCheck className="w-5 h-5" />
              {t.heroCtaBooking}
            </Link>
            <a
              href="#services"
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-slate-200 hover:text-white font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {t.heroCtaServices}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">5.000+</p>
              <p className="text-xs text-slate-400 mt-1">{t.heroMetricServiced}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">99.4%</p>
              <p className="text-xs text-slate-400 mt-1">{t.heroMetricSatisfaction}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-sky-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">{t.heroMetricGenuine}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">0 {t.servicesDurationMinutes}</p>
              <p className="text-xs text-slate-400 mt-1">{t.heroMetricWastedTime}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">{t.whyTitle}</h2>
          <p className="text-slate-400 text-sm mt-2">{t.whySubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t.whyFeature1Title}</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              {t.whyFeature1Desc}
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t.whyFeature2Title}</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              {t.whyFeature2Desc}
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t.whyFeature3Title}</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              {t.whyFeature3Desc}
            </p>
          </div>
        </div>
      </section>

      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{t.servicesTitle}</h2>
            <p className="text-slate-400 text-sm mt-1">{t.servicesSubtitle}</p>
          </div>
          <Link
            href="/booking"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            {t.servicesBookNow} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingServices ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-48 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service) => (
              <div
                key={service.id}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-blue-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{service.durationMinutes} {t.servicesDurationMinutes}
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatPrice(service.price)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {getServiceName(service.name)}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    {getServiceDesc(service.name, service.description)}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    {t.servicesWarranty}
                  </span>
                  <Link
                    href={`/booking?serviceId=${service.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    {t.servicesSelectSlot}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{t.testimonialsTitle}</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">{t.testimonialsSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReviews.map((rev) => (
              <div key={rev.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-800 hover:border-amber-500/30 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-3">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'fill-current text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {rev.rating}.0 / 5
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{rev.user?.name || 'Pelanggan Bengkel'}</span>
                  <span className="text-slate-500 text-[11px] font-medium">{rev.vehicleName}</span>
                </div>
              </div>
            ))}
          </div>

          {allReviews.length > 6 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
              >
                {showAllReviews ? 'Tampilkan Lebih Sedikit' : `Lihat Semua (${allReviews.length}) Ulasan Pelanggan`}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
