
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  // Added missing FileText icon import
  FileText
} from 'lucide-react';
import { Invoice } from '../types';

interface InvoiceListProps {
  invoices: Invoice[];
  deleteInvoice: (id: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, deleteInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<Invoice['status'] | 'all'>('all');
  const navigate = useNavigate();

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || inv.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'partially_paid': return <Clock size={16} className="text-amber-500" />;
      case 'pending': return <AlertCircle size={16} className="text-blue-500" />;
      default: return null;
    }
  };

  const getStatusStyle = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'partially_paid': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'pending': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'draft': return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Invoices</h2>
          <p className="text-slate-500">Manage and track your developer billing.</p>
        </div>
        <Link 
          to="/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-95 text-center"
        >
          + Create New Invoice
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Client, Business..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <Filter size={18} className="text-slate-400 shrink-0" />
            {(['all', 'draft', 'pending', 'partially_paid', 'paid'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all
                  ${filter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Invoice</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Issue Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Amount (₦)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(inv => {
                  const total = inv.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
                  const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                  
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => navigate(`/preview/${inv.id}`)}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{inv.invoiceNumber}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Due {inv.dueDate}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-700">{inv.client.businessName || inv.client.name}</p>
                        <p className="text-xs text-slate-400">{inv.client.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {inv.issueDate}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-slate-800">₦{total.toLocaleString()}</p>
                        {paid > 0 && paid < total && (
                          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">₦{paid.toLocaleString()} paid</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`mx-auto flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${getStatusStyle(inv.status)}`}>
                          {getStatusIcon(inv.status)}
                          {inv.status.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => navigate(`/preview/${inv.id}`)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => navigate(`/edit/${inv.id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              if(confirm('Delete this invoice?')) deleteInvoice(inv.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={48} className="text-slate-200" />
                      <p className="text-lg font-medium">No invoices found</p>
                      <Link to="/new" className="text-indigo-600 hover:underline">Create your first invoice</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
