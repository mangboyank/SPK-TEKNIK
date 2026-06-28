import React, { useState, useMemo } from 'react';
import { SPK } from '../types';
import { 
  X, 
  Search, 
  Filter, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Wrench, 
  Layers, 
  Settings, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Building2 
} from 'lucide-react';

interface SPKDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  spks: SPK[];
  initialActiveCategory?: 'all' | 'open' | 'progress' | 'close' | 'rejected';
  onSelectSPKDirectly?: (spkId: string) => void;
}

export default function SPKDetailModal({ 
  isOpen, 
  onClose, 
  spks, 
  initialActiveCategory = 'all',
  onSelectSPKDirectly
}: SPKDetailModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBagian, setSelectedBagian] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'progress' | 'close' | 'rejected'>(initialActiveCategory);

  // 1. Group SPKs into Open, Progress, Close, and Rejected
  const categorized = useMemo(() => {
    const openList: SPK[] = [];
    const progressList: SPK[] = [];
    const closeList: SPK[] = [];
    const rejectedList: SPK[] = [];

    spks.forEach(spk => {
      // Apply filters first
      const matchesSearch = 
        spk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spk.diajukanOleh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spk.namaMesin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spk.deskripsiMasalah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (spk.teknisiNama || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBagian = selectedBagian === 'All' || spk.bagian === selectedBagian;

      if (matchesSearch && matchesBagian) {
        if (spk.status === 'Pending') {
          openList.push(spk);
        } else if (spk.status === 'Approved' || spk.status === 'Menunggu Sparepart' || spk.status === 'Menunggu Verifikasi') {
          progressList.push(spk);
        } else if (spk.status === 'Closed') {
          closeList.push(spk);
        } else if (spk.status === 'Rejected') {
          rejectedList.push(spk);
        }
      }
    });

    return {
      open: openList,
      progress: progressList,
      close: closeList,
      rejected: rejectedList,
      total: openList.length + progressList.length + closeList.length + rejectedList.length
    };
  }, [spks, searchQuery, selectedBagian]);

  const bagianOptions = ['All', 'Produksi', 'QUA', 'HRDGA', 'WHM', 'Purchasing', 'Logistik', 'Manajemen'];

  const getStatusBadge = (spk: SPK) => {
    switch (spk.status) {
      case 'Pending':
        if (!spk.approvedByDeptHead) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold rounded-lg animate-pulse">
              <Clock className="w-3 h-3" />
              MENUNGGU ACC HEAD {spk.bagian.toUpperCase()}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-bold rounded-lg">
            <Clock className="w-3 h-3" />
            MENUNGGU OTORITAS TEKNIK
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-bold rounded-lg">
            <PlayCircle className="w-3 h-3" />
            DALAM PENGERJAAN
          </span>
        );
      case 'Menunggu Sparepart':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 border border-orange-500/25 text-orange-400 text-[10px] font-bold rounded-lg">
            <AlertTriangle className="w-3 h-3" />
            TERTUNDA SPAREPART
          </span>
        );
      case 'Menunggu Verifikasi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[10px] font-bold rounded-lg">
            <Settings className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
            MENUNGGU VERIFIKASI
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold rounded-lg">
            <CheckCircle2 className="w-3 h-3" />
            SELESAI & CLOSED
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-bold rounded-lg">
            <XCircle className="w-3 h-3" />
            DITOLAK
          </span>
        );
    }
  };

  const getBagianColor = (bagian: string) => {
    switch (bagian) {
      case 'Produksi': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'QUA': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'HRDGA': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'WHM': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Purchasing': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'Logistik': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Render list of SPKs for a specific group
  const renderSPKList = (list: SPK[], groupTitle: string, accentColor: string, emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-white/5 rounded-2xl bg-[#0F1115]/30">
          <Layers className="w-10 h-10 text-gray-600 mb-2.5" />
          <p className="text-xs text-gray-400 font-medium">{emptyMessage}</p>
          <p className="text-[10px] text-gray-500 mt-1">Gunakan kata kunci pencarian atau filter bagian lain.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
        {list.map((spk) => (
          <div 
            key={spk.id}
            onClick={() => {
              if (onSelectSPKDirectly) {
                onSelectSPKDirectly(spk.id);
                onClose();
              }
            }}
            className="p-4 bg-[#0F1115]/60 border border-white/5 hover:border-blue-500/35 hover:bg-blue-500/[0.02] rounded-2xl transition duration-150 space-y-3 group cursor-pointer active:scale-[0.99]"
            title="Klik untuk mengarahkan langsung ke tindakan perbaikan"
          >
            {/* Header: ID and Bagian */}
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-0.5">
                <span className="font-mono text-xs font-bold text-blue-400 block group-hover:text-blue-300 transition">
                  {spk.id}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Calendar className="w-3 h-3 text-gray-600" />
                  <span>{spk.tanggalPengajuan}</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getBagianColor(spk.bagian)}`}>
                {spk.bagian}
              </span>
            </div>

            {/* Mesin & Keluhan */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {spk.namaMesin}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed bg-white/[0.01] p-2.5 rounded-xl border border-white/5 font-medium italic">
                "{spk.deskripsiMasalah}"
              </p>
            </div>

            {/* Pelapor Info */}
            <div className="flex items-center gap-2 text-[11px] text-gray-400 border-t border-white/5 pt-2.5">
              <div className="flex items-center gap-1 text-gray-500">
                <User className="w-3.5 h-3.5" />
                <span>Pelapor:</span>
              </div>
              <span className="font-semibold text-gray-300">{spk.diajukanOleh}</span>
            </div>

            {/* Technician Actions & Perbaikan (If Approved/In-progress or Closed) */}
            {(spk.teknisiNama || spk.tindakPerbaikan) && (
              <div className="p-2.5 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-1 text-[11px]">
                {spk.teknisiNama && (
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-gray-400">Teknisi:</span>
                    <strong className="text-blue-400 font-medium">{spk.teknisiNama}</strong>
                  </div>
                )}
                {spk.tindakPerbaikan && (
                  <div className="space-y-0.5 mt-1 border-t border-blue-500/5 pt-1">
                    <span className="text-gray-500 text-[10px] block font-bold uppercase tracking-wider">Tindakan Perbaikan:</span>
                    <p className="text-gray-300 text-xs italic font-medium leading-relaxed">"{spk.tindakPerbaikan}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Approval / Verification audit trail */}
            <div className="flex justify-between items-center gap-2 border-t border-white/5 pt-2.5 text-[10px] text-gray-500">
              <div>
                {spk.approvedBy && (
                  <span className="block">Approved by: <strong className="text-gray-400 font-medium">{spk.approvedBy}</strong></span>
                )}
                {spk.verifiedByHeadNama && (
                  <span className="block text-emerald-400/80 font-medium">✓ Closed & Verified by Head</span>
                )}
              </div>
              <div>
                {getStatusBadge(spk)}
              </div>
            </div>

          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div 
        className="w-full max-w-6xl bg-[#161B22] rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-scaleIn"
        id="spk-detail-explorer-modal"
      >
        {/* Modal Header */}
        <div className="bg-[#0F1115] px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">Detail Pemantauan Kategori SPK</h2>
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              Menampilkan rincian SPK aktif yang terkelompokkan dalam kategori Open, Progress, dan Close secara detail.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/5 transition cursor-pointer active:scale-95"
            id="btn-close-explorer-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters and Search Tools */}
        <div className="p-4 sm:p-5 bg-[#12161D] border-b border-white/5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No SPK, Pelapor, Mesin, Keluhan, Teknisi..."
              className="w-full bg-[#161B22] text-[#E0E0E0] placeholder-gray-500 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium"
              id="explorer-search-input"
            />
          </div>

          {/* Department filter */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Bagian:</span>
            <div className="relative w-full">
              <select
                value={selectedBagian}
                onChange={(e) => setSelectedBagian(e.target.value)}
                className="w-full bg-[#161B22] text-[#E0E0E0] text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-semibold"
                id="explorer-dept-select"
              >
                {bagianOptions.map(opt => (
                  <option key={opt} value={opt}>{opt === 'All' ? 'Semua Bagian / Dept' : opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Total Counter Badge */}
          <div className="md:col-span-3 flex justify-end">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-xl w-full md:w-auto justify-center">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Ditemukan: <strong className="font-mono">{categorized.total}</strong> SPK</span>
            </div>
          </div>

        </div>

        {/* Mobile Tab Switche (Visible only on mobile screens) */}
        <div className="flex md:hidden bg-[#0F1115] p-1 border-b border-white/5 overflow-x-auto whitespace-nowrap">
          {(['all', 'open', 'progress', 'close', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[70px] py-2 text-[11px] font-bold rounded-lg capitalize transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'Semua' : tab === 'rejected' ? 'Ditolak' : tab}
              <span className="ml-1 px-1 py-0.2 bg-white/10 text-[9px] rounded font-mono">
                {tab === 'all' && categorized.total}
                {tab === 'open' && categorized.open.length}
                {tab === 'progress' && categorized.progress.length}
                {tab === 'close' && categorized.close.length}
                {tab === 'rejected' && categorized.rejected.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content Board */}
        <div className="p-5 flex-1 overflow-hidden bg-[#161B22]">
          
          {/* Desktop Board: 4 Grid Columns (Hidden on mobile) */}
          <div className="hidden md:grid grid-cols-4 gap-4 h-full overflow-hidden">
            
            {/* Column 1: OPEN */}
            <div className="flex flex-col h-full space-y-3 min-w-0">
              <div className="flex items-center justify-between pb-2.5 border-b-2 border-amber-500/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <h3 className="text-xs font-extrabold text-[#E0E0E0] uppercase tracking-wider">
                    1. OPEN SPK
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg font-mono">
                  {categorized.open.length} SPK
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                {renderSPKList(
                  categorized.open, 
                  'OPEN', 
                  'amber', 
                  'Tidak ada SPK berstatus Open (Pending)'
                )}
              </div>
            </div>

            {/* Column 2: PROGRESS */}
            <div className="flex flex-col h-full space-y-3 min-w-0">
              <div className="flex items-center justify-between pb-2.5 border-b-2 border-blue-500/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce"></span>
                  <h3 className="text-xs font-extrabold text-[#E0E0E0] uppercase tracking-wider">
                    2. PROGRESS SPK
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg font-mono">
                  {categorized.progress.length} SPK
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                {renderSPKList(
                  categorized.progress, 
                  'PROGRESS', 
                  'blue', 
                  'Tidak ada SPK berstatus On Progress'
                )}
              </div>
            </div>

            {/* Column 3: CLOSED */}
            <div className="flex flex-col h-full space-y-3 min-w-0">
              <div className="flex items-center justify-between pb-2.5 border-b-2 border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="text-xs font-extrabold text-[#E0E0E0] uppercase tracking-wider">
                    3. CLOSED SPK
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg font-mono">
                  {categorized.close.length} SPK
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                {renderSPKList(
                  categorized.close, 
                  'CLOSED', 
                  'emerald', 
                  'Tidak ada SPK berstatus Closed (Selesai)'
                )}
              </div>
            </div>

            {/* Column 4: REJECTED */}
            <div className="flex flex-col h-full space-y-3 min-w-0">
              <div className="flex items-center justify-between pb-2.5 border-b-2 border-red-500/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <h3 className="text-xs font-extrabold text-[#E0E0E0] uppercase tracking-wider">
                    4. DITOLAK SPK
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg font-mono">
                  {categorized.rejected.length} SPK
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                {renderSPKList(
                  categorized.rejected, 
                  'REJECTED', 
                  'red', 
                  'Tidak ada SPK berstatus Ditolak'
                )}
              </div>
            </div>

          </div>

          {/* Mobile Single-Column representation (Toggleable via activeTab) */}
          <div className="block md:hidden h-full overflow-hidden">
            {activeTab === 'all' && (
              <div className="space-y-6 h-full overflow-y-auto pb-8">
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    OPEN ({categorized.open.length})
                  </h4>
                  {renderSPKList(categorized.open, 'OPEN', 'amber', 'Tidak ada SPK Open')}
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    PROGRESS ({categorized.progress.length})
                  </h4>
                  {renderSPKList(categorized.progress, 'PROGRESS', 'blue', 'Tidak ada SPK On Progress')}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    CLOSED ({categorized.close.length})
                  </h4>
                  {renderSPKList(categorized.close, 'CLOSED', 'emerald', 'Tidak ada SPK Closed')}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-red-500 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    DITOLAK ({categorized.rejected.length})
                  </h4>
                  {renderSPKList(categorized.rejected, 'REJECTED', 'red', 'Tidak ada SPK Ditolak')}
                </div>
              </div>
            )}

            {activeTab === 'open' && renderSPKList(categorized.open, 'OPEN', 'amber', 'Tidak ada SPK Open')}
            {activeTab === 'progress' && renderSPKList(categorized.progress, 'PROGRESS', 'blue', 'Tidak ada SPK On Progress')}
            {activeTab === 'close' && renderSPKList(categorized.close, 'CLOSED', 'emerald', 'Tidak ada SPK Closed')}
            {activeTab === 'rejected' && renderSPKList(categorized.rejected, 'REJECTED', 'red', 'Tidak ada SPK Ditolak')}
          </div>

        </div>

        {/* Footer info banner */}
        <div className="bg-[#0F1115] px-6 py-4 border-t border-white/5 text-center text-[10px] text-gray-500">
          Sistem Verifikasi Audit internal didukung oleh enkripsi tanda tangan digital Pelapor, Teknisi, SPV, dan Head.
        </div>
      </div>
    </div>
  );
}
