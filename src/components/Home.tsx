import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, IndianRupee, ShoppingCart, PieChart, Upload, MousePointer2, Lightbulb, BarChart3, Database } from 'lucide-react';
import { Page } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [counts, setCounts] = useState({ customers: 0, revenue: 0, rate: 0, categories: 0 });

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setCounts({
        customers: Math.floor(progress * 500),
        revenue: Math.floor(progress * 1250000),
        rate: Math.floor(progress * 35),
        categories: Math.floor(progress * 7)
      });
      if (currentStep >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-24 fade-in">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-accent-cyan/10 to-accent-pink/20 animate-pulse" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight"
          >
            Understand Your Customers. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-purple">
              Grow Your Business.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/70 mb-10 leading-relaxed"
          >
            ShopIQ Analytics helps you transform raw shopping data into actionable insights. 
            Identify patterns, reduce cart abandonment, and optimize your sales funnel with ease.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => onNavigate('data-entry')}
              className="w-full sm:w-auto px-8 py-4 bg-accent-cyan text-bg-main font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-8 py-4 glass text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
            >
              View Sample Dashboard
            </button>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
            {[
              { label: 'Total Customers', value: counts.customers, icon: Users, color: 'text-accent-cyan' },
              { label: 'Total Revenue', value: `₹${(counts.revenue / 100000).toFixed(1)}L`, icon: IndianRupee, color: 'text-accent-green' },
              { label: 'Abandonment Rate', value: `${counts.rate}%`, icon: ShoppingCart, color: 'text-accent-pink' },
              { label: 'Categories', value: counts.categories, icon: PieChart, color: 'text-accent-amber' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl text-center">
                <stat.icon className={cn("w-8 h-8 mx-auto mb-3", stat.color)} />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-white/60">Three simple steps to unlock your business potential</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Arrows (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-1/3 w-1/6 h-px bg-white/10 -translate-y-1/2" />
          <div className="hidden md:block absolute top-1/2 left-2/3 w-1/6 h-px bg-white/10 -translate-y-1/2" />
          
          {[
            { step: '1', title: 'Enter Your Data', desc: 'Upload CSV, type manually, or use our pre-built sample data.', icon: Upload },
            { step: '2', title: 'Instant Analysis', desc: 'Our engine automatically generates interactive charts and KPIs.', icon: BarChart3 },
            { step: '3', title: 'Get Insights', desc: 'Read AI-driven findings and strategic recommendations.', icon: Lightbulb },
          ].map((item, i) => (
            <div key={i} className="text-center group">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent-cyan/20 transition-colors border border-white/5">
                <item.icon className="w-10 h-10 text-accent-cyan" />
              </div>
              <h3 className="text-xl font-bold mb-3">Step {item.step}: {item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-white/60">Everything you need for deep customer analysis</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Upload CSV File', desc: 'Seamlessly import your existing customer data in seconds.', icon: Upload },
            { title: 'Manual Data Entry', desc: 'Add records one by one with our user-friendly form.', icon: MousePointer2 },
            { title: '10+ Interactive Charts', desc: 'Visualize trends with beautiful, responsive data visualizations.', icon: BarChart3 },
            { title: 'Smart Filters', desc: 'Drill down into specific segments, categories, or time periods.', icon: PieChart },
            { title: 'Customer Segments', desc: 'Understand different buyer personas and their behaviors.', icon: Users },
            { title: 'Export Reports', desc: 'Download your analyzed data and insights for offline use.', icon: Database },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl">
              <feature.icon className="w-10 h-10 text-accent-cyan mb-6" />
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="glass rounded-3xl p-12 text-center border-accent-cyan/20">
        <h2 className="text-3xl font-bold mb-6">Ready to analyze your data?</h2>
        <button 
          onClick={() => onNavigate('data-entry')}
          className="px-10 py-4 bg-accent-cyan text-bg-main font-bold rounded-xl hover:scale-105 transition-transform"
        >
          Start Now
        </button>
      </section>
    </div>
  );
}

