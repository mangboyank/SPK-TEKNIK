import React, { useState, useEffect } from 'react';
import { SPK, Role } from '../types';
import { Search, Filter, CheckCircle2, XCircle, Clock, AlertCircle, Wrench, ShieldCheck, UserCheck, ChevronRight, CornerDownRight, CheckSquare, Trash2 } from 'lucide-react';

interface SPKListProps {
  spks: SPK[];
  currentRole: Role;
  selectedSpkId?: string;
  onSelectSpk?: (spk: SPK | null) => void;
  onApproveDeptHead: (spkId: string, deptHeadName: string) => void;
  onApproveSPK: (spkId: string, headName: string) => void;
  onRejectSPK: (spkId: string, headName: string, reason: string) => void;
  onDeleteSPK: (spkId: string) => void;
  onReportRepair: (
    spkId: string, 
    teknisi: string, 
    tindakan: string, 
    status: 'Menunggu Sparepart' | 'Menunggu Verifikasi',
    tanggalPerbaikan: string,
    jenisPekerjaan: 'Perbaikan' | 'Maintenance' | 'Pengecekan'
  ) => void;
  onVerifySPV: (spkId: string, spvName: string) => void;
  onVerifyHead: (spkId: string, headName: string) => void;
}

export default function SPKList({
  spks,
  currentRole,
  selectedSpkId,
  onSelectSpk,
  onApproveDeptHead,
  onApproveSPK,
  onRejectSPK,
  onDeleteSPK,
  onReportRepair,
  onVerifySPV,
  onVerifyHead
}: SPKListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Helpers for progress bars (Tampilan Bar pada Monitoring)
  const getSpkProgress = (spk: SPK) => {
    switch (spk.status) {
      case 'Pending':
        return spk.approvedByDeptHead ? 30 : 15;
      case 'Approved':
        return 50;
      case 'Menunggu Sparepart':
        return 65;
      case 'Menunggu Verifikasi':
        return 85;
      case 'Closed':
        return 100;
      case 'Rejected':
        return 100;
      default:
        return 0;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500';
      case 'Approved':
        return 'bg-blue-500';
      case 'Menunggu Sparepart':
        return 'bg-orange-500';
      case 'Menunggu Verifikasi':
        return 'bg-purple-500';
      case 'Closed':
        return 'bg-green-500';
      case 'Rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [bagianFilter, setBagianFilter] = useState<string>('Semua Bagian');
  const [selectedSpk, setSelectedSpk] = useState<SPK | null>(null);

  // Teknik Action states
  const [teknisiName, setTeknisiName] = useState('');
  const [tindakPerbaikan, setTindakPerbaikan] = useState('');
  const [repairStatusChoice, setRepairStatusChoice] = useState<'Menunggu Sparepart' | 'Menunggu Verifikasi'>('Menunggu Verifikasi');
  const [tanggalPerbaikan, setTanggalPerbaikan] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [jenisPekerjaan, setJenisPekerjaan] = useState<'Perbaikan' | 'Maintenance' | 'Pengecekan'>('Perbaikan');

  // Head Action states
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Manual Name inputs for other roles (Head and SPV)
  const [manualHeadName, setManualHeadName] = useState('');
  const [manualSpvName, setManualSpvName] = useState('');

  // Sync selected SPK with the updated parent list or external selectedSpkId
  useEffect(() => {
    const targetId = selectedSpkId || selectedSpk?.id;
    if (targetId) {
      const live = spks.find(s => s.id === targetId);
      if (live) {
        setSelectedSpk(live);
        setTindakPerbaikan(live.tindakPerbaikan || '');
        const cleanTeknisi = live.teknisiNama ? live.teknisiNama.replace(' (Teknik)', '') : '';
        setTeknisiName(cleanTeknisi);
        setTanggalPerbaikan(live.tanggalPerbaikan || new Date().toISOString().split('T')[0]);
        setJenisPekerjaan(live.jenisPekerjaan || 'Perbaikan');
      } else {
        setSelectedSpk(null);
      }
    } else {
      setSelectedSpk(null);
    }
  }, [selectedSpkId, spks]);

  // Handle Detail selection
  const handleSelectSpk = (spk: SPK) => {
    setSelectedSpk(spk);
    if (onSelectSpk) {
      onSelectSpk(spk);
    }
    setTindakPerbaikan(spk.tindakPerbaikan || '');
    // Strip " (Teknik)" from the end of technician name if it's there, to show nicely in input
    const cleanTeknisi = spk.teknisiNama ? spk.teknisiNama.replace(' (Teknik)', '') : '';
    setTeknisiName(cleanTeknisi);
    setTanggalPerbaikan(spk.tanggalPerbaikan || new Date().toISOString().split('T')[0]);
    setJenisPekerjaan(spk.jenisPekerjaan || 'Perbaikan');
    setManualHeadName('');
    setManualSpvName('');
    setShowRejectForm(false);
    setRejectionReason('');
  };

  // Filter logic
  const filteredSpks = spks.filter(s => {
    const matchesSearch = 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.namaMesin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.diajukanOleh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.deskripsiMasalah.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Semua' || s.status === statusFilter;
    const matchesBagian = bagianFilter === 'Semua Bagian' || s.bagian === bagianFilter;

    return matchesSearch && matchesStatus && matchesBagian;
  });

  const getStatusBadge = (spk: SPK) => {
    switch (spk.status) {
      case 'Pending':
        if (!spk.approvedByDeptHead) {
          return (
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/20 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> ACC Head {spk.bagian}
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-500/20 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Approved Dept ({spk.bagian})
          </span>
        );
      case 'Approved':
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approved / Open
        </span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/20 flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" /> Ditolak Head
        </span>;
      case 'Menunggu Sparepart':
        return <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 text-[10px] font-bold rounded-lg border border-orange-500/20 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 animate-pulse" /> Menunggu Sparepart
        </span>;
      case 'Menunggu Verifikasi':
        return <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-lg border border-purple-500/20 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Menunggu Verifikasi
        </span>;
      case 'Closed':
        return <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-lg border border-green-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Closed / Selesai
        </span>;
    }
  };

  const departemenList = [
    'Semua Bagian',
    'Produksi',
    'QUA',
    'HRDGA',
    'WHM',
    'Purchasing',
    'Logistik',
    'Manajemen'
  ];

  const statusList = [
    'Semua',
    'Pending',
    'Approved',
    'Rejected',
    'Menunggu Sparepart',
    'Menunggu Verifikasi',
    'Closed'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="spk-list-and-details">
      
      {/* LEFT SIDE: List of SPK items (7 cols) */}
      <div className="lg:col-span-7 bg-[#161B22] p-5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h2 className="font-bold text-white text-base">Monitoring Dokumen SPK</h2>
            <p className="text-[11px] text-gray-500">Gunakan pencarian & filter untuk mengelola SPK aktif.</p>
          </div>
          <span className="text-xs bg-[#0F1115] text-gray-400 font-bold px-2.5 py-1 rounded-full border border-white/5">
            {filteredSpks.length} Data Ditemukan
          </span>
        </div>

        {/* Filters Panel */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan No SPK, nama mesin, pelapor..."
              className="w-full bg-[#0F1115] text-[#E0E0E0] text-xs pl-9 pr-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              id="search-spk"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Filter Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#0F1115] text-[#E0E0E0] text-xs p-2 rounded-xl border border-white/10 cursor-pointer focus:outline-none focus:border-blue-500"
                id="filter-status"
              >
                {statusList.map(st => (
                  <option key={st} value={st} className="bg-[#161B22] text-[#E0E0E0]">{st === 'Semua' ? 'Semua Status' : st}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Filter Bagian</label>
              <select
                value={bagianFilter}
                onChange={(e) => setBagianFilter(e.target.value)}
                className="w-full bg-[#0F1115] text-[#E0E0E0] text-xs p-2 rounded-xl border border-white/10 cursor-pointer focus:outline-none focus:border-blue-500"
                id="filter-bagian"
              >
                {departemenList.map(dept => (
                  <option key={dept} value={dept} className="bg-[#161B22] text-[#E0E0E0]">{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SPK Cards List */}
        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
          {filteredSpks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-xs font-semibold">Tidak ada dokumen SPK yang cocok dengan filter.</p>
            </div>
          ) : (
            filteredSpks.map(spk => (
              <div
                key={spk.id}
                onClick={() => handleSelectSpk(spk)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                  selectedSpk?.id === spk.id
                    ? 'border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/5'
                    : 'border-white/5 bg-[#0F1115] hover:bg-white/[0.01] hover:border-white/10'
                }`}
                id={`spk-card-${spk.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-300 bg-[#161B22] px-2 py-0.5 rounded border border-white/5">
                        {spk.id}
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold">{spk.tanggalPengajuan}</span>
                    </div>
                    <h4 className="font-bold text-white text-xs">{spk.namaMesin}</h4>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      Diajukan oleh: <strong className="text-gray-300 font-semibold">{spk.diajukanOleh}</strong> ({spk.bagian})
                    </p>
                  </div>
                  {getStatusBadge(spk)}
                </div>

                <p className="text-[11px] text-gray-400 line-clamp-2 italic bg-white/[0.01] p-2 rounded-lg border border-white/5">
                  &ldquo;{spk.deskripsiMasalah}&rdquo;
                </p>

                {/* Sleek status progress bar (Tampilan Bar pada Monitoring) */}
                <div className="space-y-1 my-1">
                  <div className="flex justify-between items-center text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>Progres Alur SPK</span>
                    <span className="font-mono">{getSpkProgress(spk)}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(spk.status)}`}
                      style={{ width: `${getSpkProgress(spk)}%` }}
                    ></div>
                  </div>
                </div>

                {spk.tindakPerbaikan && (
                  <div className="text-[10px] text-gray-500 border-t border-white/5 pt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5 text-blue-400" /> Perbaikan: Ada Tindakan</span>
                    <span className="font-semibold text-gray-300">Teknisi: {spk.teknisiNama}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDE: SPK Detail & Action center (5 cols) */}
      <div className="lg:col-span-5 bg-[#161B22] p-5 rounded-2xl border border-white/5">
        {selectedSpk ? (
          <div className="space-y-5 animate-fadeIn" id="spk-detail-pane">
            
            {/* Detail Header */}
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-gray-300 bg-[#0F1115] px-2 py-0.5 rounded border border-white/5">
                  {selectedSpk.id}
                </span>
                <h3 className="font-bold text-white text-sm mt-1">{selectedSpk.namaMesin}</h3>
                <p className="text-[10px] text-gray-500">Didaftarkan: {new Date(selectedSpk.createdAt).toLocaleString('id-ID')}</p>
              </div>
              {getStatusBadge(selectedSpk)}
            </div>

            {/* General Info */}
            <div className="space-y-3 text-xs bg-[#0F1115] p-3.5 rounded-xl border border-white/5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Pelapor</span>
                  <span className="font-semibold text-white">{selectedSpk.diajukanOleh}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Bagian/Unit</span>
                  <span className="font-semibold text-white">{selectedSpk.bagian}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] text-gray-500 font-bold block uppercase mb-1">Deskripsi Masalah</span>
                <p className="text-gray-300 leading-relaxed bg-[#161B22] p-2.5 rounded-lg border border-white/5 italic">
                  &ldquo;{selectedSpk.deskripsiMasalah}&rdquo;
                </p>
              </div>
            </div>

            {/* Approval Chain Visual Timeline */}
            <div className="space-y-2 border border-white/5 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Alur Persetujuan & Verifikasi</span>
              
              <div className="space-y-3.5 pl-2 pt-1 relative">
                {/* Vertical Connector Line (The Timeline Bar) */}
                <div className="absolute left-[13px] top-3 bottom-7 w-0.5 bg-white/10 z-0"></div>

                {/* Step 1: Submisi */}
                <div className="flex items-start gap-2.5 text-xs relative z-10">
                  <div className="mt-0.5 bg-[#161B22] border border-white/10 text-green-400 p-0.5 rounded-full z-20 shadow-sm shadow-[#000]/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Laporan Masuk (Submisi)</span>
                    <span className="text-[10px] text-gray-500">Diajukan oleh {selectedSpk.diajukanOleh}</span>
                  </div>
                </div>

                {/* Step 2: ACC Head Departemen Terkait */}
                <div className="flex items-start gap-2.5 text-xs relative z-10">
                  <div className={`mt-0.5 p-0.5 rounded-full bg-[#161B22] border border-white/10 z-20 shadow-sm shadow-[#000]/40 ${
                    selectedSpk.approvedByDeptHead ? 'text-green-400' : 'text-amber-400'
                  }`}>
                    {selectedSpk.approvedByDeptHead ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-white block">ACC Head Departemen Terkait</span>
                    {selectedSpk.approvedByDeptHead ? (
                      <span className="text-[10px] text-gray-500">
                        Disetujui oleh <strong className="text-gray-300">{selectedSpk.deptHeadName}</strong> ({selectedSpk.bagian})
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block"></span>
                        Menunggu ACC Head Departemen
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 3: Persetujuan Head Teknik */}
                <div className="flex items-start gap-2.5 text-xs relative z-10">
                  <div className={`mt-0.5 p-0.5 rounded-full bg-[#161B22] border border-white/10 z-20 shadow-sm shadow-[#000]/40 ${
                    selectedSpk.status === 'Rejected' ? 'text-red-400' :
                    selectedSpk.status !== 'Pending' ? 'text-green-400' :
                    !selectedSpk.approvedByDeptHead ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {selectedSpk.status === 'Rejected' ? <XCircle className="w-3.5 h-3.5" /> :
                     selectedSpk.status !== 'Pending' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                     !selectedSpk.approvedByDeptHead ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-white block">Persetujuan Head Teknik</span>
                    {selectedSpk.status === 'Rejected' ? (
                      <div className="text-[10px] text-red-400 font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20 mt-1">
                        Ditolak oleh {selectedSpk.rejectedBy || 'Head'} <br/>
                        Alasan: {selectedSpk.rejectionReason}
                      </div>
                    ) : selectedSpk.status !== 'Pending' ? (
                      <span className="text-[10px] text-gray-500">Disetujui oleh {selectedSpk.approvedBy || 'Head'}</span>
                    ) : !selectedSpk.approvedByDeptHead ? (
                      <span className="text-[10px] text-red-400 font-bold bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10 inline-block mt-0.5">
                        Belum ACC Head Departemen Terkait
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block"></span>
                        Menunggu Persetujuan Head Teknik
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 4: Tindak Perbaikan Teknik */}
                <div className="flex items-start gap-2.5 text-xs relative z-10">
                  <div className={`mt-0.5 p-0.5 rounded-full bg-[#161B22] border border-white/10 z-20 shadow-sm shadow-[#000]/40 ${
                    selectedSpk.status === 'Closed' || selectedSpk.status === 'Menunggu Verifikasi' ? 'text-green-400' :
                    selectedSpk.status === 'Menunggu Sparepart' ? 'text-orange-400' :
                    selectedSpk.status === 'Approved' ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {selectedSpk.status === 'Closed' || selectedSpk.status === 'Menunggu Verifikasi' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                     selectedSpk.status === 'Approved' ? <Clock className="w-3.5 h-3.5" /> :
                     selectedSpk.status === 'Menunggu Sparepart' ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="font-bold text-white block">Pekerjaan Perbaikan (Teknik)</span>
                    {selectedSpk.tindakPerbaikan ? (
                      <div className="text-[10px] text-gray-300 mt-1 bg-[#0F1115] p-2 border border-white/5 rounded-lg space-y-1">
                        <div><strong className="text-white font-bold">Jenis Pekerjaan:</strong> <span className="text-blue-400 font-bold">{selectedSpk.jenisPekerjaan || 'Perbaikan'}</span></div>
                        <div><strong className="text-white font-bold">Tanggal Perbaikan:</strong> <span className="text-amber-400 font-semibold">{selectedSpk.tanggalPerbaikan || '-'}</span></div>
                        <div><strong className="text-white font-bold">Tindakan:</strong> {selectedSpk.tindakPerbaikan}</div>
                        <span className="text-[9px] text-gray-500 block mt-1">Dikerjakan oleh: {selectedSpk.teknisiNama}</span>
                      </div>
                    ) : selectedSpk.status === 'Approved' ? (
                      <span className="text-[10px] text-blue-400 font-semibold">Siap dikerjakan oleh Teknik</span>
                    ) : selectedSpk.status === 'Pending' ? (
                      <span className="text-[10px] text-gray-500">Menunggu persetujuan Head (Teknik dilarang memulai)</span>
                    ) : (
                      <span className="text-[10px] text-gray-500">Belum dimulai</span>
                    )}
                  </div>
                </div>

                {/* Step 5: Verifikasi Ganda (SPV & Head) */}
                <div className="flex items-start gap-2.5 text-xs relative z-10">
                  <div className={`mt-0.5 p-0.5 rounded-full bg-[#161B22] border border-white/10 z-20 shadow-sm shadow-[#000]/40 ${
                    selectedSpk.status === 'Closed' ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {selectedSpk.status === 'Closed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="font-bold text-white block">Verifikasi Penyelesaian Pekerjaan</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {/* SPV */}
                      <div className={`p-1.5 rounded border text-[9px] ${selectedSpk.verifiedBySPV ? 'bg-[#0F1115] border-green-500/20 text-green-400' : 'bg-[#0F1115] border-white/5 text-gray-500'}`}>
                        <div className="font-bold flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> SPV: {selectedSpk.verifiedBySPV ? 'VERIFIED ✓' : 'PENDING'}
                        </div>
                        {selectedSpk.verifiedBySPV && <span className="text-[8px] text-gray-400 block mt-0.5">{selectedSpk.verifiedBySPVNama}</span>}
                      </div>

                      {/* Head */}
                      <div className={`p-1.5 rounded border text-[9px] ${selectedSpk.verifiedByHead ? 'bg-[#0F1115] border-green-500/20 text-green-400' : 'bg-[#0F1115] border-white/5 text-gray-500'}`}>
                        <div className="font-bold flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Head: {selectedSpk.verifiedByHead ? 'VERIFIED ✓' : 'PENDING'}
                        </div>
                        {selectedSpk.verifiedByHead && <span className="text-[8px] text-gray-400 block mt-0.5">{selectedSpk.verifiedByHeadNama}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DYNAMIC ACTION CENTER based on logged in role */}
            <div className="border-t border-white/5 pt-4 space-y-3" id="action-center">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Pusat Otoritas ({currentRole})</span>
              
              {/* Otoritas: Pelapor (View Only) */}
              {currentRole === 'Pelapor' && (
                <div className="p-3 bg-[#0F1115] rounded-xl border border-white/5 text-[11px] text-gray-400">
                  Peran Anda saat ini adalah <strong>Pelapor (Tamu)</strong>. Anda tidak memiliki otoritas approval atau verifikasi. Masuk menggunakan PIN peran penanggung jawab di atas jika Anda adalah petugas berwenang.
                </div>
              )}

              {/* Otoritas: TEKNIK */}
              {currentRole === 'Teknik' && (
                <div className="space-y-3">
                  {selectedSpk.status === 'Pending' ? (
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 text-[11px] font-medium leading-relaxed">
                      ⚠️ <strong>PERINGATAN TEKNIS:</strong> Atasan belum memberikan persetujuan (Approval) untuk SPK ini. Sesuai S.O.P perusahaan, <strong>Teknisi tidak boleh / dilarang melakukan tindakan perbaikan</strong> sebelum ada persetujuan Head.
                    </div>
                  ) : selectedSpk.status === 'Rejected' ? (
                    <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-[11px]">
                      Pekerjaan ditolak oleh Head. Tidak perlu pengerjaan tindakan perbaikan.
                    </div>
                  ) : selectedSpk.status === 'Closed' ? (
                    <div className="p-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 text-[11px]">
                      Pekerjaan telah Selesai & diverifikasi penuh (Closed).
                    </div>
                  ) : (
                    /* Active states: Approved / Menunggu Sparepart / Menunggu Verifikasi */
                    <div className="bg-[#0F1115] p-4 rounded-xl border border-white/5 space-y-3">
                      <span className="font-bold text-white text-[11px] block">Laporan Tindak Perbaikan Teknisi</span>
                      
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Nama Teknisi Pelaksana</label>
                          <input
                            type="text"
                            value={teknisiName}
                            onChange={(e) => setTeknisiName(e.target.value)}
                            placeholder="Nama Teknisi"
                            className="w-full bg-[#161B22] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            id="teknisi-name-input"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Tanggal Perbaikan / Tindakan</label>
                            <input
                              type="date"
                              required
                              value={tanggalPerbaikan}
                              onChange={(e) => setTanggalPerbaikan(e.target.value)}
                              className="w-full bg-[#161B22] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                              id="teknisi-tanggal-perbaikan"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Jenis Pekerjaan</label>
                            <select
                              value={jenisPekerjaan}
                              onChange={(e) => setJenisPekerjaan(e.target.value as any)}
                              className="w-full bg-[#161B22] text-[#E0E0E0] text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                              id="teknisi-jenis-pekerjaan"
                            >
                              <option value="Perbaikan" className="bg-[#161B22]">Perbaikan</option>
                              <option value="Maintenance" className="bg-[#161B22]">Maintenance</option>
                              <option value="Pengecekan" className="bg-[#161B22]">Pengecekan</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Tindakan Korektif & Perbaikan</label>
                          <textarea
                            rows={3}
                            value={tindakPerbaikan}
                            onChange={(e) => setTindakPerbaikan(e.target.value)}
                            placeholder="Tuliskan tindakan perbaikan yang telah dilakukan secara komprehensif..."
                            className="w-full bg-[#161B22] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            id="teknisi-action-input"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Status Hasil Pekerjaan</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setRepairStatusChoice('Menunggu Verifikasi')}
                              className={`py-1.5 text-center text-[10px] font-bold rounded-lg border cursor-pointer transition ${
                                repairStatusChoice === 'Menunggu Verifikasi'
                                  ? 'bg-purple-500/15 text-purple-400 border-purple-500/30 font-bold'
                                  : 'bg-[#161B22] text-gray-400 border-white/10 hover:bg-white/[0.01]'
                              }`}
                            >
                              Selesai & Verifikasi
                            </button>
                            <button
                              type="button"
                              onClick={() => setRepairStatusChoice('Menunggu Sparepart')}
                              className={`py-1.5 text-center text-[10px] font-bold rounded-lg border cursor-pointer transition ${
                                repairStatusChoice === 'Menunggu Sparepart'
                                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/30 font-bold'
                                  : 'bg-[#161B22] text-gray-400 border-white/10 hover:bg-white/[0.01]'
                              }`}
                            >
                              Butuh Sparepart
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!teknisiName.trim() || !tindakPerbaikan.trim() || !tanggalPerbaikan) {
                              alert('Nama Teknisi, Tindakan Perbaikan, dan Tanggal Perbaikan wajib diisi!');
                              return;
                            }
                            onReportRepair(selectedSpk.id, teknisiName, tindakPerbaikan, repairStatusChoice, tanggalPerbaikan, jenisPekerjaan);
                            setSelectedSpk(null);
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-500/10 active:scale-98"
                          id="btn-save-repair"
                        >
                          Simpan Laporan Tindak Perbaikan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Otoritas: SPV */}
              {currentRole === 'SPV' && (
                <div className="space-y-3">
                  {selectedSpk.status === 'Menunggu Verifikasi' ? (
                    <div>
                      {selectedSpk.verifiedBySPV ? (
                        <div className="p-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 text-[11px]">
                          ✓ <strong>Anda sudah memverifikasi pekerjaan ini.</strong> Menunggu verifikasi kedua dari Head bagian sebelum ditutup otomatis.
                        </div>
                      ) : (
                        <div className="space-y-3 bg-[#0F1115] p-4 rounded-xl border border-white/5">
                          <p className="text-[11px] text-gray-400">Teknisi telah menyelesaikan tindakan perbaikan. Masukkan nama Anda dan berikan verifikasi pengawasan lapangan:</p>
                          
                          <div>
                            <label className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Nama Supervisor (SPV) Verifikator</label>
                            <input
                              type="text"
                              value={manualSpvName}
                              onChange={(e) => setManualSpvName(e.target.value)}
                              placeholder="Masukkan nama lengkap Anda..."
                              className="w-full bg-[#161B22] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                              id="spv-name-input"
                            />
                          </div>

                          <button
                            onClick={() => {
                              if (!manualSpvName.trim()) {
                                alert('Nama SPV Verifikator wajib diisi!');
                                return;
                              }
                              onVerifySPV(selectedSpk.id, `${manualSpvName.trim()} (SPV)`);
                              setSelectedSpk(null);
                            }}
                            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-green-500/10 active:scale-98"
                            id="btn-spv-verify"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Verifikasi Penyelesaian SPK (SPV)
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#0F1115] rounded-xl border border-white/5 text-[11px] text-gray-500">
                      Tidak ada tindakan verifikasi SPV yang diperlukan pada tahap status: <strong>{selectedSpk.status}</strong>.
                    </div>
                  )}
                </div>
              )}

              {/* Otoritas: HEAD */}
              {currentRole === 'Head' && (
                <div className="space-y-4">
                  
                  {/* Action 1: Pending state */}
                  {selectedSpk.status === 'Pending' && (
                    <div className="space-y-4">
                      
                      {/* Sub-Action A: Department Head Approval (if not approved yet) */}
                      {!selectedSpk.approvedByDeptHead ? (
                        <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-3">
                          <span className="font-bold text-amber-400 text-[11px] block uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Persetujuan Head Departemen Terkait ({selectedSpk.bagian})
                          </span>
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            SPK diajukan dari bagian <strong>{selectedSpk.bagian}</strong>. Sesuai S.O.P, harus disetujui/di-ACC terlebih dahulu oleh Head Departemen terkait sebelum disetujui Head Teknik.
                          </p>
                          
                          <div className="space-y-2.5">
                            <div>
                              <label className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Nama Head Departemen Terkait (Manual ACC)</label>
                              <input
                                type="text"
                                value={manualHeadName}
                                onChange={(e) => setManualHeadName(e.target.value)}
                                placeholder="Masukkan nama Head Departemen Terkait..."
                                className="w-full bg-[#161B22] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                id="dept-head-name-input"
                              />
                            </div>
                            
                            <button
                              onClick={() => {
                                if (!manualHeadName.trim()) {
                                  alert('Nama Head Departemen Terkait wajib diisi!');
                                  return;
                                }
                                onApproveDeptHead(selectedSpk.id, `${manualHeadName.trim()} (Head ${selectedSpk.bagian})`);
                                setManualHeadName('');
                              }}
                              className="w-full py-2 bg-[#0F1115] hover:bg-[#1a1f26] text-gray-300 hover:text-white text-xs font-bold rounded-xl border border-white/5 transition cursor-pointer flex items-center justify-center gap-1"
                              id="btn-dept-approve-confirm"
                            >
                              <ShieldCheck className="w-4 h-4 text-amber-500" />
                              ACC Manual Head Departemen Terkait
                            </button>
                          </div>

                          {/* KETERANGAN BELUM ACC HEAD DEPARTEMEN TERKAIT UNTUK HEAD TEKNIK */}
                          <div className="p-3.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-[11px] font-medium leading-relaxed mt-2 space-y-2">
                            <div>
                              ⚠️ <strong>Keterangan:</strong> Belum di-ACC oleh Atasan Departemen {selectedSpk.bagian}. Sesuai prosedur, Head Teknik dilarang menyetujui (Approve) SPK ini dan harus menolaknya.
                            </div>
                            
                            <div className="pt-2.5 border-t border-red-500/10 space-y-2">
                              <label className="text-[9px] text-gray-400 font-bold block uppercase">Nama Head Teknik Penolak</label>
                              <input
                                type="text"
                                value={manualHeadName}
                                onChange={(e) => setManualHeadName(e.target.value)}
                                placeholder="Masukkan nama Head Teknik..."
                                className="w-full bg-[#0F1115] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                id="head-teknik-auto-reject-input"
                              />
                              <button
                                onClick={() => {
                                  if (!manualHeadName.trim()) {
                                    alert('Nama Head Teknik wajib diisi untuk melakukan penolakan!');
                                    return;
                                  }
                                  const reason = `Ditolak otomatis oleh Head Teknik karena SPK belum disetujui (ACC) oleh Head/Atasan departemen terkait (${selectedSpk.bagian}).`;
                                  onRejectSPK(selectedSpk.id, `${manualHeadName.trim()} (Head Teknik)`, reason);
                                  setSelectedSpk(null);
                                  setManualHeadName('');
                                }}
                                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-red-500/10"
                                id="btn-head-auto-reject"
                              >
                                <XCircle className="w-4 h-4" />
                                Otomatis Tolak (Reject) SPK
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Sub-Action B: Head Teknik Approval (Only when Department Head has approved) */
                        <div className="space-y-3">
                          <div className="p-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 text-[11px] font-medium">
                            ✓ <strong>Sudah di-ACC oleh Head Departemen Terkait:</strong> disetujui oleh {selectedSpk.deptHeadName}. Sekarang Head Teknik dapat memproses Approval instruksi kerja.
                          </div>

                          {!showRejectForm ? (
                            <div className="bg-[#0F1115] p-4 rounded-xl border border-white/5 space-y-3">
                              <span className="font-bold text-white text-[11px] block uppercase tracking-wider">Otorisasi Kelayakan Head Teknik</span>
                              
                              <div className="space-y-3">
                                <div>
                                  <label className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Nama Head Teknik Penyetuju</label>
                                  <input
                                    type="text"
                                    value={manualHeadName}
                                    onChange={(e) => setManualHeadName(e.target.value)}
                                    placeholder="Masukkan nama Head Teknik..."
                                    className="w-full bg-[#161B22] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    id="head-teknik-approve-input"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-1">
                                  <button
                                    onClick={() => {
                                      if (!manualHeadName.trim()) {
                                        alert('Nama Head Teknik wajib diisi!');
                                        return;
                                      }
                                      onApproveSPK(selectedSpk.id, `${manualHeadName.trim()} (Head Teknik)`);
                                      setSelectedSpk(null);
                                    }}
                                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-blue-500/10 active:scale-98"
                                    id="btn-head-approve"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approve SPK
                                  </button>
                                  <button
                                    onClick={() => setShowRejectForm(true)}
                                    className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition cursor-pointer flex items-center justify-center gap-1"
                                    id="btn-head-reject-trigger"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Tolak SPK
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 space-y-3 animate-fadeIn">
                              <span className="font-bold text-red-400 text-[11px] block">Formulir Alasan Penolakan SPK</span>
                              
                              <div className="space-y-3">
                                <div>
                                  <label className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Nama Head Teknik Penolak</label>
                                  <input
                                    type="text"
                                    value={manualHeadName}
                                    onChange={(e) => setManualHeadName(e.target.value)}
                                    placeholder="Masukkan nama Head Teknik..."
                                    className="w-full bg-[#161B22] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    id="head-teknik-reject-input"
                                  />
                                </div>

                                <textarea
                                  rows={2}
                                  required
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Tuliskan secara objektif alasan penolakan instruksi kerja SPK ini..."
                                  className="w-full bg-[#161B22] text-white text-xs px-3 py-1.5 rounded-lg border border-red-500/20 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                                  id="rejection-reason-input"
                                />

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      if (!manualHeadName.trim()) {
                                        alert('Nama Head Teknik wajib diisi!');
                                        return;
                                      }
                                      if (!rejectionReason.trim()) {
                                        alert('Alasan penolakan wajib ditulis!');
                                        return;
                                      }
                                      onRejectSPK(selectedSpk.id, `${manualHeadName.trim()} (Head Teknik)`, rejectionReason.trim());
                                      setSelectedSpk(null);
                                    }}
                                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer shadow-md shadow-red-500/10 active:scale-98"
                                    id="btn-head-reject-confirm"
                                  >
                                    Konfirmasi Tolak
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowRejectForm(false)}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 text-[11px] font-bold rounded-lg transition cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action 2: Verifikasi Kedua */}
                  {selectedSpk.status === 'Menunggu Verifikasi' && (
                    <div>
                      {selectedSpk.verifiedByHead ? (
                        <div className="p-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 text-[11px]">
                          ✓ <strong>Anda sudah memverifikasi pekerjaan ini.</strong> Menunggu verifikasi pertama dari SPV bagian sebelum ditutup otomatis.
                        </div>
                      ) : (
                        <div className="space-y-3 bg-[#0F1115] p-4 rounded-xl border border-white/5">
                          <p className="text-[11px] text-gray-400">Pekerjaan perbaikan telah diajukan oleh teknisi. Masukkan nama Anda dan berikan verifikasi kelayakan manajerial:</p>
                          
                          <div>
                            <label className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Nama Head Teknik Verifikator</label>
                            <input
                              type="text"
                              value={manualHeadName}
                              onChange={(e) => setManualHeadName(e.target.value)}
                              placeholder="Masukkan nama lengkap Anda..."
                              className="w-full bg-[#161B22] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              id="head-verify-name-input"
                            />
                          </div>

                          <button
                            onClick={() => {
                              if (!manualHeadName.trim()) {
                                alert('Nama Head Verifikator wajib diisi!');
                                return;
                              }
                              onVerifyHead(selectedSpk.id, `${manualHeadName.trim()} (Head Teknik)`);
                              setSelectedSpk(null);
                            }}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-blue-500/10 active:scale-98"
                            id="btn-head-verify"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Verifikasi Penyelesaian SPK (Head)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other states */}
                  {selectedSpk.status !== 'Pending' && selectedSpk.status !== 'Menunggu Verifikasi' && (
                    <div className="p-3 bg-[#0F1115] rounded-xl border border-white/5 text-[11px] text-gray-500">
                      Tidak ada tindakan Kepala Departemen (Head) yang diperlukan pada tahap status: <strong>{selectedSpk.status}</strong>.
                    </div>
                  )}

                  {/* Delete Action For Head */}
                  <div className="pt-4 border-t border-white/5 space-y-2 mt-4">
                    <span className="text-[10px] text-red-500 font-bold block uppercase tracking-wider mb-2">
                      Otoritas Hapus Data (Khusus Head)
                    </span>
                    <p className="text-[11px] text-gray-400 mb-3">
                      Gunakan fitur ini untuk menghapus data test/coba-coba. Tindakan ini permanen.
                    </p>
                    <button
                      onClick={() => {
                        if (window.confirm("Yakin ingin menghapus SPK ini secara permanen?")) {
                          onDeleteSPK(selectedSpk.id);
                          setSelectedSpk(null);
                        }
                      }}
                      className="w-full py-2 bg-red-900/40 hover:bg-red-800 text-red-200 text-xs font-bold rounded-xl border border-red-500/30 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus SPK Permanen
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 space-y-3" id="no-spk-selected">
            <Clock className="w-12 h-12 text-gray-800 mx-auto" />
            <div>
              <p className="font-bold text-xs text-gray-400 animate-pulse">Detail Dokumen & Tindakan</p>
              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Silakan pilih salah satu SPK di sebelah kiri untuk melihat detail alur persetujuan & melakukan tindakan otorisasi.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
