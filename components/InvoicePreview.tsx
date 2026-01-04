
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Mail, Edit, CheckCircle2 } from 'lucide-react';
import { Invoice, UserProfile } from '../types';

interface InvoicePreviewProps {
  invoices: Invoice[];
  user: UserProfile;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoices, user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Invoice not found.</p>
        <button onClick={() => navigate('/invoices')} className="text-indigo-600 mt-4 underline">Back to list</button>
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = subtotal - totalPaid;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Invoices</span>
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/edit/${invoice.id}`)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-all"
          >
            <Edit size={18} />
            Edit
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-medium shadow-md transition-all active:scale-95"
          >
            <Printer size={18} />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Actual Invoice Body */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-none">
        {/* Branding Header */}
        <div className="p-12 border-b-4 border-slate-900 flex justify-between items-start">
          <div className="space-y-6">
            {invoice.logo ? (
              <img src={invoice.logo} alt="Business Logo" className="h-24 w-24 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 bg-slate-900 text-white font-bold flex items-center justify-center rounded-lg text-2xl">
                {user.businessName[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{user.businessName}</h1>
              <p className="text-slate-500 font-bold">{user.title}</p>
              {user.website && (
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 text-xs hover:underline block mt-0.5"
                >
                  {user.website}
                </a>
              )}
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4 opacity-10">Invoice</h2>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Number</p>
              <p className="font-bold text-slate-900 text-lg">{invoice.invoiceNumber}</p>
              
              <div className="pt-4 grid grid-cols-2 gap-x-8 text-left">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Issued</p>
                  <p className="text-sm font-semibold">{invoice.issueDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</p>
                  <p className="text-sm font-semibold">{invoice.dueDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="p-12 bg-slate-50/30 flex justify-between gap-12 border-b border-slate-100">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bill To:</h3>
            <div>
              <p className="text-xl font-black text-slate-900">{invoice.client.businessName || invoice.client.name}</p>
              <p className="text-slate-600 font-medium mt-1">{invoice.client.name}</p>
              <p className="text-slate-500 text-sm">{invoice.client.email}</p>
              <p className="text-slate-400 text-xs mt-2 max-w-xs whitespace-pre-wrap">{invoice.client.address}</p>
            </div>
          </div>
          {invoice.status === 'paid' ? (
            <div className="self-center">
              <div className="border-4 border-emerald-500 text-emerald-500 text-3xl font-black px-6 py-2 rotate-[-15deg] uppercase tracking-widest opacity-40">
                Paid In Full
              </div>
            </div>
          ) : totalPaid > 0 ? (
            <div className="self-center">
               <div className="border-4 border-amber-500 text-amber-500 text-xl font-black px-4 py-2 rotate-[-10deg] uppercase tracking-widest opacity-40">
                Deposit Received
              </div>
            </div>
          ) : null}
        </div>

        {/* Table */}
        <div className="p-12">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-900 text-left">
                <th className="pb-4 text-xs font-bold text-slate-900 uppercase tracking-widest">Description</th>
                <th className="pb-4 text-xs font-bold text-slate-900 uppercase tracking-widest w-24 text-center">Qty</th>
                <th className="pb-4 text-xs font-bold text-slate-900 uppercase tracking-widest w-32 text-right">Rate</th>
                <th className="pb-4 text-xs font-bold text-slate-900 uppercase tracking-widest w-32 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? '' : 'bg-slate-50/20'}>
                  <td className="py-6 pr-4">
                    <p className="font-bold text-slate-800">{item.description}</p>
                  </td>
                  <td className="py-6 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-6 text-right text-slate-600">₦{item.rate.toLocaleString()}</td>
                  <td className="py-6 text-right font-black text-slate-900">₦{(item.quantity * item.rate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payments Section (The requested new section) */}
        {invoice.payments.length > 0 && (
          <div className="px-12 pb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Amount Paid / Payment History</h3>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-200">
                    <th className="text-left font-bold pb-2 uppercase text-[10px]">Date</th>
                    <th className="text-left font-bold pb-2 uppercase text-[10px]">Reference / Note</th>
                    <th className="text-right font-bold pb-2 uppercase text-[10px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-3 text-slate-600">{payment.date}</td>
                      <td className="py-3 text-slate-800 font-medium">{payment.note || 'Payment Received'}</td>
                      <td className="py-3 text-right text-emerald-600 font-bold">₦{payment.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-200">
                    <td colSpan={2} className="py-4 font-bold text-slate-900 uppercase text-xs">Total Amount Paid To Date</td>
                    <td className="py-4 text-right text-emerald-600 font-black text-lg">₦{totalPaid.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totals Section */}
        <div className="px-12 pb-12 flex flex-col md:flex-row justify-between gap-12">
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Terms & Notes</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm whitespace-pre-wrap">
                {invoice.terms}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Methods</h4>
              <p className="text-xs text-slate-500">Bank Transfer / OPay / Bank Account</p>
              <p className="text-[10px] text-slate-400">Account details available upon request.</p>
            </div>
          </div>

          <div className="w-full md:w-72 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Subtotal</span>
              <span className="font-bold text-slate-700">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Tax (0%)</span>
              <span className="font-bold text-slate-700">₦0.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Grand Total</span>
              <span className="font-black text-slate-900">₦{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="h-px bg-slate-100" />
            
            <div className="flex justify-between items-center text-sm text-emerald-600 font-bold">
              <span className="uppercase text-[10px]">Total Amount Paid</span>
              <span>-₦{totalPaid.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-900 rounded-xl p-4 text-white shadow-lg ring-4 ring-slate-900/10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Balance Due</span>
                <span className="text-[8px] uppercase tracking-widest opacity-40">Nigerian Naira</span>
              </div>
              <span className="text-2xl font-black">₦{balance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-900 text-center border-t border-white/5">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">
            Thank you for your business! — Powered by Kelechi Nwachukwu Invoicer
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
