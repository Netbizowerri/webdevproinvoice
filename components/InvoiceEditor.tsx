
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  Image as ImageIcon,
  DollarSign,
  Info,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { Invoice, InvoiceItem, UserProfile, PaymentRecord } from '../types';
import { geminiService } from '../services/geminiService';

interface InvoiceEditorProps {
  user: UserProfile;
  invoices?: Invoice[];
  onSave: (invoice: Invoice) => void;
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ user, invoices, onSave }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [invoice, setInvoice] = useState<Invoice>({
    id: crypto.randomUUID(),
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client: {
      name: '',
      email: '',
      address: '',
      businessName: '',
    },
    items: [
      { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }
    ],
    payments: [],
    terms: '1. All payments shall be made in Nigerian Naira (₦).\n2. A first deposit has been recorded to initiate this invoice.\n3. The final balance is due immediately after the website demo is presented and prior to final deployment.\n4. Project delivery/deployment will commence only after the full balance has been cleared.',
    status: 'draft',
    logo: user.logo
  });

  useEffect(() => {
    if (id && invoices) {
      const existing = invoices.find(inv => inv.id === id);
      if (existing) setInvoice(existing);
    }
  }, [id, invoices]);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      client: { ...prev.client, [name]: value }
    }));
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }]
    }));
  };

  const removeItem = (itemId: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoice(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const polishDescription = async (itemId: string) => {
    const item = invoice.items.find(i => i.id === itemId);
    if (!item || !item.description) return;
    
    setLoading(true);
    const polished = await geminiService.polishDescription(item.description);
    updateItem(itemId, 'description', polished);
    setLoading(false);
  };

  const smartGenerateTerms = async () => {
    setLoading(true);
    const mainService = invoice.items[0]?.description || "Development services";
    const terms = await geminiService.generateTerms(mainService);
    setInvoice(prev => ({ ...prev, terms }));
    setLoading(false);
  };

  const handleDepositChange = (amount: number) => {
    setInvoice(prev => {
      // Find or create the first payment record (the deposit)
      const existingPayments = [...prev.payments];
      if (amount <= 0) {
        // If amount is 0, remove the first payment if it exists
        const newPayments = existingPayments.filter((_, i) => i !== 0 || existingPayments[0]?.note !== 'First Deposit');
        return { ...prev, payments: newPayments, status: newPayments.length > 0 ? 'partially_paid' : 'pending' };
      }

      const depositPayment: PaymentRecord = {
        id: existingPayments[0]?.note === 'First Deposit' ? existingPayments[0].id : crypto.randomUUID(),
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        note: 'First Deposit'
      };

      let newPayments;
      if (existingPayments.length > 0 && existingPayments[0].note === 'First Deposit') {
        newPayments = [depositPayment, ...existingPayments.slice(1)];
      } else {
        newPayments = [depositPayment, ...existingPayments];
      }

      const totalBilled = prev.items.reduce((sum, i) => sum + (i.quantity * i.rate), 0);
      const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
      
      let status: Invoice['status'] = 'pending';
      if (totalPaid >= totalBilled) status = 'paid';
      else if (totalPaid > 0) status = 'partially_paid';

      return {
        ...prev,
        payments: newPayments,
        status
      };
    });
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const depositAmount = invoice.payments.find(p => p.note === 'First Deposit')?.amount || 0;
  const otherPayments = invoice.payments.filter(p => p.note !== 'First Deposit').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = depositAmount + otherPayments;
  const balance = subtotal - totalPaid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(invoice);
    navigate('/invoices');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium shadow-md transition-all active:scale-95"
          >
            <Save size={18} />
            Save Invoice
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header/Branding */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="relative group w-32 h-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer">
              {invoice.logo ? (
                <img src={invoice.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-400">
                  <Upload size={24} className="mx-auto mb-2" />
                  <span className="text-xs">Logo</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{user.businessName}</h3>
              <p className="text-slate-500 text-sm font-semibold">{user.title}</p>
              {user.website && (
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-600 text-xs hover:underline block mt-0.5"
                >
                  {user.website}
                </a>
              )}
            </div>
          </div>

          <div className="text-right space-y-4">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Invoice</h2>
            <div className="grid grid-cols-2 gap-2 max-w-xs ml-auto">
              <label className="text-xs font-bold text-slate-400 uppercase self-center">Invoice #</label>
              <input 
                type="text" 
                value={invoice.invoiceNumber} 
                onChange={e => setInvoice(prev => ({...prev, invoiceNumber: e.target.value}))}
                className="text-right text-sm border-none bg-slate-50 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              />
              <label className="text-xs font-bold text-slate-400 uppercase self-center">Issue Date</label>
              <input 
                type="date" 
                value={invoice.issueDate} 
                onChange={e => setInvoice(prev => ({...prev, issueDate: e.target.value}))}
                className="text-right text-sm border-none bg-slate-50 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              />
              <label className="text-xs font-bold text-slate-400 uppercase self-center">Due Date</label>
              <input 
                type="date" 
                value={invoice.dueDate} 
                onChange={e => setInvoice(prev => ({...prev, dueDate: e.target.value}))}
                className="text-right text-sm border-none bg-slate-50 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="p-8 bg-slate-50/50 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Client Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input 
                type="text" 
                name="businessName"
                placeholder="Client Business Name"
                value={invoice.client.businessName}
                onChange={handleClientChange}
                className="w-full text-lg font-semibold bg-white border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              />
              <input 
                type="text" 
                name="name"
                placeholder="Contact Person Name"
                value={invoice.client.name}
                onChange={handleClientChange}
                className="w-full text-sm bg-white border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-4">
              <input 
                type="email" 
                name="email"
                placeholder="Email Address"
                value={invoice.client.email}
                onChange={handleClientChange}
                className="w-full text-sm bg-white border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              />
              <textarea 
                name="address"
                placeholder="Billing Address"
                value={invoice.client.address}
                onChange={handleClientChange}
                rows={2}
                className="w-full text-sm bg-white border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-8">
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Service Description</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase w-24 px-4 text-center">Qty</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase w-40 text-right">Rate (₦)</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase w-40 text-right">Project Cost (₦)</th>
                <th className="pb-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4">
                    <div className="flex gap-2 group">
                      <input 
                        type="text" 
                        value={item.description}
                        placeholder="e.g. Website Development"
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                        className="flex-1 text-sm border-none bg-transparent p-0 focus:ring-0"
                      />
                      <button 
                        type="button"
                        onClick={() => polishDescription(item.id)}
                        disabled={loading || !item.description}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-0"
                        title="Polish with Gemini AI"
                      >
                        <Sparkles size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full text-sm text-center border-none bg-slate-50 rounded-lg py-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center bg-slate-50 rounded-lg px-2">
                      <span className="text-slate-400 text-xs">₦</span>
                      <input 
                        type="number" 
                        value={item.rate}
                        onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full text-sm text-right border-none bg-transparent py-2 focus:ring-0"
                      />
                    </div>
                  </td>
                  <td className="py-4 text-right font-bold text-slate-800">
                    ₦{(item.quantity * item.rate).toLocaleString()}
                  </td>
                  <td className="py-4 pl-4">
                    {invoice.items.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeItem(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button 
            type="button" 
            onClick={addItem}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl transition-all"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>

        {/* Summary and Terms */}
        <div className="p-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Terms & Conditions</h4>
                <button 
                  type="button" 
                  onClick={smartGenerateTerms}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <Sparkles size={14} />
                  Smart Generate
                </button>
              </div>
              <textarea 
                value={invoice.terms}
                onChange={e => setInvoice(prev => ({...prev, terms: e.target.value}))}
                rows={6}
                className="w-full text-xs text-slate-500 bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
               <div className="flex items-center gap-2 text-indigo-600">
                  <CreditCard size={18} />
                  <h4 className="text-sm font-bold">First payment made</h4>
               </div>
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                  <input 
                    type="number" 
                    placeholder="Enter deposit amount"
                    value={depositAmount || ''}
                    onChange={e => handleDepositChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 bg-white border-indigo-200 rounded-xl text-lg font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
               <p className="text-[10px] text-slate-400 uppercase font-medium">Record the initial deposit here to calculate balance</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 text-white space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-sm">Subtotal (Project Cost)</span>
                <span className="font-medium">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span className="text-sm font-bold">First Payment Made</span>
                <span className="font-black">-₦{depositAmount.toLocaleString()}</span>
              </div>
              {otherPayments > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="text-sm font-bold">Other Payments</span>
                  <span className="font-black">-₦{otherPayments.toLocaleString()}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="h-px bg-slate-800" />
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-sm text-slate-400 block font-bold">Total Balance Due</span>
                  <span className="text-xs uppercase font-black tracking-widest text-indigo-400">NGN</span>
                </div>
                <span className="text-4xl font-black">₦{balance.toLocaleString()}</span>
              </div>
              <div className={`mt-4 py-2 px-4 rounded-lg text-center text-xs font-black uppercase tracking-[0.2em] border ${
                invoice.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
              }`}>
                Status: {invoice.status.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceEditor;
