import React, { useState, useEffect } from 'react';
import { HomeSection } from './components/HomeSection';
import { MapDashboard } from './components/MapDashboard';
import { RecentBuilds } from './components/RecentBuilds';
import { CivicVoting } from './components/CivicVoting';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { DataSources } from './components/DataSources';
import { Navbar } from './components/layout/Navbar';
import { CitizenReportModal } from './components/citizen/CitizenReportModal';
import { LanguageProvider, useLanguage } from './lib/LanguageContext';
import { LayoutDashboard, Database, MapPin, Home, Building2, Vote, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

type Tab = 'home' | 'dashboard' | 'builds' | 'voting' | 'analytics' | 'sources';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedCityForMap, setSelectedCityForMap] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleNavigateToCity = (cityName: string) => {
    setSelectedCityForMap(cityName);
    setActiveTab('dashboard');
  };

  const navItems = [
    { 
      id: 'home', 
      label: t('Home'), 
      rawLabel: 'Home',
      badge: null,
      icon: <Home className="w-4 h-4" /> 
    },
    { 
      id: 'dashboard', 
      label: t('Map / Bharat (Urban+Rural)'), 
      rawLabel: 'Map / Bharat (Urban+Rural)',
      badge: t('Pan-India Coverage'),
      icon: <MapPin className="w-4 h-4" /> 
    },
    { 
      id: 'builds', 
      label: t('Recent Builds'), 
      rawLabel: 'Recent Builds',
      badge: t('Gov Log'),
      icon: <Building2 className="w-4 h-4" /> 
    },
    { 
      id: 'voting', 
      label: t('Public Voting'), 
      rawLabel: 'Public Voting',
      badge: t('Referendum'),
      icon: <Vote className="w-4 h-4" /> 
    },
    { 
      id: 'analytics', 
      label: t('Policymaker'), 
      rawLabel: 'Policymaker',
      badge: null,
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      id: 'sources', 
      label: t('Data Hub'), 
      rawLabel: 'Data Hub',
      badge: null,
      icon: <Database className="w-4 h-4" /> 
    },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0C] text-slate-100 font-sans">
      
      <Navbar 
        onReport={() => setIsReportModalOpen(true)} 
        onPortal={() => setActiveTab('analytics')} 
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6 px-6 py-6">
        
        {/* Side Navigation - Target element 1: aside:nth-of-type(1) */}
        <aside className={`w-full shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible p-2 md:p-3 scrollbar-hide border border-white/10 rounded-2xl bg-[#0e0e14]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] md:h-fit transition-all duration-300 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
          <div className={`hidden md:flex items-center justify-between px-3 py-1.5 mb-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 border-b border-white/5 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            {!isSidebarCollapsed && (
              <>
                <span>{t('Navigation')}</span>
                <span className="text-neon-green flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> {t('Live')}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-row md:flex-col gap-2">
            {navItems.map((item, index) => {
              const isActive = activeTab === item.id;
              const isSecondButton = index === 1; // Map / Seher button:nth-of-type(2)

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`relative flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap text-xs font-bold uppercase tracking-wider group ${
                    isActive
                      ? isSecondButton
                        ? 'bg-gradient-to-r from-neon-cyan/15 to-neon-green/10 border border-neon-cyan/40 text-neon-cyan shadow-[0_0_20px_rgba(0,229,255,0.15)] font-extrabold'
                        : 'bg-[#15151c] border border-neon-green/30 text-neon-green shadow-[0_0_15px_rgba(0,255,135,0.12)]'
                      : isSecondButton
                        ? 'text-slate-400 hover:text-neon-cyan hover:bg-white/5 border border-transparent hover:border-neon-cyan/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive 
                        ? isSecondButton ? 'text-neon-cyan' : 'text-neon-green' 
                        : 'text-slate-500 group-hover:text-slate-300'
                    }`}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isSidebarCollapsed && item.badge && (
                    <span className={`hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                      isActive 
                        ? isSecondButton ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-neon-green/20 text-neon-green' 
                        : 'bg-white/5 text-slate-500 group-hover:text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex items-center justify-center p-2.5 mt-4 rounded-xl border border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all group"
            title={isSidebarCollapsed ? t('Expand Sidebar') : t('Collapse Sidebar')}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 transition-transform group-hover:scale-110" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                <span className="text-[10px] font-mono uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{t('Collapse')}</span>
              </div>
            )}
          </button>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 flex flex-col min-h-[600px] h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
          {activeTab === 'home' && (
            <HomeSection 
              onNavigate={(tab) => {
                if (tab === 'builds' || tab === 'voting' || tab === 'dashboard' || tab === 'analytics' || tab === 'sources' || tab === 'home') {
                  setActiveTab(tab as Tab);
                }
              }} 
            />
          )}
          {activeTab === 'dashboard' && (
            <MapDashboard initialCity={selectedCityForMap} />
          )}
          {activeTab === 'builds' && (
            <RecentBuilds onNavigateToMap={handleNavigateToCity} />
          )}
          {activeTab === 'voting' && (
            <CivicVoting onNavigateToMap={handleNavigateToCity} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsPanel />
          )}
          {activeTab === 'sources' && (
            <DataSources />
          )}
        </main>
      </div>

      <CitizenReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
