import { useState } from 'react';
import { Shield, User, Landmark, BadgeCheck, LogOut, LogIn, UserPlus, Menu, ChevronDown, ArrowLeft } from 'lucide-react';
import { UserAccount } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  loggedInUser: UserAccount | null;
  onLogout: () => void;
  onTriggerAuthSection: (tab: 'login' | 'register') => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  loggedInUser,
  onLogout,
  onTriggerAuthSection
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40" id="main-header">
      {/* Red & White Ribbon representing Indonesian Government Portal */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 to-red-600 via-white to-gray-200"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Official Logo & Portal Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-md flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors"
                onClick={() => {
                  if (loggedInUser) {
                    if (loggedInUser.role === 'user') {
                      setCurrentTab('dashboard');
                    }
                  } else {
                    setCurrentTab('landing');
                  }
                }}
              >
                <Landmark className="h-6 w-6" id="logo-icon" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span 
                    className="font-sans font-bold text-lg tracking-tight text-gray-900 leading-none cursor-pointer hover:text-emerald-700 transition-colors"
                    onClick={() => {
                      if (loggedInUser) {
                        if (loggedInUser.role === 'user') {
                          setCurrentTab('dashboard');
                        }
                      } else {
                        setCurrentTab('landing');
                      }
                    }}
                  >
                    SIM Kelurahan Trajeng
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5 uppercase tracking-wider">
                    <BadgeCheck className="h-2.5 w-2.5" /> Resmi
                  </span>
                </div>
                <span className="font-sans text-[11px] text-gray-500 font-medium tracking-wide mt-1 uppercase">
                  Kec. Panggungrejo, Kota Pasuruan, Jawa Timur
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Login / Register controls */}
          <div className="flex items-center gap-3">
            {!loggedInUser ? (
              <div className="flex items-center gap-2" id="header-auth-buttons">
                <button
                  id="header-login-btn"
                  onClick={() => onTriggerAuthSection('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Login
                </button>
                <button
                  id="header-register-btn"
                  onClick={() => onTriggerAuthSection('register')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Daftar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4" id="header-logged-in-profile">
                {/* User Role specific label */}
                {loggedInUser.role === 'admin' ? (
                  <div className="flex items-center gap-2.5 pl-3 border-gray-200 font-sans relative">
                    <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-100 flex items-center justify-center font-bold text-sm">
                      A
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="text-xs font-bold text-gray-850">{loggedInUser.nama}</div>
                      <div className="text-[10px] text-indigo-600 uppercase font-bold tracking-widest font-mono">
                        ADMIN / PETUGAS
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3.5 font-sans">
                    <div 
                      className="flex items-center gap-2.5 pl-3 group hover:opacity-80 transition-all"
                    >
                      <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center font-bold text-sm shadow-inner group-hover:bg-emerald-100">
                        {loggedInUser.nama.charAt(0)}
                      </div>
                      <div className="text-left hidden md:block">
                        <div className="text-xs font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                          {loggedInUser.nama}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono tracking-wider">
                          NIK: {loggedInUser.nik.slice(0, 6)}...{loggedInUser.nik.slice(-4)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-center flex items-center justify-center cursor-pointer"
                  title="Keluar / Logout"
                  id="logout-btn"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
