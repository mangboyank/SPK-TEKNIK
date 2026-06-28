import React, { useState } from 'react';
import { Role, RolePin } from '../types';
import { KeyRound, ShieldCheck, Lock, Unlock, LogOut, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface RoleLoginProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  pins: RolePin;
  onChangePin: (role: 'Teknik' | 'SPV' | 'Head', newPin: string) => void;
  onLogout: () => void;
}

export default function RoleLogin({ currentRole, onRoleChange, pins, onChangePin, onLogout }: RoleLoginProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('Pelapor');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Ubah PIN States
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [showChangePinForm, setShowChangePinForm] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedRole === 'Pelapor') {
      onRoleChange('Pelapor');
      setPinInput('');
      return;
    }

    const correctPin = pins[selectedRole as 'Teknik' | 'SPV' | 'Head'];
    if (pinInput === correctPin) {
      onRoleChange(selectedRole);
      setPinInput('');
    } else {
      setErrorMsg('PIN yang Anda masukkan salah. Silakan coba lagi.');
    }
  };

  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setPinChangeSuccess(false);

    if (currentRole === 'Pelapor') return;

    const actualCurrentPin = pins[currentRole as 'Teknik' | 'SPV' | 'Head'];
    if (currentPin !== actualCurrentPin) {
      setErrorMsg('PIN Lama tidak sesuai.');
      return;
    }

    if (newPin.length < 4) {
      setErrorMsg('PIN Baru harus minimal 4 karakter / angka.');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    onChangePin(currentRole as 'Teknik' | 'SPV' | 'Head', newPin);
    setPinChangeSuccess(true);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');

    setTimeout(() => {
      setPinChangeSuccess(false);
      setShowChangePinForm(false);
    }, 4000);
  };

  return (
    <div className="bg-[#161B22] p-6 rounded-2xl border border-white/5" id="login-auth-component">
      {currentRole === 'Pelapor' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Lock className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-white text-sm">Masuk / Switch Akun Penanggung Jawab</h2>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Peran Otoritas</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Pelapor', 'Teknik', 'SPV', 'Head'] as Role[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setErrorMsg('');
                    }}
                    className={`px-2 py-2.5 text-xs font-semibold rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      selectedRole === role
                        ? 'border-blue-500 bg-blue-600/20 text-blue-400 font-bold'
                        : 'border-white/10 bg-[#0F1115] text-gray-400 hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider">{role}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedRole !== 'Pelapor' && (
              <div className="space-y-2 animate-fadeIn">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  PIN Keamanan <span className="text-blue-400">({selectedRole})</span>
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={10}
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder={`Masukkan PIN ${selectedRole}`}
                    className="w-full bg-[#0F1115] text-[#E0E0E0] font-mono font-bold tracking-widest text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    id="login-pin-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-2.5 text-gray-500 hover:text-white cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-[11px] text-red-400 font-medium bg-red-500/10 p-2.5 rounded-lg border border-red-500/20" id="login-error-msg">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer active:scale-98 flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
              id="btn-login-submit"
            >
              <KeyRound className="w-4 h-4" />
              {selectedRole === 'Pelapor' ? 'Gunakan Akses Pelapor' : `Konfirmasi PIN & Masuk Peran ${selectedRole}`}
            </button>
          </form>

          {/* Quick instructions with default pins for easy assessment */}
          <div className="p-3.5 bg-blue-500/5 rounded-xl border border-white/5 text-[11px] text-gray-400 space-y-1.5">
            <span className="font-bold flex items-center gap-1 text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Panduan Hak Otoritas Akun & PIN Default:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-[10px] text-gray-400">
              <li><strong>Pelapor</strong> (Umum): Bebas mengajukan SPK baru dari bagian produksi dll.</li>
              <li><strong>Teknik</strong> (PIN: <span className="font-bold font-mono text-blue-400">1111</span>): Mengisi Tindak Perbaikan (Hanya setelah SPK disetujui Head).</li>
              <li><strong>SPV</strong> (PIN: <span className="font-bold font-mono text-blue-400">2222</span>): Verifikasi 1 penyelesaian pekerjaan.</li>
              <li><strong>Head</strong> (PIN: <span className="font-bold font-mono text-blue-400">3333</span>): Menyetujui/Menolak SPK awal & Verifikasi 2 penyelesaian pekerjaan.</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Logged In View */
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="font-bold text-white text-xs uppercase tracking-wide">Aktif: {currentRole}</h2>
                <p className="text-[10px] text-gray-500">Hak akses terotentikasi</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg flex items-center gap-1 border border-red-500/20 transition cursor-pointer"
              id="btn-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>

          {!showChangePinForm ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold block text-emerald-400">Otoritas {currentRole} Aktif</span>
                  {currentRole === 'Teknik' && "Anda memiliki hak akses untuk mengisi Form Tindak Perbaikan & merubah status SPK yang sudah disetujui Head."}
                  {currentRole === 'SPV' && "Anda memiliki otoritas verifikasi 1 untuk menutup SPK yang telah diselesaikan oleh tim Teknik."}
                  {currentRole === 'Head' && "Anda memiliki otoritas penuh untuk Menyetujui (Approve), Menolak (Reject) SPK awal, serta memberikan Verifikasi 2."}
                </div>
              </div>

              <button
                onClick={() => setShowChangePinForm(true)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-semibold rounded-xl border border-white/10 transition flex items-center justify-center gap-1 cursor-pointer"
                id="btn-trigger-change-pin"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Ubah PIN Akses {currentRole}
              </button>
            </div>
          ) : (
            /* Change PIN Form */
            <form onSubmit={handlePinChangeSubmit} className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300">Formulir Ubah PIN {currentRole}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePinForm(false);
                    setErrorMsg('');
                  }}
                  className="text-[10px] text-gray-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
              </div>

              {pinChangeSuccess && (
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] rounded-lg flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  PIN Akses {currentRole} berhasil diperbarui!
                </div>
              )}

              <div className="space-y-2">
                {/* PIN Lama */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">PIN Lama</label>
                  <input
                    type="password"
                    maxLength={10}
                    required
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    className="w-full bg-[#0F1115] text-[#E0E0E0] font-mono text-xs px-3 py-1.5 rounded-lg border border-white/10"
                  />
                </div>

                {/* PIN Baru */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">PIN Baru (Min 4 digit)</label>
                  <input
                    type="password"
                    maxLength={10}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full bg-[#0F1115] text-[#E0E0E0] font-mono text-xs px-3 py-1.5 rounded-lg border border-white/10"
                  />
                </div>

                {/* Konfirmasi PIN Baru */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">Ulangi PIN Baru</label>
                  <input
                    type="password"
                    maxLength={10}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full bg-[#0F1115] text-[#E0E0E0] font-mono text-xs px-3 py-1.5 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-[10px] text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-blue-500/10"
              >
                Simpan PIN Baru
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
