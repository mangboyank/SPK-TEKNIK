import React, { useState, useEffect } from 'react';
import { SPK, BackupLog } from '../types';
import { Database, FileSpreadsheet, Server, RefreshCcw, Download, Terminal, AlertTriangle, Trash2, HardDrive, ShieldCheck } from 'lucide-react';
import { googleSignIn, getAccessToken, initAuth, logout } from '../lib/auth';
import { addBackupLog } from '../lib/dataService';

interface BackupPanelProps {
  spks: SPK[];
  logs: BackupLog[];
  onTriggerBackup: (type: 'Firebase' | 'Google Spreadsheet') => void;
  onExportXLS: () => void;
  onResetData?: () => void;
}

export default function BackupPanel({ spks, logs, onTriggerBackup, onExportXLS, onResetData }: BackupPanelProps) {
  const [activeTab, setActiveTab] = useState<'google_drive' | 'firebase'>('google_drive');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      () => setIsAuthenticated(true),
      () => setIsAuthenticated(false)
    );
    return () => unsubscribe();
  }, []);

  const handleDriveLogin = async () => {
    setIsAuthenticating(true);
    try {
      await googleSignIn();
      setIsAuthenticated(true);
    } catch (e) {
      console.error(e);
      alert('Gagal menghubungkan ke Google Drive');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const uploadToDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      setIsSyncing('Google Drive');

      const data = {
        timestamp: new Date().toISOString(),
        spks,
        logs
      };
      
      const fileContent = JSON.stringify(data, null, 2);
      const metadata = {
        name: `SPK_Backup_${new Date().toISOString().split('T')[0]}.json`,
        mimeType: 'application/json'
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });

      if (!response.ok) {
        throw new Error('Gagal upload ke Google Drive');
      }

      await addBackupLog({
        timestamp: new Date().toISOString(),
        type: 'Google Drive',
        status: 'Sukses',
        recordsSynced: spks.length,
        details: 'Backup JSON berhasil diunggah ke Google Drive (Hibrida)'
      });

      alert('Berhasil membackup data ke Google Drive!');
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat membackup ke Google Drive.');
    } finally {
      setIsSyncing(null);
    }
  };

  const handleSync = (type: 'Firebase' | 'Google Spreadsheet') => {
    setIsSyncing(type);
    setTimeout(() => {
      onTriggerBackup(type);
      setIsSyncing(null);
    }, 1500);
  };

  return (
    <div className="bg-[#161B22] rounded-2xl border border-white/5 shadow-lg overflow-hidden" id="backup-schema-panel">
      {/* Header */}
      <div className="bg-[#0F1115] p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-green-400" />
            <h2 className="font-bold text-base">Skema Sinkronisasi & Backup Data</h2>
          </div>
          <p className="text-xs text-gray-400">Arsitektur Hibrida: Firebase (Metadata) & Google Drive (Penyimpanan Berkas).</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            HIBRIDA CLOUD AKTIF
          </div>
          <button
            onClick={onExportXLS}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-md shadow-blue-500/10"
            id="btn-backup-export"
          >
            <Download className="w-3.5 h-3.5" />
            Download XLS
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-[#0F1115]">
        <button
          onClick={() => setActiveTab('google_drive')}
          className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'google_drive'
              ? 'border-green-500 bg-[#161B22] text-green-400'
              : 'border-transparent text-gray-500 hover:text-white hover:bg-white/[0.01]'
          }`}
          id="tab-google-drive"
        >
          <HardDrive className="w-4 h-4 text-green-400" />
          Google Drive Backup (File Storage)
        </button>
        <button
          onClick={() => setActiveTab('firebase')}
          className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'firebase'
              ? 'border-blue-500 bg-[#161B22] text-blue-400'
              : 'border-transparent text-gray-500 hover:text-white hover:bg-white/[0.01]'
          }`}
          id="tab-firebase"
        >
          <Database className="w-4 h-4 text-blue-400" />
          Firebase Cloud Firestore (Database Utama)
        </button>
      </div>

      <div className="p-5">
        {activeTab === 'google_drive' ? (
          /* Google Drive Content */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Penyimpanan Hibrida via Google Drive
                </h3>
                <p className="text-[11px] text-gray-400">Sinkronisasi data sistem ke akun Google Drive yang terhubung untuk menghemat memori Firebase.</p>
              </div>

              <div className="flex gap-2">
                {!isAuthenticated ? (
                  <button
                    onClick={handleDriveLogin}
                    disabled={isAuthenticating}
                    className="px-3.5 py-2 bg-white text-[#161B22] text-xs font-bold rounded-xl flex items-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <img src="https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" alt="Drive" className="w-4 h-4" />
                    {isAuthenticating ? 'Menghubungkan...' : 'Hubungkan Drive'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={logout}
                      className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      Putuskan Drive
                    </button>
                    <button
                      disabled={isSyncing !== null}
                      onClick={uploadToDrive}
                      className="px-3.5 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <HardDrive className={`w-3.5 h-3.5 ${isSyncing === 'Google Drive' ? 'animate-pulse' : ''}`} />
                      {isSyncing === 'Google Drive' ? 'Mencadangkan...' : 'Backup ke Drive'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Simulated File Explorer */}
            <div className="border border-white/10 rounded-xl overflow-hidden shadow-md">
              <div className="bg-[#F8F9FA] text-[#3C4043] px-3.5 py-2.5 text-xs font-medium font-sans flex items-center gap-2">
                <img src="https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" alt="Drive" className="w-4 h-4" />
                <span>My Drive &gt; SPK_Backup</span>
              </div>
              <div className="bg-white p-4 h-40 flex flex-col items-center justify-center text-center">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <ShieldCheck className="w-8 h-8 text-green-500 mx-auto" />
                    <p className="text-sm font-medium text-gray-800">Google Drive Terhubung</p>
                    <p className="text-xs text-gray-500">Siap menerima file backup sistem SPK.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <img src="https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" alt="Drive" className="w-8 h-8 mx-auto opacity-50" />
                    <p className="text-sm font-medium text-gray-400">Belum Terhubung</p>
                    <p className="text-xs text-gray-400">Hubungkan akun untuk memulai backup hibrida.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Firebase Firestore Cloud DB Content */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Visualisasi Skema Firestore
                </h3>
                <p className="text-[11px] text-gray-400">Peta relasi database NoSQL terstruktur yang digunakan aplikasi ini secara cloud.</p>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={isSyncing !== null}
                  onClick={() => handleSync('Firebase')}
                  className="px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing === 'Firebase' ? 'animate-spin' : ''}`} />
                  {isSyncing === 'Firebase' ? 'Sinkronisasi...' : 'Push Manual ke Firestore'}
                </button>
              </div>
            </div>

            {/* Firestore Visual Schema */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border border-white/5 rounded-xl p-3.5 bg-[#0F1115] hover:border-blue-500/20 transition">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold font-mono text-[11px] mb-2">
                  <Database className="w-3.5 h-3.5" />
                  koleksi: /spks/
                </div>
                <div className="text-[10px] space-y-1.5 text-gray-400">
                  <p>Menyimpan metadata Surat Perintah Kerja.</p>
                  <div className="bg-[#161B22] border border-white/5 rounded p-2 text-[9px] font-mono leading-relaxed text-gray-300">
                    id: string (No SPK)<br/>
                    tanggalPengajuan: string<br/>
                    status: string (enum)
                  </div>
                </div>
              </div>

              <div className="border border-white/5 rounded-xl p-3.5 bg-[#0F1115] hover:border-blue-500/20 transition">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold font-mono text-[11px] mb-2">
                  <Database className="w-3.5 h-3.5" />
                  koleksi: /notifications/
                </div>
                <div className="text-[10px] space-y-1.5 text-gray-400">
                  <p>Notifikasi real-time penanggung jawab.</p>
                  <div className="bg-[#161B22] border border-white/5 rounded p-2 text-[9px] font-mono leading-relaxed text-gray-300">
                    id: string<br/>
                    title: string<br/>
                    role: string
                  </div>
                </div>
              </div>

              <div className="border border-white/5 rounded-xl p-3.5 bg-[#0F1115] hover:border-blue-500/20 transition">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold font-mono text-[11px] mb-2">
                  <Database className="w-3.5 h-3.5" />
                  koleksi: /backupLogs/
                </div>
                <div className="text-[10px] space-y-1.5 text-gray-400">
                  <p>Log sinkronisasi dan backup data.</p>
                  <div className="bg-[#161B22] border border-white/5 rounded p-2 text-[9px] font-mono leading-relaxed text-gray-300">
                    type: string<br/>
                    status: string<br/>
                    recordsSynced: number
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Sync Logs Terminal */}
        <div className="mt-5 border border-white/5 rounded-2xl bg-slate-950 p-4 font-mono text-xs text-[#E0E0E0] space-y-3 shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-gray-500">
            <span className="flex items-center gap-1.5 text-[10px]">
              <Terminal className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              LOG AKTIVITAS SINKRONISASI BACKUP
            </span>
            <span className="text-[9px] bg-[#0F1115] px-1.5 py-0.5 rounded text-blue-400 border border-white/5">Auto-Sync On</span>
          </div>

          <div className="space-y-2 max-h-[120px] overflow-y-auto text-[10px]">
            {logs.length === 0 ? (
              <p className="text-gray-600 italic text-center py-2">Belum ada log sinkronisasi tercatat.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed border-b border-slate-900/50 pb-1.5">
                  <span className="text-gray-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`font-bold shrink-0 ${log.type === 'Google Drive' ? 'text-green-400' : 'text-blue-400'}`}>
                    {log.type}
                  </span>
                  <span className={`px-1 rounded text-[8px] font-bold shrink-0 ${log.status === 'Sukses' ? 'bg-green-950 text-green-400 border border-green-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'}`}>
                    {log.status}
                  </span>
                  <span className="text-gray-500 font-medium">({log.recordsSynced} data)</span>
                  <span className="text-gray-300">{log.details}</span>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Danger Zone: Reset Data */}
        <div className="mt-5 border border-red-500/10 rounded-2xl bg-red-500/[0.02] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Zona Berbahaya (Persiapan Publish)
              </h4>
              <p className="text-[11px] text-gray-400">
                Gunakan tombol di samping untuk menghapus seluruh data transaksi SPK, notifikasi, dan log di memori browser Anda sebelum meluncurkan aplikasi ke produksi.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin menghapus semua data SPK, notifikasi, dan log? Tindakan ini tidak dapat dibatalkan.")) {
                  onResetData?.();
                }
              }}
              className="px-3.5 py-2 bg-red-600/10 hover:bg-red-600 hover:text-white border border-red-600/20 text-red-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan Semua Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

