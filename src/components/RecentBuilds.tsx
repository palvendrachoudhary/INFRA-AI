import React, { useState, useMemo } from 'react';
import { 
  Building2, School, HeartPulse, Trophy, Trees, Droplets, 
  MapPin, CheckCircle2, Clock, IndianRupee, ShieldCheck, 
  Search, Filter, Star, ExternalLink, Users, AlertCircle, ArrowUpRight, Compass,
  Copy, Check, Sparkles
} from 'lucide-react';
import { MOCK_GOVERNMENT_BUILDS, GovernmentBuild } from '../lib/mockData';
import { useLanguage } from '../lib/LanguageContext';

interface RecentBuildsProps {
  onNavigateToMap?: (city: string) => void;
}

export function RecentBuilds({ onNavigateToMap }: RecentBuildsProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('all');
  const [selectedGovBody, setSelectedGovBody] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBuild, setSelectedBuild] = useState<GovernmentBuild | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const handleCopyPrompt = (id: string, promptText: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(promptText);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const filteredBuilds = useMemo(() => {
    return MOCK_GOVERNMENT_BUILDS.filter(build => {
      const matchesSearch = 
        build.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        build.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        build.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
        build.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTier = selectedTier === 'all' || build.tier.toString() === selectedTier;
      const matchesPurpose = selectedPurpose === 'all' || build.purpose === selectedPurpose;
      const matchesGov = selectedGovBody === 'all' || build.governingBody.includes(selectedGovBody);
      const matchesStatus = selectedStatus === 'all' || build.status === selectedStatus;

      return matchesSearch && matchesTier && matchesPurpose && matchesGov && matchesStatus;
    });
  }, [searchTerm, selectedTier, selectedPurpose, selectedGovBody, selectedStatus]);

  const getPurposeIcon = (purpose: GovernmentBuild['purpose']) => {
    switch (purpose) {
      case 'School': return <School className="w-4 h-4 text-emerald-400" />;
      case 'Hospital': return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'Sports Ground / Stadium': return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'Public Garden & Park': return <Trees className="w-4 h-4 text-green-400" />;
      case 'Drainage & Water Plant': return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'Transport Hub & Bridge': return <Compass className="w-4 h-4 text-indigo-400" />;
      default: return <Building2 className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: GovernmentBuild['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'Commissioned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <ShieldCheck className="w-3 h-3" /> Commissioned & Active
          </span>
        );
      case 'Under Construction':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0f0f14] border border-white/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-neon-green/20 text-neon-green border border-neon-green/30">
                Civic Audit & Transparency
              </span>
              <span className="text-xs text-slate-400">• Local & State Government Builds</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">
              {t('Recent Government Builds')}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Inspect verified public projects delivered by Municipal Corporations, Smart City SPVs, and State PWDs across Tier 1, Tier 2, and Tier 3 cities—including audited budgets, delivery timelines, land areas, and citizen utility ratings.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center min-w-[100px]">
              <div className="text-xl font-bold font-mono text-neon-green">
                ₹{MOCK_GOVERNMENT_BUILDS.reduce((acc, b) => acc + b.costCrores, 0).toFixed(1)} Cr
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Public Spend</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center min-w-[90px]">
              <div className="text-xl font-bold font-mono text-cyan-glow">
                {MOCK_GOVERNMENT_BUILDS.length}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Audited Builds</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by project, city (Indore, Pune...), or ward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-green transition-colors"
            />
          </div>

          {/* Tier Filter */}
          <div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-neon-green transition-colors"
            >
              <option value="all">All City Tiers</option>
              <option value="1">Tier 1 (Metro Hubs)</option>
              <option value="2">Tier 2 (Emerging Capitals)</option>
              <option value="3">Tier 3 (Regional Centers)</option>
            </select>
          </div>

          {/* Purpose Filter */}
          <div>
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-neon-green transition-colors"
            >
              <option value="all">All Purposes (Schools, Parks...)</option>
              <option value="School">School & Education</option>
              <option value="Hospital">Hospital & Healthcare</option>
              <option value="Sports Ground / Stadium">Sports Ground & Stadium</option>
              <option value="Public Garden & Park">Public Garden & Park</option>
              <option value="Drainage & Water Plant">Water & Drainage Plant</option>
              <option value="Transport Hub & Bridge">Transport Hub & Bridge</option>
            </select>
          </div>

          {/* Governing Body Filter */}
          <div>
            <select
              value={selectedGovBody}
              onChange={(e) => setSelectedGovBody(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-neon-green transition-colors"
            >
              <option value="all">All Governing Levels</option>
              <option value="Municipal Corporation">Local Municipal Corp</option>
              <option value="State Government">State Government (PWD)</option>
              <option value="Smart City">Smart City SPV</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Government Builds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBuilds.map((build) => (
          <div 
            key={build.id}
            className="rounded-2xl bg-[#0d0d12] border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-lg"
          >
            <div className="p-5 space-y-4">
              {/* Header Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-200">
                    {getPurposeIcon(build.purpose)}
                    {build.purpose}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/20">
                    Tier {build.tier}
                  </span>
                </div>
                {getStatusBadge(build.status)}
              </div>

              {/* Title & Location */}
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-neon-green transition-colors leading-snug">
                  {build.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neon-green shrink-0" />
                  <span className="font-medium text-slate-300">{build.city}, {build.state}</span>
                  <span>•</span>
                  <span className="text-slate-400 truncate">{build.ward}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {build.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Total Budget</div>
                  <div className="text-sm font-bold font-mono text-neon-green mt-0.5">{build.totalCostINR}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Timeline / Duration</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">{build.timeline}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Land / Area</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">{build.areaOccupied}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Citizen Rating</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-white">{build.citizenRating} / 5</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-medium">({build.satisfactionPercent}%)</span>
                  </div>
                </div>
              </div>

              {/* Governing Body & Public Impact */}
              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="truncate max-w-[180px] font-medium text-slate-300">
                  🏛️ {build.governingBody}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {build.completionYear}
                </span>
              </div>

              {/* AI Map Prompt snippet if available */}
              {build.aiMapPrompt && (
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-neon-cyan flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Map Prompt
                  </span>
                  <button
                    onClick={(e) => handleCopyPrompt(build.id, build.aiMapPrompt!, e)}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedPromptId === build.id ? (
                      <>
                        <Check className="w-3 h-3 text-neon-green" />
                        <span className="text-neon-green">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="p-3 bg-black/40 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedBuild(build)}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors text-center"
              >
                View Full Audit
              </button>

              {onNavigateToMap && (
                <button
                  onClick={() => onNavigateToMap(build.city)}
                  className="py-2 px-3 rounded-lg text-xs font-semibold text-neon-green hover:bg-neon-green/10 border border-neon-green/30 transition-colors flex items-center gap-1"
                  title="Locate on Map"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Map View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBuilds.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#0d0d12] border border-white/10 text-slate-400">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-base font-semibold text-white">No government builds match your current filters</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the tier, purpose, or search keyword.</p>
        </div>
      )}

      {/* Build Details Modal */}
      {selectedBuild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#121218] border border-white/20 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neon-green/15 text-neon-green border border-neon-green/30">
                    {selectedBuild.governingBody}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300">
                    Tier {selectedBuild.tier}
                  </span>
                  {getStatusBadge(selectedBuild.status)}
                </div>
                <h3 className="text-2xl font-display font-bold text-white">
                  {selectedBuild.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
                  <MapPin className="w-4 h-4 text-neon-green" />
                  <span>{selectedBuild.ward}, {selectedBuild.city}, {selectedBuild.state}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBuild(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Expenditure</div>
                <div className="text-base font-bold font-mono text-neon-green mt-1">{selectedBuild.totalCostINR}</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Land Area</div>
                <div className="text-xs font-bold text-white mt-1">{selectedBuild.areaOccupied}</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Timeline</div>
                <div className="text-xs font-bold text-white mt-1">{selectedBuild.timeline}</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Citizen Approval</div>
                <div className="text-base font-bold text-amber-400 mt-1">★ {selectedBuild.citizenRating} / 5</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Overview & Specifications</h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
                {selectedBuild.description}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Public Benefit & Reach</h4>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
                <Users className="w-5 h-5 shrink-0" />
                <span>{selectedBuild.citizenBeneficiaries}</span>
              </div>
            </div>

            {/* AI Map Prompt Full Display */}
            {selectedBuild.aiMapPrompt && (
              <div className="space-y-2 bg-[#090b12] p-4 rounded-xl border border-neon-cyan/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neon-cyan font-bold uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Mapping Prompt (GIS Ready)
                  </span>
                  <button
                    onClick={() => handleCopyPrompt(selectedBuild.id, selectedBuild.aiMapPrompt!)}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedPromptId === selectedBuild.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-neon-green" />
                        <span className="text-neon-green font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap select-all bg-black/50 p-2.5 rounded-lg border border-white/5">
                  {selectedBuild.aiMapPrompt}
                </pre>
                {selectedBuild.sourceAttribution && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    Source: {selectedBuild.sourceAttribution}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Executing Agency: <strong className="text-white">{selectedBuild.contractorAgency}</strong></span>
              {onNavigateToMap && (
                <button
                  onClick={() => {
                    const city = selectedBuild.city;
                    setSelectedBuild(null);
                    onNavigateToMap(city);
                  }}
                  className="px-4 py-2 rounded-xl bg-neon-green text-black font-bold flex items-center gap-1.5 hover:bg-neon-green/90 transition-colors"
                >
                  <MapPin className="w-4 h-4" /> Locate on Seher Map
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
