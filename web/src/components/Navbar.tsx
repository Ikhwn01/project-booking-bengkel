'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Wrench, LogOut, Calendar, ShieldCheck, History, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const updateAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    updateAuth();
    window.addEventListener('storage', updateAuth);
    return () => window.removeEventListener('storage', updateAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white group">
          <div className="p-2 rounded-xl bg-blue-600 group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span>Auto<span className="text-blue-500">Fix</span> Express</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-slate-300 hover:text-white transition-colors">
            {t.navHome}
          </Link>
          <Link href="/booking" className="text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {t.navBooking}
          </Link>
          {user && (
            <Link href="/riwayat" className="text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <History className="w-4 h-4" />
              {t.navHistory}
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              href="/dashboard"
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <ShieldCheck className="w-4 h-4" />
              {t.navDashboard}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* LANGUAGE SWITCHER BUTTON */}
          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs font-semibold text-slate-300">
            <button
              onClick={() => setLang('id')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                lang === 'id' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
              }`}
            >
              🇮🇩 ID
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                lang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-blue-400 font-medium uppercase tracking-wider">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                title={t.navLogout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors"
              >
                {t.navLogin}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/20 transition-all"
              >
                {t.navRegister}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
