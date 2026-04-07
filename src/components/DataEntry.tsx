import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileText, Plus, Database, Trash2, CheckCircle2, 
  Download, AlertCircle, Lightbulb, User, ShoppingCart, 
  Clock, Check, ChevronRight, ChevronLeft, Monitor, 
  Smartphone, Tablet, Star, Zap, ShieldCheck, Gift, Target,
  XCircle, AlertTriangle, MousePointer2, LayoutDashboard
} from 'lucide-react';
import { 
  CustomerRecord, Page, Gender, Device, Category, 
  CartStatus, AbandonReason, Segment, DayOfWeek, Month 
} from '../types';
import { generateSampleData } from '../data/sampleData';
import { cn } from '../lib/utils';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface DataEntryProps {
  onDataLoaded: (data: CustomerRecord[]) => void;
}

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Jaipur', 'Other'];
const CATEGORIES: { id: Category; name: string; emoji: string }[] = [
  { id: 'Electronics', name: 'Electronics', emoji: '🖥️' },
  { id: 'Fashion', name: 'Fashion', emoji: '👗' },
  { id: 'Grocery', name: 'Grocery', emoji: '🛒' },
  { id: 'Beauty', name: 'Beauty', emoji: '💄' },
  { id: 'Sports', name: 'Sports', emoji: '⚽' },
  { id: 'Books', name: 'Books', emoji: '📚' },
  { id: 'Home Decor', name: 'Home Decor', emoji: '🏠' },
];

const SEGMENTS: { id: Segment; name: string; icon: any; desc: string }[] = [
  { id: 'Impulse Buyer', name: 'Impulse Buyer', icon: Zap, desc: 'Buys quickly without much thought' },
  { id: 'Loyal Customer', name: 'Loyal Customer', icon: ShieldCheck, desc: 'Returns frequently, high lifetime value' },
  { id: 'Bargain Hunter', name: 'Bargain Hunter', icon: Gift, desc: 'Waits for deals and discounts' },
  { id: 'Window Shopper', name: 'Window Shopper', icon: MousePointer2, desc: 'Browses often but rarely purchases' },
];

const ABANDON_REASONS: { id: AbandonReason; name: string; emoji: string }[] = [
  { id: 'Price Too High', name: 'Price Too High', emoji: '💸' },
  { id: 'Bad Website UX', name: 'Bad Website UX', emoji: '😵' },
  { id: 'Got Distracted', name: 'Got Distracted', emoji: '📱' },
  { id: 'Payment Failed', name: 'Payment Failed', emoji: '💳' },
  { id: 'Out of Stock', name: 'Out of Stock', emoji: '📦' },
  { id: 'Found Cheaper Elsewhere', name: 'Found Cheaper Elsewhere', emoji: '🏷️' },
];

const MONTHS: Month[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function DataEntry({ onDataLoaded }: DataEntryProps) {
  const [method, setMethod] = useState<'upload' | 'manual' | 'sample' | null>(null);
  const [manualData, setManualData] = useState<CustomerRecord[]>([]);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CustomerRecord>>({
    name: '',
    age: 25,
    gender: 'Male',
    city: '',
    device: 'Mobile',
    category: 'Fashion',
    amountSpent: 0,
    purchaseFrequency: 5,
    sessionDuration: 25,
    cartStatus: 'Completed',
    abandonReason: null,
    dayOfWeek: 'Mon',
    hourOfDay: 14,
    month: 'Jan',
    customerSegment: 'Impulse Buyer',
    rating: 5
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.name || formData.name.length < 2) newErrors.name = 'Full Name must be at least 2 characters';
      if (!formData.age || formData.age < 18 || formData.age > 80) newErrors.age = 'Age must be between 18 and 80';
      if (!formData.city) newErrors.city = 'Please select a city';
    } else if (currentStep === 2) {
      if (!formData.category) newErrors.category = 'Please select a product category';
      if (formData.amountSpent === undefined || formData.amountSpent < 0) newErrors.amountSpent = 'Amount spent cannot be negative';
      if (!formData.purchaseFrequency || formData.purchaseFrequency < 1 || formData.purchaseFrequency > 50) newErrors.purchaseFrequency = 'Frequency must be between 1 and 50';
    } else if (currentStep === 4) {
      if (formData.cartStatus === 'Abandoned' && !formData.abandonReason) newErrors.abandonReason = 'Abandon reason is required when cart is abandoned';
      if (!formData.customerSegment) newErrors.customerSegment = 'Please select a customer segment';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: 25,
      gender: 'Male',
      city: '',
      device: 'Mobile',
      category: 'Fashion',
      amountSpent: 0,
      purchaseFrequency: 5,
      sessionDuration: 25,
      cartStatus: 'Completed',
      abandonReason: null,
      dayOfWeek: 'Mon',
      hourOfDay: 14,
      month: 'Jan',
      customerSegment: 'Impulse Buyer',
      rating: 5
    });
    setStep(1);
    setErrors({});
  };

  const handleAddCustomer = async (goToDashboard: boolean = false) => {
    if (!validateStep(4)) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to save data.');
        return;
      }

      setIsSaving(true);
      const newEntry = {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        city: formData.city,
        device: formData.device,
        category: formData.category,
        amount_spent: formData.amountSpent,
        purchase_frequency: formData.purchaseFrequency,
        session_duration: formData.sessionDuration,
        cart_status: formData.cartStatus,
        abandon_reason: formData.abandonReason,
        day_of_week: formData.dayOfWeek,
        hour_of_day: formData.hourOfDay,
        month: formData.month,
        customer_segment: formData.customerSegment,
        rating: formData.rating,
        user_id: session.user.id
      };

      const { data: savedData, error } = await supabase
        .from('customer_records')
        .insert([newEntry])
        .select();

      if (error) throw error;

      const updatedData = [...manualData, savedData[0] as any];
      setManualData(updatedData);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      if (goToDashboard) {
        onDataLoaded(updatedData);
      } else {
        resetForm();
      }
    } catch (err: any) {
      console.error('Error saving data:', err);
      alert('Failed to save data: ' + (err.message || 'Supabase not configured.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          alert('Please log in to upload data.');
          return;
        }

        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          complete: async (results) => {
            const validData = results.data.filter((row: any) => row.name && row.age);
            setCsvPreview(validData.slice(0, 5));
            
            setIsSaving(true);
            try {
              const formattedData = validData.map((row: any) => ({
                name: row.name,
                age: row.age,
                gender: row.gender,
                city: row.city,
                device: row.device,
                category: row.category,
                amount_spent: row.amountSpent,
                purchase_frequency: row.purchaseFrequency,
                session_duration: row.sessionDuration,
                cart_status: row.cartStatus,
                abandon_reason: row.abandonReason,
                day_of_week: row.dayOfWeek,
                hour_of_day: row.hourOfDay,
                month: row.month,
                customer_segment: row.customerSegment,
                rating: row.rating,
                user_id: session.user.id
              }));

              const { data: savedRecords, error } = await supabase
                .from('customer_records')
                .insert(formattedData)
                .select();

              if (error) throw error;

              setUploadSuccess(true);
              setManualData(savedRecords as any);
            } catch (err: any) {
              console.error('Error uploading CSV:', err);
              alert('Failed to upload CSV: ' + (err.message || 'Supabase not configured.'));
            } finally {
              setIsSaving(false);
            }
          }
        });
      } catch (err: any) {
        alert('Supabase not configured or failed to initialize.');
      }
    }
  };

  const downloadTemplate = () => {
    const headers = 'name,age,gender,city,device,category,amountSpent,purchaseFrequency,sessionDuration,cartStatus,abandonReason,dayOfWeek,hourOfDay,month,customerSegment,rating';
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopiq_template.csv';
    a.click();
  };

  const getTimeLabel = (hour: number) => {
    if (hour === 0) return { label: '12:00 AM (Midnight)', color: 'text-accent-purple' };
    if (hour < 6) return { label: `${hour}:00 AM (Night)`, color: 'text-accent-purple' };
    if (hour === 6) return { label: '6:00 AM (Morning)', color: 'text-accent-amber' };
    if (hour < 12) return { label: `${hour}:00 AM (Morning)`, color: 'text-accent-amber' };
    if (hour === 12) return { label: '12:00 PM (Noon)', color: 'text-accent-cyan' };
    if (hour < 18) return { label: `${hour - 12}:00 PM (Afternoon)`, color: 'text-accent-cyan' };
    if (hour === 18) return { label: '6:00 PM (Evening)', color: 'text-accent-pink' };
    return { label: `${hour - 12}:00 PM (Night)`, color: 'text-accent-purple' };
  };

  return (
    <div className="space-y-12 fade-in">
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 bg-accent-green text-bg-main px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>✓ Customer added! ({manualData.length} total records)</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Enter Your Shopping Data</h1>
        <p className="text-white/60">Choose how you want to add data — all methods are quick and easy.</p>
      </div>

      {/* Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setMethod('upload')}
          className={cn(
            "glass-card p-8 rounded-3xl text-left transition-all",
            method === 'upload' ? "ring-2 ring-accent-cyan bg-accent-cyan/5" : "hover:bg-white/5"
          )}
        >
          <div className="w-12 h-12 bg-accent-cyan/20 rounded-xl flex items-center justify-center mb-6">
            <Upload className="text-accent-cyan" />
          </div>
          <h3 className="text-xl font-bold mb-2">Upload CSV File</h3>
          <p className="text-white/50 text-sm mb-6">Import large datasets instantly from your local machine.</p>
          <div className="text-xs font-medium text-accent-cyan uppercase tracking-wider">Select Method →</div>
        </button>

        <button 
          onClick={() => setMethod('manual')}
          className={cn(
            "glass-card p-8 rounded-3xl text-left transition-all",
            method === 'manual' ? "ring-2 ring-accent-purple bg-accent-purple/5" : "hover:bg-white/5"
          )}
        >
          <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center mb-6">
            <Plus className="text-accent-purple" />
          </div>
          <h3 className="text-xl font-bold mb-2">Manual Entry Form</h3>
          <p className="text-white/50 text-sm mb-6">Type in records one by one with our guided form.</p>
          <div className="text-xs font-medium text-accent-purple uppercase tracking-wider">Select Method →</div>
        </button>

        <button 
          onClick={() => setMethod('sample')}
          className={cn(
            "glass-card p-8 rounded-3xl text-left transition-all",
            method === 'sample' ? "ring-2 ring-accent-amber bg-accent-amber/5" : "hover:bg-white/5"
          )}
        >
          <div className="w-12 h-12 bg-accent-amber/20 rounded-xl flex items-center justify-center mb-6">
            <Database className="text-accent-amber" />
          </div>
          <h3 className="text-xl font-bold mb-2">Use Sample Data</h3>
          <p className="text-white/50 text-sm mb-6">Load 500 pre-generated records to explore immediately.</p>
          <div className="text-xs font-medium text-accent-amber uppercase tracking-wider">Select Method →</div>
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {!method && (
          <div className="glass rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="text-white/20 w-8 h-8" />
            </div>
            <p className="text-white/40">Please select a data entry method above to continue.</p>
          </div>
        )}

        {method === 'upload' && (
          <div className="glass rounded-3xl p-8 space-y-8 fade-in">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-accent-cyan/50 hover:bg-accent-cyan/5 transition-all cursor-pointer group"
            >
              <input type="file" ref={fileInputRef} onChange={handleCsvUpload} accept=".csv" className="hidden" />
              <Upload className="w-12 h-12 text-white/20 mx-auto mb-4 group-hover:text-accent-cyan transition-colors" />
              <p className="text-lg font-medium mb-2">Click to browse or drag your CSV file here</p>
              <p className="text-white/40 text-sm">Supported format: .csv files only</p>
            </div>
            <div className="flex items-center justify-between">
              <button onClick={downloadTemplate} className="flex items-center gap-2 text-sm text-accent-cyan hover:underline">
                <Download className="w-4 h-4" /> Download CSV Template
              </button>
              {uploadSuccess && (
                <div className="flex items-center gap-2 text-accent-green font-medium">
                  <CheckCircle2 className="w-5 h-5" /> {manualData.length} records loaded successfully
                </div>
              )}
            </div>
            {csvPreview.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-white/70">Preview (First 5 rows)</h4>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-white/50">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Age</th>
                        <th className="p-3">City</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="p-3">{row.name}</td>
                          <td className="p-3">{row.age}</td>
                          <td className="p-3">{row.city}</td>
                          <td className="p-3">{row.category}</td>
                          <td className="p-3">₹{row.amountSpent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="pt-6 flex justify-end">
              <button 
                disabled={manualData.length === 0}
                onClick={() => onDataLoaded(manualData)}
                className="px-8 py-3 bg-accent-cyan text-bg-main font-bold rounded-xl disabled:opacity-50"
              >
                Analyze This Data
              </button>
            </div>
          </div>
        )}

        {method === 'manual' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
            {/* Wizard Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Bar */}
              <div className="glass rounded-2xl p-4 flex items-center justify-between">
                <div className="text-sm font-bold">
                  Step {step} of 4 — {
                    step === 1 ? 'Customer Information' :
                    step === 2 ? 'Shopping Details' :
                    step === 3 ? 'Device & Time' : 'Purchase Outcome'
                  }
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(s => (
                    <div 
                      key={s} 
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-300",
                        s === step ? "bg-accent-cyan scale-125" : s < step ? "bg-accent-green" : "bg-white/10"
                      )} 
                    />
                  ))}
                </div>
              </div>

              {/* Step Card */}
              <div className={cn(
                "glass rounded-3xl p-8 border-l-4 min-h-[500px] flex flex-col",
                step === 1 ? "border-accent-cyan" :
                step === 2 ? "border-accent-purple" :
                step === 3 ? "border-accent-amber" : "border-accent-green"
              )}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8 flex-grow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-accent-cyan/20 rounded-lg"><User className="w-5 h-5 text-accent-cyan" /></div>
                        <h2 className="text-2xl font-bold">Customer Information</h2>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/50 uppercase">Full Name*</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Priya Sharma"
                            className={cn(
                              "w-full bg-surface border rounded-xl p-4 focus:outline-none transition-all",
                              errors.name ? "border-accent-pink" : "border-white/10 focus:border-accent-cyan"
                            )}
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                          {errors.name && <p className="text-accent-pink text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/50 uppercase">Age*</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 28"
                            className={cn(
                              "w-full bg-surface border rounded-xl p-4 focus:outline-none transition-all",
                              errors.age ? "border-accent-pink" : "border-white/10 focus:border-accent-cyan"
                            )}
                            value={formData.age || ''}
                            onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                          />
                          {errors.age && <p className="text-accent-pink text-xs mt-1">{errors.age}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/50 uppercase">Gender*</label>
                          <div className="flex gap-3">
                            {['Male', 'Female', 'Other'].map(g => (
                              <button 
                                key={g}
                                onClick={() => setFormData({...formData, gender: g as Gender})}
                                className={cn(
                                  "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                                  formData.gender === g 
                                    ? "bg-accent-cyan text-bg-main shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                                    : "bg-white/5 text-white/50 hover:bg-white/10"
                                )}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/50 uppercase">City*</label>
                          <select 
                            className={cn(
                              "w-full bg-surface border rounded-xl p-4 focus:outline-none transition-all appearance-none",
                              errors.city ? "border-accent-pink" : "border-white/10 focus:border-accent-cyan"
                            )}
                            value={formData.city}
                            onChange={e => setFormData({...formData, city: e.target.value})}
                          >
                            <option value="">Select your city...</option>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          {errors.city && <p className="text-accent-pink text-xs mt-1">{errors.city}</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8 flex-grow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-accent-purple/20 rounded-lg"><ShoppingCart className="w-5 h-5 text-accent-purple" /></div>
                        <h2 className="text-2xl font-bold">Shopping Details</h2>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/50 uppercase">Product Category*</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {CATEGORIES.map(cat => (
                              <button 
                                key={cat.id}
                                onClick={() => setFormData({...formData, category: cat.id})}
                                className={cn(
                                  "p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all",
                                  formData.category === cat.id 
                                    ? "border-accent-purple bg-accent-purple/10 shadow-[0_0_15px_rgba(180,124,255,0.2)]" 
                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                )}
                              >
                                <span className="text-2xl">{cat.emoji}</span>
                                <span className="text-[10px] font-bold uppercase tracking-tight">{cat.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/50 uppercase">Amount Spent ₹</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">₹</span>
                            <input 
                              type="number" 
                              placeholder="e.g. 2500"
                              className="w-full bg-surface border border-white/10 rounded-xl p-4 pl-10 focus:outline-none focus:border-accent-purple transition-all"
                              value={formData.amountSpent || ''}
                              onChange={e => setFormData({...formData, amountSpent: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <p className="text-[10px] text-white/30 italic">Enter 0 if purchase was not completed</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/50 uppercase">Purchase Frequency (per year)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 5"
                            className="w-full bg-surface border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent-purple transition-all"
                            value={formData.purchaseFrequency || ''}
                            onChange={e => setFormData({...formData, purchaseFrequency: parseInt(e.target.value)})}
                          />
                          <p className="text-[10px] text-white/30 italic">How many times does this customer shop per year?</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-white/50 uppercase">Session Duration (minutes)</label>
                            <span className="text-sm font-bold text-accent-purple">{formData.sessionDuration} minutes</span>
                          </div>
                          <input 
                            type="range" min="1" max="120" step="1"
                            className="w-full accent-accent-purple"
                            value={formData.sessionDuration}
                            onChange={e => setFormData({...formData, sessionDuration: parseInt(e.target.value)})}
                          />
                          <div className="flex justify-between text-[10px] text-white/20 font-bold px-1">
                            <span>1</span><span>15</span><span>30</span><span>60</span><span>90</span><span>120</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8 flex-grow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-accent-amber/20 rounded-lg"><Clock className="w-5 h-5 text-accent-amber" /></div>
                        <h2 className="text-2xl font-bold">Device & Time</h2>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-white/50 uppercase">Device Used*</label>
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { id: 'Mobile', icon: Smartphone, emoji: '📱' },
                              { id: 'Desktop', icon: Monitor, emoji: '💻' },
                              { id: 'Tablet', icon: Tablet, emoji: '📱' }
                            ].map(dev => (
                              <button 
                                key={dev.id}
                                onClick={() => setFormData({...formData, device: dev.id as Device})}
                                className={cn(
                                  "p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                                  formData.device === dev.id 
                                    ? "border-accent-cyan bg-accent-cyan/10 shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                )}
                              >
                                <dev.icon className={cn("w-8 h-8", formData.device === dev.id ? "text-accent-cyan" : "text-white/20")} />
                                <span className="text-xs font-bold uppercase">{dev.id}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-bold text-white/50 uppercase">Day of Week*</label>
                          <div className="flex flex-wrap gap-2">
                            {DAYS.map(day => (
                              <button 
                                key={day}
                                onClick={() => setFormData({...formData, dayOfWeek: day})}
                                className={cn(
                                  "px-4 py-2 rounded-full text-xs font-bold transition-all",
                                  formData.dayOfWeek === day 
                                    ? "bg-accent-amber text-bg-main" 
                                    : (day === 'Sat' || day === 'Sun')
                                      ? "bg-accent-amber/10 text-accent-amber border border-accent-amber/20"
                                      : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10"
                                )}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-white/50 uppercase">Hour of Purchase*</label>
                            <span className={cn("text-sm font-bold transition-colors", getTimeLabel(formData.hourOfDay || 0).color)}>
                              {getTimeLabel(formData.hourOfDay || 0).label}
                            </span>
                          </div>
                          <input 
                            type="range" min="0" max="23" step="1"
                            className="w-full accent-accent-amber"
                            value={formData.hourOfDay}
                            onChange={e => setFormData({...formData, hourOfDay: parseInt(e.target.value)})}
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-bold text-white/50 uppercase">Month*</label>
                          <div className="grid grid-cols-4 gap-2">
                            {MONTHS.map(m => (
                              <button 
                                key={m}
                                onClick={() => setFormData({...formData, month: m})}
                                className={cn(
                                  "py-2 rounded-lg text-xs font-bold transition-all border",
                                  formData.month === m 
                                    ? "bg-accent-amber border-accent-amber text-bg-main" 
                                    : (m === 'Oct' || m === 'Dec')
                                      ? "bg-white/5 border-accent-amber/30 text-white/70"
                                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                )}
                              >
                                {m}{(m === 'Oct' || m === 'Dec') && ' ⭐'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8 flex-grow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-accent-green/20 rounded-lg"><Check className="w-5 h-5 text-accent-green" /></div>
                        <h2 className="text-2xl font-bold">Purchase Outcome</h2>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-white/50 uppercase">Cart Status*</label>
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => setFormData({...formData, cartStatus: 'Completed'})}
                              className={cn(
                                "p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                                formData.cartStatus === 'Completed' 
                                  ? "border-accent-green bg-accent-green/10 shadow-[0_0_20px_rgba(0,230,118,0.2)]" 
                                  : "border-white/5 bg-white/5 hover:bg-white/10"
                              )}
                            >
                              <CheckCircle2 className={cn("w-8 h-8", formData.cartStatus === 'Completed' ? "text-accent-green" : "text-white/20")} />
                              <span className="text-xs font-bold uppercase">✅ Completed</span>
                            </button>
                            <button 
                              onClick={() => setFormData({...formData, cartStatus: 'Abandoned', amountSpent: 0})}
                              className={cn(
                                "p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                                formData.cartStatus === 'Abandoned' 
                                  ? "border-accent-pink bg-accent-pink/10 shadow-[0_0_20px_rgba(255,77,141,0.2)]" 
                                  : "border-white/5 bg-white/5 hover:bg-white/10"
                              )}
                            >
                              <XCircle className={cn("w-8 h-8", formData.cartStatus === 'Abandoned' ? "text-accent-pink" : "text-white/20")} />
                              <span className="text-xs font-bold uppercase">❌ Abandoned</span>
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {formData.cartStatus === 'Abandoned' && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-2"
                            >
                              <label className="text-xs font-bold text-white/50 uppercase">Abandon Reason*</label>
                              <select 
                                className={cn(
                                  "w-full bg-surface border rounded-xl p-4 focus:outline-none transition-all",
                                  errors.abandonReason ? "border-accent-pink" : "border-white/10 focus:border-accent-pink"
                                )}
                                value={formData.abandonReason || ''}
                                onChange={e => setFormData({...formData, abandonReason: e.target.value as AbandonReason})}
                              >
                                <option value="">Select reason...</option>
                                {ABANDON_REASONS.map(r => <option key={r.id} value={r.id!}>{r.emoji} {r.name}</option>)}
                              </select>
                              {errors.abandonReason && <p className="text-accent-pink text-xs mt-1">{errors.abandonReason}</p>}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="space-y-3">
                          <label className="text-xs font-bold text-white/50 uppercase">Customer Segment*</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SEGMENTS.map(seg => (
                              <button 
                                key={seg.id}
                                onClick={() => setFormData({...formData, customerSegment: seg.id})}
                                className={cn(
                                  "p-4 rounded-2xl border text-left transition-all flex items-start gap-3",
                                  formData.customerSegment === seg.id 
                                    ? "border-accent-purple bg-accent-purple/10 shadow-[0_0_15px_rgba(180,124,255,0.2)]" 
                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                )}
                              >
                                <div className={cn("p-2 rounded-lg shrink-0", formData.customerSegment === seg.id ? "bg-accent-purple/20 text-accent-purple" : "bg-white/5 text-white/20")}>
                                  <seg.icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold mb-1">{seg.name}</div>
                                  <div className="text-[10px] text-white/40 leading-tight">{seg.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <AnimatePresence>
                          {formData.cartStatus === 'Completed' && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-3"
                            >
                              <label className="text-xs font-bold text-white/50 uppercase">Rating ⭐</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button 
                                    key={star}
                                    onClick={() => setFormData({...formData, rating: star})}
                                    className="transition-transform hover:scale-110"
                                  >
                                    <Star 
                                      className={cn(
                                        "w-8 h-8 transition-colors",
                                        (formData.rating || 0) >= star ? "fill-accent-amber text-accent-amber" : "text-white/10"
                                      )} 
                                    />
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-white/30 italic">1=Very Poor, 5=Excellent</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-10 mt-auto border-t border-white/5">
                  <button 
                    onClick={prevStep}
                    disabled={step === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white/5 text-white/50 hover:bg-white/10 disabled:opacity-0 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  
                  <div className="flex gap-3">
                    {step < 4 ? (
                      <button 
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8 py-3 bg-accent-cyan text-bg-main font-bold rounded-xl hover:scale-105 transition-transform"
                      >
                        Next Section <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleAddCustomer(false)}
                          disabled={isSaving}
                          className="px-6 py-3 bg-white/5 text-white/80 font-bold rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save & Add Another'}
                        </button>
                        <button 
                          onClick={() => handleAddCustomer(true)}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-8 py-3 bg-accent-green text-bg-main font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,230,118,0.3)] disabled:opacity-50"
                        >
                          {isSaving ? 'Adding...' : 'Add Customer'} <Check className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="space-y-6">
              <div className="sticky top-24">
                <div className="text-xs font-bold text-white/40 uppercase mb-4 tracking-widest">Live Preview</div>
                <div className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <div className={cn(
                    "h-2",
                    step === 1 ? "bg-accent-cyan" :
                    step === 2 ? "bg-accent-purple" :
                    step === 3 ? "bg-accent-amber" : "bg-accent-green"
                  )} />
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl">
                        {formData.gender === 'Male' ? '👨' : formData.gender === 'Female' ? '👩' : '👤'}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{formData.name || 'New Customer'}</div>
                        <div className="text-xs text-white/40">{formData.age || '??'} years • {formData.city || 'Location'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Category</div>
                        <div className="text-sm font-bold flex items-center gap-2">
                          {CATEGORIES.find(c => c.id === formData.category)?.emoji} {formData.category}
                        </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Spent</div>
                        <div className="text-sm font-bold text-accent-green">₹{formData.amountSpent?.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Device</div>
                        <div className="text-sm font-bold flex items-center gap-2">
                          {formData.device === 'Mobile' ? '📱' : formData.device === 'Desktop' ? '💻' : '📟'} {formData.device}
                        </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Status</div>
                        <div className={cn(
                          "text-sm font-bold uppercase",
                          formData.cartStatus === 'Completed' ? "text-accent-green" : "text-accent-pink"
                        )}>
                          {formData.cartStatus}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Segment:</span>
                        <span className="font-bold text-accent-purple">{formData.customerSegment}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Time:</span>
                        <span className="font-bold text-accent-amber">{formData.dayOfWeek}, {formData.hourOfDay}:00</span>
                      </div>
                      {formData.cartStatus === 'Abandoned' && formData.abandonReason && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Reason:</span>
                          <span className="font-bold text-accent-pink">{formData.abandonReason}</span>
                        </div>
                      )}
                      {formData.cartStatus === 'Completed' && formData.rating && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Rating:</span>
                          <span className="font-bold text-accent-amber">{'⭐'.repeat(formData.rating)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {manualData.length > 0 && (
                  <div className="mt-8">
                    <button 
                      onClick={() => onDataLoaded(manualData)}
                      className="w-full py-4 glass border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                    >
                      <LayoutDashboard className="w-5 h-5 text-accent-cyan" /> Analyze {manualData.length} Records
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {method === 'sample' && (
          <div className="glass rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center py-12 fade-in">
            <div className="w-20 h-20 bg-accent-amber/10 rounded-3xl flex items-center justify-center mb-8">
              <Database className="w-10 h-10 text-accent-amber" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Load 500 Realistic Records</h3>
            <p className="text-white/50 max-w-md mb-10">
              Explore the full power of ShopIQ with our pre-generated dataset including 
              diverse Indian cities, segments, and shopping behaviors.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-10 text-left max-w-md w-full">
              {['Indian Names & Cities', '65% Conversion Rate', 'All 7 Categories', '4 Customer Segments'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-accent-green" /> {f}
                </div>
              ))}
            </div>
            <button 
              onClick={() => onDataLoaded(generateSampleData(500))}
              className="px-10 py-4 bg-accent-amber text-bg-main font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Load Sample Data & Explore
            </button>
          </div>
        )}
      </div>

      {/* Tips Box */}
      <div className="bg-accent-cyan/5 border border-accent-cyan/20 rounded-2xl p-6 flex gap-4 items-start">
        <div className="p-2 bg-accent-cyan/20 rounded-lg">
          <Lightbulb className="w-5 h-5 text-accent-cyan" />
        </div>
        <div>
          <h4 className="font-bold text-accent-cyan mb-1">Pro Tip</h4>
          <p className="text-sm text-white/60 leading-relaxed">
            For the most accurate insights, we recommend adding at least 50 records. 
            The more data you provide, the better our pattern recognition algorithms can identify trends 
            specific to your business.
          </p>
        </div>
      </div>
    </div>
  );
}

