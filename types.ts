
export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface ClientDetails {
  name: string;
  email: string;
  address: string;
  businessName: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  client: ClientDetails;
  items: InvoiceItem[];
  payments: PaymentRecord[];
  terms: string;
  status: 'draft' | 'pending' | 'partially_paid' | 'paid';
  logo?: string;
}

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  businessName: string;
  logo?: string;
  website?: string;
}
