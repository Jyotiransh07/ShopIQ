import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Lightbulb } from 'lucide-react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { DataEntry } from './components/DataEntry';
import { Dashboard } from './components/Dashboard';
import { Insights } from './components/Insights';
import { About } from './components/About';
import { Auth } from './components/Auth';
import { Page, CustomerRecord } from './types';
import { generateSampleData } from './data/sampleData';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [data, setData] = useState<CustomerRecord[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
      } catch (err) {
        console.warn('Supabase not configured or failed to initialize:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setData([]);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data: records, error } = await supabase
        .from('customer_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (records) {
        // Map Supabase snake_case to frontend camelCase if necessary
        // In this case, the table was created to match the types mostly
        setData(records as any);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleDataLoaded = (newData: CustomerRecord[]) => {
    setData(newData);
    setCurrentPage('dashboard');
    window.scrollTo(0, 0);
  };

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={handlePageChange}
      user={user}
      onLogout={handleLogout}
    >
      {currentPage === 'home' && (
        <Home onNavigate={handlePageChange} />
      )}
      
      {currentPage === 'data-entry' && (
        <DataEntry onDataLoaded={handleDataLoaded} />
      )}
      
      {currentPage === 'dashboard' && (
        data.length > 0 ? (
          <Dashboard data={data} onNavigate={handlePageChange} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center fade-in">
            <div className="w-20 h-20 bg-accent-cyan/10 rounded-full flex items-center justify-center mb-8">
              <LayoutDashboard className="w-10 h-10 text-accent-cyan" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Data to Analyze</h2>
            <p className="text-white/50 max-w-md mb-10">
              Please enter your shopping data first to see the analytics dashboard.
            </p>
            <button 
              onClick={() => handlePageChange('data-entry')}
              className="px-8 py-3 bg-accent-cyan text-bg-main font-bold rounded-xl"
            >
              Go to Data Entry
            </button>
          </div>
        )
      )}
      
      {currentPage === 'insights' && (
        data.length > 0 ? (
          <Insights data={data} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center fade-in">
            <div className="w-20 h-20 bg-accent-purple/10 rounded-full flex items-center justify-center mb-8">
              <Lightbulb className="w-10 h-10 text-accent-purple" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Insights Available</h2>
            <p className="text-white/50 max-w-md mb-10">
              Insights are generated automatically once you provide customer data.
            </p>
            <button 
              onClick={() => handlePageChange('data-entry')}
              className="px-8 py-3 bg-accent-purple text-white font-bold rounded-xl"
            >
              Go to Data Entry
            </button>
          </div>
        )
      )}
      
      {currentPage === 'about' && (
        <About />
      )}
      
      {(currentPage === 'login' || currentPage === 'signup') && (
        <Auth mode={currentPage} onNavigate={handlePageChange} />
      )}
    </Layout>
  );
}
