
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  Download,
  Printer,
  Sparkles,
  User,
  Calendar
} from 'lucide-react';
import { Invoice, UserProfile, PaymentRecord } from './types';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceEditor from './components/InvoiceEditor';
import InvoicePreview from './components/InvoicePreview';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [user] = useState<UserProfile>({
    name: 'Kelechi Nwachukwu',
    title: 'Freelance Full Stack Developer',
    email: '',
    businessName: 'Kelechi Nwachukwu',
    logo: 'https://i.ibb.co/LXpWzwWV/Kaycee-Nwachukwu.jpg',
    website: 'https://kelechi-nwachukwu.vercel.app'
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kelechi_invoices');
    if (saved) {
      try {
        setInvoices(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved invoices", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('kelechi_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const updateInvoice = (updated: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl overflow-hidden">
                {user.logo ? <img src={user.logo} alt="Logo" className="w-full h-full object-cover" /> : 'K'}
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Invoicer</h1>
                <p className="text-xs text-slate-400">Pro Developer Edition</p>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/invoices" icon={<FileText size={20} />} label="All Invoices" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/new" icon={<PlusCircle size={20} />} label="Create New" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/payments" icon={<CreditCard size={20} />} label="Payments" onClick={() => setIsSidebarOpen(false)} />
            </nav>

            <div className="p-4 mt-auto border-t border-slate-800">
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                  {user.logo ? <img src={user.logo} alt="Profile" className="w-full h-full object-cover" /> : <User size={16} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.title}</p>
                  {user.website && (
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors block truncate mt-0.5"
                    >
                      {user.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            <button 
              className="lg:hidden p-2 hover:bg-slate-100 rounded-md"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2 w-96 max-w-full">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search invoices, clients..." 
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <Link 
                to="/new" 
                className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <PlusCircle size={18} />
                New Invoice
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard invoices={invoices} user={user} />} />
              <Route path="/invoices" element={<InvoiceList invoices={invoices} deleteInvoice={deleteInvoice} />} />
              <Route path="/new" element={<InvoiceEditor user={user} onSave={addInvoice} />} />
              <Route path="/edit/:id" element={<InvoiceEditor user={user} invoices={invoices} onSave={updateInvoice} />} />
              <Route path="/preview/:id" element={<InvoicePreview invoices={invoices} user={user} />} />
              <Route path="/payments" element={<div className="p-8 text-center text-slate-500">Payments tracking coming soon. View specific invoices to record payments.</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
      `}
    >
      {icon}
      {label}
    </Link>
  );
};

export default App;
