import React, { useState, useEffect } from 'react';
import { Menu, X, BarChart3, Home, Database, LayoutDashboard, Lightbulb, Info, LogOut, User } from 'lucide-react';
import { Page } from '../types';
import { cn } from '../lib/utils';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  user: SupabaseUser | null;
  onLogout: () => void;
}

export function Layout({ children, currentPage, onPageChange, user, onLogout }: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'data-entry', label: 'Enter Data', icon: Database },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8",
          isScrolled ? "py-3 glass border-b" : "py-6 bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onPageChange('home')}
          >
            <div className="p-2 bg-accent-cyan rounded-lg group-hover:rotate-12 transition-transform">
              <BarChart3 className="w-6 h-6 text-bg-main" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              ShopIQ <span className="text-accent-cyan">Analytics</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onPageChange(link.id as Page)}
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors hover:text-accent-cyan",
                  currentPage === link.id ? "text-accent-cyan" : "text-white/70"
                )}
              >
                {link.label}
                {currentPage === link.id && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent-cyan rounded-full" />
                )}
              </button>
            ))}
            <div className="h-4 w-px bg-white/10 mx-2" />
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <User className="w-4 h-4 text-accent-cyan" />
                  <span className="text-xs font-medium text-white/70 max-w-[100px] truncate">
                    {user.user_metadata.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-white/50 hover:text-red-400 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onPageChange('login')}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-accent-cyan",
                    currentPage === 'login' ? "text-accent-cyan" : "text-white/70"
                  )}
                >
                  Log in
                </button>
                <button
                  onClick={() => onPageChange('signup')}
                  className="px-5 py-2 bg-accent-cyan text-bg-main text-sm font-bold rounded-xl hover:scale-105 transition-transform"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 glass border-b fade-in">
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onPageChange(link.id as Page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    currentPage === link.id ? "bg-accent-cyan/10 text-accent-cyan" : "hover:bg-white/5"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </button>
              ))}
              <div className="h-px bg-white/10 my-2" />
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <User className="w-5 h-5 text-accent-cyan" />
                    <span className="text-sm font-medium text-white/70">
                      {user.user_metadata.full_name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg text-left text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Log out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onPageChange('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      currentPage === 'login' ? "bg-accent-cyan/10 text-accent-cyan" : "hover:bg-white/5"
                    )}
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      onPageChange('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg text-left bg-accent-cyan text-bg-main font-bold"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-accent-cyan" />
              <span className="text-xl font-bold">ShopIQ Analytics</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Turning shopping data into business intelligence. A professional analytics platform for understanding customer behavior.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <div className="grid grid-cols-2 gap-4">
              {navLinks.map(link => (
                <button 
                  key={link.id}
                  onClick={() => onPageChange(link.id as Page)}
                  className="text-white/60 hover:text-accent-cyan text-sm text-left transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-white/40 text-xs">
          © {new Date().getFullYear()} ShopIQ Analytics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
