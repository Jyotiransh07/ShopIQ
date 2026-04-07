import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  Users, IndianRupee, ShoppingCart, Percent, Clock, TrendingUp, 
  Filter, RotateCcw, Download, Search, ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight, MousePointer2, BarChart3
} from 'lucide-react';
import { CustomerRecord, Page, Gender, Device, Category, CartStatus, Segment, Month } from '../types';
import { cn } from '../lib/utils';
import Papa from 'papaparse';

interface DashboardProps {
  data: CustomerRecord[];
  onNavigate: (page: Page) => void;
}

const COLORS = ['#00e5ff', '#b47cff', '#00e676', '#ff4d8d', '#ffc947', '#ff7043', '#8d6e63'];

export function Dashboard({ data, onNavigate }: DashboardProps) {
  // Filters
  const [filters, setFilters] = useState({
    gender: 'All',
    ageGroup: 'All',
    device: 'All',
    category: 'All',
    month: 'All',
    city: 'All',
    status: 'All'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchGender = filters.gender === 'All' || item.gender === filters.gender;
      const matchDevice = filters.device === 'All' || item.device === filters.device;
      const matchCategory = filters.category === 'All' || item.category === filters.category;
      const matchMonth = filters.month === 'All' || item.month === filters.month;
      const matchCity = filters.city === 'All' || item.city === filters.city;
      const matchStatus = filters.status === 'All' || item.cartStatus === filters.status;
      
      let matchAge = true;
      if (filters.ageGroup !== 'All') {
        if (filters.ageGroup === '18-25') matchAge = item.age >= 18 && item.age <= 25;
        else if (filters.ageGroup === '26-35') matchAge = item.age >= 26 && item.age <= 35;
        else if (filters.ageGroup === '36-50') matchAge = item.age >= 36 && item.age <= 50;
        else if (filters.ageGroup === '51+') matchAge = item.age >= 51;
      }

      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.city.toLowerCase().includes(searchTerm.toLowerCase());

      return matchGender && matchDevice && matchCategory && matchMonth && matchCity && matchStatus && matchAge && matchSearch;
    });
  }, [data, filters, searchTerm]);

  // KPIs
  const kpis = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(d => d.cartStatus === 'Completed');
    const revenue = completed.reduce((sum, d) => sum + d.amountSpent, 0);
    const avgOrder = completed.length > 0 ? revenue / completed.length : 0;
    const convRate = total > 0 ? (completed.length / total) * 100 : 0;
    const abandonRate = 100 - convRate;
    const avgSession = filteredData.reduce((sum, d) => sum + d.sessionDuration, 0) / (total || 1);

    return [
      { label: 'Total Customers', value: total, icon: Users, color: 'text-accent-cyan', trend: '+12%' },
      { label: 'Total Revenue', value: `₹${(revenue / 100000).toFixed(2)}L`, icon: IndianRupee, color: 'text-accent-green', trend: '+8%' },
      { label: 'Avg Order Value', value: `₹${Math.round(avgOrder)}`, icon: TrendingUp, color: 'text-accent-purple', trend: '+5%' },
      { label: 'Conversion Rate', value: `${convRate.toFixed(1)}%`, icon: Percent, color: 'text-accent-amber', trend: '-2%' },
      { label: 'Abandonment Rate', value: `${abandonRate.toFixed(1)}%`, icon: ShoppingCart, color: 'text-accent-pink', trend: '+1%' },
      { label: 'Avg Session', value: `${avgSession.toFixed(1)}m`, icon: Clock, color: 'text-accent-cyan', trend: '+3%' },
    ];
  }, [filteredData]);

  // Chart Data: Monthly Revenue
  const monthlyRevenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({
      name: m,
      revenue: filteredData.filter(d => d.month === m && d.cartStatus === 'Completed').reduce((sum, d) => sum + d.amountSpent, 0)
    }));
  }, [filteredData]);

  // Chart Data: Revenue by Category
  const categoryRevenueData = useMemo(() => {
    const categories = Array.from(new Set(data.map(d => d.category)));
    return categories.map(c => ({
      name: c,
      revenue: filteredData.filter(d => d.category === c && d.cartStatus === 'Completed').reduce((sum, d) => sum + d.amountSpent, 0)
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredData, data]);

  // Chart Data: Device Usage
  const deviceUsageData = useMemo(() => {
    const devices: Device[] = ['Mobile', 'Desktop', 'Tablet'];
    return devices.map(dev => ({
      name: dev,
      value: filteredData.filter(d => d.device === dev).length
    }));
  }, [filteredData]);

  // Chart Data: Customer Segments
  const segmentData = useMemo(() => {
    const segments: Segment[] = ['Impulse Buyer', 'Loyal Customer', 'Bargain Hunter', 'Window Shopper'];
    return segments.map(seg => ({
      name: seg,
      value: filteredData.filter(d => d.customerSegment === seg).length
    }));
  }, [filteredData]);


  // Table Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const resetFilters = () => {
    setFilters({
      gender: 'All',
      ageGroup: 'All',
      device: 'All',
      category: 'All',
      month: 'All',
      city: 'All',
      status: 'All'
    });
    setSearchTerm('');
  };

  const exportCsv = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopiq_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-accent-cyan/10 text-accent-cyan text-xs font-bold rounded-full border border-accent-cyan/20">
              {data.length === 500 ? 'Sample Data' : 'Your Data'} — {data.length} records
            </span>
            <button 
              onClick={() => onNavigate('data-entry')}
              className="text-xs text-white/40 hover:text-accent-cyan transition-colors"
            >
              Change Data
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 glass border-white/5 rounded-xl text-sm hover:bg-white/5 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass rounded-2xl p-6 border-white/5">
        <div className="flex items-center gap-2 mb-6 text-white/70">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Filter Your Data</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Gender', key: 'gender', options: ['All', 'Male', 'Female', 'Other'] },
            { label: 'Age Group', key: 'ageGroup', options: ['All', '18-25', '26-35', '36-50', '51+'] },
            { label: 'Device', key: 'device', options: ['All', 'Mobile', 'Desktop', 'Tablet'] },
            { label: 'Category', key: 'category', options: ['All', 'Electronics', 'Fashion', 'Grocery', 'Beauty', 'Sports', 'Books', 'Home Decor'] },
            { label: 'Month', key: 'month', options: ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
            { label: 'City', key: 'city', options: ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Jaipur'] },
            { label: 'Status', key: 'status', options: ['All', 'Completed', 'Abandoned'] },
          ].map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase ml-1">{f.label}</label>
              <select 
                className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-accent-cyan"
                value={(filters as any)[f.key]}
                onChange={e => setFilters({...filters, [f.key]: e.target.value})}
              >
                {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
          <div className="text-xs text-white/40">
            Showing <span className="text-white font-bold">{filteredData.length}</span> of <span className="text-white font-bold">{data.length}</span> records
          </div>
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 text-xs text-accent-pink hover:underline"
          >
            <RotateCcw className="w-3 h-3" /> Reset All Filters
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-lg bg-white/5", kpi.color)}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center text-[10px] font-bold",
                kpi.trend.startsWith('+') ? "text-accent-green" : "text-accent-pink"
              )}>
                {kpi.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
            <div className="text-xl font-bold mb-1">{kpi.value}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Row 1 */}
        <div className="glass-card p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-cyan" /> Monthly Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={monthlyRevenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                itemStyle={{ color: '#00e5ff' }}
                formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#00e5ff" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent-purple" /> Revenue by Product Category
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={categoryRevenueData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#ffffff60" fontSize={10} width={80} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {categoryRevenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Row 2 */}
        <div className="glass-card p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <MousePointer2 className="w-5 h-5 text-accent-amber" /> Device Usage
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={deviceUsageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {deviceUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-pink" /> Customer Segments
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {segmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold">All Customer Records</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search by name or city..."
              className="bg-surface/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-cyan w-full md:w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Age</th>
                <th className="p-4 font-medium">City</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Segment</th>
                <th className="p-4 font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr key={row.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white/40">{(currentPage-1)*rowsPerPage + i + 1}</td>
                  <td className="p-4 font-medium">{row.name}</td>
                  <td className="p-4">{row.age}</td>
                  <td className="p-4">{row.city}</td>
                  <td className="p-4">{row.category}</td>
                  <td className="p-4">₹{row.amountSpent.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                      row.cartStatus === 'Completed' ? "bg-accent-green/10 text-accent-green" : "bg-accent-pink/10 text-accent-pink"
                    )}>
                      {row.cartStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                      {row.customerSegment}
                    </span>
                  </td>
                  <td className="p-4">
                    {row.rating ? (
                      <div className="flex items-center gap-1 text-accent-amber">
                        {row.rating} <span className="text-[10px]">⭐</span>
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <div className="text-xs text-white/40">
            Showing <span className="text-white font-bold">{(currentPage-1)*rowsPerPage + 1}</span>–<span className="text-white font-bold">{Math.min(currentPage*rowsPerPage, filteredData.length)}</span> of <span className="text-white font-bold">{filteredData.length}</span> records
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 glass rounded-lg disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-3">Page {currentPage} of {totalPages || 1}</span>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 glass rounded-lg disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

