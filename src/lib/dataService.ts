import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { SPK, AppNotification, BackupLog, RolePin } from '../types';

export const spkCollection = collection(db, 'spks');
export const notifCollection = collection(db, 'notifications');
export const logCollection = collection(db, 'backupLogs');
export const configCollection = collection(db, 'config'); // single doc for pins

export const addSpk = async (spk: Omit<SPK, 'id'>) => {
  const docRef = await addDoc(spkCollection, spk);
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const updateSpk = async (id: string, data: Partial<SPK>) => {
  const docRef = doc(db, 'spks', id);
  await updateDoc(docRef, data);
};

export const deleteSpk = async (id: string) => {
  const docRef = doc(db, 'spks', id);
  await deleteDoc(docRef);
};

export const addNotification = async (notif: Omit<AppNotification, 'id'>) => {
  const docRef = await addDoc(notifCollection, notif);
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const updateNotification = async (id: string, data: Partial<AppNotification>) => {
  const docRef = doc(db, 'notifications', id);
  await updateDoc(docRef, data);
};

export const addBackupLog = async (log: Omit<BackupLog, 'id'>) => {
  const docRef = await addDoc(logCollection, log);
  await updateDoc(docRef, { id: docRef.id });
};

export const updatePins = async (pins: RolePin) => {
  const docRef = doc(db, 'config', 'rolePins');
  await updateDoc(docRef, { ...pins });
};

export const initConfig = async () => {
  // Create if not exists
  const docRef = doc(db, 'config', 'rolePins');
  try {
    await updateDoc(docRef, { Teknik: '1111', SPV: '2222', Head: '3333' });
  } catch (e: any) {
    // If doesn't exist (e.g. not-found error), create it with batch or setDoc
    const { setDoc } = await import('firebase/firestore');
    await setDoc(docRef, { Teknik: '1111', SPV: '2222', Head: '3333' });
  }
};
