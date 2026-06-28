export interface SPK {
  id: string;
  tanggalPengajuan: string; // YYYY-MM-DD
  namaMesin: string;
  diajukanOleh: string; // Nama pelapor
  bagian: 'Produksi' | 'QUA' | 'HRDGA' | 'WHM' | 'Purchasing' | 'Logistik' | 'Manajemen';
  deskripsiMasalah: string;
  status: 'Pending' | 'Rejected' | 'Approved' | 'Menunggu Sparepart' | 'Menunggu Verifikasi' | 'Closed';
  
  createdAt: string; // ISO DateTime
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  
  tindakPerbaikan?: string;
  perbaikanSelesaiAt?: string; // ISO DateTime
  tanggalPerbaikan?: string; // YYYY-MM-DD
  jenisPekerjaan?: 'Perbaikan' | 'Maintenance' | 'Pengecekan';
  teknisiNama?: string;
  
  verifiedBySPV: boolean;
  verifiedBySPVAt?: string;
  verifiedBySPVNama?: string;
  
  verifiedByHead: boolean;
  verifiedByHeadAt?: string;
  verifiedByHeadNama?: string;
  
  // Department Head Approval fields
  approvedByDeptHead: boolean;
  deptHeadName?: string;
  approvedByDeptHeadAt?: string;
  
  // Minutes calculated for stats
  approvalDurationMinutes?: number;
  repairDurationMinutes?: number;
}

export type Role = 'Pelapor' | 'Teknik' | 'SPV' | 'Head';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO
  role: 'Teknik' | 'SPV' | 'Head' | 'All';
  read: boolean;
  spkId?: string;
}

export interface BackupLog {
  id: string;
  timestamp: string;
  type: 'Firebase' | 'Google Spreadsheet';
  status: 'Sukses' | 'Gagal';
  recordsSynced: number;
  details: string;
}

export interface RolePin {
  Teknik: string;
  SPV: string;
  Head: string;
}
