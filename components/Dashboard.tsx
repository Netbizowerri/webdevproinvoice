
import React, { useMemo, useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  // Added missing FileText icon import
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Invoice, UserProfile } from '../types';
import { geminiService } from '../services/geminiService';

interface DashboardProps {
  invoices: Invoice[];
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, user }) => {
  const [aiInsight, setAiInsight] = useState<string>('Analyzing your data...');

  const stats = useMemo(() => {
    const totalEarned = invoices.reduce((sum, inv) => 
      sum + inv.payments.reduce((pSum, p) => pSum + p.amount, 0), 0
    );
    
    const totalBilled = invoices.reduce((sum, inv) => 
      sum + inv.items.reduce((iSum, item) => iSum + (item.quantity * item.rate), 0), 0
    );

    const pendingAmount = totalBilled - totalEarned;
    const paidCount = invoices.filter(inv => inv.status === 'paid').length;
    const pendingCount = invoices.length - paidCount;

    return { totalEarned, pendingAmount, totalBilled, paidCount, pendingCount };
  }, [invoices]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ month: m, amount: 0 }));
    
    invoices.forEach(inv => {
      inv.payments.forEach(p => {
        const date = new Date(p.date);
        const monthIndex = date.getMonth();
        data[monthIndex].amount += p.amount;
      });
    });

    return data;
  }, [invoices]);

  useEffect(() => {
    const fetchInsight = async () => {
      if (invoices.length > 0) {
        const relevantData = chartData.filter(d => d.amount > 0);
        const insight = await geminiService.analyzeIncome(relevantData);
        setAiInsight(insight);
      } else {
        setAiInsight("Start creating invoices to see financial insights.");
      }
    };
    fetchInsight();
  }, [chartData, invoices.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user.name}</h2>
          <p className="text-slate-500">Here's an overview of your development business.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-3 rounded-xl shadow-sm">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Gemini Insights</p>
            <p className="text-xs text-indigo-900 font-medium max-w-[200px] leading-tight">
              {aiInsight}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Earned" 
          value={`₦${stats.totalEarned.toLocaleString()}`} 
          icon={<span className="font-bold text-emerald-600">₦</span>} 
          trend="+12% from last month"
          color="bg-emerald-50"
        />
        <StatCard 
          title="Pending Payments" 
          value={`₦${stats.pendingAmount.toLocaleString()}`} 
          icon={<Clock className="text-amber-600" />} 
          trend={`${stats.pendingCount} invoices pending`}
          color="bg-amber-50"
        />
        <StatCard 
          title="Invoices Paid" 
          value={stats.paidCount.toString()} 
          icon={<CheckCircle2 className="text-indigo-600" />} 
          trend="85% success rate"
          color="bg-indigo-50"
        />
        <StatCard 
          title="Total Billed" 
          value={`₦${stats.totalBilled.toLocaleString()}`} 
          icon={<TrendingUp className="text-blue-600" />} 
          trend="Overall business volume"
          color="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Monthly Revenue (₦)</h3>
            <select className="text-sm border-none bg-slate-100 rounded-lg focus:ring-0">
              <option>Year 2024</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}}
                  tickFormatter={(val) => `₦${val}`}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Recent Invoices</h3>
          <div className="space-y-4">
            {invoices.length > 0 ? (
              invoices.slice(0, 5).map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{inv.client.businessName || inv.client.name}</p>
                      <p className="text-xs text-slate-500">{inv.issueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">
                      ₦{inv.items.reduce((sum, i) => sum + (i.quantity * i.rate), 0).toLocaleString()}
                    </p>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${
                      inv.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>{inv.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-slate-400">No recent activity</p>
              </div>
            )}
          </div>
          {invoices.length > 5 && (
            <button className="w-full mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View All Invoices
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  trend: string,
  color: string 
}> = ({ title, value, icon, trend, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-xl ${color} flex items-center justify-center min-w-[36px]`}>
        {icon}
      </div>
      <span className="text-slate-400"><ArrowUpRight size={18} /></span>
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
    <p className="text-xs text-slate-400 mt-2">{trend}</p>
  </div>
);

export default Dashboard;
