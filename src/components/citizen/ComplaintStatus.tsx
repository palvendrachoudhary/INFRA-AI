import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, ArrowRight, ClipboardList, ShieldCheck, Building, Wrench } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface ComplaintStatusData {
  id: string;
  category: string;
  location: string;
  submittedAt: string;
  currentStatus: 'submitted' | 'verified' | 'planned' | 'in_progress' | 'resolved';
  updates: {
    date: string;
    status: string;
    comment: string;
  }[];
}

const MOCK_STATUSES: Record<string, ComplaintStatusData> = {
  "INF-78241": {
    id: "INF-78241",
    category: "Road & Transport",
    location: "Indore, Sector 4 Junction",
    submittedAt: "2026-09-01T10:30:00Z",
    currentStatus: "in_progress",
    updates: [
      { date: "2026-09-01", status: "Submitted", comment: "Complaint received via Citizen Portal." },
      { date: "2026-09-02", status: "Verified", comment: "Site inspected by Municipal Engineer. Issue confirmed as critical potholes." },
      { date: "2026-09-03", status: "Action Plan", comment: "Budget approved under 'Amrit Bharat' scheme. Contractor assigned." },
      { date: "2026-09-05", status: "In Progress", comment: "Road milling started. Material dispatched to site." }
    ]
  },
  "INF-99012": {
    id: "INF-99012",
    category: "Water Supply",
    location: "Bhopal, MP Nagar",
    submittedAt: "2026-08-28T14:15:00Z",
    currentStatus: "resolved",
    updates: [
      { date: "2026-08-28", status: "Submitted", comment: "Complaint received via Citizen Portal." },
      { date: "2026-08-29", status: "Verified", comment: "Pipeline burst verified." },
      { date: "2026-08-30", status: "Work Started", comment: "Emergency repair team dispatched." },
      { date: "2026-08-31", status: "Resolved", comment: "Pipeline repaired and pressure tested. Water supply restored." }
    ]
  }
};

const statusSteps = [
  { key: 'submitted', label: 'Submitted', icon: <ClipboardList className="w-5 h-5" /> },
  { key: 'verified', label: 'Verified', icon: <ShieldCheck className="w-5 h-5" /> },
  { key: 'planned', label: 'Action Plan', icon: <Building className="w-5 h-5" /> },
  { key: 'in_progress', label: 'In Progress', icon: <Wrench className="w-5 h-5" /> },
  { key: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="w-5 h-5" /> }
];

export function ComplaintStatus() {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<ComplaintStatusData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    // Simulate API delay
    setTimeout(() => {
      const found = MOCK_STATUSES[searchId.trim().toUpperCase()];
      if (found) {
        setResult(found);
      } else {
        setError("Tracking ID not found. Please check and try again.");
      }
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Track Your Complaint</h2>
        <p className="text-slate-400 text-sm">Enter the unique tracking ID provided during submission to check real-time progress.</p>
      </div>

      {/* Search Bar */}
      <GlassCard glowColor="cyan" className="p-2 bg-[#121216]/80" hoverEffect={false}>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Enter Tracking ID (e.g. INF-78241)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-white focus:outline-none placeholder:text-slate-600 font-mono"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="px-8 py-3 bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track Status"}
          </button>
        </form>
      </GlassCard>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-alert-red/10 border border-alert-red/20 rounded-xl flex items-center gap-3 text-alert-red text-sm"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard icon={<ClipboardList />} label="Tracking ID" value={result.id} highlight />
              <InfoCard icon={<MapPin />} label="Location" value={result.location} />
              <InfoCard icon={<Calendar />} label="Submitted On" value={new Date(result.submittedAt).toLocaleDateString()} />
            </div>

            {/* Stepper */}
            <GlassCard className="p-8 bg-[#0d0e13]/60 border-white/5 overflow-x-auto scrollbar-none" hoverEffect={false}>
              <div className="flex items-start justify-between min-w-[600px] relative">
                {/* Connector Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10 -z-0" />
                
                {statusSteps.map((step, idx) => {
                  const stepIndex = statusSteps.findIndex(s => s.key === result.currentStatus);
                  const isCompleted = idx <= stepIndex;
                  const isCurrent = idx === stepIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center gap-4 relative z-10 w-1/5">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_15px_rgba(0,255,135,0.4)]' 
                          : 'bg-[#1a1b26] border-white/10 text-slate-600'
                      }`}>
                        {isCompleted && !isCurrent ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                        
                        {isCurrent && (
                          <span className="absolute inset-0 rounded-full border border-neon-green animate-ping opacity-40" />
                        )}
                      </div>
                      <div className="text-center space-y-1">
                        <p className={`text-[11px] font-bold uppercase tracking-widest ${isCompleted ? 'text-neon-green' : 'text-slate-500'}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[9px] font-mono text-neon-green bg-neon-green/10 px-1.5 py-0.5 rounded animate-pulse">ACTIVE</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Timeline Updates */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Activity Timeline
              </h3>
              <div className="space-y-3">
                {result.updates.map((update, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="flex gap-4 group"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${idx === 0 ? 'bg-neon-green' : 'bg-slate-700'}`} />
                      {idx !== result.updates.length - 1 && (
                        <div className="w-0.5 flex-1 bg-white/5 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-white group-hover:text-neon-green transition-colors">{update.status}</span>
                        <span className="text-[10px] font-mono text-slate-500">{update.date}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{update.comment}</p>
                    </div>
                  </motion.div>
                )).reverse()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !isSearching && !error && (
        <div className="flex flex-col items-center justify-center py-20 opacity-30 select-none pointer-events-none">
          <Search className="w-16 h-16 mb-4" />
          <p className="text-lg font-bold">Search to view tracking details</p>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value, highlight = false }: any) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      highlight 
        ? 'bg-neon-cyan/10 border-neon-cyan/30 shadow-[0_0_20px_rgba(0,229,255,0.1)]' 
        : 'bg-[#121216]/60 border-white/5'
    }`}>
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {React.cloneElement(icon, { className: "w-3.5 h-3.5" })}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-sm font-bold ${highlight ? 'text-neon-cyan font-mono' : 'text-white'}`}>{value}</p>
    </div>
  );
}
