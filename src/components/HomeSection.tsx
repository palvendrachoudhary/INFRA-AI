import React from 'react';
import { motion } from 'motion/react';
import { Bot, MapPin, BarChart3, UploadCloud, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export function HomeSection({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-300 text-[10px] uppercase tracking-[0.3em] font-medium mb-4 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-300"></span>
          </span>
          {t('By Team THEKEDAAR')} • Led by Palvendra Choudhary
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight text-white drop-shadow-lg leading-tight"
        >
          {t('AI-Powered Civic Infrastructure Intelligence')}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed"
        >
          {t('Real-time urban and rural infrastructure monitoring, citizen audits, satellite risk mapping, and democratic public voting across India.')}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-4"
        >
          <button 
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 bg-neon-cyan/20 border border-neon-cyan/40 hover:bg-neon-cyan/30 text-neon-cyan shadow-[0_0_20px_rgba(0,229,255,0.2)] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" /> {t('Live Map & Bharat')}
          </button>
          <button 
            onClick={() => onNavigate('builds')}
            className="px-6 py-3 bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {t('Recent Gov Builds')} <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onNavigate('voting')}
            className="px-6 py-3 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {t('Public Referendum & Veto')}
          </button>
        </motion.div>
      </section>

      {/* Workflow Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <WorkflowCard 
            icon={<UploadCloud className="w-8 h-8 text-blue-500" />}
            title="1. Hyper-Local Ingestion"
            description="Omnichannel reporting via WhatsApp, text, or voice notes in regional languages (Hindi, Malvi, Marathi, Tamil)."
            delay={0.4}
          />
          <WorkflowCard 
            icon={<Bot className="w-8 h-8 text-indigo-500" />}
            title="2. Multi-Source Fusion"
            description="Correlates real-time citizen feedback with demographic density and municipal budget data."
            delay={0.5}
            highlight="Powered by Gemini"
          />
          <WorkflowCard 
            icon={<BarChart3 className="w-8 h-8 text-emerald-500" />}
            title="3. Actionable Policy Engine"
            description="Converts raw reports directly into prioritized project briefs with suggested budget reallocations."
            delay={0.6}
            highlight="Google Cloud Vertex AI"
          />
        </div>
      </section>
      
      {/* Trust Badges */}
      <section className="max-w-4xl mx-auto px-4 py-8 border-t border-slate-200 dark:border-white/5 text-center">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-[#E0E0E0] opacity-40 mb-6">Enterprise-Grade Infrastructure</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale dark:opacity-40">
          <div className="flex items-center gap-2 font-display text-xl tracking-tight"><ShieldCheck /> SecureGov Data</div>
          <div className="flex items-center gap-2 font-display text-xl tracking-tight"><Zap /> Real-time Sync</div>
        </div>
      </section>
    </div>
  );
}

function WorkflowCard({ icon, title, description, delay, highlight }: { icon: React.ReactNode, title: string, description: string, delay: number, highlight?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-[#121212] p-6 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden"
    >
      <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-sm flex items-center justify-center mb-8">
        {icon}
      </div>
      <h3 className="text-xl font-display font-medium text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-[#E0E0E0] dark:opacity-60 leading-relaxed">{description}</p>
      
      {highlight && (
        <div className="mt-6 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-100 dark:bg-gold/10 border dark:border-gold/20 text-[10px] uppercase tracking-widest text-slate-600 dark:text-gold font-bold">
          <Zap className="w-3 h-3 text-amber-500 dark:text-gold" />
          {highlight}
        </div>
      )}
    </motion.div>
  );
}
