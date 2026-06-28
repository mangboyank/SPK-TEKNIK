import React, { useState } from 'react';
import { SPK } from '../types';
import { Clock, CheckCircle2, AlertTriangle, PlayCircle, ClipboardList, XCircle } from 'lucide-react';
import SPKDetailModal from './SPKDetailModal';

interface DashboardStatsProps {
  spks: SPK[];
  onSelectSPKDirectly?: (spkId: string) => void;
}

export default function DashboardStats({ spks, onSelectSPKDirectly }: DashboardStatsProps) {
  // State for SPK Explorer detailed modal
  const [showExplorer, setShowExplorer] = useState(false);
  const [explorerCategory, setExplorerCategory] = useState<'all' | 'open' | 'progress' | 'close' | 'rejected'>('all');

  const openExplorer = (category: 'all' | 'open' | 'progress' | 'close' | 'rejected') => {
    setExplorerCategory(category);
    setShowExplorer(true);
  };

  // Counters
  const totalSPK = spks.length;
  const openSPK = spks.filter(s => s.status !== 'Closed' && s.status !== 'Rejected' && s.status !== 'Menunggu Sparepart').length;
  const closedSPK = spks.filter(s => s.status === 'Closed').length;
  const sparepartSPK = spks.filter(s => s.status === 'Menunggu Sparepart').length;
  const pendingSPK = spks.filter(s => s.status === 'Pending').length;
  const rejectedSPK = spks.filter(s => s.status === 'Rejected').length;

  return (
    <div className="space-y-6" id="dashboard-section">
      {/* Core Summary Cards with Rejected column */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total SPK */}
        <div 
          onClick={() => openExplorer('all')}
          className="bg-[#161B22] p-5 rounded-2xl border border-white/5 flex items-center justify-between transition hover:border-blue-500/40 hover:bg-[#1a202a] active:scale-98 cursor-pointer group" 
          id="metric-total-spk"
          title="Klik untuk rincian semua SPK"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total SPK Masuk</p>
              <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded-md font-bold group-hover:bg-blue-500/20">Detail</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold font-sans text-white">{totalSPK}</span>
              <span className="text-xs text-gray-500 font-medium">dokumen</span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              {pendingSPK} SPK baru diajukan
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 transition group-hover:scale-110">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: SPK Open */}
        <div 
          onClick={() => openExplorer('open')}
          className="bg-[#161B22] p-5 rounded-2xl border border-white/5 flex items-center justify-between transition hover:border-amber-500/40 hover:bg-[#1a202a] active:scale-98 cursor-pointer group" 
          id="metric-open-spk"
          title="Klik untuk rincian SPK Open"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">SPK Status Open</p>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded-md font-bold group-hover:bg-amber-500/20">Detail</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold font-sans text-amber-400">{openSPK}</span>
              <span className="text-xs text-gray-500 font-medium">aktif</span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Persetujuan & approval berjalan
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 transition group-hover:scale-110">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: SPK Close */}
        <div 
          onClick={() => openExplorer('close')}
          className="bg-[#161B22] p-5 rounded-2xl border border-white/5 flex items-center justify-between transition hover:border-emerald-500/40 hover:bg-[#1a202a] active:scale-98 cursor-pointer group" 
          id="metric-close-spk"
          title="Klik untuk rincian SPK Closed"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">SPK Status Closed</p>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded-md font-bold group-hover:bg-emerald-500/20">Detail</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold font-sans text-emerald-400">{closedSPK}</span>
              <span className="text-xs text-gray-500 font-medium">selesai</span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
              <span className="text-emerald-400 font-semibold">
                {totalSPK > 0 ? Math.round((closedSPK / totalSPK) * 100) : 0}%
              </span>
              rasio penyelesaian
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 transition group-hover:scale-110">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Menunggu Sparepart */}
        <div 
          onClick={() => openExplorer('progress')}
          className="bg-[#161B22] p-5 rounded-2xl border border-white/5 flex items-center justify-between transition hover:border-orange-500/40 hover:bg-[#1a202a] active:scale-98 cursor-pointer group" 
          id="metric-sparepart-spk"
          title="Klik untuk rincian SPK On Progress / Sparepart"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menunggu Sparepart</p>
              <span className="text-[9px] bg-orange-500/10 text-orange-400 px-1.5 py-0.2 rounded-md font-bold group-hover:bg-orange-500/20">Detail</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold font-sans text-orange-400">{sparepartSPK}</span>
              <span className="text-xs text-gray-500 font-medium">tertunda</span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-bounce"></span>
              Butuh purchasing / material
            </div>
          </div>
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 transition group-hover:scale-110">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 5: SPK Ditolak */}
        <div 
          onClick={() => openExplorer('rejected')}
          className="bg-[#161B22] p-5 rounded-2xl border border-white/5 flex items-center justify-between transition hover:border-red-500/40 hover:bg-[#1a202a] active:scale-98 cursor-pointer group" 
          id="metric-rejected-spk"
          title="Klik untuk rincian SPK Ditolak"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">SPK Ditolak</p>
              <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.2 rounded-md font-bold group-hover:bg-red-500/20">Detail</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold font-sans text-red-400">{rejectedSPK}</span>
              <span className="text-xs text-gray-500 font-medium">ditolak</span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
              Tidak disetujui / dibatalkan
            </div>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 transition group-hover:scale-110">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Explorer Modal overlay */}
      <SPKDetailModal 
        isOpen={showExplorer}
        onClose={() => setShowExplorer(false)}
        spks={spks}
        initialActiveCategory={explorerCategory}
        onSelectSPKDirectly={onSelectSPKDirectly}
      />
    </div>
  );
}
