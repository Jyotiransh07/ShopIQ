import React from 'react';
import { 
  Code2, Database, Layout, Globe, 
  BarChart3, Lightbulb, User, School, Calendar, BookOpen, 
  CheckCircle2, Cpu, Layers, MousePointer2
} from 'lucide-react';
import { cn } from '../lib/utils';

export function About() {
  const fields = [
    { name: 'id', type: 'string', desc: 'Unique identifier for each customer record', example: 'cust-123' },
    { name: 'name', type: 'string', desc: 'Full name of the customer', example: 'Priya Sharma' },
    { name: 'age', type: 'number', desc: 'Age of the customer (18-80)', example: '28' },
    { name: 'gender', type: 'enum', desc: 'Gender identification', example: 'Female' },
    { name: 'city', type: 'string', desc: 'City of residence', example: 'Mumbai' },
    { name: 'device', type: 'enum', desc: 'Device used for shopping', example: 'Mobile' },
    { name: 'category', type: 'enum', desc: 'Product category browsed', example: 'Fashion' },
    { name: 'amountSpent', type: 'number', desc: 'Total transaction value (₹)', example: '2500' },
    { name: 'purchaseFrequency', type: 'number', desc: 'Number of purchases per year', example: '5' },
    { name: 'sessionDuration', type: 'number', desc: 'Time spent on site (minutes)', example: '15' },
    { name: 'cartStatus', type: 'enum', desc: 'Final outcome of the session', example: 'Completed' },
    { name: 'abandonReason', type: 'enum', desc: 'Reason for cart abandonment', example: 'Price Too High' },
    { name: 'dayOfWeek', type: 'enum', desc: 'Day of the week of purchase', example: 'Mon' },
    { name: 'hourOfDay', type: 'number', desc: 'Hour of the day (0-23)', example: '14' },
    { name: 'month', type: 'enum', desc: 'Month of the year', example: 'Jan' },
    { name: 'customerSegment', type: 'enum', desc: 'Buyer persona classification', example: 'Impulse Buyer' },
    { name: 'rating', type: 'number', desc: 'Customer satisfaction rating (1-5)', example: '5' },
  ];

  const tools = [
    { name: 'React', icon: Code2, desc: 'Component-based UI architecture' },
    { name: 'Recharts', icon: BarChart3, desc: 'Interactive data visualizations' },
    { name: 'Tailwind CSS', icon: Layout, desc: 'Utility-first modern styling' },
    { name: 'JavaScript', icon: Cpu, desc: 'Dynamic logic and data processing' },
    { name: 'Data Simulation', icon: Database, desc: 'Realistic synthetic dataset generation' },
    { name: 'Statistical Analysis', icon: Lightbulb, desc: 'Pattern recognition algorithms' },
  ];

  return (
    <div className="space-y-24 fade-in">
      {/* Project Header */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-8 tracking-tight">ShopIQ Analytics</h1>
        <p className="text-xl text-white/60 leading-relaxed">
          ShopIQ Analytics is a comprehensive data analysis platform designed to help businesses 
          understand customer shopping behavior through intuitive visualizations and automated insights.
        </p>
      </section>

      {/* What This Project Does */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">What This Project Does</h2>
          <div className="space-y-4 text-white/60 leading-relaxed">
            <p>
              This project bridges the gap between raw data and business intelligence. By analyzing a wide range of customer attributes—from demographics to session duration—it identifies the hidden patterns that drive sales and cause cart abandonment.
            </p>
            <p>
              Whether you're uploading your own CSV file or using our realistic sample data, ShopIQ provides an instant, interactive dashboard that visualizes revenue trends, device preferences, and customer segments in real-time.
            </p>
            <p>
              The platform doesn't just show you "what" happened; it uses statistical analysis to suggest "why" and provides actionable recommendations to optimize your conversion funnel and increase customer lifetime value.
            </p>
          </div>
        </div>
        <div className="glass rounded-3xl p-8 border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-cyan/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="text-accent-cyan" />
              </div>
              <div className="font-bold">Interactive Dashboards</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center">
                <Lightbulb className="text-accent-purple" />
              </div>
              <div className="font-bold">Automated Insights</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
                <Database className="text-accent-green" />
              </div>
              <div className="font-bold">Data Import & Export</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Info */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Dataset Structure</h2>
          <p className="text-white/60">A detailed breakdown of the 17 fields analyzed by ShopIQ</p>
        </div>
        <div className="glass rounded-3xl overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-white/50">
                <tr>
                  <th className="p-4 font-medium">Field Name</th>
                  <th className="p-4 font-medium">Data Type</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Example Value</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-accent-cyan">{field.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] uppercase font-bold text-white/40">
                        {field.type}
                      </span>
                    </td>
                    <td className="p-4 text-white/60">{field.desc}</td>
                    <td className="p-4 text-white/80 italic">{field.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tools Used */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Tools & Technologies</h2>
          <p className="text-white/60">Built with the latest modern web stack</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tools.map((tool, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl text-center flex flex-col items-center">
              <tool.icon className="w-8 h-8 text-accent-cyan mb-4" />
              <h4 className="font-bold mb-2">{tool.name}</h4>
              <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Analysis Methods */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Analysis Methods</h2>
          <p className="text-white/60">Our 4-step process for data intelligence</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Data Generation', desc: 'Synthetic data created using realistic probability distributions.', icon: Database },
            { title: 'EDA', desc: 'Exploratory Data Analysis to clean and prepare records for visualization.', icon: MousePointer2 },
            { title: 'Pattern Recognition', desc: 'Identifying correlations between demographics and behavior.', icon: Layers },
            { title: 'Insights', desc: 'Translating statistical findings into actionable business strategy.', icon: Lightbulb },
          ].map((m, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                <m.icon className="w-8 h-8 text-accent-cyan" />
              </div>
              <h4 className="font-bold mb-2">{m.title}</h4>
              <p className="text-xs text-white/50 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
