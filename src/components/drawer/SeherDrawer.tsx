"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Activity, Mic, Image as ImageIcon, FileText, 
  BrainCircuit, HardHat, FileSignature, MapPin, AlertOctagon, CheckCircle2
} from "lucide-react";
import { CityData } from "../../lib/mockData";
import { GlassCard } from "../ui/GlassCard";
import { VoiceNotePlayer } from "../audio/VoiceNotePlayer";
import Markdown from "react-markdown";

interface SeherDrawerProps {
  isOpen?: boolean;
  onClose: () => void;
  city: CityData | null;
}

export const SeherDrawer: React.FC<SeherDrawerProps> = ({ isOpen = true, onClose, city }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isGeneratingTender, setIsGeneratingTender] = useState(false);
  const [tenderDocument, setTenderDocument] = useState<string | null>(null);

  // Reset state when drawer closes or city changes
  React.useEffect(() => {
    setTenderDocument(null);
  }, [city?.city_id, isOpen]);

  const handleGenerateTender = async () => {
    if (!city) return;
    setIsGeneratingTender(true);
    try {
      const res = await fetch("/api/generate-tender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city_name: city.city_name,
          issue_category: city.recent_feed[0]?.category || "Infrastructure",
          total_complaints: 1420,
          suggested_structure: city.contech_estimates.suggested_structure
        })
      });
      
      if (!res.ok) throw new Error("Failed to generate tender");
      const data = await res.json();
      setTenderDocument(data.tender_document);
    } catch (err) {
      console.error(err);
      setTenderDocument("Error generating tender. Please ensure API is reachable.");
    } finally {
      setIsGeneratingTender(false);
    }
  };

  if (!city) return null;

  const tabs = [
    { id: 0, label: "Live Feed", icon: <Mic className="w-4 h-4" /> },
    { id: 1, label: "Demographics", icon: <Activity className="w-4 h-4" /> },
    { id: 2, label: "Gemini AI", icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 3, label: "ConTech CAD", icon: <HardHat className="w-4 h-4" /> },
    { id: 4, label: "Action", icon: <FileSignature className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="seher-drawer-wrapper">
          {/* BACKDROP BLUR - Increased opacity for better focus */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          />

          {/* SLIDE OVER DRAWER */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300,
              opacity: { duration: 0.2 }
            }}
            className="fixed top-20 right-0 w-full max-w-md h-[calc(100vh-80px)] bg-[#0d0e13] z-50 border-l border-white/20 shadow-[-20px_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
          >
            {/* HEADER */}
            <div className="p-6 border-b border-white/10 bg-[#12131a]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{city.city_name}</h2>
                  <p className="text-sm text-slate-300 flex items-center gap-1.5 mt-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-neon-green" />
                    {city.location.lat}° N, {city.location.lng}° E
                  </p>
                </div>
                <button 
                  onClick={onClose} 
                  aria-label="Close drawer"
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-alert-red/20 text-alert-red border border-alert-red/40 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,59,48,0.25)]">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {city.risk_score}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {city.complaints_summary.primary_languages.map((lang) => (
                    <span key={lang} className="px-2.5 py-1 bg-white/10 text-slate-200 border border-white/15 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex overflow-x-auto border-b border-white/10 bg-[#101117] scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-neon-green text-neon-green bg-neon-green/10 shadow-[inset_0_-2px_0_#00FF87]"
                      : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT AREA */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-6 pb-28 custom-scrollbar">
              
              {/* TAB 1: LIVE FEED */}
              {activeTab === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Real-Time Multimodal Inputs</h3>
                    <span className="text-[10px] text-neon-green font-mono px-2 py-0.5 rounded bg-neon-green/10 border border-neon-green/30">LIVE SYNC</span>
                  </div>
                  {city.recent_feed.map((feed) => (
                    <GlassCard 
                      key={feed.id} 
                      glowColor="none" 
                      className="p-4.5 bg-gradient-to-b from-[#141624] to-[#0c0e17] border border-white/20 hover:border-cyan-glow/60 shadow-2xl rounded-2xl border-l-4 border-l-cyan-glow transition-all space-y-3"
                    >
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30">
                            {feed.category}
                          </span>
                          {feed.urgency_level && (
                            <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border ${
                              feed.urgency_level === 'Critical'
                                ? 'bg-alert-red/20 text-alert-red border-alert-red/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {feed.urgency_level}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400">
                            {feed.type === 'voice' ? '🎙️ Audio Dispatch' : feed.type === 'image' ? '📸 Geo-Photo' : '📝 Text Feed'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {feed.timestamp}
                        </span>
                      </div>
                      
                      {/* Image Preview Banner if image report */}
                      {feed.type === "image" && (
                        <div className="w-full py-2.5 px-3 bg-black/60 rounded-xl flex items-center gap-2 border border-white/10">
                          <ImageIcon className="w-4 h-4 text-cyan-glow shrink-0" />
                          <span className="text-xs text-slate-200 font-semibold">Citizen Geo-Tagged Photo Verified</span>
                        </div>
                      )}

                      {/* Interactive Functional Voice Note & Transcript Player */}
                      <VoiceNotePlayer 
                        transcript={feed.transcript}
                        regionalTranscript={feed.regional_transcript}
                        language={feed.original_audio_lang || (city.complaints_summary.primary_languages?.[0] ? `${city.complaints_summary.primary_languages[0]} / Regional` : 'Hindi / Regional')}
                        durationSec={feed.audio_duration_sec || (feed.type === 'voice' ? 14 : 10)}
                        category={feed.category}
                        location={feed.user_location}
                      />
                      
                      <div className="text-xs text-slate-300 pt-2.5 border-t border-white/10 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-neon-green shrink-0"/> 
                          {feed.user_location}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                          #{feed.id}
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* TAB 2: DEMOGRAPHICS */}
              {activeTab === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#151722] p-4 rounded-xl border border-white/10">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Population</p>
                      <p className="text-xl font-bold text-white mt-1">{(city.demographics.population / 1000000).toFixed(2)}M</p>
                    </div>
                    <div className="bg-[#151722] p-4 rounded-xl border border-white/10">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Density (/sq km)</p>
                      <p className="text-xl font-bold text-white mt-1">{city.demographics.density_sq_km.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Infrastructure Indices</h3>
                    <ProgressBar label="Overall Index Score" value={parseInt(city.demographics.infrastructure_index)} color="bg-yellow-500" />
                    <ProgressBar label="Water Supply Access" value={42} color="bg-alert-red" />
                    <ProgressBar label="Road Connectivity" value={78} color="bg-cyan-glow" />
                  </div>
                </div>
              )}

              {/* TAB 3: GEMINI AI */}
              {activeTab === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <BrainCircuit className="w-5 h-5 text-cyan-glow" />
                       <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-glow to-neon-green">
                         Gemini 1.5 Pro Analysis
                       </h3>
                     </div>
                     <span className="text-[10px] font-mono text-neon-green bg-neon-green/10 border border-neon-green/30 px-2 py-0.5 rounded">
                       AI EXECUTIVE DISPATCH
                     </span>
                  </div>
                  <GlassCard glowColor="cyan" className="p-5 relative overflow-hidden bg-[#151722] border-white/20 shadow-xl space-y-4">
                    {/* Background glow effect */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-glow/10 blur-3xl rounded-full" />
                    
                    <p className="text-sm text-slate-100 font-medium leading-relaxed relative z-10 select-text">
                      {city.gemini_ai_recommendation}
                    </p>

                    <div className="relative z-10 pt-2 border-t border-white/10">
                      <VoiceNotePlayer 
                        transcript={city.gemini_ai_recommendation}
                        language="Executive English AI Briefing"
                        category="Civil Engineering Directive"
                        durationSec={16}
                        location={city.city_name}
                      />
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* TAB 4: CONTECH */}
              {activeTab === 3 && (
                <div className="space-y-4">
                  {/* 3D Blueprint Canvas */}
                  <div className="w-full h-40 bg-[#050508] border border-[#1a1a24] rounded-xl relative overflow-hidden flex items-center justify-center dashboard-grid-bg">
                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#00FF87 1px, transparent 1px), linear-gradient(90deg, #00FF87 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                     <HardHat className="w-10 h-10 text-neon-green/50 mb-2 z-10" />
                     <p className="absolute bottom-3 right-3 text-[10px] text-neon-green font-mono z-10">AUTOCAD_PREVIEW_GENERATED</p>
                  </div>

                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-6 mb-2">Material & Cost Estimation</h3>
                  <div className="space-y-2.5">
                    <EstimationRow label="Suggested Structure" value={city.contech_estimates.suggested_structure} />
                    <EstimationRow label="Concrete Required" value={`${city.contech_estimates.estimated_concrete_m3} m³`} />
                    <EstimationRow label="Steel Rebar" value={`${city.contech_estimates.estimated_steel_tons} Tons`} />
                    <EstimationRow label="Estimated Budget" value={city.contech_estimates.projected_cost_inr} highlight />
                  </div>
                </div>
              )}

              {/* TAB 5: ACTION */}
              {activeTab === 4 && (
                <div className="space-y-6 flex flex-col min-h-full">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Matched Government Scheme</h3>
                    <GlassCard glowColor="none" className="p-4.5 border-l-4 border-l-neon-green bg-[#151722] border-white/20">
                      <p className="text-lg font-bold text-white">{city.funding_scheme}</p>
                      <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">Funds available for immediate disbursement based on critical hotspot status.</p>
                    </GlassCard>
                  </div>
                  
                  <button 
                    onClick={handleGenerateTender}
                    disabled={isGeneratingTender}
                    className="w-full py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-neon-green hover:text-black transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                    {isGeneratingTender ? (
                      <span className="animate-pulse">Generating via Gemini...</span>
                    ) : (
                      <>
                        <FileSignature className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Auto-Generate Tender Document
                      </>
                    )}
                  </button>
                  {tenderDocument && (
                    <GlassCard glowColor="cyan" className="p-5 max-h-80 overflow-y-auto custom-scrollbar border-t-2 border-cyan-glow bg-[#151722] border-white/20">
                       <div className="flex items-center gap-2 mb-3">
                         <CheckCircle2 className="w-5 h-5 text-neon-green shrink-0" />
                         <span className="text-sm font-bold text-white">Tender Generated</span>
                       </div>
                       <div className="markdown-body text-xs text-slate-200 leading-relaxed select-text">
                         <Markdown>{tenderDocument}</Markdown>
                       </div>
                    </GlassCard>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Sub Components for clean code ---

const ProgressBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs mb-1.5">
      <span className="text-slate-300 font-medium">{label}</span>
      <span className="text-white font-bold font-mono">{value}%</span>
    </div>
    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const EstimationRow = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
  <div className={`flex justify-between items-center p-3.5 rounded-xl border ${highlight ? 'border-neon-green/40 bg-neon-green/10 shadow-[0_0_15px_rgba(0,255,135,0.1)]' : 'border-white/10 bg-[#151722]'}`}>
    <span className="text-xs text-slate-400 font-medium">{label}</span>
    <span className={`text-sm font-bold ${highlight ? 'text-neon-green' : 'text-white'}`}>{value}</span>
  </div>
);
