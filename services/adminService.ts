import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: string;
  disabled?: boolean;
}

const USERS_COLLECTION = 'app_users';

function fromFirestore(uid: string, data: any): AppUser {
  return {
    uid,
    email: data.email ?? '',
    displayName: data.displayName ?? '',
    role: data.role ?? 'user',
    createdAt: data.createdAt ?? '',
    disabled: data.disabled ?? false,
  };
}

export const adminService = {
  async createUserRecord(uid: string, email: string, displayName: string, role: 'admin' | 'user' = 'user') {
    await setDoc(doc(db, USERS_COLLECTION, uid), {
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
      disabled: false,
    });
  },

  async getUsers(): Promise<AppUser[]> {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => fromFirestore(d.id, d.data()));
  },

  onUsersChanged(callback: (users: AppUser[]) => void): () => void {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(d => fromFirestore(d.id, d.data()));
      callback(users);
    });
  },

  async updateUserRole(uid: string, role: 'admin' | 'user') {
    await updateDoc(doc(db, USERS_COLLECTION, uid), { role });
  },

  async toggleUserDisabled(uid: string, disabled: boolean) {
    await updateDoc(doc(db, USERS_COLLECTION, uid), { disabled });
  },

  async deleteUser(uid: string) {
    await deleteDoc(doc(db, USERS_COLLECTION, uid));
  },
};
