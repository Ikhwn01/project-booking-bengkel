'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';

export const serviceTranslations: Record<
  string,
  { nameEn: string; descEn: string }
> = {
  'Servis Berkala & Ganti Oli': {
    nameEn: 'Periodic Service & Oil Change',
    descEn:
      '20-point component inspection, engine oil change, air filter cleaning, and chain/CVT adjustment.',
  },
  'Tune Up Injeksi & Carbon Cleaner': {
    nameEn: 'Injection Tune Up & Carbon Cleaner',
    descEn:
      'Throttle body cleaning, combustion chamber carbon cleaning, valve clearance adjustment, and sensor calibration.',
  },
  'Servis Rem & Kaki-Kaki': {
    nameEn: 'Brake & Suspension Service',
    descEn:
      'Front & rear brake pad replacement, brake fluid flush, and wheel bearing inspection.',
  },
  'Pengecekan Kelistrikan & Ganti Aki': {
    nameEn: 'Electrical Check & Battery Replacement',
    descEn:
      'Alternator/stator testing, charging system test, and new battery replacement with a 6-month warranty.',
  },
};

export const specializationTranslations: Record<string, string> = {
  'Mesin & Tune Up Injeksi': 'Engine & Injection Tune Up',
  'Rem & Kaki-kaki': 'Brakes & Suspension',
  'Kelistrikan & ECU': 'Electrical & ECU',
};

export const translations = {
  id: {
    // Navbar
    navHome: 'Beranda',
    navBooking: 'Booking Servis',
    navHistory: 'Riwayat Servis',
    navDashboard: 'Admin Dashboard',
    navLogin: 'Masuk',
    navRegister: 'Daftar',
    navLogout: 'Keluar',

    // Hero Landing Page
    heroBadge: 'Sistem Booking Online Real-Time',
    heroTitle1: 'Servis Kendaraan Lengkap,',
    heroTitle2: 'Tepat Waktu & Bebas Antre',
    heroDesc:
      'Pilih tanggal, jam slot, jenis layanan, dan mekanik secara langsung. Sistem anti double-booking memastikan kendaraan Anda langsung dikerjakan saat tiba.',
    heroCtaBooking: 'Booking Jadwal Servis',
    heroCtaServices: 'Lihat Katalog Layanan',
    heroMetricServiced: 'Servis Selesai',
    heroMetricSatisfaction: 'Kepuasan Pelanggan',
    heroMetricGenuine: 'Suku Cadang Asli',
    heroMetricWastedTime: 'Waktu Wasted Antre',

    // Features Section
    whyTitle: 'Keunggulan Bengkel AutoFix',
    whySubtitle: 'Memberikan pengalaman servis modern dan profesional',
    whyFeature1Title: 'Sistem Slot Presisi',
    whyFeature1Desc:
      'Kapasitas bay dan mekanik dibatasi secara otomatis per jam untuk mencegah ketersediaan ganda dan penumpukan kendaraan.',
    whyFeature2Title: 'Mekanik Berpengalaman',
    whyFeature2Desc:
      'Tim sertifikasi profesional yang siap menangani spesialisasi mesin injeksi, kelistrikan, maupun sistem pengereman.',
    whyFeature3Title: 'Estimasi Biaya Transparan',
    whyFeature3Desc:
      'Semua harga paket servis dapat dilihat secara transparan di awal booking tanpa biaya tersembunyi.',

    // Services Catalog
    servicesTitle: 'Daftar Layanan Servis',
    servicesSubtitle: 'Pilih paket layanan terbaik untuk performa kendaraan Anda',
    servicesBookNow: 'Pesan Layanan Sekarang',
    servicesSelectSlot: 'Pilih Slot',
    servicesWarranty: 'Garansi Servis',
    servicesDurationMinutes: 'Menit',

    // Testimonials
    testimonialsTitle: 'Apa Kata Pelanggan Kami?',
    testimonialsSubtitle: 'Ulasan asli langsung dari pelanggan setelah servis selesai',
    testi1Comment:
      'Sangat terbantu dengan sistem booking ini! Tinggal pesan jam 10 pagi, sampai sana motor langsung ditangani Mas Budi tanpa antri sama sekali.',
    testi1User: 'Bambang S.',
    testi1Vehicle: 'Pemilik Honda Vario',

    testi2Comment:
      'Harganya transparan dari awal, riwayat servis kendaraan tersimpan rapi di akun. Bengkel recommended untuk area Jakarta!',
    testi2User: 'Dian Permata',
    testi2Vehicle: 'Pemilik Toyota Avanza',

    testi3Comment:
      'Fitur pilih mekaniknya oke banget. Saya selalu pilih Mas Agus buat urusan rem dan kaki-kaki, hasilnya mantap!',
    testi3User: 'Reza Fahlevi',
    testi3Vehicle: 'Pemilik NMAX 155',

    // Review Modal & History Buttons
    historyAddReview: 'Beri Ulasan Servis',
    historyYourReview: 'Ulasan Anda:',
    reviewModalTitle: 'Beri Ulasan & Rating Servis',
    reviewModalRatingLabel: 'Rating Kepuasan:',
    reviewModalCommentLabel: 'Ulasan & Pengalaman Servis:',
    reviewModalCommentPlaceholder: 'Tuliskan pengalaman Anda mengenai kecepatan pengerjaan, hasil servis, dan keramahan mekanik...',
    reviewModalSubmit: 'Kirim Ulasan',
    reviewModalSubmitting: 'Mengirim...',
    reviewSuccess: 'Terima kasih! Ulasan Anda telah dikirim dan tampil di beranda.',
    reviewModalCancel: 'Batal',

    // Footer
    footerDesc:
      'Sistem Booking Servis Kendaraan Terpercaya & Transparan. Tanpa antri lama, jaminan mekanik profesional dan estimasi transparan.',
    footerServicesTitle: 'Layanan Kami',
    footerHoursTitle: 'Jam Operasional',
    footerContactTitle: 'Kontak & Lokasi',
    footerHoursMonSat: 'Senin - Sabtu: 08:00 - 17:00 WIB',
    footerHoursSun: 'Minggu: 09:00 - 15:00 WIB',
    footerHoursLimited: 'Slot terbatas per jam!',
    footerService1: 'Servis Berkala & Ganti Oli',
    footerService2: 'Tune Up Injeksi & Carbon Cleaner',
    footerService3: 'Servis Rem & Kaki-kaki',
    footerService4: 'Pengecekan Kelistrikan & Aki',
    footerService5: 'Overhaul Engine',

    // Auth (Login / Register)
    loginWelcome: 'Selamat Datang Kembali',
    loginSubtitle: 'Masuk ke akun AutoFix Express Anda',
    loginEmail: 'Email',
    loginPassword: 'Password',
    loginButton: 'Masuk Sekarang',
    loginProcessing: 'Memproses...',
    loginNoAccount: 'Belum punya akun?',
    loginRegisterHere: 'Daftar disini',
    loginFailMsg: 'Login gagal. Periksa email dan password.',

    regTitle: 'Buat Akun Pelanggan',
    regSubtitle: 'Daftar untuk melakukan booking online',
    regFullName: 'Nama Lengkap',
    regPhone: 'Nomor Handphone / WhatsApp',
    regButton: 'Daftar Sekarang',
    regProcessing: 'Mendaftarkan...',
    regHasAccount: 'Sudah punya akun?',
    regLoginHere: 'Masuk disini',
    regFailMsg: 'Registrasi gagal. Periksa data Anda.',

    // Booking Page
    bookingPageTitle: 'Booking Servis Kendaraan',
    bookingPageSubtitle: 'Pilih kendaraan, layanan, dan jam slot ketersediaan secara real-time.',
    bookingFormHeader: 'Formulir Reservasi',
    bookingStep1: '1. Data Kendaraan',
    bookingUseExisting: 'Pilih Kendaraan Tersimpan',
    bookingInputNew: 'Input Kendaraan Baru',
    bookingBrand: 'Merk (Contoh: Honda)',
    bookingModel: 'Model (Contoh: Vario 160)',
    bookingPlate: 'Plat Nomor',
    bookingStep2: '2. Pilih Jenis Layanan Servis',
    bookingStep3: '3. Tanggal & Preferensi Mekanik',
    bookingSelectDate: 'Pilih Tanggal Servis',
    bookingSelectMechanic: 'Pilih Mekanik (Opsional)',
    bookingMechanicAuto: 'Pilih Mekanik Bebas (Rekomendasi Bengkel)',
    bookingSlotHeader: 'Pilih Jam Slot Ketersediaan (Real-Time)',
    bookingCheckingSlot: 'Memeriksa kuota slot...',
    bookingSlotFull: 'Penuh',
    bookingSlotBayRemains: 'Bay Sisa',
    bookingStep4: '4. Catatan & Ringkasan Booking',
    bookingNotes: 'Catatan Kendaraan / Keluhan (Opsional)',
    bookingNotesPlaceholder: 'Contoh: Tarikan awal terasa berat, rem belakang agak berdecit',
    bookingTotalEst: 'Total Estimasi Biaya',
    bookingPaymentNote: '* Pembayaran dilakukan di bengkel setelah servis selesai dan Anda puas dengan pengerjaan.',
    bookingSubmit: 'Konfirmasi & Kirim Booking',
    bookingSubmitting: 'Mengirim Booking...',
    bookingSuccess: 'Booking berhasil dibuat! Jadwal servis Anda telah terkonfirmasi.',
    bookingFailMsg: 'Gagal membuat booking. Silakan coba lagi.',

    // History Page
    historyTitle: 'Riwayat Servis Kendaraan',
    historySubtitle: 'Pantau status jadwal servis dan riwayat pengerjaan kendaraan Anda.',
    historyEmptyTitle: 'Belum Ada Riwayat Servis',
    historyEmptyDesc: 'Anda belum pernah membuat jadwal booking servis kendaraan di bengkel kami.',
    historyMakeBooking: 'Buat Booking Sekarang',
    historyStatusPending: 'Menunggu Konfirmasi',
    historyStatusConfirmed: 'Dikonfirmasi',
    historyStatusInProgress: 'Sedang Dikerjakan',
    historyStatusDone: 'Selesai',
    historyStatusCancelled: 'Dibatalkan',
    historySchedule: 'Jadwal Servis:',
    historyServicePrice: 'Layanan & Biaya:',
    historyMechanicAssigned: 'Mekanik Bertugas:',
    historyMechanicUnassigned: 'Mekanik akan ditugaskan admin',
    historyNotes: 'Catatan:',
    historyFetchError: 'Gagal memuat riwayat booking. Silakan login kembali.',

    // Dashboard Page
    dashBadge: 'Admin Control Panel',
    dashTitle: 'Dashboard Kelola Booking',
    dashRefresh: 'Refresh Data',
    dashStatRev: 'Estimasi Pendapatan',
    dashStatDone: 'Servis Selesai',
    dashStatPending: 'Menunggu Konfirmasi',
    dashStatProgress: 'Sedang Dikerjakan',
    dashSearchPlaceholder: 'Cari Plat / Nama Pelanggan...',
    dashAllStatus: 'Semua Status',
    dashResetFilter: 'Reset Filter',
    dashThCustomer: 'Pelanggan & Kendaraan',
    dashThSchedule: 'Jadwal & Jam',
    dashThService: 'Layanan & Harga',
    dashThMechanic: 'Mekanik',
    dashThStatus: 'Status',
    dashThActions: 'Aksi',
    dashManageBtn: 'Kelola / Edit',
    dashModalTitle: 'Update Status & Mekanik',
    dashModalSelectMech: 'Tugaskan Mekanik',
    dashModalUnassigned: '-- Belum Pilih Mekanik --',
    dashModalSelectStatus: 'Ubah Status Booking',
    dashModalCancel: 'Batal',
    dashModalSave: 'Simpan Perubahan',
    dashModalSaving: 'Menyimpan...',
    dashCustomerLabel: 'Pelanggan:',
    dashVehicleLabel: 'Kendaraan:',
    dashServiceLabel: 'Layanan:',
    dashLoading: 'Memuat data booking...',
    dashEmptyMatch: 'Tidak ada booking yang sesuai kriteria.',
    dashUnassignedMechanic: 'Belum Ditugaskan',
  },
  en: {
    // Navbar
    navHome: 'Home',
    navBooking: 'Book Service',
    navHistory: 'Service History',
    navDashboard: 'Admin Dashboard',
    navLogin: 'Log In',
    navRegister: 'Register',
    navLogout: 'Log Out',

    // Hero Landing Page
    heroBadge: 'Real-Time Online Booking System',
    heroTitle1: 'Complete Vehicle Service,',
    heroTitle2: 'On Time & Queue-Free',
    heroDesc:
      'Choose your date, time slot, service type, and preferred mechanic directly. Our anti double-booking system guarantees immediate service upon arrival.',
    heroCtaBooking: 'Book Service Schedule',
    heroCtaServices: 'Browse Service Catalog',
    heroMetricServiced: 'Completed Services',
    heroMetricSatisfaction: 'Customer Satisfaction',
    heroMetricGenuine: 'Genuine Parts 100%',
    heroMetricWastedTime: 'Minutes Wasted Queuing',

    // Features Section
    whyTitle: 'Why Choose AutoFix Workshop',
    whySubtitle: 'Delivering a modern, professional, and transparent service experience',
    whyFeature1Title: 'Precision Slot Allocation',
    whyFeature1Desc:
      'Bay capacity and mechanic slots are automatically capped per hour to eliminate double-booking and overcrowding.',
    whyFeature2Title: 'Experienced Mechanics',
    whyFeature2Desc:
      'Certified professionals equipped for engine injection tuning, electrical systems, and brake servicing.',
    whyFeature3Title: 'Transparent Pricing',
    whyFeature3Desc:
      'All package costs are clearly presented upfront during booking with zero hidden charges.',

    // Services Catalog
    servicesTitle: 'Our Service Packages',
    servicesSubtitle: 'Select the optimal maintenance package for your vehicle performance',
    servicesBookNow: 'Book Service Package Now',
    servicesSelectSlot: 'Select Slot',
    servicesWarranty: 'Service Warranty',
    servicesDurationMinutes: 'Mins',

    // Testimonials
    testimonialsTitle: 'What Our Customers Say',
    testimonialsSubtitle: 'Genuine reviews directly submitted by customers after completed services',
    testi1Comment:
      'This booking system saved me so much time! I booked for 10 AM, arrived at the workshop, and Budi started working on my motorcycle immediately with zero wait.',
    testi1User: 'Bambang S.',
    testi1Vehicle: 'Honda Vario Owner',

    testi2Comment:
      'Upfront transparent prices, and all vehicle service history is neatly stored in my account. Highly recommended workshop in Jakarta!',
    testi2User: 'Dian Permata',
    testi2Vehicle: 'Toyota Avanza Owner',

    testi3Comment:
      'The mechanic selection feature is fantastic. I always pick Agus for brake and suspension jobs, outstanding performance!',
    testi3User: 'Reza Fahlevi',
    testi3Vehicle: 'NMAX 155 Owner',

    // Review Modal & History Buttons
    historyAddReview: 'Write Service Review',
    historyYourReview: 'Your Review:',
    reviewModalTitle: 'Write Service Review & Rating',
    reviewModalRatingLabel: 'Satisfaction Rating:',
    reviewModalCommentLabel: 'Review & Service Experience:',
    reviewModalCommentPlaceholder: 'Share your experience regarding service speed, quality, and mechanic friendliness...',
    reviewModalSubmit: 'Submit Review',
    reviewModalSubmitting: 'Submitting...',
    reviewSuccess: 'Thank you! Your review has been submitted and featured on the homepage.',
    reviewModalCancel: 'Cancel',

    // Footer
    footerDesc:
      'Trusted & Transparent Vehicle Service Booking System. Say goodbye to long queues with guaranteed expert mechanics.',
    footerServicesTitle: 'Our Services',
    footerHoursTitle: 'Operating Hours',
    footerContactTitle: 'Contact & Location',
    footerHoursMonSat: 'Monday - Saturday: 08:00 - 17:00 WIB',
    footerHoursSun: 'Sunday: 09:00 - 15:00 WIB',
    footerHoursLimited: 'Limited slots per hour!',
    footerService1: 'Periodic Service & Oil Change',
    footerService2: 'Injection Tune Up & Carbon Cleaner',
    footerService3: 'Brake & Suspension Service',
    footerService4: 'Electrical System & Battery Replacement',
    footerService5: 'Engine Overhaul',

    // Auth (Login / Register)
    loginWelcome: 'Welcome Back',
    loginSubtitle: 'Sign in to your AutoFix Express account',
    loginEmail: 'Email Address',
    loginPassword: 'Password',
    loginButton: 'Sign In Now',
    loginProcessing: 'Authenticating...',
    loginNoAccount: "Don't have an account?",
    loginRegisterHere: 'Register here',
    loginFailMsg: 'Login failed. Please check your email and password.',

    regTitle: 'Create Customer Account',
    regSubtitle: 'Register now to access online booking',
    regFullName: 'Full Name',
    regPhone: 'Phone / WhatsApp Number',
    regButton: 'Register Now',
    regProcessing: 'Creating Account...',
    regHasAccount: 'Already have an account?',
    regLoginHere: 'Log in here',
    regFailMsg: 'Registration failed. Please check your data.',

    // Booking Page
    bookingPageTitle: 'Book Vehicle Service',
    bookingPageSubtitle: 'Select your vehicle, service package, and real-time available time slots.',
    bookingFormHeader: 'Reservation Form',
    bookingStep1: '1. Vehicle Details',
    bookingUseExisting: 'Select Saved Vehicle',
    bookingInputNew: 'Input New Vehicle',
    bookingBrand: 'Brand (e.g. Honda)',
    bookingModel: 'Model (e.g. Vario 160)',
    bookingPlate: 'License Plate',
    bookingStep2: '2. Select Service Package',
    bookingStep3: '3. Date & Mechanic Preference',
    bookingSelectDate: 'Select Service Date',
    bookingSelectMechanic: 'Select Mechanic (Optional)',
    bookingMechanicAuto: 'Any Available Mechanic (Workshop Recommended)',
    bookingSlotHeader: 'Select Real-Time Time Slot',
    bookingCheckingSlot: 'Checking slot quota...',
    bookingSlotFull: 'Full',
    bookingSlotBayRemains: 'Bays Left',
    bookingStep4: '4. Notes & Cost Summary',
    bookingNotes: 'Vehicle Notes / Complaint Details (Optional)',
    bookingNotesPlaceholder: 'Example: Acceleration feels sluggish, rear brake makes squeaking noise',
    bookingTotalEst: 'Total Estimated Cost',
    bookingPaymentNote: '* Payment is settled at the workshop after service completion to your satisfaction.',
    bookingSubmit: 'Confirm & Submit Booking',
    bookingSubmitting: 'Submitting Booking...',
    bookingSuccess: 'Booking created successfully! Your service slot is confirmed.',
    bookingFailMsg: 'Failed to create booking. Please try again.',

    // History Page
    historyTitle: 'Vehicle Service History',
    historySubtitle: 'Track your booking status and view past maintenance history.',
    historyEmptyTitle: 'No Service History Found',
    historyEmptyDesc: 'You have not placed any service bookings yet.',
    historyMakeBooking: 'Make a Booking Now',
    historyStatusPending: 'Pending Confirmation',
    historyStatusConfirmed: 'Confirmed',
    historyStatusInProgress: 'In Progress',
    historyStatusDone: 'Completed',
    historyStatusCancelled: 'Cancelled',
    historySchedule: 'Schedule:',
    historyServicePrice: 'Service & Cost:',
    historyMechanicAssigned: 'Assigned Mechanic:',
    historyMechanicUnassigned: 'Mechanic will be assigned by admin',
    historyNotes: 'Notes:',
    historyFetchError: 'Failed to load booking history. Please sign in again.',

    // Dashboard Page
    dashBadge: 'Admin Control Panel',
    dashTitle: 'Booking Management Dashboard',
    dashRefresh: 'Refresh Data',
    dashStatRev: 'Estimated Revenue',
    dashStatDone: 'Completed Services',
    dashStatPending: 'Pending Confirmation',
    dashStatProgress: 'In Progress',
    dashSearchPlaceholder: 'Search Plate / Customer Name...',
    dashAllStatus: 'All Statuses',
    dashResetFilter: 'Reset Filters',
    dashThCustomer: 'Customer & Vehicle',
    dashThSchedule: 'Schedule & Slot',
    dashThService: 'Service & Price',
    dashThMechanic: 'Mechanic',
    dashThStatus: 'Status',
    dashThActions: 'Actions',
    dashManageBtn: 'Manage / Edit',
    dashModalTitle: 'Update Status & Mechanic Assignment',
    dashModalSelectMech: 'Assign Mechanic',
    dashModalUnassigned: '-- No Mechanic Selected --',
    dashModalSelectStatus: 'Change Booking Status',
    dashModalCancel: 'Cancel',
    dashModalSave: 'Save Changes',
    dashModalSaving: 'Saving...',
    dashCustomerLabel: 'Customer:',
    dashVehicleLabel: 'Vehicle:',
    dashServiceLabel: 'Service:',
    dashLoading: 'Loading booking data...',
    dashEmptyMatch: 'No bookings match your filter criteria.',
    dashUnassignedMechanic: 'Unassigned',
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.id;
  getServiceName: (name: string) => string;
  getServiceDesc: (name: string, defaultDesc: string) => string;
  getSpecialization: (spec: string) => string;
  formatPrice: (priceInIdr: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('id');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang === 'id' || savedLang === 'en') {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = translations[lang];

  const getServiceName = (name: string) => {
    if (lang === 'en' && serviceTranslations[name]) {
      return serviceTranslations[name].nameEn;
    }
    return name;
  };

  const getServiceDesc = (name: string, defaultDesc: string) => {
    if (lang === 'en' && serviceTranslations[name]) {
      return serviceTranslations[name].descEn;
    }
    return defaultDesc;
  };

  const getSpecialization = (spec: string) => {
    if (lang === 'en' && specializationTranslations[spec]) {
      return specializationTranslations[spec];
    }
    return spec;
  };

  const formatPrice = (priceInIdr: number) => {
    if (lang === 'en') {
      const usd = priceInIdr / 15000;
      return `$${usd.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `Rp ${priceInIdr.toLocaleString('id-ID')}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        getServiceName,
        getServiceDesc,
        getSpecialization,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
