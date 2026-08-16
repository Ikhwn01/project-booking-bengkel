'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import { useLanguage } from '@/lib/i18n';
import {
  Calendar,
  Clock,
  Car,
  Wrench,
  UserCheck,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const bookingSchema = z.object({
  vehicleId: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  plateNumber: z.string().optional(),
  serviceId: z.string().min(1, 'Layanan servis harus dipilih'),
  mechanicId: z.string().optional(),
  date: z.string().min(1, 'Tanggal servis harus dipilih'),
  timeSlot: z.string().min(1, 'Jam slot harus dipilih'),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
}

interface MechanicItem {
  id: string;
  name: string;
  specialization: string;
  isAvailable: boolean;
}

interface VehicleItem {
  id: string;
  brand: string;
  model: string;
  plateNumber: string;
}

interface SlotAvailability {
  timeSlot: string;
  bookedCount: number;
  maxCapacity: number;
  isAvailable: boolean;
  isMechanicBooked: boolean;
}

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId') || '';
  const { t, getServiceName, getSpecialization, formatPrice } = useLanguage();

  const [useNewVehicle, setUseNewVehicle] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: todayStr,
      serviceId: preselectedServiceId,
      timeSlot: '',
    },
  });

  const selectedDate = watch('date');
  const selectedMechanicId = watch('mechanicId');
  const selectedServiceId = watch('serviceId');
  const selectedTimeSlot = watch('timeSlot');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const { data: services } = useQuery<ServiceItem[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data;
    },
  });

  const { data: mechanics } = useQuery<MechanicItem[]>({
    queryKey: ['mechanics'],
    queryFn: async () => {
      const res = await api.get('/mechanics/available');
      return res.data;
    },
  });

  const { data: vehicles } = useQuery<VehicleItem[]>({
    queryKey: ['my-vehicles'],
    queryFn: async () => {
      const res = await api.get('/vehicles');
      return res.data;
    },
  });

  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !useNewVehicle) {
      setValue('vehicleId', vehicles[0].id);
    } else if (vehicles && vehicles.length === 0) {
      setUseNewVehicle(true);
    }
  }, [vehicles, useNewVehicle, setValue]);

  const { data: slotData, isLoading: isLoadingSlots } = useQuery<{
    date: string;
    slots: SlotAvailability[];
  }>({
    queryKey: ['slot-availability', selectedDate, selectedMechanicId],
    queryFn: async () => {
      if (!selectedDate) return { date: '', slots: [] };
      const res = await api.get('/bookings/check-availability', {
        params: {
          date: selectedDate,
          mechanicId: selectedMechanicId || undefined,
        },
      });
      return res.data;
    },
    enabled: Boolean(selectedDate),
  });

  const selectedService = services?.find((s) => s.id === selectedServiceId);

  const onSubmit = async (values: BookingFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/bookings', values);
      setSuccessMsg(t.bookingSuccess);
      setTimeout(() => {
        router.push('/riwayat');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.bookingFailMsg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider border border-blue-500/20">
          {t.bookingFormHeader}
        </span>
        <h1 className="text-3xl font-extrabold text-white">{t.bookingPageTitle}</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          {t.bookingPageSubtitle}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-400" />
              {t.bookingStep1}
            </h2>
            {vehicles && vehicles.length > 0 && (
              <button
                type="button"
                onClick={() => setUseNewVehicle(!useNewVehicle)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {useNewVehicle ? t.bookingUseExisting : t.bookingInputNew}
              </button>
            )}
          </div>

          {!useNewVehicle && vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicles.map((v) => {
                const isSelected = watch('vehicleId') === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setValue('vehicleId', v.id);
                      setValue('brand', '');
                      setValue('model', '');
                      setValue('plateNumber', '');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{v.brand} {v.model}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-blue-400">
                        {v.plateNumber}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.bookingBrand}</label>
                <input
                  type="text"
                  placeholder="Honda / Toyota / Yamaha"
                  {...register('brand')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.bookingModel}</label>
                <input
                  type="text"
                  placeholder="Vario / Avanza / NMax"
                  {...register('model')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.bookingPlate}</label>
                <input
                  type="text"
                  placeholder="B 1234 ABC"
                  {...register('plateNumber')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            {t.bookingStep2}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services?.map((s) => {
              const isSelected = selectedServiceId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setValue('serviceId', s.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm">{getServiceName(s.name)}</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {formatPrice(s.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                    <Clock className="w-3 h-3 text-blue-400" />
                    ~{s.durationMinutes} {t.servicesDurationMinutes}
                  </div>
                </div>
              );
            })}
          </div>
          {errors.serviceId && (
            <p className="text-red-400 text-xs">{errors.serviceId.message}</p>
          )}
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            {t.bookingStep3}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.bookingSelectDate}</label>
              <input
                type="date"
                min={todayStr}
                {...register('date')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              />
              {errors.date && (
                <p className="text-red-400 text-[11px] mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.bookingSelectMechanic}
              </label>
              <select
                {...register('mechanicId')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">{t.bookingMechanicAuto}</option>
                {mechanics?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({getSpecialization(m.specialization)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-slate-300">
                {t.bookingSlotHeader}
              </label>
              {isLoadingSlots && (
                <span className="text-[11px] text-blue-400 animate-pulse">{t.bookingCheckingSlot}</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {slotData?.slots.map((slot) => {
                const isSelected = selectedTimeSlot === slot.timeSlot;
                const isDisabled = !slot.isAvailable;

                return (
                  <button
                    key={slot.timeSlot}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setValue('timeSlot', slot.timeSlot)}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                        : isDisabled
                        ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed line-through'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-blue-500/50 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-sm">{slot.timeSlot} WIB</span>
                    <span className="text-[10px] mt-0.5">
                      {isDisabled
                        ? t.bookingSlotFull
                        : `${slot.maxCapacity - slot.bookedCount} ${t.bookingSlotBayRemains}`}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.timeSlot && (
              <p className="text-red-400 text-xs mt-2">{errors.timeSlot.message}</p>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            {t.bookingStep4}
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.bookingNotes}
            </label>
            <textarea
              rows={3}
              placeholder={t.bookingNotesPlaceholder}
              {...register('notes')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {selectedService && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-slate-300 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-white">
                <span>{t.bookingTotalEst} ({getServiceName(selectedService.name)})</span>
                <span className="text-base font-bold text-emerald-400">
                  {formatPrice(selectedService.price)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {t.bookingPaymentNote}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? t.bookingSubmitting : t.bookingSubmit}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400 py-20 text-sm">Loading booking form...</div>}>
      <BookingForm />
    </Suspense>
  );
}
