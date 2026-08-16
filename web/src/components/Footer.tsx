'use client';

import { Wrench, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <div className="p-1.5 rounded-lg bg-blue-600">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            AutoFix Express
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.footerDesc}
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">{t.footerServicesTitle}</h4>
          <ul className="space-y-2 text-xs">
            <li>{t.footerService1}</li>
            <li>{t.footerService2}</li>
            <li>{t.footerService3}</li>
            <li>{t.footerService4}</li>
            <li>{t.footerService5}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">{t.footerHoursTitle}</h4>
          <ul className="space-y-2 text-xs">
            <li>{t.footerHoursMonSat}</li>
            <li>{t.footerHoursSun}</li>
            <li className="text-blue-400 font-medium">{t.footerHoursLimited}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">{t.footerContactTitle}</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Jl. Otomotif Raya No. 88, Jakarta
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" />
              0812-3456-7890
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              info@autofix-express.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} AutoFix Express. All rights reserved.
      </div>
    </footer>
  );
}
