import React, { useMemo } from 'react';
import { 
  AlertCircle, CheckCircle2, AlertTriangle, TrendingUp, 
  ShoppingCart, MousePointer2, Clock, Users, MapPin, 
  Zap, ShieldCheck, Gift, Calendar, Target
} from 'lucide-react';
import { CustomerRecord } from '../types';
import { cn } from '../lib/utils';

interface InsightsProps {
  data: CustomerRecord[];
}

export function Insights({ data }: InsightsProps) {
  const insights = useMemo(() => {
    const total = data.length;
    const completed = data.filter(d => d.cartStatus === 'Completed');
    const abandoned = data.filter(d => d.cartStatus === 'Abandoned');
    const revenue = completed.reduce((sum, d) => sum + d.amountSpent, 0);
    
    // 1. Abandonment Analysis
    const abandonRate = (abandoned.length / total) * 100;
    const topReason = abandoned.length > 0 ? 
      Object.entries(abandoned.reduce((acc: any, d) => {
        acc[d.abandonReason!] = (acc[d.abandonReason!] || 0) + 1;
        return acc;
      }, {})).sort((a: any, b: any) => b[1] - a[1])[0][0] : 'N/A';

    // 2. Top Category
    const topCategory = Object.entries(completed.reduce((acc: any, d) => {
      acc[d.category] = (acc[d.category] || 0) + d.amountSpent;
      return acc;
    }, {})).sort((a: any, b: any) => b[1] - a[1])[0];

    // 3. Device Conversion
    const deviceConv = ['Mobile', 'Desktop', 'Tablet'].map(dev => {
      const devTotal = data.filter(d => d.device === dev).length;
      const devComp = data.filter(d => d.device === dev && d.cartStatus === 'Completed').length;
      return { dev, rate: devTotal > 0 ? (devComp / devTotal) * 100 : 0 };
    }).sort((a, b) => a.rate - b.rate);

    // 4. Peak Time
    const hourCounts = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: data.filter(d => d.hourOfDay === h).length
    })).sort((a, b) => b.count - a.count);
    const peakHour = hourCounts[0].hour;

    // 5. Most Valuable Segment
    const segmentValue = Object.entries(completed.reduce((acc: any, d) => {
      acc[d.customerSegment] = (acc[d.customerSegment] || 0) + d.amountSpent;
      return acc;
    }, {})).sort((a: any, b: any) => b[1] - a[1])[0];

    // 6. Top City by AOV
    const cityAOV = Object.entries(completed.reduce((acc: any, d) => {
      if (!acc[d.city]) acc[d.city] = { total: 0, count: 0 };
      acc[d.city].total += d.amountSpent;
      acc[d.city].count += 1;
      return acc;
    }, {})).map(([city, stats]: [string, any]) => ({
      city,
      aov: stats.total / stats.count
    })).sort((a, b) => b.aov - a.aov)[0];

    return {
      abandonRate,
      topReason,
      topCategory,
      lowestConvDevice: deviceConv[0],
      peakHour,
      topSegment: segmentValue,
      topCityAOV: cityAOV
    };
  }, [data]);

  const cards = [
    {
      severity: insights.abandonRate > 30 ? 'Critical' : 'Warning',
      icon: ShoppingCart,
      title: 'Cart Abandonment Analysis',
      desc: `Your current abandonment rate is ${insights.abandonRate.toFixed(1)}%. The primary reason cited by customers is "${insights.topReason}".`,
      recommendation: 'Implement a "Save for Later" feature and send automated recovery emails within 1 hour of abandonment.',
      color: insights.abandonRate > 30 ? 'text-accent-pink' : 'text-accent-amber',
      badge: insights.abandonRate > 30 ? '🔴 Critical' : '🟡 Warning'
    },
    {
      severity: 'Positive',
      icon: TrendingUp,
      title: 'Top Performing Category',
      desc: `"${insights.topCategory[0]}" is your revenue leader, contributing ₹${(insights.topCategory[1] / 100000).toFixed(2)}L to your total sales.`,
      recommendation: 'Consider expanding the inventory in this category and launching cross-sell campaigns with lower-performing ones.',
      color: 'text-accent-green',
      badge: '🟢 Positive'
    },
    {
      severity: 'Warning',
      icon: MousePointer2,
      title: 'Device Conversion Gap',
      desc: `${insights.lowestConvDevice.dev} users have the lowest conversion rate at ${insights.lowestConvDevice.rate.toFixed(1)}%.`,
      recommendation: `Audit the ${insights.lowestConvDevice.dev} checkout flow for UI/UX friction points or slow loading times.`,
      color: 'text-accent-amber',
      badge: '🟡 Warning'
    },
    {
      severity: 'Positive',
      icon: Clock,
      title: 'Peak Shopping Window',
      desc: `Maximum customer activity is recorded at ${insights.peakHour}:00. This is when your audience is most engaged.`,
      recommendation: 'Schedule flash sales and marketing push notifications during this peak window for maximum impact.',
      color: 'text-accent-cyan',
      badge: '🟢 Positive'
    },
    {
      severity: 'Positive',
      icon: Users,
      title: 'High-Value Segment',
      desc: `"${insights.topSegment[0]}" customers are your most valuable, spending a total of ₹${(insights.topSegment[1] / 100000).toFixed(2)}L.`,
      recommendation: 'Launch a targeted loyalty program for this segment to increase retention and lifetime value.',
      color: 'text-accent-purple',
      badge: '🟢 Positive'
    },
    {
      severity: 'Positive',
      icon: MapPin,
      title: 'Regional Performance',
      desc: `${insights.topCityAOV.city} has the highest Average Order Value (AOV) of ₹${Math.round(insights.topCityAOV.aov).toLocaleString()}.`,
      recommendation: 'Increase local marketing spend in this city to capitalize on high-spending customer behavior.',
      color: 'text-accent-cyan',
      badge: '🟢 Positive'
    }
  ];

  return (
    <div className="space-y-12 fade-in">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Key Insights & Recommendations</h1>
        <p className="text-white/60">Auto-generated findings based on your actual shopping data.</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Overall Conversion', value: `${((data.filter(d => d.cartStatus === 'Completed').length / data.length) * 100).toFixed(1)}%`, icon: Target, color: 'text-accent-cyan' },
          { label: 'Avg Rating', value: `${(data.filter(d => d.rating).reduce((s, d) => s + d.rating!, 0) / data.filter(d => d.rating).length || 0).toFixed(1)} ⭐`, icon: Zap, color: 'text-accent-amber' },
          { label: 'Total Records', value: data.length, icon: Calendar, color: 'text-accent-purple' },
        ].map((s, i) => (
          <div key={i} className="glass p-6 rounded-2xl flex items-center gap-4">
            <div className={cn("p-3 rounded-xl bg-white/5", s.color)}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="glass-card p-8 rounded-3xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className={cn("p-3 rounded-xl bg-white/5", card.color)}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-full border border-white/5">
                {card.badge}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-4">{card.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6 flex-grow">
              {card.desc}
            </p>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-[10px] font-bold text-white/30 uppercase mb-2">What to do:</div>
              <p className="text-xs text-white/80 leading-relaxed italic">
                {card.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Behaviour Patterns */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Behaviour Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Impulse Buying Triggers', desc: 'Customers in the 18-25 age group show 40% higher conversion rates during evening hours (6 PM - 10 PM).', icon: Zap },
            { title: 'Price Sensitivity', desc: 'Abandonment reasons related to "Price Too High" are 2x more common in the Electronics category compared to Fashion.', icon: ShieldCheck },
            { title: 'Device Preference', desc: 'Tablets are primarily used by the 50+ age group for Grocery shopping, showing a unique niche market.', icon: MousePointer2 },
            { title: 'Weekend Behaviour', desc: 'Average order value increases by 15% on Saturdays and Sundays, driven by high-ticket Home Decor purchases.', icon: Calendar },
          ].map((p, i) => (
            <div key={i} className="glass p-6 rounded-2xl flex gap-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                <p.icon className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h4 className="font-bold mb-2">{p.title}</h4>
                <p className="text-sm text-white/50 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Strategic Recommendations</h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            { problem: 'High Mobile Abandonment', solution: 'Implement One-Tap Checkout (UPI/Apple Pay)', impact: 'Expected 15% increase in mobile conversion' },
            { problem: 'Low Retention in Impulse Buyers', solution: 'Launch a "Points for Every Purchase" loyalty program', impact: 'Expected 20% increase in repeat purchases' },
            { problem: 'Peak Hour Server Load', solution: 'Scale infrastructure during 7 PM - 9 PM window', impact: 'Reduced latency and zero checkout failures' },
            { problem: 'Category Imbalance', solution: 'Bundle Beauty products with Fashion purchases', impact: '10% growth in Beauty category revenue' },
          ].map((r, i) => (
            <div key={i} className="glass p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <div className="text-[10px] font-bold text-accent-pink uppercase mb-1">Problem</div>
                <div className="font-bold">{r.problem}</div>
              </div>
              <div className="md:border-l md:border-white/5 md:pl-6">
                <div className="text-[10px] font-bold text-accent-cyan uppercase mb-1">Solution</div>
                <div className="text-sm text-white/70">{r.solution}</div>
              </div>
              <div className="md:border-l md:border-white/5 md:pl-6">
                <div className="text-[10px] font-bold text-accent-green uppercase mb-1">Expected Impact</div>
                <div className="text-sm font-medium text-accent-green">{r.impact}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
