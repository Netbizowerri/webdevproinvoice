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
