import React, { useState, useEffect } from 'react';
import { Role, RolePin } from '../types';
import { Shield, User, Wrench, UserCheck, ShieldAlert, KeyRound, Eye, EyeOff, Lock, CheckCircle2, QrCode } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface RoleLoginModalProps {
  isOpen: boolean;
  pins: RolePin;
  onAuthenticate: (role: Role) => void;
}

export default function RoleLoginModal({ isOpen, pins, onAuthenticate }: RoleLoginModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          // Success
          scanner.clear();
          setShowScanner(false);
          setPinInput(decodedText);
          setErrorMsg('');
        },
        (error) => {
          // Ignore scanning errors
        }
      );

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [showScanner]);

  if (!isOpen) return null;

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
    setPinInput('');
    setErrorMsg('');
    setShowPin(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (selectedRole === 'Pelapor') {
      onAuthenticate('Pelapor');
      return;
    }

    const correctPin = pins[selectedRole as 'Teknik' | 'SPV' | 'Head'];
    if (pinInput === correctPin) {
      onAuthenticate(selectedRole);
    } else {
      setErrorMsg('PIN keamanan salah! Silakan coba lagi.');
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'Pelapor':
        return <User className="w-6 h-6 text-blue-400" />;
      case 'Teknik':
        return <Wrench className="w-6 h-6 text-amber-400" />;
      case 'SPV':
        return <UserCheck className="w-6 h-6 text-purple-400" />;
      case 'Head':
        return <Shield className="w-6 h-6 text-rose-400" />;
    }
  };

  const getRoleDesc = (role: Role) => {
    switch (role) {
      case 'Pelapor':
        return 'Hanya akses Formulir Pengajuan SPK baru. Tidak melihat dashboard & data monitoring.';
      case 'Teknik':
        return 'Mengisi Tindak Perbaikan & merubah status pengerjaan SPK yang disetujui.';
      case 'SPV':
        return 'Melakukan pengawasan lapangan & Verifikasi Pekerjaan Pertama.';
      case 'Head':
        return 'Otorisasi persetujuan/penolakan SPK & Verifikasi Pekerjaan Kedua.';
    }
  };

  const getRolePinHint = (role: Role) => {
    switch (role) {
      case 'Teknik':
        return '1111';
      case 'SPV':
        return '2222';
      case 'Head':
        return '3333';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-[#161B22] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scaleIn my-8"
        id="role-login-modal"
      >
        {/* Banner header */}
        <div className="bg-[#0F1115] px-6 py-8 text-center border-b border-white/5 relative">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-3.5">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">SISTEM OTORITAS SPK PABRIK</h2>
          <p className="text-xs text-gray-400 mt-1">Silakan tentukan peran Anda untuk mengakses sistem kerja.</p>
          
          {/* Firebase optimization label inside login modal to reassure users */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Offline-First Shield Active (Menghemat Kuota & Pencegah Riset Data)
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Choose Role */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Langkah 1: Pilih Peran Otoritas Kerja Anda
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([ 'Pelapor', 'Teknik', 'SPV', 'Head' ] as Role[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleClick(role)}
                    className={`p-4 rounded-2xl border text-left transition duration-200 cursor-pointer flex gap-4 items-start ${
                      selectedRole === role
                        ? 'border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/5 text-white'
                        : 'border-white/5 bg-[#0F1115]/50 text-gray-400 hover:bg-[#0F1115] hover:border-white/10'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      selectedRole === role ? 'bg-blue-600/20' : 'bg-[#161B22]'
                    }`}>
                      {getRoleIcon(role)}
                    </div>
                    <div className="space-y-1">
                      <span className={`font-bold text-sm block ${selectedRole === role ? 'text-blue-400' : 'text-gray-300'}`}>
                        {role === 'Pelapor' ? 'Pelapor (Umum)' : role}
                      </span>
                      <p className="text-[11px] text-gray-400 leading-normal">{getRoleDesc(role)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Input PIN if admin role */}
            {selectedRole && selectedRole !== 'Pelapor' && (
              <div className="space-y-3 p-5 bg-[#0F1115]/80 rounded-2xl border border-white/5 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Langkah 2: Verifikasi PIN Otoritas <span className="text-blue-400 font-extrabold font-mono">[{selectedRole}]</span>
                  </label>
                  <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded font-medium">
                    PIN default: <strong className="font-mono text-blue-400">{getRolePinHint(selectedRole)}</strong>
                  </span>
                </div>

                {!showScanner ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        maxLength={10}
                        required={!showScanner}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder={`Masukkan PIN Otoritas ${selectedRole}...`}
                        className="w-full bg-[#161B22] text-[#E0E0E0] font-mono font-bold tracking-widest text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        id="modal-pin-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-4 top-3.5 text-gray-500 hover:text-white cursor-pointer"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl border border-white/10 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      Scan Barcode Login
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div id="qr-reader" className="w-full bg-[#161B22] rounded-xl overflow-hidden border border-white/10 [&>div]:!border-none [&>div>div]:!bg-[#161B22] [&_video]:!rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setShowScanner(false)}
                      className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      Tutup Scanner
                    </button>
                  </div>
                )}

                {errorMsg && (
                  <p className="text-[11px] text-red-400 font-semibold bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 animate-fadeIn" id="modal-error-msg">
                    ⚠️ {errorMsg}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            {selectedRole && (
              <div className="pt-2 animate-fadeIn">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  id="btn-modal-submit"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  {selectedRole === 'Pelapor' 
                    ? 'Masuk ke Sistem Pengajuan SPK (Pelapor)' 
                    : `Verifikasi & Akses Dashboard ${selectedRole}`
                  }
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
