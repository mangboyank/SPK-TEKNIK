import React, { useState, useMemo } from 'react';
import { SPK } from '../types';
import { 
  TrendingUp, 
  Settings, 
  Users, 
  Wrench, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Calendar,
  AlertTriangle,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';

interface DataAnalysisPanelProps {
  spks: SPK[];
}

export default function DataAnalysisPanel({ spks }: DataAnalysisPanelProps) {
  const [trendView, setTrendView] = useState<'mingguan' | 'bulanan' | 'tahunan'>('bulanan');

  // 1. Calculations: Pencapaian SPK Masuk vs Close
  const stats = useMemo(() => {
    const total = spks.length;
    const closed = spks.filter(s => s.status === 'Closed').length;
    const pending = spks.filter(s => s.status === 'Pending').length;
    const rejected = spks.filter(s => s.status === 'Rejected').length;
    const active = total - closed - rejected; // Pending, Approved, Menunggu Sparepart, etc.
    
    // SPK yang direject tidak usah dihitung dalam total rate persentase pencapaian
    const totalForPercentage = total - rejected;
    const percentage = totalForPercentage > 0 ? Math.round((closed / totalForPercentage) * 100) : 0;
    
    return {
      total,
      closed,
      pending,
      rejected,
      active,
      percentage
    };
  }, [spks]);

  // 2. Calculations: Mesin yang Sering Rusak (Top 5)
  const machinesAnalysis = useMemo(() => {
    const counts: { [key: string]: { canonicalName: string; count: number } } = {};
    spks.forEach(s => {
      if (s.namaMesin) {
        const nameRaw = s.namaMesin.trim();
        const key = nameRaw.toLowerCase();
        if (!counts[key]) {
          counts[key] = { canonicalName: nameRaw, count: 0 };
        }
        counts[key].count++;
      }
    });

    const list = Object.entries(counts).map(([key, data]) => {
      const formattedName = data.canonicalName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      return {
        name: formattedName,
        count: data.count,
        percentage: spks.length > 0 ? Math.round((data.count / spks.length) * 100) : 0
      };
    });

    // Sort descending
    return list.sort((a, b) => b.count - a.count).slice(0, 5);
  }, [spks]);

  // 3. Calculations: Siapa yang Sering Melakukan Perbaikan (Technician performance)
  const techniciansAnalysis = useMemo(() => {
    const completedCounts: { [key: string]: { canonicalName: string; completed: number; totalMinutes: number; types: { [key: string]: number } } } = {};
    
    spks.forEach(s => {
      // Only count Closed jobs with assigned technicians
      if (s.status === 'Closed' && s.teknisiNama) {
        const nameRaw = s.teknisiNama.replace(' (Teknik)', '').trim();
        const key = nameRaw.toLowerCase();
        if (!completedCounts[key]) {
          completedCounts[key] = { canonicalName: nameRaw, completed: 0, totalMinutes: 0, types: {} };
        }
        completedCounts[key].completed++;
        if (s.repairDurationMinutes !== undefined) {
          completedCounts[key].totalMinutes += s.repairDurationMinutes;
        }
        if (s.jenisPekerjaan) {
          completedCounts[key].types[s.jenisPekerjaan] = (completedCounts[key].types[s.jenisPekerjaan] || 0) + 1;
        }
      }
    });

    const list = Object.entries(completedCounts).map(([key, data]) => {
      const avgTime = data.completed > 0 ? Math.round(data.totalMinutes / data.completed) : 0;
      // Find main specialty
      let mainSpecialty = 'Perbaikan';
      let maxCount = 0;
      Object.entries(data.types).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mainSpecialty = type;
        }
      });

      const formattedName = data.canonicalName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

      return {
        name: formattedName,
        completed: data.completed,
        avgTime,
        mainSpecialty
      };
    });

    // Sort by completed descending
    return list.sort((a, b) => b.completed - a.completed);
  }, [spks]);

  // 4. Calculations: Trend Mingguan, Bulanan, Tahunan
  const trendData = useMemo(() => {
    // Helper to get week of year or month name
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    if (trendView === 'mingguan') {
      // Group by Week 1 to Week 4 based on date (simulated based on the last 4 calendar weeks)
      const weeklyCounts = {
        'Minggu 1': 0,
        'Minggu 2': 0,
        'Minggu 3': 0,
        'Minggu 4': 0,
      };

      const weeklyClosed = {
        'Minggu 1': 0,
        'Minggu 2': 0,
        'Minggu 3': 0,
        'Minggu 4': 0,
      };

      spks.forEach(s => {
        const date = new Date(s.tanggalPengajuan);
        const day = date.getDate();
        let week = 'Minggu 4';
        if (day <= 7) week = 'Minggu 1';
        else if (day <= 14) week = 'Minggu 2';
        else if (day <= 21) week = 'Minggu 3';

        weeklyCounts[week]++;
        if (s.status === 'Closed') {
          weeklyClosed[week]++;
        }
      });

      return Object.keys(weeklyCounts).map(week => ({
        label: week,
        masuk: weeklyCounts[week as keyof typeof weeklyCounts],
        closed: weeklyClosed[week as keyof typeof weeklyClosed]
      }));
    } else if (trendView === 'bulanan') {
      const monthlyCounts: { [key: string]: number } = {};
      const monthlyClosed: { [key: string]: number } = {};

      // Initialize last 6 months
      const currentMonth = new Date().getMonth();
      for (let i = 5; i >= 0; i--) {
        const mIdx = (currentMonth - i + 12) % 12;
        monthlyCounts[months[mIdx]] = 0;
        monthlyClosed[months[mIdx]] = 0;
      }

      spks.forEach(s => {
        const date = new Date(s.tanggalPengajuan);
        const mName = months[date.getMonth()];
        if (monthlyCounts[mName] !== undefined) {
          monthlyCounts[mName]++;
          if (s.status === 'Closed') {
            monthlyClosed[mName]++;
          }
        }
      });

      return Object.keys(monthlyCounts).map(label => ({
        label,
        masuk: monthlyCounts[label],
        closed: monthlyClosed[label]
      }));
    } else {
      // Yearly
      const yearlyCounts: { [key: string]: number } = { '2024': 0, '2025': 0, '2026': 0 };
      const yearlyClosed: { [key: string]: number } = { '2024': 0, '2025': 0, '2026': 0 };

      spks.forEach(s => {
        const date = new Date(s.tanggalPengajuan);
        const year = date.getFullYear().toString();
        if (yearlyCounts[year] !== undefined) {
          yearlyCounts[year]++;
          if (s.status === 'Closed') {
            yearlyClosed[year]++;
          }
        }
      });

      return Object.keys(yearlyCounts).map(label => ({
        label,
        masuk: yearlyCounts[label],
        closed: yearlyClosed[label]
      }));
    }
  }, [spks, trendView]);

  // Find max value in trend data for SVG scaling
  const maxTrendValue = useMemo(() => {
    const values = trendData.flatMap(d => [d.masuk, d.closed]);
    return Math.max(...values, 5); // Default to at least 5 to avoid division by zero & preserve scale
  }, [trendData]);

  return (
    <div className="space-y-6" id="panel-analisa-data">
      
      {/* Title block */}
      <div className="p-6 bg-[#161B22] border border-white/5 rounded-2xl flex items-center gap-4">
        <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-white">Panel Analisa Data & KPI Teknik</h2>
          <p className="text-xs text-gray-400">Analisa efisiensi, produktivitas teknisi pelaksana, tingkat keseringan kerusakan mesin, dan visualisasi trend.</p>
        </div>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Ring Chart Percentage & Detailed Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-[#161B22] p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-6" id="section-pencapaian-spk">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pencapaian SPK Selesai (Closed Rate)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Ring Progress SVG */}
              <div className="md:col-span-5 flex justify-center py-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Track */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="rgba(255, 255, 255, 0.05)" 
                      strokeWidth="9" 
                      fill="transparent" 
                    />
                    {/* Fill arc */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="#10b981" 
                      strokeWidth="9" 
                      fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.percentage / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  {/* Absolute ring label */}
                  <div className="absolute text-center space-y-0.5">
                    <span className="text-3xl font-black text-white font-sans">{stats.percentage}%</span>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-widest">Selesai</span>
                  </div>
                </div>
              </div>

              {/* Detailed Counter Stats */}
              <div className="md:col-span-7 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#0F1115] p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total SPK Masuk</span>
                    <span className="text-xl font-extrabold text-white font-mono block mt-1">{stats.total}</span>
                  </div>
                  <div className="bg-[#0F1115] p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">SPK Closed</span>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono block mt-1">{stats.closed}</span>
                  </div>
                </div>

                {/* Sub-breakdown rows */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Masih Aktif / Dalam Proses
                    </span>
                    <span className="font-bold text-white font-mono">{stats.active} SPK</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Menunggu Approval
                    </span>
                    <span className="font-bold text-white font-mono">{stats.pending} SPK</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Ditolak (Rejected)
                    </span>
                    <span className="font-bold text-white font-mono">{stats.rejected} SPK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[11px] text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span><strong>Target KPI:</strong> Rasio penyelesaian SPK ditargetkan berada di atas 85% setiap bulannya. Status saat ini sangat memuaskan.</span>
          </div>
        </div>

        {/* Mesin yang Sering Rusak (5 Cols) */}
        <div className="lg:col-span-5 bg-[#161B22] p-6 rounded-2xl border border-white/5 flex flex-col justify-between" id="section-mesin-rusak">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-red-500 rounded-full"></span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Mesin Sering Rusak</h3>
              </div>
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-full">Frekuensi</span>
            </div>

            <div className="space-y-4 pt-1">
              {machinesAnalysis.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500">
                  Belum ada data pengajuan SPK untuk menganalisa mesin rusak.
                </div>
              ) : (
                machinesAnalysis.map((machine, idx) => (
                  <div key={machine.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-300 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-white/5 text-gray-400 text-[10px] flex items-center justify-center font-bold font-mono">
                          #{idx + 1}
                        </span>
                        {machine.name}
                      </span>
                      <span className="font-mono text-white font-bold bg-[#0F1115] border border-white/5 px-2 py-0.5 rounded-lg text-[10px]">
                        {machine.count} SPK
                      </span>
                    </div>

                    {/* Progress representation */}
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(machine.percentage, 8)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-[10px] text-gray-500 leading-normal pt-4 mt-4 border-t border-white/5 italic">
            * Data dihitung berdasarkan total seluruh riwayat dokumen SPK masuk untuk mendeteksi anomali kegagalan berulang.
          </p>
        </div>

      </div>

      {/* Grid Row 2: Trend and Technician Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Section (8 Cols) */}
        <div className="lg:col-span-8 bg-[#161B22] p-6 rounded-2xl border border-white/5 space-y-4" id="section-trend-analisa">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3 bg-blue-500 rounded-full"></span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trend Pengajuan VS Selesai</h3>
            </div>
            
            {/* View selectors */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setTrendView('mingguan')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                  trendView === 'mingguan' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setTrendView('bulanan')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                  trendView === 'bulanan' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setTrendView('tahunan')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                  trendView === 'tahunan' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Tahunan
              </button>
            </div>
          </div>

          {/* Custom SVG Trend Bar Chart */}
          <div className="p-4 bg-[#0F1115] border border-white/5 rounded-2xl">
            <div className="h-44 w-full flex items-end justify-around pt-4 pb-2">
              {trendData.map((data, idx) => {
                const safeMax = maxTrendValue > 0 ? maxTrendValue : 1;
                const masukHeightPct = Math.max(Math.round((data.masuk / safeMax) * 100), 2); 
                const closedHeightPct = Math.max(Math.round((data.closed / safeMax) * 100), 2);

                return (
                  <div key={`${data.label}-${idx}`} className="flex flex-col items-center gap-2.5 flex-1 max-w-[80px]">
                    {/* Bars Container */}
                    <div className="h-32 w-full flex items-end justify-center gap-1.5 relative group">
                      
                      {/* Bar 1: SPK Masuk */}
                      <div className="relative flex-1 flex flex-col items-center justify-end h-full">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-6 bg-blue-500 text-white font-bold font-mono text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          Masuk: {data.masuk}
                        </div>
                        <div 
                          className="w-3 sm:w-4 bg-blue-500 rounded-t-sm transition-all duration-700 hover:bg-blue-400 cursor-pointer"
                          style={{ height: `${masukHeightPct}%`, minHeight: '4px' }}
                        ></div>
                      </div>

                      {/* Bar 2: SPK Closed */}
                      <div className="relative flex-1 flex flex-col items-center justify-end h-full">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-6 bg-emerald-500 text-white font-bold font-mono text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          Selesai: {data.closed}
                        </div>
                        <div 
                          className="w-3 sm:w-4 bg-emerald-500 rounded-t-sm transition-all duration-700 hover:bg-emerald-400 cursor-pointer"
                          style={{ height: `${closedHeightPct}%`, minHeight: '4px' }}
                        ></div>
                      </div>

                    </div>

                    {/* Label */}
                    <span className="text-[10px] font-bold text-gray-400 truncate w-full text-center">{data.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Chart Legend */}
            <div className="flex justify-center gap-6 pt-3 mt-2 border-t border-white/5 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs"></span>
                SPK Baru Diajukan
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span>
                SPK Selesai Dikerjakan (Closed)
              </span>
            </div>
          </div>
        </div>

        {/* Technician Performance (4 Cols) */}
        <div className="lg:col-span-4 bg-[#161B22] p-6 rounded-2xl border border-white/5 space-y-4" id="section-technician-performance">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3 bg-purple-500 rounded-full"></span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pelaksana Perbaikan</h3>
            </div>
          </div>

          <div className="space-y-3">
            {techniciansAnalysis.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-500">
                Belum ada data tindakan perbaikan selesai oleh Teknisi.
              </div>
            ) : (
              techniciansAnalysis.map((tech, idx) => (
                <div key={tech.name} className="p-3 bg-[#0F1115]/50 border border-white/5 rounded-xl hover:border-purple-500/20 hover:bg-purple-500/5 transition flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {idx === 0 ? (
                      <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs" title="Teknisi Terproduktif">
                        👑
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{tech.name}</p>
                      <span className="text-[9px] bg-purple-500/15 text-purple-400 font-bold px-1.5 py-0.2 rounded mt-0.5 inline-block uppercase tracking-wide">
                        {tech.mainSpecialty}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">{tech.completed} Closed</p>
                    <p className="text-[9px] text-gray-500 font-mono font-medium">Rata-rata: {tech.avgTime}m</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
