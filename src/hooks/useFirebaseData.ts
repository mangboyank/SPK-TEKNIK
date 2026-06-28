import { useState, useEffect } from 'react';
import { SPK, AppNotification, BackupLog, RolePin } from '../types';
import { 
  spkCollection, notifCollection, logCollection, configCollection,
  addSpk, updateSpk, deleteSpk, addNotification, updateNotification, addBackupLog, updatePins, initConfig
} from '../lib/dataService';
import { onSnapshot, query, orderBy, doc, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useFirebaseData() {
  const [spks, setSpks] = useState<SPK[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [pins, setPins] = useState<RolePin>({ Teknik: '1111', SPV: '2222', Head: '3333' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize config if not exists
    initConfig();

    // Menggunakan limit(200) untuk membatasi read document dan menghemat kuota Firebase
    const qSpks = query(spkCollection, orderBy('createdAt', 'desc'), limit(200));
    const unsubSpks = onSnapshot(qSpks, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as SPK);
      setSpks(data);
    });

    // Menggunakan limit(50) untuk notifikasi agar tidak fetch terlalu banyak data lama
    const qNotifs = query(notifCollection, orderBy('timestamp', 'desc'), limit(50));
    const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as AppNotification);
      setNotifications(data);
    });

    // Menggunakan limit(50) untuk logs
    const qLogs = query(logCollection, orderBy('timestamp', 'desc'), limit(50));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as BackupLog);
      setLogs(data);
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'rolePins'), (docSnap) => {
      if (docSnap.exists()) {
        setPins(docSnap.data() as RolePin);
      }
      setLoading(false);
    });

    return () => {
      unsubSpks();
      unsubNotifs();
      unsubLogs();
      unsubConfig();
    };
  }, []);

  return { spks, notifications, logs, pins, loading };
}
