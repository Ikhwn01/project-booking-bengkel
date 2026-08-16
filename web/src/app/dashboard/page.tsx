'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useLanguage } from '@/lib/i18n';
import {
  ShieldCheck,
  Clock,
  Car,
  Search,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface BookingItem {
  id: string;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  notes?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  vehicle?: {
    brand?: string;
    model?: string;
    plateNumber?: string;
  };
  service?: {
    name?: string;
    price?: number;
    durationMinutes?: number;
  };
  mechanic?: {
    id: string;
    name: string;
    specialization: string;
  };
}

interface MechanicItem {
  id: string;
  name: string;
  specialization: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { lang, t, getServiceName, getSpecialization, formatPrice } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [assignedMechanicId, setAssignedMechanicId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'ADMIN' && user.role !== 'MECHANIC') {
        router.push('/booking');
      }
    } catch {
      router.push('/login');
    }
  }, [router]);

  const { data: bookings, isLoading, refetch } = useQuery<BookingItem[]>({
    queryKey: ['admin-bookings', selectedDate, selectedStatus],
    queryFn: async () => {
      const res = await api.get('/bookings', {
        params: {
          date: selectedDate || undefined,
          status: selectedStatus || undefined,
        },
      });
      return res.data;
    },
  });

  const { data: stats } = useQuery<{
    totalRevenue: number;
    totalCompleted: number;
    pendingCount: number;
    inProgressCount: number;
  }>({
    queryKey: ['revenue-stats'],
    queryFn: async () => {
      const res = await api.get('/bookings/stats/revenue');
      return res.data;
    },
  });

  const { data: mechanics } = useQuery<MechanicItem[]>({
    queryKey: ['all-mechanics'],
    queryFn: async () => {
      const res = await api.get('/mechanics');
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, mechanicId }: { id: string; status: string; mechanicId?: string }) => {
      setModalError(null);
      return api.patch(`/bookings/${id}/status`, {
        status,
        mechanicId: mechanicId || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-stats'] });
      setEditingBooking(null);
    },
    onError: (err: any) => {
      setModalError(err.response?.data?.message || 'Gagal memperbarui status. Periksa koneksi API.');
    },
  });

  const filteredBookings = bookings?.filter((b) => {
    const userName = b.user?.name || 'Customer';
    const plate = b.vehicle?.plateNumber || '';
    const brand = b.vehicle?.brand || '';
    const matchesSearch =
      plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const openEditModal = (booking: BookingItem) => {
    setModalError(null);
    setEditingBooking(booking);
    setNewStatus(booking.status);
    setAssignedMechanicId(booking.mechanic?.id || '');
  };

  const handleSaveStatus = () => {
    if (!editingBooking) return;
    updateMutation.mutate({
      id: editingBooking.id,
      status: newStatus,
      mechanicId: assignedMechanicId,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            {t.dashBadge}
          </div>
          <h1 className="text-3xl font-extrabold text-white">{t.dashTitle}</h1>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          {t.dashRefresh}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{t.dashStatRev}</p>
            <h3 className="text-xl font-bold text-emerald-400 mt-1">
              {formatPrice(stats?.totalRevenue || 0)}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{t.dashStatDone}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats?.totalCompleted || 0}</h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{t.dashStatPending}</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{stats?.pendingCount || 0}</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{t.dashStatProgress}</p>
            <h3 className="text-2xl font-bold text-indigo-400 mt-1">{stats?.inProgressCount || 0}</h3>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.dashSearchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
          />

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="">{t.dashAllStatus}</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {(selectedDate || selectedStatus || searchTerm) && (
            <button
              onClick={() => {
                setSelectedDate('');
                setSelectedStatus('');
                setSearchTerm('');
              }}
              className="text-xs text-red-400 hover:underline px-2 py-1 font-medium"
            >
              {t.dashResetFilter}
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">{t.dashThCustomer}</th>
                <th className="px-6 py-4">{t.dashThSchedule}</th>
                <th className="px-6 py-4">{t.dashThService}</th>
                <th className="px-6 py-4">{t.dashThMechanic}</th>
                <th className="px-6 py-4">{t.dashThStatus}</th>
                <th className="px-6 py-4 text-right">{t.dashThActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {t.dashLoading}
                  </td>
                </tr>
              ) : filteredBookings?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {t.dashEmptyMatch}
                  </td>
                </tr>
              ) : (
                filteredBookings?.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{b.user?.name || 'Customer'}</div>
                      <div className="text-slate-400 text-[11px]">{b.user?.phone || '-'}</div>
                      <div className="inline-flex items-center gap-1 mt-1 text-[11px] text-blue-400 font-mono">
                        <Car className="w-3 h-3" />
                        {b.vehicle?.brand || ''} {b.vehicle?.model || ''} ({b.vehicle?.plateNumber || 'N/A'})
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {new Date(b.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-blue-400 font-bold mt-0.5">{b.timeSlot} WIB</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{getServiceName(b.service?.name || '')}</div>
                      <div className="text-emerald-400 font-bold">
                        {formatPrice(b.service?.price || 0)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {b.mechanic ? (
                        <div className="text-slate-200 font-medium">{b.mechanic.name}</div>
                      ) : (
                        <span className="text-slate-500 italic">{t.dashUnassignedMechanic}</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          b.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : b.status === 'CONFIRMED'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : b.status === 'IN_PROGRESS'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : b.status === 'DONE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(b)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-medium transition-all"
                      >
                        {t.dashManageBtn}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">{t.dashModalTitle}</h3>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="text-xs space-y-1 text-slate-300">
              <p>
                <strong className="text-white">{t.dashCustomerLabel}</strong> {editingBooking.user?.name || 'Customer'} ({editingBooking.user?.phone || '-'})
              </p>
              <p>
                <strong className="text-white">{t.dashVehicleLabel}</strong> {editingBooking.vehicle?.brand} {editingBooking.vehicle?.model} - {editingBooking.vehicle?.plateNumber}
              </p>
              <p>
                <strong className="text-white">{t.dashServiceLabel}</strong> {getServiceName(editingBooking.service?.name || '')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.dashModalSelectMech}
              </label>
              <select
                value={assignedMechanicId}
                onChange={(e) => setAssignedMechanicId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">{t.dashModalUnassigned}</option>
                {mechanics?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({getSpecialization(m.specialization)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.dashModalSelectStatus}
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {t.dashModalCancel}
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={updateMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.dashModalSaving}</span>
                  </>
                ) : (
                  t.dashModalSave
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
