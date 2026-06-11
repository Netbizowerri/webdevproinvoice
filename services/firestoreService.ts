import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Invoice } from '../types';

const COLLECTION = 'invoices';

function toFirestore(invoice: Invoice) {
  return {
    ...invoice,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    payments: invoice.payments.map(p => ({
      ...p,
      date: p.date,
    })),
  };
}

function fromFirestore(id: string, data: any): Invoice {
  return {
    id,
    invoiceNumber: data.invoiceNumber ?? '',
    issueDate: data.issueDate ?? '',
    dueDate: data.dueDate ?? '',
    client: data.client ?? { name: '', email: '', address: '', businessName: '' },
    items: data.items ?? [],
    payments: data.payments ?? [],
    terms: data.terms ?? '',
    status: data.status ?? 'draft',
    logo: data.logo ?? undefined,
  };
}

const MIGRATED_KEY = 'kelechi_invoices_migrated';

export const firestoreService = {
  async getAll(): Promise<Invoice[]> {
    const q = query(collection(db, COLLECTION), orderBy('issueDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => fromFirestore(d.id, d.data()));
  },

  onSnapshot(callback: (invoices: Invoice[]) => void): () => void {
    const q = query(collection(db, COLLECTION), orderBy('issueDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const invoices = snapshot.docs.map(d => fromFirestore(d.id, d.data()));
      callback(invoices);
    });
  },

  async migrateFromLocalStorage(): Promise<number> {
    const saved = localStorage.getItem('kelechi_invoices');
    if (!saved) return 0;
    const alreadyMigrated = localStorage.getItem(MIGRATED_KEY);
    if (alreadyMigrated) return 0;

    let migrated = 0;
    try {
      const localInvoices: Invoice[] = JSON.parse(saved);
      for (const inv of localInvoices) {
        await firestoreService.create(inv);
        migrated++;
      }
      localStorage.removeItem('kelechi_invoices');
      localStorage.setItem(MIGRATED_KEY, 'true');
    } catch (e) {
      console.error('Migration failed:', e);
    }
    return migrated;
  },

  async create(invoice: Invoice): Promise<string> {
    const { id, ...rest } = invoice;
    const docRef = await addDoc(collection(db, COLLECTION), toFirestore(rest as Invoice));
    return docRef.id;
  },

  async update(invoice: Invoice): Promise<void> {
    await updateDoc(doc(db, COLLECTION, invoice.id), toFirestore(invoice));
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
