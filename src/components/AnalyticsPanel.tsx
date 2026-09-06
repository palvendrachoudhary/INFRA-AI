import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, ComposedChart } from 'recharts';
import { BUDGET_COMPLAINTS_DATA, PREDICTION_DATA, AI_RECOMMENDATIONS } from '../data';
import { TrendingUp, Activity, BarChart2, Bot, AlertTriangle, ShieldCheck, Download, Loader2, X, FileText } from 'lucide-react';
import Markdown from 'react-markdown';

export function AnalyticsPanel() {
  const [generatingTenderFor, setGeneratingTenderFor] = useState<string | null>(null);
  const [tenderDraft, setTenderDraft] = useState<string | null>(null);

  const generateTender = async (rec: any) => {
    setGeneratingTenderFor(rec.id);
    try {
      const res = await fetch('/api/generate-tender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectContext: `${rec.title}: ${rec.description}` })
      });
      const data = await res.json();
      if (data.tenderDraft) {
        setTenderDraft(data.tenderDraft);
      } else if (data.error) {
        alert(`Error generating tender: ${data.error}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error generating tender: ${err.message || 'Unknown error'}`);
    }
    setGeneratingTenderFor(null);
  };

  return (
    <div className="space-y-6 relative">
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 mb-2">Policymaker Dashboard & Analytics</h2>
        <p className="text-slate-400 text-sm">Macro-level insights and predictive governance powered by Google Cloud.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total Reports Processed" value="12,450" change="+14% this month" icon={<Activity className="text-teal-400 w-6 h-6" />} />
        <MetricCard title="AI Categorization Accuracy" value="96.8%" change="+2.1% from baseline" icon={<TrendingUp className="text-emerald-400 w-6 h-6" />} />
        <MetricCard title="Avg. Time to Insight" value="1.2s" change="Real-time stream active" icon={<BarChart2 className="text-indigo-400 w-6 h-6" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Budget vs Complaints Chart */}
        <div className="bg-[#121212]/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-widest font-bold px-4 py-2 border-l border-b border-indigo-500/30 rounded-bl-lg">
            Resource Optimization
          </div>
          <h3 className="text-xl font-display font-medium text-white mb-6">Citizen Complaints vs. Budget Allocation</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={BUDGET_COMPLAINTS_DATA} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} angle={-15} textAnchor="end" />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} label={{ value: 'Complaints', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 10 } }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} label={{ value: 'Budget (Cr)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 10 } }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.05 }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#cbd5e1' }} />
                <Bar yAxisId="left" dataKey="complaints" name="Complaints Volume" fill="#2dd4bf" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="budgetAllocated" name="Budget (Cr)" stroke="#818cf8" strokeWidth={3} dot={{ r: 5, fill: '#818cf8' }} activeDot={{ r: 7 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-[#121212]/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-teal-500/20 text-teal-300 text-[10px] uppercase tracking-widest font-bold px-4 py-2 border-l border-b border-teal-500/30 rounded-bl-lg">
            Predictive Model Active
          </div>
          <h3 className="text-xl font-display font-medium text-white mb-6">Incident Volume Forecast</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PREDICTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Line type="monotone" name="Reported Issues" dataKey="reports" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Resolved Issues" dataKey="resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Recommendations List */}
      <div className="bg-[#121212]/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 border border-teal-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-display font-medium text-white">AI Automated Tender Generator</h3>
              <p className="text-sm text-white/50">Converts raw civic reports into formal public works tenders instantly via Gemini.</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {AI_RECOMMENDATIONS.map((rec) => (
            <div key={rec.id} className="p-6 flex flex-col md:flex-row gap-6 items-start hover:bg-white/[0.02] transition-colors">
              <div className="shrink-0 pt-1">
                {rec.impact === 'Critical' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Critical Impact
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    <ShieldCheck className="w-3 h-3" /> High Impact
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h4 className="text-lg font-display font-medium text-white mb-2">{rec.title}</h4>
                <p className="text-sm text-slate-300 opacity-80 leading-relaxed max-w-4xl">{rec.description}</p>
              </div>
              <div className="shrink-0 mt-4 md:mt-0">
                <button 
                  onClick={() => generateTender(rec)}
                  disabled={generatingTenderFor === rec.id}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingTenderFor === rec.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Drafting...</>
                  ) : (
                    <><FileText className="w-4 h-4" /> Draft Tender</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tender Modal */}
      {tenderDraft && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1121] border border-teal-500/30 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 to-indigo-500"></div>
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">AI-Drafted Tender Document</h3>
              </div>
              <button 
                onClick={() => setTenderDraft(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 prose prose-invert prose-teal max-w-none text-sm">
              <div className="markdown-body">
                <Markdown>{tenderDraft}</Markdown>
              </div>
            </div>
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button onClick={() => setTenderDraft(null)} className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors">
                Close
              </button>
              <button className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-lg text-sm font-bold transition-all shadow-[0_0_10px_rgba(20,184,166,0.3)] flex items-center gap-2">
                <Download className="w-4 h-4" /> Export as PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MetricCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#121212]/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg transition-transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-8">
        <div className="h-12 w-12 border border-white/10 bg-white/5 flex items-center justify-center rounded-xl shadow-inner">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{change}</span>
      </div>
      <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{title}</p>
      <h3 className="text-2xl font-display font-bold text-white">{value}</h3>
    </div>
  );
}
