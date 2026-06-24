import React, { useState, useRef, ChangeEvent } from 'react';
import { User, Shield, AlertCircle, CheckCircle, Upload, Eye, EyeOff, KeyRound, UserCheck } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthContainerProps {
  onLoginSuccess: (user: UserAccount) => void;
  registeredUsers: UserAccount[];
  onRegisterUser: (newUser: UserAccount) => void;
  tabIntent: 'login' | 'register';
  onChangeTabIntent: (tab: 'login' | 'register') => void;
  onCancel?: () => void;
}

export default function AuthContainer({
  onLoginSuccess,
  registeredUsers,
  onRegisterUser,
  tabIntent,
  onChangeTabIntent,
  onCancel
}: AuthContainerProps) {
  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form states
  const [regNama, setRegNama] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regKtpName, setRegKtpName] = useState('');
  const [regKtpUrl, setRegKtpUrl] = useState<string>('');
  const [regPasfotoName, setRegPasfotoName] = useState('');
  const [regPasfotoUrl, setRegPasfotoUrl] = useState<string>('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // File Upload input refs
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const pasfotoInputRef = useRef<HTMLInputElement>(null);

  // Read files as base64 URLs so they can be viewed by the admin
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'ktp' | 'pasfoto') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation checks
    const validFormats = type === 'ktp' ? ['image/jpeg', 'image/png', 'application/pdf'] : ['image/jpeg', 'image/png'];
    if (!validFormats.includes(file.type)) {
      const errMsg = type === 'ktp' 
        ? 'Format KTP harus berupa JPEG, PNG, atau PDF.' 
        : 'Format Pasfoto harus berupa JPEG atau PNG.';
      if (type === 'ktp') setRegError(errMsg);
      else setRegError(errMsg);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      const errMsg = 'Ukuran berkas maksimal adalah 2 MB.';
      setRegError(errMsg);
      return;
    }

    setRegError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (type === 'ktp') {
          setRegKtpName(file.name);
          setRegKtpUrl(reader.result);
        } else {
          setRegPasfotoName(file.name);
          setRegPasfotoUrl(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginUsername || !loginPassword) {
      setLoginError('Harap isi semua kolom username dan password.');
      return;
    }

    // Find user in registered users
    const matched = registeredUsers.find(
      u => u.username.toLowerCase() === loginUsername.toLowerCase() && u.password === loginPassword
    );

    if (!matched) {
      setLoginError('Username atau Password yang Anda masukkan tidak terdaftar.');
      return;
    }

    if (matched.status === 'tidak aktif') {
      setLoginError('PENTING: Akun Anda belum diverifikasi. Silakan menunggu proses verifikasi dengan estimasi beberapa menit hingga maksimal 1x24 jam kerja operasional. Jika mendaftar saat kantor tutup, harap menunggu hingga jam buka kembali.');
      return;
    }

    if (matched.status === 'ditolak') {
      setLoginError(`PENTING: Akun Anda telah ditolak atau dihapus oleh Admin Kelurahan. Alasan: ${matched.rejectionReason || 'Dokumen tidak sesuai / tidak lengkap'}. Silakan melakukan registrasi ulang menggunakan dokumen yang benar.`);
      return;
    }

    onLoginSuccess(matched);
  };

  // Registration handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // 1. Check empty fields
    if (!regNama || !regNik || !regUsername || !regPassword || !regConfirmPassword) {
      setRegError('Harap isi semua kolom formulir pendaftaran.');
      return;
    }

    // 2. Validate NIK length (exactly 16 digits)
    if (regNik.length !== 16 || !/^\d+$/.test(regNik)) {
      setRegError('NIK (Nomor Induk Kependudukan) harus diisi tepat 16 digit angka saja (tidak lebih, tidak kurang).');
      return;
    }

    // 3. Keep track of file uploads
    if (!regKtpUrl) {
      setRegError('Anda wajib mengunggah Foto KTP asli untuk kebutuhan verifikasi data.');
      return;
    }

    if (!regPasfotoUrl) {
      setRegError('Anda wajib mengunggah Pasfoto terbaru (Format JPG/PNG) untuk kelengkapan administrasi.');
      return;
    }

    // 4. Validate username match
    const isExistUsername = registeredUsers.some(u => u.username.toLowerCase() === regUsername.toLowerCase());
    if (isExistUsername) {
      setRegError('Username tersebut sudah digunakan orang lain. Gunakan username unik.');
      return;
    }

    // 5. Check if NIK already holds an account
    const isExistNik = registeredUsers.some(u => u.nik === regNik);
    if (isExistNik) {
      setRegError('NIK tersebut telah terdaftar dalam sistem. Silakan login ke akun Anda.');
      return;
    }

    // 6. Test passwords match
    if (regPassword !== regConfirmPassword) {
      setRegError('Ketik ulang kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    // Create account
    const newAccount: UserAccount = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      nama: regNama,
      nik: regNik,
      username: regUsername,
      password: regPassword,
      role: 'user',
      status: 'tidak aktif',
      ktpPhotoUrl: regKtpUrl,
      pasfotoUrl: regPasfotoUrl
    };

    onRegisterUser(newAccount);
    setRegSuccess(true);
    setRegError(null);

    // Clear registration fields
    setRegNama('');
    setRegNik('');
    setRegKtpName('');
    setRegKtpUrl('');
    setRegPasfotoName('');
    setRegPasfotoUrl('');
    setRegUsername('');
    setRegPassword('');
    setRegConfirmPassword('');

    // Switch to login tab in 3 seconds
    setTimeout(() => {
      setRegSuccess(false);
      onChangeTabIntent('login');
      setLoginUsername(newAccount.username);
    }, 2500);
  };

  // Instantly apply demo accounts for easy checking
  const handleQuickFill = (role: 'warga' | 'admin') => {
    if (role === 'warga') {
      setLoginUsername('budi');
      setLoginPassword('budi');
    } else {
      setLoginUsername('admin');
      setLoginPassword('admin');
    }
    setLoginError(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden text-left" id="auth-main-container">
      {/* Tab Switcher Headers */}
      <div className="flex bg-gray-50 border-b border-gray-150">
        <button
          onClick={() => {
            onChangeTabIntent('login');
            setLoginError(null);
          }}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            tabIntent === 'login'
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
              : 'text-gray-400 hover:text-gray-700'
          }`}
          id="auth-tab-login"
        >
          <KeyRound className="h-4 w-4 text-emerald-600" />
          Login
        </button>
        <button
          onClick={() => {
            onChangeTabIntent('register');
            setRegError(null);
          }}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            tabIntent === 'register'
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
              : 'text-gray-400 hover:text-gray-700'
          }`}
          id="auth-tab-register"
        >
          <User className="h-4 w-4 text-emerald-600" />
          Registrasi
        </button>
      </div>

      <div className="p-6 md:p-8">
        {/* VIEW A: LOGIN FORM */}
        {tabIntent === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5" id="login-form">
            <div className="text-left space-y-1">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase">Akses Layanan Mandiri</h3>
              <p className="text-xs text-gray-400">Gunakan akun terdaftar Anda untuk login.</p>
            </div>

            {loginError && (
              <div className="flex gap-2 p-3.5 bg-red-50 border border-red-150 text-red-800 rounded-xl text-xs font-semibold leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider font-mono">Username:</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan username anda"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider font-mono">Password:</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-400">🔑</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi anda"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 text-center flex items-center justify-center gap-1"
                >
                  ◀ Keluar
                </button>
              )}
              <button
                type="submit"
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Masuk
              </button>
            </div>
          </form>
        )}

        {/* VIEW B: REGISTER/REGISTRATION FORM */}
        {tabIntent === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4" id="register-form">
            <div className="text-left space-y-1">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase">Formulir Pendaftaran Akun</h3>
              <p className="text-xs text-gray-400">Daftarkan data diri Anda secara valid dan lengkap.</p>
            </div>

            {regSuccess && (
              <div className="flex gap-2 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold leading-relaxed">
                <CheckCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Pendaftaran Berhasil!</strong>
                  <span>Akun Anda masuk daftar antrean verifikasi Admin. Silakan menunggu proses verifikasi dengan estimasi beberapa menit hingga maksimal 1x24 jam kerja operasional. Jika mendaftar saat kantor tutup, harap menunggu hingga jam buka kembali.</span>
                </div>
              </div>
            )}

            {regError && (
              <div className="flex gap-2 p-3.5 bg-red-50 border border-red-150 text-red-800 rounded-xl text-xs font-semibold leading-relaxed">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {/* Personal Data */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider font-mono">Nama Lengkap Sesuai KTP:</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap"
                  value={regNama}
                  onChange={(e) => setRegNama(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider font-mono">NIK (Harus Tepat 16 Digit):</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="Masukkan 16 digit NIK"
                  value={regNik}
                  onChange={(e) => {
                    // Only allow digits
                    const val = e.target.value.replace(/\D/g, '');
                    setRegNik(val);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wide"
                />
                <span className={`text-[10px] font-bold block mt-1 ${regNik.length === 16 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {regNik.length} / 16 Karakter Angka
                </span>
              </div>

              {/* Upload blocks requested */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider font-mono">Upload Foto KTP (JPG/PNG/PDF):</label>
                  <div 
                    onClick={() => ktpInputRef.current?.click()}
                    className="border border-dashed border-gray-250 bg-gray-50 hover:bg-gray-100 rounded-xl p-3 text-center cursor-pointer transition-colors flex flex-col items-center justify-center h-28 relative overflow-hidden group"
                  >
                    {regKtpUrl ? (
                      <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-2">
                        {regKtpName.endsWith('.pdf') ? (
                          <div className="text-[10px] font-mono font-bold text-red-600">📄 PDF DOCUMENT</div>
                        ) : (
                          <img src={regKtpUrl} alt="Preview KTP" className="h-14 w-auto object-contain rounded border mb-1" />
                        )}
                        <span className="text-[9px] text-gray-500 font-semibold truncate w-full px-1">{regKtpName}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 mb-1" />
                        <span className="text-[10px] font-bold text-gray-700">Pilih Berkas KTP</span>
                        <span className="text-[9px] text-gray-400">Maks. 2MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={ktpInputRef}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange(e, 'ktp')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider font-mono">Upload Pasfoto (JPG/PNG):</label>
                  <div 
                    onClick={() => pasfotoInputRef.current?.click()}
                    className="border border-dashed border-gray-250 bg-gray-50 hover:bg-gray-100 rounded-xl p-3 text-center cursor-pointer transition-colors flex flex-col items-center justify-center h-28 relative overflow-hidden group"
                  >
                    {regPasfotoUrl ? (
                      <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-2">
                        <img src={regPasfotoUrl} alt="Preview Pasfoto" className="h-14 w-auto object-contain rounded border mb-1" />
                        <span className="text-[9px] text-gray-500 font-semibold truncate w-full px-1">{regPasfotoName}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 mb-1" />
                        <span className="text-[10px] font-bold text-gray-700">Pilih Pasfoto 3x4 / 4x6</span>
                        <span className="text-[9px] text-gray-400">Maks. 2MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={pasfotoInputRef}
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'pasfoto')}
                    />
                  </div>
                </div>
              </div>

              {/* Credentials details underneath */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider font-mono">Buat Username Baru:</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan username baru"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.replace(/\s+/g, ''))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider font-mono">Password:</label>
                    <input
                      type="password"
                      required
                      placeholder="Buat sandi rumit"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider font-mono">Ketik Ulang Password:</label>
                    <input
                      type="password"
                      required
                      placeholder="Ulangi sandi anda"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 text-center flex items-center justify-center gap-1"
                >
                  ◀ Keluar
                </button>
              )}
              <button
                type="submit"
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Daftar
              </button>
            </div>
          </form>
        )}
        
        {/* Info Jam Operasional Kelurahan */}
        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
            <span className="font-bold text-gray-500">Jam Operasional Layanan Kelurahan Trajeng:</span><br/>
            Sen - Kam: 08.00 - 15.00 WIB<br/>
            Jum: 08.00 - 11.30 WIB
          </p>
        </div>
      </div>
    </div>
  );
}
