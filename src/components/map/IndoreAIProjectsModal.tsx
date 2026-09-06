import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Copy, Check, MapPin, Sparkles, Building2, HardHat, 
  ExternalLink, ArrowUpRight, CheckCircle2, Search, Filter,
  Share2, ShieldCheck, FileText, Vote, Compass
} from 'lucide-react';
import { INDORE_AI_MAP_PROMPTS, AIMapPromptItem } from '../../lib/mockData';

interface IndoreAIProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlotOnMap?: (coords: { lat: number; lng: number }, title: string) => void;
  onNavigateToVoting?: (proposalId?: string) => void;
}

export const IndoreAIProjectsModal: React.FC<IndoreAIProjectsModalProps> = ({
  isOpen,
  onClose,
  onPlotOnMap,
  onNavigateToVoting,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState<boolean>(false);

  const categories = [
    'All',
    'Government & Public Infra',
    'Private & Corporate Landmark',
    'Mega Future Construction',
  ];

  const filteredProjects = INDORE_AI_MAP_PROMPTS.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleCopyAllPrompts = () => {
    const formatted = INDORE_AI_MAP_PROMPTS.map((p, idx) => {
      return `${idx + 1}. [${p.category.toUpperCase()}] ${p.title}\nBudget: ${p.budgetOrCost} | Location: ${p.locationName}\nCoordinates: ${p.coords.lat}, ${p.coords.lng}\nAI Map Prompt:\n"${p.exactPrompt}"\n`;
    }).join('\n----------------------------------------\n\n');

    navigator.clipboard.writeText(formatted);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-[#0c0d14] border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col z-10 text-white"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 bg-[#121420] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Indore Smart Infra GIS
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {INDORE_AI_MAP_PROMPTS.length} Verified Projects & Prompts
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Indore AI Map Prompts & Mega Construction Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Exact GIS prompts ready for AI mapping tools, current high-rise commercial hubs, public transit landmarks, and future mega-constructions.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={handleCopyAllPrompts}
                className="px-3 py-2 rounded-xl bg-neon-cyan/15 hover:bg-neon-cyan/25 border border-neon-cyan/40 text-neon-cyan text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                title="Copy all 16 AI Map Prompts in formatted text"
              >
                {allCopied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    <span className="text-neon-green">All 16 Prompts Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy All Prompts</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="p-4 border-b border-white/10 bg-[#0e0f18] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-neon-cyan text-black font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Indore project or location..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan/60"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-neon-cyan" />
                <p className="text-sm">No projects matching your search.</p>
              </div>
            ) : (
              filteredProjects.map((item) => {
                const isCopied = copiedId === item.id;
                const isFuture = item.category === 'Mega Future Construction';
                const isPrivate = item.category === 'Private & Corporate Landmark';

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 sm:p-5 transition-all ${
                      isFuture
                        ? 'bg-[#150d24]/70 border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.08)]'
                        : isPrivate
                        ? 'bg-[#0f172a]/60 border-blue-500/25 hover:border-blue-400/50'
                        : 'bg-[#0e1614]/70 border-emerald-500/25 hover:border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.06)]'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                              item.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : item.status === 'Under Construction'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            }`}
                          >
                            {item.status}
                          </span>

                          <span className="text-[11px] font-semibold text-slate-400">
                            {item.category}
                          </span>

                          <span className="text-slate-600">•</span>
                          
                          <span className="text-[11px] text-neon-green font-mono font-bold">
                            {item.budgetOrCost}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                            {item.locationName}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">
                            Agency: <strong className="text-slate-200">{item.builtBy}</strong>
                          </span>
                          {item.areaOrSize && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400">
                                Size: <strong className="text-slate-200">{item.areaOrSize}</strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-start shrink-0">
                        {onPlotOnMap && (
                          <button
                            onClick={() => {
                              onPlotOnMap(item.coords, item.title);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Fly to and plot on map"
                          >
                            <Compass className="w-3.5 h-3.5 text-neon-cyan" />
                            <span>Plot on Map</span>
                          </button>
                        )}

                        {isFuture && onNavigateToVoting && (
                          <button
                            onClick={() => {
                              onNavigateToVoting();
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            title="Open Civic Referendum / Public Voting"
                          >
                            <Vote className="w-3.5 h-3.5" />
                            <span>Vote / Referendum</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Purpose / Highlights */}
                    <div className="text-xs text-slate-300 mb-3 bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1">
                      <div>
                        <span className="text-slate-400 font-semibold">Purpose: </span>
                        <span>{item.purpose}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Highlight: </span>
                        <span className="text-slate-200">{item.keyHighlight}</span>
                      </div>
                    </div>

                    {/* AI Map Prompt Box */}
                    <div className="relative group bg-[#090a10] border border-neon-cyan/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-neon-cyan font-bold uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3 h-3" /> AI Map Prompt Format
                        </span>
                        <button
                          onClick={() => handleCopy(item.id, item.exactPrompt)}
                          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-neon-green" />
                              <span className="text-neon-green font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-300" />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-all select-all selection:bg-neon-cyan selection:text-black">
                        {item.exactPrompt}
                      </pre>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-white/10 bg-[#10121c] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-neon-green" />
              <span>
                Verified against Indore Development Authority (IDA), MPIDC, and Smart City registries.
              </span>
            </div>
            <div className="font-mono text-[11px] text-neon-cyan">
              Lat: 22.7196° N, Lng: 75.8577° E (Indore Datum)
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
