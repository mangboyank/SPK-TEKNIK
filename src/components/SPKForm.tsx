import React, { useState } from 'react';
import { SPK } from '../types';
import { PlusCircle, FileText, Check, ShieldAlert, CheckCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';

interface SPKFormProps {
  onAddSPK: (spk: SPK) => void;
  currentUserName: string;
}

export default function SPKForm({ onAddSPK, currentUserName }: SPKFormProps) {
  const [namaMesin, setNamaMesin] = useState('');
  const [diajukanOleh, setDiajukanOleh] = useState(currentUserName || '');
  const [bagian, setBagian] = useState<'Produksi' | 'QUA' | 'HRDGA' | 'WHM' | 'Purchasing' | 'Logistik' | 'Manajemen'>('Produksi');
  const [deskripsiMasalah, setDeskripsiMasalah] = useState('');
  const [namaAtasan, setNamaAtasan] = useState('');
  const [sudahDisetujui, setSudahDisetujui] = useState<'Sudah' | 'Belum'>('Sudah');
  const [tanggalPengajuan, setTanggalPengajuan] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // State management for custom validation, confirmations, and success screens
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [lastSubmittedSpk, setLastSubmittedSpk] = useState<SPK | null>(null);

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!namaMesin.trim()) {
      setValidationError('Nama Mesin / Fasilitas wajib diisi!');
      return;
    }
    if (!diajukanOleh.trim()) {
      setValidationError('Nama Pelapor / Pengaju wajib diisi!');
      return;
    }
    if (!deskripsiMasalah.trim()) {
      setValidationError('Deskripsi Kerusakan / Gejala Masalah wajib diisi!');
      return;
    }
    if (!tanggalPengajuan) {
      setValidationError('Tanggal Pengajuan wajib dipilih!');
      return;
    }
    if (!namaAtasan.trim()) {
      setValidationError('Nama Atasan Langsung wajib diisi!');
      return;
    }

    // Trigger custom React modal instead of window.confirm
    setShowConfirmModal(true);
  };

  const executeSubmit = () => {
    setShowConfirmModal(false);

    const dateFormatted = tanggalPengajuan.replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digit random number
    const generatedId = `SPK-${dateFormatted}-${randomSuffix}`;

    const newSPK: SPK = {
      id: generatedId,
      tanggalPengajuan: tanggalPengajuan,
      namaMesin: namaMesin.trim(),
      diajukanOleh: diajukanOleh.trim(),
      bagian,
      deskripsiMasalah: deskripsiMasalah.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      verifiedBySPV: false,
      verifiedByHead: false,
      approvedByDeptHead: sudahDisetujui === 'Sudah',
      deptHeadName: namaAtasan.trim(),
      approvedByDeptHeadAt: sudahDisetujui === 'Sudah' ? new Date().toISOString() : undefined
    };

    onAddSPK(newSPK);
    setLastSubmittedSpk(newSPK);
    setShowSuccessScreen(true);
  };

  const handleCreateAnother = () => {
    // Reset Form fields and return to form view
    setNamaMesin('');
    setDeskripsiMasalah('');
    setNamaAtasan('');
    setSudahDisetujui('Sudah');
    setValidationError(null);
    setShowSuccessScreen(false);
    setLastSubmittedSpk(null);
  };

  const departemenList = [
    'Produksi',
    'QUA',
    'HRDGA',
    'WHM',
    'Purchasing',
    'Logistik',
    'Manajemen'
  ];

  // Render Success Screen if submitted
  if (showSuccessScreen && lastSubmittedSpk) {
    return (
      <div className="bg-[#161B22] p-8 rounded-3xl border-2 border-emerald-500/20 shadow-xl shadow-black/40 text-center space-y-6 max-w-2xl mx-auto" id="spk-success-screen">
        <div className="mx-auto w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 animate-bounce">
          <CheckCircle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white">SPK Berhasil Diajukan!</h2>
          <p className="text-xs text-gray-400">Pendaftaran Surat Perintah Kerja (SPK) digital Anda telah terdaftar dalam sistem.</p>
        </div>

        {/* SPK Details Summary Card */}
        <div className="bg-[#0F1115] border border-white/5 rounded-2xl p-5 text-left space-y-3">
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5 text-xs">
            <span className="text-gray-400 font-medium">Nomor Tiket SPK</span>
            <span className="font-mono font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-lg text-[13px]">{lastSubmittedSpk.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs pt-1.5">
            <div>
              <span className="text-gray-500 font-medium block">Nama Mesin</span>
              <span className="text-white font-bold">{lastSubmittedSpk.namaMesin}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Tanggal Pengajuan</span>
              <span className="text-white font-bold">{lastSubmittedSpk.tanggalPengajuan}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Nama Pelapor</span>
              <span className="text-white font-bold">{lastSubmittedSpk.diajukanOleh}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Bagian / Departemen</span>
              <span className="text-white font-bold">{lastSubmittedSpk.bagian}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Atasan Langsung</span>
              <span className="text-white font-bold">{lastSubmittedSpk.deptHeadName || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Status Persetujuan Atasan</span>
              {lastSubmittedSpk.approvedByDeptHead ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Disetujui (SUDAH)
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px] mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Belum Diketahui (Tunda)
                </span>
              )}
            </div>
          </div>

          {/* Warning note if not approved */}
          {!lastSubmittedSpk.approvedByDeptHead && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] text-amber-400/90 leading-relaxed mt-2">
              ⚠️ <strong>PENTING:</strong> Karena status belum disetujui atasan, SPK ini akan masuk kategori tunda. Kepala Bagian Teknik berhak melakukan penolakan (Reject) otomatis kecuali Head Departemen Anda login untuk menyetujuinya.
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="pt-3">
          <button
            onClick={handleCreateAnother}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 mx-auto"
            id="btn-create-another-spk"
          >
            <RefreshCw className="w-4 h-4" />
            Ajukan SPK Baru Lainnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161B22] p-6 rounded-2xl border border-white/5 relative" id="spk-form-component">
      <div className="flex items-center gap-2 pb-4 mb-5 border-b border-white/5">
        <PlusCircle className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold text-white text-lg">Buat Pengajuan SPK Baru</h2>
      </div>

      {/* Validation error box if present */}
      {validationError && (
        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2.5 animate-fadeIn" id="form-validation-error">
          <span className="text-base leading-none">⚠️</span>
          <div className="text-xs">
            <strong>Gagal Mengirim:</strong> {validationError}
          </div>
        </div>
      )}

      <form onSubmit={handlePreSubmit} className="space-y-4">
        {/* Tanggal Pengajuan (Bisa dipilih) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Pengajuan</label>
            <input 
              type="date" 
              required
              value={tanggalPengajuan}
              onChange={(e) => setTanggalPengajuan(e.target.value)}
              className="w-full bg-[#0F1115] text-[#E0E0E0] font-medium text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition cursor-pointer"
              id="input-tanggal-pengajuan"
            />
          </div>

          {/* Diajukan Oleh */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Pelapor / Pengaju</label>
            <input 
              type="text" 
              required
              value={diajukanOleh}
              onChange={(e) => setDiajukanOleh(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              className="w-full bg-[#0F1115] text-[#E0E0E0] font-medium text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              id="input-diajukan-oleh"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Mesin */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Mesin / Fasilitas</label>
            <input 
              type="text" 
              required
              value={namaMesin}
              onChange={(e) => setNamaMesin(e.target.value)}
              placeholder="Contoh: Chiller B, Compressor 1, Forklift 2T"
              className="w-full bg-[#0F1115] text-[#E0E0E0] font-medium text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              id="input-nama-mesin"
            />
          </div>

          {/* Diajukan Oleh Bagian */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Diajukan Oleh Bagian (Departemen)</label>
            <select 
              value={bagian}
              onChange={(e) => setBagian(e.target.value as any)}
              className="w-full bg-[#0F1115] text-[#E0E0E0] font-medium text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition cursor-pointer"
              id="select-bagian"
            >
              {departemenList.map(dept => (
                <option key={dept} value={dept} className="bg-[#161B22] text-[#E0E0E0]">{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Deskripsi Masalah */}
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Deskripsi Kerusakan / Gejala Masalah</label>
          <textarea 
            required
            rows={4}
            value={deskripsiMasalah}
            onChange={(e) => setDeskripsiMasalah(e.target.value)}
            placeholder="Jelaskan secara detail masalah mesin, gejala kerusakan, kode error jika ada, dan dampaknya terhadap operasional..."
            className="w-full bg-[#0F1115] text-[#E0E0E0] font-medium text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
            id="textarea-deskripsi-masalah"
          />
        </div>

        {/* Atasan Approval Section */}
        <div className="p-4 bg-[#0F1115]/40 border border-white/5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-blue-500 rounded-full"></span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Persetujuan & Verifikasi Atasan Langsung ({bagian})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Atasan / Head {bagian}</label>
              <input 
                type="text" 
                required
                value={namaAtasan}
                onChange={(e) => setNamaAtasan(e.target.value)}
                placeholder="Contoh: Budi Santoso (Head QUA)"
                className="w-full bg-[#0F1115] text-[#E0E0E0] font-medium text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                id="input-nama-atasan"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Apakah Sudah Disetujui Atasan?</label>
              <div className="grid grid-cols-2 gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => setSudahDisetujui('Sudah')}
                  className={`py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    sudahDisetujui === 'Sudah'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                      : 'bg-[#0F1115] border-white/5 text-gray-500 hover:text-gray-300 font-medium'
                  }`}
                  id="btn-atasan-sudah"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sudahDisetujui === 'Sudah' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`}></span>
                  Sudah Disetujui
                </button>
                <button
                  type="button"
                  onClick={() => setSudahDisetujui('Belum')}
                  className={`py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    sudahDisetujui === 'Belum'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                      : 'bg-[#0F1115] border-white/5 text-gray-500 hover:text-gray-300 font-medium'
                  }`}
                  id="btn-atasan-belum"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sudahDisetujui === 'Belum' ? 'bg-amber-500 animate-pulse' : 'bg-gray-600'}`}></span>
                  Belum Disetujui
                </button>
              </div>
            </div>
          </div>

          {/* Interactive feedback based on state */}
          {sudahDisetujui === 'Sudah' ? (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[11px] text-emerald-400/95 leading-relaxed flex items-start gap-2">
              <span className="text-base leading-none text-emerald-400">✓</span>
              <div>
                <strong>Sudah Approve Atasan Terkait:</strong> SPK dinyatakan sah disetujui secara lisan/digital oleh <span className="font-bold underline text-emerald-300">{namaAtasan || '[Nama Atasan]'}</span> selaku Head/Atasan {bagian}. SPK akan langsung diteruskan ke Tim Teknik (TEKNIK GIT) untuk segera diproses.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px] text-amber-400/95 leading-relaxed flex items-start gap-2">
              <span className="text-base leading-none text-amber-400">⚠</span>
              <div>
                <strong>Belum Diketahui Atasan:</strong> SPK belum divalidasi oleh Atasan Anda. <span className="text-amber-300 font-bold">Penting:</span> Head Teknik memiliki wewenang penuh untuk otomatis <strong>MELAKUKAN REJECT / PENOLAKAN</strong> terhadap SPK ini apabila diajukan tanpa persetujuan Head {bagian}.
              </div>
            </div>
          )}
        </div>

        {/* Flow information box */}
        <div className="p-4 bg-blue-500/5 rounded-2xl border border-white/5 space-y-3 text-xs text-gray-400">
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
            <ShieldAlert className="w-4 h-4" />
            <span>Alur Persetujuan Digital (Tanpa Tanda Tangan Basah)</span>
          </div>
          
          <div className="text-[11px] leading-relaxed text-gray-400 space-y-2">
            <p>
              Sistem ini mendigitalisasi tanda tangan konvensional untuk kecepatan dan akuntabilitas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#0F1115]/50 p-2.5 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-gray-300 text-[10px] uppercase text-blue-400">1. Submisi & Notifikasi</span>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Pelapor mengisi SPK. Setelah dikirim, sistem otomatis memunculkan tanda <strong>"Menunggu ACC Atasan Departemen Terkait"</strong> ({bagian}) agar Head departemen mengetahuinya.
                </p>
              </div>
              <div className="bg-[#0F1115]/50 p-2.5 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-gray-300 text-[10px] uppercase text-amber-400">2. ACC Digital Atasan</span>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Atasan Anda (Head {bagian}) masuk menggunakan akun <strong>"Head"</strong>, lalu menekan tombol <strong>"ACC Head Departemen Terkait"</strong>. Nama & waktu ACC tercatat otomatis sebagai bukti sah.
                </p>
              </div>
              <div className="bg-[#0F1115]/50 p-2.5 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-gray-300 text-[10px] uppercase text-indigo-400">3. Otorisasi Head Teknik</span>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Setelah di-ACC oleh Head departemen asal, SPK otomatis masuk ke antrean <strong>Departemen Teknik (TEKNIK GIT)</strong> untuk di-Approve oleh Head Teknik.
                </p>
              </div>
              <div className="bg-[#0F1115]/50 p-2.5 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-gray-300 text-[10px] uppercase text-emerald-400">4. Perbaikan & Penutupan</span>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Teknisi Teknik mengerjakan, melapor tindakan, kemudian diverifikasi oleh SPV Teknik & Head Teknik untuk status <strong>Closed (Selesai)</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-blue-500/10"
            id="btn-submit-spk"
          >
            <FileText className="w-4 h-4" />
            Kirim Permohonan SPK
          </button>
        </div>
      </form>

      {/* CUSTOM REACT-BASED CONFIRMATION MODAL (Prevents browser popup issues in iframe) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" id="custom-confirm-modal">
          <div className="bg-[#161B22] border border-white/10 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {sudahDisetujui === 'Sudah' ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Konfirmasi Persetujuan Atasan</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Apakah Anda menyatakan benar bahwa permohonan SPK ini <span className="text-emerald-400 font-semibold underline">telah disetujui secara lisan/digital (ACC)</span> oleh Atasan langsung Anda: <span className="text-white font-bold">"{namaAtasan}"</span>?
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white rounded-xl transition cursor-pointer font-bold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeSubmit}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs text-white rounded-xl transition cursor-pointer font-extrabold shadow-lg shadow-emerald-500/10"
                  >
                    Ya, Sudah Disetujui
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">⚠️ Peringatan Penting</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    SPK Anda <span className="text-amber-400 font-bold">belum diketahui atau belum divalidasi oleh Atasan Anda</span>. Head Teknik (TEKNIK GIT) berhak mutlak untuk melakukan <strong>Reject / Penolakan Otomatis</strong> terhadap permohonan ini.
                  </p>
                  <p className="text-[10px] text-gray-500">Apakah Anda tetap ingin mengirimkan berkas pengajuan ini?</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white rounded-xl transition cursor-pointer font-bold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeSubmit}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-xs text-white rounded-xl transition cursor-pointer font-extrabold shadow-lg shadow-amber-500/10"
                  >
                    Ya, Tetap Kirim
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
