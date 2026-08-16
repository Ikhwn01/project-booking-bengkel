'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useLanguage } from '@/lib/i18n';
import {
  History,
  Calendar,
  Clock,
  Car,
  Wrench,
  UserCheck,
  AlertCircle,
  Star,
  MessageSquarePlus,
  XCircle,
  CheckCircle,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface BookingItem {
  id: string;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  vehicle: {
    brand: string;
    model: string;
    plateNumber: string;
  };
  service: {
    name: string;
    price: number;
    durationMinutes: number;
  };
  mechanic?: {
    name: string;
    specialization: string;
  };
  review?: ReviewItem;
}

export default function HistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { lang, t, getServiceName, getSpecialization, formatPrice } = useLanguage();

  const [reviewBooking, setReviewBooking] = useState<BookingItem | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const { data: bookings, isLoading, isError } = useQuery<BookingItem[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my-bookings');
      return res.data;
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment: string }) => {
      const res = await api.post('/reviews', { bookingId, rating, comment });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] });
      setSuccessMsg(t.reviewSuccess);
      setTimeout(() => {
        setReviewBooking(null);
        setSuccessMsg(null);
        setComment('');
      }, 1500);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Gagal mengirim ulasan.');
    },
  });

  const handleOpenReviewModal = (booking: BookingItem) => {
    setReviewBooking(booking);
    setRating(5);
    setComment('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    if (!comment.trim()) {
      setErrorMsg('Harap masukan komentar ulasan Anda');
      return;
    }
    submitReviewMutation.mutate({
      bookingId: reviewBooking.id,
      rating,
      comment,
    });
  };

  const getStatusBadge = (status: BookingItem['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            {t.historyStatusPending}
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            {t.historyStatusConfirmed}
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold animate-pulse">
            {t.historyStatusInProgress}
          </span>
        );
      case 'DONE':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            {t.historyStatusDone}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
            {t.historyStatusCancelled}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <History className="w-7 h-7 text-blue-400" />
            {t.historyTitle}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {t.historySubtitle}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-32 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 glass-card rounded-3xl text-center text-red-400 text-sm flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8" />
          <span>{t.historyFetchError}</span>
        </div>
      ) : bookings && bookings.length === 0 ? (
        <div className="p-12 glass-panel rounded-3xl text-center space-y-4 border border-slate-800">
          <Wrench className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">{t.historyEmptyTitle}</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {t.historyEmptyDesc}
          </p>
          <a
            href="/booking"
            className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            {t.historyMakeBooking}
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings?.map((b) => {
            const formattedDate = new Date(b.date).toLocaleDateString(
              lang === 'en' ? 'en-US' : 'id-ID',
              {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              },
            );

            return (
              <div
                key={b.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {b.vehicle.brand} {b.vehicle.model}
                      </h3>
                      <span className="text-xs text-blue-400 font-mono font-medium">
                        {b.vehicle.plateNumber}
                      </span>
                    </div>
                  </div>
                  <div>{getStatusBadge(b.status)}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 block">{t.historySchedule}</span>
                    <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {formattedDate}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {b.timeSlot} WIB
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">{t.historyServicePrice}</span>
                    <div className="font-semibold text-white">{getServiceName(b.service.name)}</div>
                    <div className="text-emerald-400 font-bold">
                      {formatPrice(b.service.price)} (~{b.service.durationMinutes} {t.servicesDurationMinutes})
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">{t.historyMechanicAssigned}</span>
                    {b.mechanic ? (
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>{b.mechanic.name} ({getSpecialization(b.mechanic.specialization)})</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">{t.historyMechanicUnassigned}</span>
                    )}
                  </div>
                </div>

                {b.notes && (
                  <div className="mt-2 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl">
                    <span className="font-semibold text-slate-300">{t.historyNotes} </span>
                    {b.notes}
                  </div>
                )}

                {/* REVIEW SECTION FOR DONE BOOKINGS */}
                {b.status === 'DONE' && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60">
                    {b.review ? (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {t.historyYourReview} ({b.review.rating}/5 ⭐)
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(b.review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs italic">"{b.review.comment}"</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenReviewModal(b)}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
                      >
                        <MessageSquarePlus className="w-4 h-4" />
                        {t.historyAddReview}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* REVIEW SUBMIT MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-current" />
                {t.reviewModalTitle}
              </h3>
              <button
                onClick={() => setReviewBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="text-xs text-slate-300">
                <p><strong>Servis:</strong> {getServiceName(reviewBooking.service.name)}</p>
                <p><strong>Kendaraan:</strong> {reviewBooking.vehicle.brand} {reviewBooking.vehicle.model} ({reviewBooking.vehicle.plateNumber})</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t.reviewModalRatingLabel}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'fill-current' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.reviewModalCommentLabel}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={t.reviewModalCommentPlaceholder}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  {t.reviewModalCancel}
                </button>
                <button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {submitReviewMutation.isPending ? t.reviewModalSubmitting : t.reviewModalSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
