import { useState, useEffect } from 'react';
import {
  apiGetApplications, apiAddApplication,
  apiUpdateApplicationStatus,
  apiGetUsers, apiRegisterUser, apiUpdateUser, apiDeleteUser
} from './lib/api';
import { ServiceApplication, ServiceStatus, DAFTAR_PELAYANAN, ServiceType, UserAccount } from './types';
import Header from './components/Header';
import HistoryList from './components/HistoryList';
import ServiceForm from './components/ServiceForm';
import AdminPortal from './components/AdminPortal';
import ApplicationDetails from './components/ApplicationDetails';
import ServiceCatalogBox from './components/ServiceCatalogBox';
import AuthContainer from './components/AuthContainer';
import {
  Building2, Landmark, Users, CheckCircle, Shield,
  Award, Globe, ArrowRight, BookOpen, Clock, HeartHandshake, PhoneCall,
  FileText
} from 'lucide-react';

export default function App() {
  const [applications, setApplications] = useState<ServiceApplication[]>([]);

  // User Accounts persistency
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<UserAccount | null>(null);
  const [authTabIntent, setAuthTabIntent] = useState<'login' | 'register'>('login');

  // Dashboard routing tabs: 'landing' | 'dashboard' | 'form' | 'details' | 'admin'
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [userRole, setUserRole] = useState<'warga' | 'petugas'>('warga');

  const [activeApp, setActiveApp] = useState<ServiceApplication | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [initialServiceType, setInitialServiceType] = useState<ServiceType | undefined>(undefined);

  // Load from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        const apps = await apiGetApplications();
        setApplications(apps);
        const users = await apiGetUsers();
        setRegisteredUsers(users);
      } catch (error) {
        console.error("Error loading data from API:", error);
      }
    }
    loadData();

    const savedTab = localStorage.getItem('sim_trajeng_current_tab');
    if (savedTab) {
      setCurrentTab(savedTab);
    }

    const savedAuthTabIntent = localStorage.getItem('sim_trajeng_auth_tab_intent') as 'login' | 'register';
    if (savedAuthTabIntent) {
      setAuthTabIntent(savedAuthTabIntent);
    }

    const savedUser = localStorage.getItem('sim_trajeng_logged_in_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setLoggedInUser(parsed);
        if (parsed.role === 'admin') {
          setUserRole('petugas');
        } else {
          setUserRole('warga');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save changes to local storage to persist state on reload
  useEffect(() => {
    localStorage.setItem('sim_trajeng_current_tab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    localStorage.setItem('sim_trajeng_auth_tab_intent', authTabIntent);
  }, [authTabIntent]);

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('sim_trajeng_logged_in_user', JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem('sim_trajeng_logged_in_user');
    }
  }, [loggedInUser]);

  // Synchronize resident profile once citizens log in so forms prefill automatically
  useEffect(() => {
    if (loggedInUser) {
      if (loggedInUser.role === 'admin') {
        if (currentTab !== 'admin' && currentTab !== 'details') {
          setCurrentTab('admin');
        }
      } else if (loggedInUser.role === 'user') {
        if (currentTab !== 'dashboard' && currentTab !== 'form' && currentTab !== 'details') {
          setCurrentTab('dashboard');
        }
      }
    }
  }, [loggedInUser, currentTab]);



  // Show auto-fading success alerts
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };



  const handleAddApplication = async (newApp: ServiceApplication) => {
    try {
      await apiAddApplication(newApp);
      const updatedApps = await apiGetApplications();
      setApplications(updatedApps);
      setCurrentTab('dashboard');
      triggerToast(`Pengajuan ${newApp.jenisPelayanan.toUpperCase()} berhasil dikirim! Silakan pantau status.`);
    } catch (e) {
      console.error(e);
      triggerToast('Gagal mengirim pengajuan');
    }
  };

  const handleUpdateStatus = async (id: string, status: ServiceStatus, comment: string) => {
    try {
      await apiUpdateApplicationStatus(id, status, comment);
      const updatedApps = await apiGetApplications();
      setApplications(updatedApps);
      triggerToast(`Status pengajuan #${id} diproses!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartLayananForm = (type: ServiceType) => {
    setInitialServiceType(type);
    setUserRole('warga');
    setCurrentTab('form');
  };

  // Auth Operations
  const handleLoginSuccess = (user: UserAccount) => {
    setLoggedInUser(user);
    if (user.role === 'admin') {
      setUserRole('petugas');
      setCurrentTab('admin');
    } else {
      setUserRole('warga');
      setCurrentTab('dashboard');
    }
    triggerToast(`Selamat datang kembali, ${user.nama}!`);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setUserRole('warga');
    setCurrentTab('landing');
    triggerToast('Anda telah keluar dari sistem.');
  };

  const handleRegisterUser = async (newUser: UserAccount) => {
    try {
      await apiRegisterUser(newUser);
      const updated = await apiGetUsers();
      setRegisteredUsers(updated);
      triggerToast('Pendaftaran Berhasil! Silakan menunggu verifikasi Admin Kelurahan Trajeng.');
    } catch (e) {
      console.error(e);
      triggerToast('Gagal mendaftar');
    }
  };

  const handleUpdateUser = async (updatedUser: UserAccount) => {
    try {
      await apiUpdateUser(updatedUser);
      const updated = await apiGetUsers();
      setRegisteredUsers(updated);

      // Sync current loggedInUser profile if modified
      if (loggedInUser && loggedInUser.id === updatedUser.id) {
        setLoggedInUser(updatedUser);
      }
      triggerToast(`Akun ${updatedUser.nama} berhasil diperbarui!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (loggedInUser && loggedInUser.id === id) {
      triggerToast('Kesalahan: Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!');
      return;
    }
    try {
      await apiDeleteUser(id);
      const updated = await apiGetUsers();
      setRegisteredUsers(updated);
      triggerToast(`Akun berhasil dihapus dari sistem.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerAuthSection = (tab: 'login' | 'register') => {
    setAuthTabIntent(tab);
    setCurrentTab(tab);
  };

  // Filter applications for logged-in citizen so they can only see their own records,
  // while admin sees everything.
  const citizenApps = loggedInUser && loggedInUser.role === 'user'
    ? applications.filter(app => app.nik === loggedInUser.nik)
    : applications;

  return (
    <div className="bg-gray-50/50 min-h-screen font-sans flex flex-col justify-between text-gray-800" id="main-app-container">

      {/* Official Government Navbar Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        onTriggerAuthSection={handleTriggerAuthSection}
      />

      {/* Success Trigger Toast */}
      {successToast && (
        <div className="fixed bottom-5 right-5 bg-gray-950 border border-gray-800 text-white rounded-xl shadow-xl px-5 py-3.5 flex items-center gap-3 z-50 animate-bounce tracking-wide text-xs font-semibold" id="success-banner-toast">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main viewport Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">

        {/* VIEW 1: HERO LANDING PAGE */}
        {currentTab === 'landing' && (
          <div className="space-y-12 animate-fade-in" id="landing-tab">
            {/* Elegant Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 md:p-10 border border-gray-150 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-1/3 h-full bg-linear-to-bl from-emerald-100/30 to-transparent rounded-tr-3xl shrink-0 pointer-events-none" />

              <div className="lg:col-span-7 text-left space-y-5">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                  <Landmark className="h-3.5 w-3.5" id="hero-badge-icon" />
                  KOTA PASURUAN INTEGRATED PORTAL
                </div>
                <h1 className="text-3xl md:text-4.5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                  Layanan Mandiri Digital <br />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">Kelurahan Trajeng</span>
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xl font-medium">
                  Selamat datang di Portal Sistem Informasi Manajemen Mandiri (SIM) Kelurahan Trajeng Pasuruan. Ajukan surat pengantar kehilangan, domisili kependudukan, tidak mampu, dan izin operasional usaha secara mandiri, lengkap dengan pengisian Surat Pernyataan sah di atas materai.
                </p>

                {/* DYNAMIC WELCOME BANNER FOR LOGGED IN USERS */}
                {loggedInUser && loggedInUser.role !== 'admin' && (
                  <div className="bg-emerald-50/40 border border-emerald-150 p-6 rounded-2xl space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800">Status Sesi Pengguna:</h3>
                      <h4 className="text-lg font-extrabold text-gray-900 leading-tight">Selamat Datang Kembali, {loggedInUser.nama}!</h4>
                      <p className="text-xs text-gray-500">Anda saat ini sedang masuk ke sistem.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {loggedInUser.role === 'admin' ? (
                        <button
                          onClick={() => setCurrentTab('admin')}
                          className="bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold uppercase tracking-wider px-5 py-3 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <Shield className="h-4.5 w-4.5" />
                          Buka Panel Verifikasi Petugas
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setCurrentTab('dashboard')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider px-5 py-3 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                          >
                            <FileText className="h-4.5 w-4.5" />
                            Pantau Berkas Pengajuan Saya
                          </button>
                          <button
                            onClick={() => {
                              const el = document.getElementById('service-selector-box-card');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-white hover:bg-gray-100 border border-gray-250 text-gray-700 font-bold rounded-xl text-xs uppercase tracking-wider px-4 py-3 transition-all cursor-pointer shadow-xs"
                          >
                            Isi Surat Pengantar Baru
                          </button>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition-colors cursor-pointer"
                      >
                        Keluar / Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid illustration card */}
              <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
                <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-emerald-50">
                  <img
                    referrerPolicy="no-referrer"
                    src="/src/assets/images/kantor_kelurahan.jpg"
                    alt="Kantor Kelurahan Trajeng Pasuruan"
                    className="w-full h-44 object-cover object-center filter saturate-75 contrast-105"
                  />
                  <div className="p-5 text-left bg-white leading-normal space-y-2">
                    <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest font-mono">Kantor Kelurahan</h3>
                    <p className="text-xs text-gray-700 leading-normal font-medium">Jl. Kolonel Sugiono No.87, Trajeng, Kecamatan Panggungrejo, Kota Pasuruan.</p>
                    <div className="flex gap-4.5 text-[10.5px] border-t border-gray-100 pt-3 text-gray-500 font-semibold font-mono">
                      <span>Sen - Kam: 08.00 - 15.00</span>
                      <span>Jum: 08.00 - 11.30</span>
                    </div>
                  </div>
                </div>

                {/* Grid 3 photos under the main photo - Requested by user */}
                <div className="grid grid-cols-3 gap-2.5 mt-4 w-full max-w-sm">
                  <div className="rounded-xl overflow-hidden border border-gray-200 h-16 shadow-xs relative group cursor-pointer">
                    <img
                      src="/src/assets/images/pelayanan1.jpg"
                      alt="Aparatur Kelurahan"
                      className="w-full h-full object-cover filter saturate-75 hover:scale-110 transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-gray-190 h-16 shadow-xs relative group cursor-pointer">
                    <img
                      src="/src/assets/images/pelayanan2.jpg"
                      alt="Loket Registrasi"
                      className="w-full h-full object-cover filter saturate-75 hover:scale-110 transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-gray-190 h-16 shadow-xs relative group cursor-pointer">
                    <img
                      src="/src/assets/images/pelayanan3.jpg"
                      alt="Rembuk Warga"
                      className="w-full h-full object-cover filter saturate-75 hover:scale-110 transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </div>



            {/* Service catalog section representing the single requirement box select component */}
            {(!loggedInUser || loggedInUser.role !== 'admin') && (
              <div className="space-y-6" id="service-catalog-section">
                <div className="text-center md:text-left">
                  <h2 className="text-lg font-sans font-bold text-gray-900 uppercase tracking-wider">Katalog Layanan Surat Pengantar</h2>
                  <p className="text-xs text-gray-500 font-medium tracking-wide mt-1 uppercase">LAYANAN MANDIRI RESPONSIP BAGI PENDUDUK TRAJENG</p>
                </div>

                <ServiceCatalogBox
                  onStartService={handleStartLayananForm}
                  isLoggedIn={!!loggedInUser}
                  onRedirectToLogin={() => handleTriggerAuthSection('login')}
                />
              </div>
            )}

          </div>
        )}

        {/* VIEW: LOGIN PAGE */}
        {currentTab === 'login' && !loggedInUser && (
          <div className="max-w-md mx-auto py-12 px-4 animate-fade-in" id="login-page-view">
            <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 md:p-10 space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-emerald-50 rounded-2xl text-emerald-700 mx-auto">
                  <Landmark className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-extrabold font-sans tracking-tight text-gray-900 uppercase">Login &amp; Registrasi</h2>
                <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-wide">
                  Silakan login atau daftar akun guna bermitasi pelayanan mandiri
                </p>
              </div>

              <AuthContainer
                onLoginSuccess={handleLoginSuccess}
                registeredUsers={registeredUsers}
                onRegisterUser={handleRegisterUser}
                tabIntent="login"
                onChangeTabIntent={(newTab) => {
                  setAuthTabIntent(newTab);
                  setCurrentTab(newTab);
                }}
                onCancel={() => setCurrentTab('landing')}
              />
            </div>
          </div>
        )}

        {/* VIEW: REGISTER PAGE */}
        {currentTab === 'register' && !loggedInUser && (
          <div className="max-w-xl mx-auto py-12 px-4 animate-fade-in" id="register-page-view">
            <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 md:p-10 space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-emerald-50 rounded-2xl text-emerald-700 mx-auto">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-extrabold font-sans tracking-tight text-gray-900 uppercase">Login &amp; Registrasi</h2>
                <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-wide">
                  Silakan login atau daftar akun guna bermitasi pelayanan mandiri
                </p>
              </div>

              <AuthContainer
                onLoginSuccess={handleLoginSuccess}
                registeredUsers={registeredUsers}
                onRegisterUser={handleRegisterUser}
                tabIntent="register"
                onChangeTabIntent={(newTab) => {
                  setAuthTabIntent(newTab);
                  setCurrentTab(newTab);
                }}
                onCancel={() => setCurrentTab('landing')}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: RESIDENT HISTORY DASHBOARD */}
        {currentTab === 'dashboard' && loggedInUser && loggedInUser.role === 'user' && (
          <div className="animate-fade-in" id="dashboard-tab">
            <HistoryList
              applications={citizenApps}
              onAddNew={() => setCurrentTab('form')}
              onViewDetails={(app) => {
                setActiveApp(app);
                setCurrentTab('details');
              }}
            />
          </div>
        )}

        {/* VIEW 3: CITIZEN SERVICE APPLICATION FORM */}
        {currentTab === 'form' && loggedInUser && loggedInUser.role === 'user' && (
          <div className="animate-fade-in" id="form-tab">
            <ServiceForm
              loggedInUser={loggedInUser}
              onSubmit={handleAddApplication}
              onCancel={() => {
                setCurrentTab('dashboard');
                setInitialServiceType(undefined);
              }}
              initialServiceType={initialServiceType}
            />
          </div>
        )}

        {/* VIEW 4: CITIZEN DETAILED APPLICATION VIEW (Simulating actual print pdf) */}
        {currentTab === 'details' && (
          <div className="animate-fade-in" id="details-tab">
            {activeApp && (
              <ApplicationDetails
                app={activeApp}
                onClose={() => {
                  if (loggedInUser && loggedInUser.role === 'admin') {
                    setCurrentTab('admin');
                  } else {
                    setCurrentTab('dashboard');
                  }
                }}
              />
            )}
          </div>
        )}

        {/* VIEW 5: OFFICERS REVIEW PORTAL */}
        {currentTab === 'admin' && loggedInUser && loggedInUser.role === 'admin' && (
          <div className="animate-fade-in" id="admin-tab">
            <AdminPortal
              applications={applications}
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={(app) => {
                setActiveApp(app);
                setCurrentTab('details');
              }}
              registeredUsers={registeredUsers}
              onUpdateUser={handleUpdateUser}
              onRegisterUser={async (newUser) => {
                try {
                  await apiRegisterUser(newUser);
                  const updated = await apiGetUsers();
                  setRegisteredUsers(updated);
                  triggerToast(`Akun ${newUser.nama} berhasil ditambahkan!`);
                } catch (e) {
                  console.error(e);
                }
              }}
              onAddApplication={async (newApp) => {
                try {
                  await apiAddApplication(newApp);
                  const updatedApps = await apiGetApplications();
                  setApplications(updatedApps);
                  triggerToast(`Pengajuan #${newApp.id} untuk ${newApp.nama} berhasil dibuat!`);
                } catch (e) {
                  console.error(e);
                }
              }}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        )}

      </main>



      {/* Official Government Footer bar */}
      <footer className="bg-gray-900 border-t border-gray-800 text-gray-500 py-10" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 font-sans">
          <div className="flex justify-center gap-3 text-emerald-500 mb-2">
            <Building2 className="h-5 w-5" />
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-emerald-400">PEMERINTAH KOTA PASURUAN • KELURAHAN TRAJENG</span>
          </div>
          <p className="text-[11px] leading-relaxed max-w-md mx-auto text-gray-400">
            Aplikasi mandiri digital SIM Kelurahan Trajeng Kota Pasuruan. Dibangun khusus mendigitalkan verifikasi dan pengisian surat pernyataan kependudukan dan tertunjuk legalitas.
          </p>
          <div className="text-[10px] text-gray-500 font-mono pt-3 border-t border-gray-850 w-44 mx-auto uppercase font-bold tracking-wider">
            Trajeng SIM © 2026
          </div>
        </div>
      </footer>

    </div>
  );
}
