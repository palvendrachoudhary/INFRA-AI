import React, { useState, useEffect, useMemo } from 'react';
import { 
  ThumbsUp, ThumbsDown, CheckCircle2, XCircle, AlertTriangle, 
  Building2, School, HeartPulse, Trophy, Trees, Droplets, 
  MapPin, Clock, IndianRupee, Layers, PlusCircle, MessageSquare, 
  Sparkles, Filter, Search, ShieldAlert, Send, ArrowRight,
  Copy, Check
} from 'lucide-react';
import { MOCK_CIVIC_PROPOSALS, CivicProposal, MOCK_CITIES } from '../lib/mockData';
import { useLanguage } from '../lib/LanguageContext';

interface CivicVotingProps {
  onNavigateToMap?: (cityName: string) => void;
}

export function CivicVoting({ onNavigateToMap }: CivicVotingProps) {
  const { t } = useLanguage();
  const [proposals, setProposals] = useState<CivicProposal[]>(() => {
    const saved = localStorage.getItem('infra_civic_proposals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_CIVIC_PROPOSALS;
      }
    }
    return MOCK_CIVIC_PROPOSALS;
  });

  const [activeTab, setActiveTab] = useState<'all' | 'gov' | 'citizen'>('all');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const handleCopyPrompt = (id: string, promptText: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(promptText);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };
  
  // Modals
  const [isCitizenModalOpen, setIsCitizenModalOpen] = useState(false);
  const [isGovModalOpen, setIsGovModalOpen] = useState(false);
  const [selectedProposalForFeedback, setSelectedProposalForFeedback] = useState<CivicProposal | null>(null);

  // New Citizen Proposal Form
  const [newCitTitle, setNewCitTitle] = useState('');
  const [newCitCity, setNewCitCity] = useState('Indore');
  const [newCitWard, setNewCitWard] = useState('');
  const [newCitPurpose, setNewCitPurpose] = useState<CivicProposal['purpose']>('School');
  const [newCitCost, setNewCitCost] = useState('₹ 3.5 Crores');
  const [newCitTimeline, setNewCitTimeline] = useState('12 Months');
  const [newCitArea, setNewCitArea] = useState('2.5 Acres');
  const [newCitDesc, setNewCitDesc] = useState('');
  const [newCitJustification, setNewCitJustification] = useState('');
  const [newCitAuthor, setNewCitAuthor] = useState('');

  // New Gov Proposal Form
  const [newGovTitle, setNewGovTitle] = useState('');
  const [newGovDept, setNewGovDept] = useState('');
  const [newGovCity, setNewGovCity] = useState('Bhopal');
  const [newGovWard, setNewGovWard] = useState('');
  const [newGovPurpose, setNewGovPurpose] = useState<CivicProposal['purpose']>('Sports Ground / Stadium');
  const [newGovCost, setNewGovCost] = useState('₹ 45 Crores');
  const [newGovTimeline, setNewGovTimeline] = useState('2.5 Years');
  const [newGovArea, setNewGovArea] = useState('14 Acres');
  const [newGovDesc, setNewGovDesc] = useState('');
  const [newGovJustification, setNewGovJustification] = useState('');

  // New Comment state
  const [commentText, setCommentText] = useState('');
  const [commentStance, setCommentStance] = useState<'approve' | 'reject'>('reject');
  const [commentAuthor, setCommentAuthor] = useState('');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('infra_civic_proposals', JSON.stringify(proposals));
  }, [proposals]);

  const handleVote = (proposalId: string, voteType: 'approve' | 'reject') => {
    setProposals(prev => prev.map(p => {
      if (p.id !== proposalId) return p;

      let newApprove = p.votesApprove;
      let newReject = p.votesReject;
      
      // If user had already voted opposite, decrease old vote
      if (p.userVoted === 'approve' && voteType === 'reject') {
        newApprove = Math.max(0, newApprove - 1);
        newReject += 1;
      } else if (p.userVoted === 'reject' && voteType === 'approve') {
        newReject = Math.max(0, newReject - 1);
        newApprove += 1;
      } else if (!p.userVoted) {
        if (voteType === 'approve') newApprove += 1;
        if (voteType === 'reject') newReject += 1;
      } else if (p.userVoted === voteType) {
        // Toggle off
        if (voteType === 'approve') newApprove = Math.max(0, newApprove - 1);
        if (voteType === 'reject') newReject = Math.max(0, newReject - 1);
        return { ...p, votesApprove: newApprove, votesReject: newReject, userVoted: null };
      }

      return {
        ...p,
        votesApprove: newApprove,
        votesReject: newReject,
        userVoted: voteType,
      };
    }));
  };

  const handleAddComment = (proposalId: string) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: `cf-${Date.now()}`,
      author: commentAuthor.trim() || 'Concerned Citizen',
      vote: commentStance,
      comment: commentText.trim(),
      time: 'Just now',
      upvotes: 1,
    };

    setProposals(prev => prev.map(p => {
      if (p.id !== proposalId) return p;
      return {
        ...p,
        citizenFeedback: [newComment, ...p.citizenFeedback],
      };
    }));

    setCommentText('');
    setCommentAuthor('');
  };

  const handleCreateCitizenProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitTitle || !newCitDesc) return;

    const cityObj = MOCK_CITIES[newCitCity] || MOCK_CITIES['Indore'];

    const newProp: CivicProposal = {
      id: `cp-cit-${Date.now()}`,
      title: `Citizen Demand: ${newCitTitle}`,
      proposedBy: 'Citizen Initiative',
      departmentOrAuthor: newCitAuthor || 'Local Neighborhood Association',
      city: newCitCity,
      state: cityObj.state,
      tier: cityObj.tier,
      ward: newCitWard || 'Ward 1',
      locationCoords: cityObj.location,
      purpose: newCitPurpose,
      costEstimateINR: newCitCost || '₹ 2.5 Crores',
      costCrores: parseFloat(newCitCost.replace(/[^0-9.]/g, '')) || 2.5,
      timelineEstimated: newCitTimeline || '12 Months',
      areaRequired: newCitArea || '2 Acres',
      description: newCitDesc,
      justification: newCitJustification || 'High community demand identified by local residents.',
      status: 'Open for Voting',
      votesApprove: 1,
      votesReject: 0,
      userVoted: 'approve',
      environmentalImpact: 'Positive Eco-Buffer',
      createdDate: 'Today',
      citizenFeedback: [
        {
          id: `cf-init-${Date.now()}`,
          author: newCitAuthor || 'Proposal Founder',
          vote: 'approve',
          comment: 'We urgently need this infrastructure to improve our daily quality of life.',
          time: 'Just now',
          upvotes: 1,
        }
      ],
    };

    setProposals([newProp, ...proposals]);
    setIsCitizenModalOpen(false);
    // Reset form
    setNewCitTitle('');
    setNewCitDesc('');
    setNewCitJustification('');
    setNewCitWard('');
  };

  const handleCreateGovProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGovTitle || !newGovDesc) return;

    const cityObj = MOCK_CITIES[newGovCity] || MOCK_CITIES['Indore'];

    const newProp: CivicProposal = {
      id: `cp-gov-${Date.now()}`,
      title: `${newGovCost} ${newGovTitle}`,
      proposedBy: 'Government Department',
      departmentOrAuthor: newGovDept || 'State Urban Development Authority',
      city: newGovCity,
      state: cityObj.state,
      tier: cityObj.tier,
      ward: newGovWard || 'Ward Central',
      locationCoords: cityObj.location,
      purpose: newGovPurpose,
      costEstimateINR: newGovCost,
      costCrores: parseFloat(newGovCost.replace(/[^0-9.]/g, '')) || 25.0,
      timelineEstimated: newGovTimeline || '2 Years',
      areaRequired: newGovArea || '5 Acres',
      description: newGovDesc,
      justification: newGovJustification || 'Proposed under state capital infrastructure master plan.',
      status: 'Open for Voting',
      votesApprove: 0,
      votesReject: 0,
      userVoted: null,
      environmentalImpact: 'Moderate',
      createdDate: 'Today',
      citizenFeedback: [],
    };

    setProposals([newProp, ...proposals]);
    setIsGovModalOpen(false);
    // Reset form
    setNewGovTitle('');
    setNewGovDept('');
    setNewGovDesc('');
    setNewGovJustification('');
  };

  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      const matchesTab = 
        activeTab === 'all' ? true :
        activeTab === 'gov' ? p.proposedBy === 'Government Department' :
        p.proposedBy === 'Citizen Initiative';

      const matchesPurpose = filterPurpose === 'all' ? true : p.purpose === filterPurpose;
      const matchesCity = filterCity === 'all' ? true : p.city === filterCity;
      const matchesSearch = 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesPurpose && matchesCity && matchesSearch;
    });
  }, [proposals, activeTab, filterPurpose, filterCity, searchTerm]);

  const rejectedUselessBuilds = useMemo(() => {
    return proposals.filter(p => p.votesReject > p.votesApprove);
  }, [proposals]);

  const approvedBuilds = useMemo(() => {
    return proposals.filter(p => p.votesApprove > p.votesReject);
  }, [proposals]);

  const getPurposeIcon = (purpose: CivicProposal['purpose']) => {
    switch (purpose) {
      case 'School': return <School className="w-4 h-4 text-emerald-400" />;
      case 'Hospital': return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'Sports Ground / Stadium': return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'Public Garden': return <Trees className="w-4 h-4 text-green-400" />;
      case 'Drainage / Flood Defense': return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'Administrative Office': return <Building2 className="w-4 h-4 text-purple-400" />;
      default: return <Building2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0f0f14] border border-white/10 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-alert-red/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Participatory Democracy & Referendum
              </span>
              <span className="text-xs text-slate-400">• Citizen Veto on Useless Infrastructure</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">
              {t('Public Voting, Needs Suggestion & Project Veto')}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Vote to approve or reject government proposed builds before tenders are floated. Stop taxpayer waste on unnecessary VIP structures, or propose what your neighborhood actually needs (schools, hospitals, stadiums, athletic grounds, or public gardens).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCitizenModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-neon-green text-black text-xs font-bold uppercase tracking-wider hover:bg-neon-green/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,135,0.2)]"
            >
              <PlusCircle className="w-4 h-4" /> {t('Propose Citizen Project')}
            </button>
            <button
              onClick={() => setIsGovModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-cyan-glow" /> {t('Propose as Government')}
            </button>
          </div>
        </div>

        {/* Civic Democracy Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-mono">{t('Active Referendums')}</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{proposals.length} Projects</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20">
            <div className="text-[10px] text-rose-300 uppercase font-mono flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-400" /> {t('Useless Builds Vetoed')}
            </div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
              {rejectedUselessBuilds.length} Blocked by Public
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20">
            <div className="text-[10px] text-emerald-300 uppercase font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {t('Public Approved')}
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {approvedBuilds.length} High Priority
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-mono">{t('Total Citizen Votes')}</div>
            <div className="text-xl font-bold font-mono text-neon-green mt-0.5">
              {(proposals.reduce((a, b) => a + b.votesApprove + b.votesReject, 0)).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'all' 
                  ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' 
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              {t('All Referendums')} ({proposals.length})
            </button>
            <button
              onClick={() => setActiveTab('gov')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'gov' 
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              🏛️ {t('Government Proposals')}
            </button>
            <button
              onClick={() => setActiveTab('citizen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'citizen' 
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              🙋 {t('Grassroots Citizen Demands')}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search voting items, cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-green"
              />
            </div>

            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="all">All Purposes</option>
              <option value="School">Schools</option>
              <option value="Hospital">Hospitals</option>
              <option value="Sports Ground / Stadium">Stadiums & Grounds</option>
              <option value="Public Garden">Public Gardens & Parks</option>
              <option value="Administrative Office">Offices & Complexes</option>
              <option value="Drainage / Flood Defense">Drainage & Floods</option>
              <option value="Transport Hub & Bridge">Transport Hubs & Transit</option>
            </select>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="all">All Cities</option>
              {Object.keys(MOCK_CITIES).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Proposals Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredProposals.map((proposal) => {
          const totalVotes = proposal.votesApprove + proposal.votesReject;
          const approvePct = totalVotes > 0 ? Math.round((proposal.votesApprove / totalVotes) * 100) : 50;
          const rejectPct = 100 - approvePct;
          const isUselessRejected = proposal.votesReject > proposal.votesApprove && totalVotes >= 5;

          return (
            <div 
              key={proposal.id}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between bg-[#0d0d12] shadow-xl ${
                isUselessRejected 
                  ? 'border-rose-500/40 bg-rose-950/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                {/* Status & Purpose Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-200">
                      {getPurposeIcon(proposal.purpose)}
                      {proposal.purpose}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      proposal.proposedBy === 'Government Department'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                        : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                    }`}>
                      {proposal.proposedBy === 'Government Department' ? '🏛️ Gov Plan' : '🙋 Citizen Demand'}
                    </span>
                    {proposal.isFutureMegaProject && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)] flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-neon-cyan" /> Future Mega Build
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400">
                      Tier {proposal.tier}
                    </span>
                  </div>

                  {isUselessRejected ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Citizen Veto: Rejected as Wasteful
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> High Public Demand
                    </span>
                  )}
                </div>

                {/* Title & Author */}
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {proposal.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="text-slate-300 font-medium">Proposed by: {proposal.departmentOrAuthor}</span>
                    <span>•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neon-green" /> {proposal.ward}, {proposal.city}
                    </span>
                  </div>
                </div>

                {/* Project Dimensions & Key Government Disclosures */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Estimated Cost</div>
                    <div className="text-sm font-bold font-mono text-neon-green mt-0.5">{proposal.costEstimateINR}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Build Timeline</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5 truncate">{proposal.timelineEstimated}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Land / Area</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5 truncate">{proposal.areaRequired}</div>
                  </div>
                </div>

                {/* Description & Public Justification */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-black/30 p-3 rounded-xl border border-white/5">
                  <p className="line-clamp-2 leading-relaxed">{proposal.description}</p>
                  <p className="text-slate-400 text-[11px] italic">
                    <strong className="text-slate-300 not-italic">Justification:</strong> {proposal.justification}
                  </p>
                </div>

                {/* AI Map Prompt if available */}
                {proposal.aiMapPrompt && (
                  <div className="bg-[#080a10] p-2.5 rounded-xl border border-neon-cyan/20 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-neon-cyan font-mono font-bold uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Map Prompt
                      </span>
                      <button
                        onClick={(e) => handleCopyPrompt(proposal.id, proposal.aiMapPrompt!, e)}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedPromptId === proposal.id ? (
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
                    <div className="text-[11px] font-mono text-slate-300 line-clamp-2 select-all">
                      {proposal.aiMapPrompt}
                    </div>
                  </div>
                )}

                {/* Live Voting Bar */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" /> Approve ({approvePct}% • {proposal.votesApprove} votes)
                    </span>
                    <span className="text-rose-400 flex items-center gap-1">
                      <ThumbsDown className="w-3.5 h-3.5" /> Reject ({rejectPct}% • {proposal.votesReject} votes)
                    </span>
                  </div>

                  {/* Dual Bar */}
                  <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden flex p-0.5 border border-white/10">
                    <div 
                      className="h-full rounded-l-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${approvePct}%` }}
                    />
                    <div 
                      className="h-full rounded-r-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-300"
                      style={{ width: `${rejectPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Voting & Discussion Action Footer */}
              <div className="mt-5 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Voting Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleVote(proposal.id, 'approve')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      proposal.userVoted === 'approve'
                        ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {proposal.userVoted === 'approve' ? t('Approved by You') : t('Approve Build')}
                  </button>

                  <button
                    onClick={() => handleVote(proposal.id, 'reject')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      proposal.userVoted === 'reject'
                        ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                        : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    {proposal.userVoted === 'reject' ? t('Rejected as Wasteful') : t('Reject / Veto Build')}
                  </button>
                </div>

                {/* Feedback / Comments Count & Map View */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedProposalForFeedback(proposal)}
                    className="flex-1 sm:flex-none text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-glow" />
                    <span>{t('Citizen Debates')} ({proposal.citizenFeedback.length})</span>
                  </button>

                  {onNavigateToMap && (
                    <button
                      onClick={() => onNavigateToMap(proposal.city)}
                      className="py-2 px-3 rounded-lg text-xs font-semibold text-neon-green hover:bg-neon-green/10 border border-neon-green/30 transition-colors flex items-center gap-1"
                      title="View city in Map"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Map</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProposals.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#0d0d12] border border-white/10 text-slate-400">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-base font-semibold text-white">No referendum items match your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try changing the purpose or city filter.</p>
        </div>
      )}

      {/* Citizen Feedback & Comments Drawer/Modal */}
      {selectedProposalForFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#121218] border border-white/20 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-neon-green uppercase">
                  Citizen Scrutiny & Deliberation
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-1">
                  {selectedProposalForFeedback.title}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedProposalForFeedback.ward}, {selectedProposalForFeedback.city} • Estimated: {selectedProposalForFeedback.costEstimateINR}
                </div>
              </div>
              <button
                onClick={() => setSelectedProposalForFeedback(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {selectedProposalForFeedback.citizenFeedback.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No comments yet. Be the first citizen to voice your opinion!
                </div>
              ) : (
                selectedProposalForFeedback.citizenFeedback.map(fb => (
                  <div 
                    key={fb.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      fb.vote === 'approve'
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-300'
                        : 'bg-rose-950/20 border-rose-500/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{fb.author}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          fb.vote === 'approve' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {fb.vote === 'approve' ? 'VOTED APPROVE' : 'VOTED REJECT'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{fb.time}</span>
                    </div>
                    <p className="leading-relaxed text-slate-300">{fb.comment}</p>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 pt-1">
                      <span>👍 {fb.upvotes} citizens supported this reason</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Your Name / Ward Resident Tag..."
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-green"
                />

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Your Stance:</span>
                  <button
                    type="button"
                    onClick={() => setCommentStance('approve')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs ${
                      commentStance === 'approve'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentStance('reject')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs ${
                      commentStance === 'reject'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    Reject as Wasteful
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <textarea
                  rows={2}
                  placeholder="State your clear reason for approving or rejecting this project..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-green resize-none"
                />
                <button
                  onClick={() => handleAddComment(selectedProposalForFeedback.id)}
                  disabled={!commentText.trim()}
                  className="px-4 py-3 rounded-xl bg-neon-green disabled:opacity-50 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-neon-green/90 transition-colors h-full"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Propose Citizen Project Modal */}
      {isCitizenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-[#121218] border border-white/20 rounded-3xl p-6 lg:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-neon-green uppercase">
                  Grassroots Citizen Initiative
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-1">
                  Propose What Your Neighborhood Actually Needs
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Democratically demand schools, athletic stadiums, playgrounds, parks, or hospitals where government planning has left deficits.
                </p>
              </div>
              <button 
                onClick={() => setIsCitizenModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCitizenProposal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ward 9 Public Children's Park & Open Gym"
                  value={newCitTitle}
                  onChange={(e) => setNewCitTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target City</label>
                  <select
                    value={newCitCity}
                    onChange={(e) => setNewCitCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                  >
                    {Object.keys(MOCK_CITIES).map(c => (
                      <option key={c} value={c}>{c} (Tier {MOCK_CITIES[c].tier})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Specific Ward / Area</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ward 14, Near Old Bus Stand"
                    value={newCitWard}
                    onChange={(e) => setNewCitWard(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Purpose / Facility Type</label>
                  <select
                    value={newCitPurpose}
                    onChange={(e) => setNewCitPurpose(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="School">School & Education</option>
                    <option value="Hospital">Hospital & Primary Clinic</option>
                    <option value="Sports Ground / Stadium">Sports Ground & Stadium</option>
                    <option value="Public Garden">Public Garden & Eco Park</option>
                    <option value="Drainage / Flood Defense">Drainage & Flood Canal</option>
                    <option value="Community Hall">Community Hall</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Budget Needed</label>
                  <input
                    type="text"
                    placeholder="e.g., ₹ 2.80 Crores"
                    value={newCitCost}
                    onChange={(e) => setNewCitCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-neon-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Timeline</label>
                  <input
                    type="text"
                    placeholder="e.g., 8 Months"
                    value={newCitTimeline}
                    onChange={(e) => setNewCitTimeline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Land / Area Required</label>
                  <input
                    type="text"
                    placeholder="e.g., 2.5 Acres vacant plot"
                    value={newCitArea}
                    onChange={(e) => setNewCitArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">What Should Be Built & Specifications</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain what the facility will contain (e.g. running track, 12 classrooms, walking path, doctor clinics)..."
                  value={newCitDesc}
                  onChange={(e) => setNewCitDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-green resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Why Is This Needed in Your Area? (Rationale)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why this is an urgent necessity (e.g. nearest school is 6km away, kids playing on busy highway)..."
                  value={newCitJustification}
                  onChange={(e) => setNewCitJustification(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-green resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Citizen Author / Committee Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ward 9 Youth & Senior Citizens Forum"
                  value={newCitAuthor}
                  onChange={(e) => setNewCitAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCitizenModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-neon-green text-black font-bold flex items-center gap-1.5 hover:bg-neon-green/90 shadow-[0_0_15px_rgba(0,255,135,0.3)]"
                >
                  <PlusCircle className="w-4 h-4" /> Publish for Public Voting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Propose as Government Modal */}
      {isGovModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-[#121218] border border-purple-500/30 rounded-3xl p-6 lg:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">
                  Government Department Notice
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-1">
                  Submit Planned Construction for Public Voting
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Public bodies must disclose planned projects, costs, areas, and timelines to gauge citizen support or rejection before spending funds.
                </p>
              </div>
              <button 
                onClick={() => setIsGovModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGovProposal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Central District Olympic Sports Complex"
                  value={newGovTitle}
                  onChange={(e) => setNewGovTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department / Agency</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., State PWD / Municipal Corporation"
                    value={newGovDept}
                    onChange={(e) => setNewGovDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">City Location</label>
                  <select
                    value={newGovCity}
                    onChange={(e) => setNewGovCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                  >
                    {Object.keys(MOCK_CITIES).map(c => (
                      <option key={c} value={c}>{c} (Tier {MOCK_CITIES[c].tier})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ward / Sector</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sector 14, Outer Ring"
                    value={newGovWard}
                    onChange={(e) => setNewGovWard(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Facility Purpose</label>
                  <select
                    value={newGovPurpose}
                    onChange={(e) => setNewGovPurpose(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="Sports Ground / Stadium">Sports Ground / Stadium</option>
                    <option value="School">School & College</option>
                    <option value="Hospital">Hospital & Health Hub</option>
                    <option value="Public Garden">Public Garden / Urban Park</option>
                    <option value="Administrative Office">Administrative Office Building</option>
                    <option value="Drainage / Flood Defense">Drainage / Flood Defense</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cost of Building</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., ₹ 48 Crores"
                    value={newGovCost}
                    onChange={(e) => setNewGovCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Build Timeline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 2.5 Years"
                    value={newGovTimeline}
                    onChange={(e) => setNewGovTimeline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Land Area Needed</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 10 Acres"
                    value={newGovArea}
                    onChange={(e) => setNewGovArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Purpose & Architectural Scope</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the facilities, structure size, and intended usage..."
                  value={newGovDesc}
                  onChange={(e) => setNewGovDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Government Justification for Taxpayer Funds</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Justify why this construction is essential for the city..."
                  value={newGovJustification}
                  onChange={(e) => setNewGovJustification(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGovModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-1.5 hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  <Building2 className="w-4 h-4" /> Open for Public Referendum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
