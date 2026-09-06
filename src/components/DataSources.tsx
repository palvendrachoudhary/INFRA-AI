import React from 'react';
import { DATA_SOURCES } from '../data';
import { Database, Link2, Server, CheckCircle2 } from 'lucide-react';

export function DataSources() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-teal-500/30 bg-teal-500/10 text-teal-400 mb-6 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
          <Database className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 mb-3">Data Transparency</h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Infra.AI synthesizes data from multiple trusted civic and crowd-sourced pipelines to form a unified truth for municipal planning.
        </p>
      </div>

      <div className="bg-[#121212]/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
          
          {/* Active Integrations List */}
          <div className="p-8">
            <h3 className="text-[10px] font-bold text-teal-300 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-teal-400" /> Active Data Streams
            </h3>
            <ul className="space-y-4">
              {DATA_SOURCES.map((source, i) => (
                <li key={i} className="flex items-start justify-between gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-white/5 bg-[#0b1121]">
                  <div>
                    <p className="font-medium text-sm text-white">{source.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{source.type}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {source.status}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Architecture Overview */}
          <div className="p-8 bg-black/20">
            <h3 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" /> Processing Pipeline
            </h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-teal-500/50 before:via-indigo-500/50 before:to-transparent">
               
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-teal-500/50 bg-[#0b1121] text-teal-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(20,184,166,0.5)] z-10 font-display">
                    1
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0b1121] p-4 rounded-xl border border-white/10 shadow-lg border-l-2 border-l-teal-500">
                     <p className="font-display font-bold text-white mb-1">Google Cloud Vision & APIs</p>
                     <p className="text-xs text-slate-400 leading-relaxed">Visual damage assessment and API aggregation.</p>
                  </div>
               </div>
               
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-blue-500/50 bg-[#0b1121] text-blue-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 font-display">
                    2
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0b1121] p-4 rounded-xl border border-white/10 shadow-lg border-r-2 border-r-blue-500">
                     <p className="font-display font-bold text-white mb-1">Gemini 3.7 Flash Engine</p>
                     <p className="text-xs text-slate-400 leading-relaxed">Multilingual NLP categorization, JSON extraction & sentiment.</p>
                  </div>
               </div>

               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-indigo-500/50 bg-[#0b1121] text-indigo-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10 font-display">
                    3
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0b1121] p-4 rounded-xl border border-white/10 shadow-lg border-l-2 border-l-indigo-500">
                     <p className="font-display font-bold text-white mb-1">Google Vertex AI Forecast</p>
                     <p className="text-xs text-slate-400 leading-relaxed">Predictive spatio-temporal modeling and hotspot forecasting.</p>
                  </div>
               </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
