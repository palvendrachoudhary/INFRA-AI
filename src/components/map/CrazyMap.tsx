import React, { useEffect, useState, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Tooltip, useMap as useLeafletMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Globe, Eye, Sparkles, AlertTriangle, Building2, Users, Coins, HardHat, Check, Wrench, ShieldAlert, Mic, ImageIcon, FileText, School, HeartPulse, Trophy, Trees, Droplets, MapPin, CheckCircle2 } from 'lucide-react';
import { CityData, MOCK_CITIES, MOCK_GOVERNMENT_BUILDS, GovernmentBuild } from '../../lib/mockData';

import { IndoreAIProjectsModal } from './IndoreAIProjectsModal';

// Pan & Zoom synchronization component for Google Maps
function GoogleMapEffect({ 
  activeCity,
  focalPoint
}: { 
  activeCity: CityData | null;
  focalPoint: { lat: number; lng: number; zoom?: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (map && focalPoint) {
      map.panTo({ lat: focalPoint.lat, lng: focalPoint.lng });
      map.setZoom(focalPoint.zoom || 15);
    } else if (map && activeCity) {
      map.panTo({ lat: activeCity.location.lat, lng: activeCity.location.lng });
      map.setZoom(12);
    } else if (map && !activeCity && !focalPoint) {
      map.panTo({ lat: 22.5, lng: 79.0 });
      map.setZoom(5);
    }
  }, [activeCity, focalPoint, map]);
  return null;
}

// Leaflet effect for fallback mode
function LeafletMapEffect({ 
  activeCity,
  focalPoint 
}: { 
  activeCity: CityData | null;
  focalPoint: { lat: number; lng: number; zoom?: number } | null;
}) {
  const map = useLeafletMap();
  useEffect(() => {
    if (focalPoint) {
      map.flyTo([focalPoint.lat, focalPoint.lng], focalPoint.zoom || 15, {
        duration: 1.5,
        animate: true,
      });
    } else if (activeCity) {
      map.flyTo([activeCity.location.lat, activeCity.location.lng], 12, {
        duration: 1.5,
        animate: true,
      });
    } else {
      map.flyTo([22.5, 79.0], 5, { duration: 1.5 });
    }
  }, [activeCity, focalPoint, map]);
  return null;
}

export function CrazyMap({ onCityClick, activeCity }: { onCityClick: (city: CityData) => void, activeCity: CityData | null }) {
  const defaultDemoKey = 'AIzaSyDyF-rIXueOIUhLXHOL832q3BYMzWLOICc';
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  const apiKey = metaEnv?.VITE_GOOGLE_MAPS_API_KEY || defaultDemoKey;

  const [engine, setEngine] = useState<'google' | 'leaflet'>('google');
  const [mapType, setMapType] = useState<'satellite' | 'hybrid'>('satellite');
  const [leafletStyle, setLeafletStyle] = useState<'dark' | 'satellite'>('dark');
  const [selectedTier, setSelectedTier] = useState<'all' | '1' | '2' | '3'>('all');
  const [activeLayers, setActiveLayers] = useState({
    hotspots: true,
    infrastructure: false,
    demographics: false,
    budget: false,
    builds: true,
  });

  const [isIndorePromptsOpen, setIsIndorePromptsOpen] = useState(false);
  const [focalPoint, setFocalPoint] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [focalTitle, setFocalTitle] = useState<string | null>(null);

  const mapData = useMemo(() => {
    if (selectedTier === 'all') return Object.values(MOCK_CITIES);
    const tierNum = parseInt(selectedTier);
    return Object.values(MOCK_CITIES).filter(c => c.tier === tierNum);
  }, [selectedTier]);

  const activeBuilds = useMemo(() => {
    if (selectedTier === 'all') return MOCK_GOVERNMENT_BUILDS;
    const tierNum = parseInt(selectedTier);
    return MOCK_GOVERNMENT_BUILDS.filter(b => b.tier === tierNum);
  }, [selectedTier]);

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'High': return '#FF3B30'; // Alert Red
      case 'Medium': return '#FFCC00'; // Amber/Yellow
      case 'Low': return '#00FF87'; // Neon Green
      default: return '#00E5FF';
    }
  };

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-[#050508]">
      {/* Map Overlay Controls */}
      <div className="absolute top-4 left-4 z-[400] glass-panel p-4 rounded-xl shadow-glass-panel w-72 flex flex-col gap-3 pointer-events-auto backdrop-blur-md bg-black/60 border border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Satellite Control</span>
          </div>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setEngine('google')}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                engine === 'google' ? 'bg-neon-cyan text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setEngine('leaflet')}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                engine === 'leaflet' ? 'bg-neon-cyan text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Open
            </button>
          </div>
        </div>

        {engine === 'google' ? (
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>Map Style</span>
            <div className="flex gap-1">
              <button
                onClick={() => setMapType('satellite')}
                className={`px-2 py-0.5 text-[11px] rounded transition-all ${
                  mapType === 'satellite' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setMapType('hybrid')}
                className={`px-2 py-0.5 text-[11px] rounded transition-all ${
                  mapType === 'hybrid' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Hybrid
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>Map Style</span>
            <div className="flex gap-1">
              <button
                onClick={() => setLeafletStyle('dark')}
                className={`px-2 py-0.5 text-[11px] rounded transition-all ${
                  leafletStyle === 'dark' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Dark Filter
              </button>
              <button
                onClick={() => setLeafletStyle('satellite')}
                className={`px-2 py-0.5 text-[11px] rounded transition-all ${
                  leafletStyle === 'satellite' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
            </div>
          </div>
        )}

        {/* City Quick Jumper */}
        <div className="space-y-1 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono text-slate-400">
            <span>Jump to City</span>
            <span className="text-neon-cyan font-bold">{mapData.length} Shown</span>
          </div>
          <select
            value={activeCity?.city_name || ''}
            onChange={(e) => {
              const selected = MOCK_CITIES[e.target.value];
              if (selected) onCityClick(selected);
            }}
            className="w-full px-2 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-neon-cyan"
          >
            <option value="">-- Jump to Indian City ({mapData.length}) --</option>
            {mapData.map(c => (
              <option key={c.city_id} value={c.city_name}>
                {c.city_name} (Tier {c.tier} • {c.state})
              </option>
            ))}
          </select>
        </div>

        {/* City Tier Filter */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-400">
            Filter by City Tier
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: '1', label: 'Tier 1' },
              { id: '2', label: 'Tier 2' },
              { id: '3', label: 'Tier 3' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id as any)}
                className={`py-1 text-[10px] font-bold font-mono rounded transition-colors ${
                  selectedTier === t.id
                    ? 'bg-neon-green text-black shadow-[0_0_10px_rgba(0,255,135,0.3)]'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400 pt-1 border-t border-white/5">
          <Layers className="w-3.5 h-3.5 text-neon-green" />
          <span className="font-semibold text-gray-200">Interactive Layers</span>
        </div>

        {/* Selected Element: Interactive Layers Container (div:nth-of-type(4)) */}
        <div className="space-y-1.5 bg-black/40 p-2 rounded-xl border border-white/10 max-h-60 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between px-1 pb-1 border-b border-white/5">
            <span className="text-[10px] font-mono font-medium text-slate-400">
              {Object.values(activeLayers).filter(Boolean).length} / 5 ACTIVE
            </span>
            <button
              onClick={() => {
                const allActive = Object.values(activeLayers).every(Boolean);
                setActiveLayers({
                  hotspots: !allActive,
                  infrastructure: !allActive,
                  demographics: !allActive,
                  budget: !allActive,
                  builds: !allActive,
                });
              }}
              className="text-[10px] text-neon-cyan hover:text-white font-mono transition-colors cursor-pointer"
            >
              {Object.values(activeLayers).every(Boolean) ? 'Reset' : 'Enable All'}
            </button>
          </div>

          {/* Layer 1: Citizen Complaint Hotspots */}
          <div
            onClick={() => toggleLayer('hotspots')}
            className={`p-2 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
              activeLayers.hotspots
                ? 'bg-neon-green/10 border-neon-green/40 shadow-[0_0_12px_rgba(0,255,135,0.12)]'
                : 'bg-white/5 border-transparent hover:border-white/15 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                  activeLayers.hotspots ? 'bg-neon-green text-black font-bold' : 'bg-white/10 text-slate-400'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${activeLayers.hotspots ? 'text-white' : 'text-slate-300'}`}>
                  Complaint Hotspots
                </span>
                <span className="text-[10px] text-slate-400">Live Voice & Photo Incidents</span>
              </div>
            </div>
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                activeLayers.hotspots ? 'bg-neon-green border-neon-green text-black' : 'border-slate-600 bg-black/40'
              }`}
            >
              {activeLayers.hotspots && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          {/* Layer 2: Infrastructure Deficit Index */}
          <div
            onClick={() => toggleLayer('infrastructure')}
            className={`p-2 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
              activeLayers.infrastructure
                ? 'bg-neon-cyan/10 border-neon-cyan/40 shadow-[0_0_12px_rgba(0,229,255,0.12)]'
                : 'bg-white/5 border-transparent hover:border-white/15 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                  activeLayers.infrastructure ? 'bg-neon-cyan text-black font-bold' : 'bg-white/10 text-slate-400'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${activeLayers.infrastructure ? 'text-white' : 'text-slate-300'}`}>
                  Infrastructure Deficit
                </span>
                <span className="text-[10px] text-slate-400">Drainage, Water & Grid Gap</span>
              </div>
            </div>
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                activeLayers.infrastructure ? 'bg-neon-cyan border-neon-cyan text-black' : 'border-slate-600 bg-black/40'
              }`}
            >
              {activeLayers.infrastructure && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          {/* Layer 3: Demographic Density */}
          <div
            onClick={() => toggleLayer('demographics')}
            className={`p-2 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
              activeLayers.demographics
                ? 'bg-amber-400/10 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.12)]'
                : 'bg-white/5 border-transparent hover:border-white/15 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                  activeLayers.demographics ? 'bg-amber-400 text-black font-bold' : 'bg-white/10 text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${activeLayers.demographics ? 'text-white' : 'text-slate-300'}`}>
                  Demographic Density
                </span>
                <span className="text-[10px] text-slate-400">Population Heat & Ward Pressure</span>
              </div>
            </div>
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                activeLayers.demographics ? 'bg-amber-400 border-amber-400 text-black' : 'border-slate-600 bg-black/40'
              }`}
            >
              {activeLayers.demographics && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          {/* Layer 4: ConTech Budget & Schemes */}
          <div
            onClick={() => toggleLayer('budget')}
            className={`p-2 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
              activeLayers.budget
                ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.12)]'
                : 'bg-white/5 border-transparent hover:border-white/15 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                  activeLayers.budget ? 'bg-purple-500 text-white font-bold' : 'bg-white/10 text-slate-400'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${activeLayers.budget ? 'text-white' : 'text-slate-300'}`}>
                  ConTech Schemes
                </span>
                <span className="text-[10px] text-slate-400">AMRUT 2.0 & Material Pools</span>
              </div>
            </div>
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                activeLayers.budget ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-600 bg-black/40'
              }`}
            >
              {activeLayers.budget && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          {/* Layer 5: Government Builds */}
          <div
            onClick={() => toggleLayer('builds')}
            className={`p-2 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
              activeLayers.builds
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.12)]'
                : 'bg-white/5 border-transparent hover:border-white/15 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                  activeLayers.builds ? 'bg-emerald-500 text-black font-bold' : 'bg-white/10 text-slate-400'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${activeLayers.builds ? 'text-white' : 'text-slate-300'}`}>
                  Government Builds
                </span>
                <span className="text-[10px] text-slate-400">Completed & Ongoing ({activeBuilds.length})</span>
              </div>
            </div>
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                activeLayers.builds ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-600 bg-black/40'
              }`}
            >
              {activeLayers.builds && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-neon-green" /> Live Intel Feed
          </span>
          <span className="text-neon-cyan font-mono">100% Free Demo Mode</span>
        </div>
      </div>

      {/* Top-Right: Indore AI Prompts & Mega Projects trigger button */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col items-end gap-2 pointer-events-auto">
        <button
          onClick={() => setIsIndorePromptsOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[#0d0f17]/95 hover:bg-[#151926] border border-neon-cyan/50 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(0,229,255,0.25)] hover:scale-105 transition-all cursor-pointer backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
          <span>Indore AI Prompts & Mega Builds</span>
          <span className="px-1.5 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan font-mono text-[10px] font-bold">
            16
          </span>
        </button>

        {/* Plotted Focal Point Indicator */}
        {focalTitle && (
          <div className="px-3 py-1.5 rounded-lg bg-black/85 border border-neon-green/40 backdrop-blur-md text-xs text-white flex items-center gap-2 shadow-lg">
            <MapPin className="w-3.5 h-3.5 text-neon-green shrink-0 animate-bounce" />
            <span className="text-[11px] truncate max-w-[220px] text-slate-200">
              Focus: <strong className="text-neon-cyan">{focalTitle}</strong>
            </span>
            <button
              onClick={() => {
                setFocalPoint(null);
                setFocalTitle(null);
              }}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer ml-1"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Main Map Rendering */}
      {engine === 'google' ? (
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat: 22.5, lng: 79.0 }}
            defaultZoom={5}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapType}
            disableDefaultUI={true}
            gestureHandling="greedy"
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          >
            <GoogleMapEffect activeCity={activeCity} focalPoint={focalPoint} />

            {/* 1. Hotspots Layer */}
              {activeLayers.hotspots && mapData.map(city => {
                const color = getPriorityColor(city.priorityLevel);
                const isSelected = activeCity?.city_id === city.city_id;
                const size = isSelected ? 56 : (city.priorityLevel === 'High' ? 44 : city.priorityLevel === 'Medium' ? 32 : 24);

                return (
                  <React.Fragment key={`hotspot-group-${city.city_id}`}>
                    <AdvancedMarker
                      position={{ lat: city.location.lat, lng: city.location.lng }}
                      onClick={() => onCityClick(city)}
                    >
                      <div
                        className={`relative rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${
                          isSelected ? 'scale-110 z-50' : 'hover:scale-110 opacity-60 grayscale-[0.5]'
                        }`}
                        style={{
                          width: size,
                          height: size,
                          backgroundColor: isSelected ? `${color}60` : `${color}30`,
                          border: isSelected ? `3px solid white` : `2px solid ${color}`,
                          boxShadow: isSelected ? `0 0 40px ${color}, 0 0 100px ${color}40` : `0 0 20px ${color}40`,
                        }}
                      >
                      {/* Inner glowing pulse ring */}
                      <span
                        className="absolute inset-0 rounded-full animate-ping opacity-60"
                        style={{ backgroundColor: color }}
                      />
                      
                      <span className="relative text-[10px] font-bold text-white uppercase drop-shadow">
                        {city.risk_score.split('/')[0].trim()}
                      </span>

                      {/* Popover Badge */}
                      <div
                        className={`absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#0e0e12]/95 border border-white/20 text-white text-[11px] whitespace-nowrap shadow-xl flex items-center gap-1.5 transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-semibold">{city.city_name}</span>
                        {city.demographics.is_rural && (
                          <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded uppercase tracking-tighter">Rural</span>
                        )}
                        <span className="text-gray-400 font-mono">({city.priorityLevel})</span>
                      </div>
                    </div>
                  </AdvancedMarker>

                  {/* Citizen incident sub-reports around the city */}
                  {city.recent_feed.map((feed, idx) => {
                    const offsetLat = idx === 0 ? 0.018 : -0.015;
                    const offsetLng = idx === 0 ? -0.022 : 0.024;
                    return (
                      <AdvancedMarker
                        key={`feed-${feed.id}`}
                        position={{ lat: city.location.lat + offsetLat, lng: city.location.lng + offsetLng }}
                        onClick={() => onCityClick(city)}
                      >
                        <div 
                          className="px-2 py-1 rounded-md bg-[#0c0c12]/95 border border-white/20 text-white text-[10px] flex items-center gap-1.5 shadow-lg hover:scale-110 transition-transform cursor-pointer"
                          title={`${feed.category}: ${feed.transcript}`}
                        >
                          {feed.type === 'voice' && <Mic className="w-3 h-3 text-neon-green" />}
                          {feed.type === 'image' && <ImageIcon className="w-3 h-3 text-neon-cyan" />}
                          {feed.type === 'text' && <FileText className="w-3 h-3 text-amber-400" />}
                          <span className="font-mono text-[9px] text-gray-300">{feed.category.split(' ')[0]}</span>
                        </div>
                      </AdvancedMarker>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* 2. Infrastructure Deficit Layer */}
            {activeLayers.infrastructure && mapData.map(city => {
              const deficit = 100 - parseInt(city.demographics.infrastructure_index);
              return (
                <AdvancedMarker
                  key={`infra-${city.city_id}`}
                  position={{ lat: city.location.lat + 0.042, lng: city.location.lng + 0.045 }}
                  onClick={() => onCityClick(city)}
                >
                  <div className="px-2.5 py-1.5 rounded-lg bg-[#07131b]/95 border border-neon-cyan/60 shadow-[0_0_20px_rgba(0,229,255,0.25)] text-white text-xs flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform backdrop-blur-md">
                    <Building2 className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neon-cyan text-[11px]">Deficit {deficit}%</span>
                        <span className="text-[10px] text-slate-400 font-mono">({city.demographics.infrastructure_index})</span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium truncate max-w-[130px]">
                        {city.complaints_summary.top_category}
                      </div>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* 3. Demographic Density Layer */}
            {activeLayers.demographics && mapData.map(city => {
              const popM = (city.demographics.population / 1000000).toFixed(2);
              return (
                <AdvancedMarker
                  key={`demo-${city.city_id}`}
                  position={{ lat: city.location.lat + 0.042, lng: city.location.lng - 0.048 }}
                  onClick={() => onCityClick(city)}
                >
                  <div className="px-2.5 py-1.5 rounded-lg bg-[#181105]/95 border border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.25)] text-white text-xs flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform backdrop-blur-md">
                    <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-400 text-[11px]">{city.demographics.density_sq_km.toLocaleString()}/km²</span>
                        <span className="text-[10px] text-slate-400 font-mono">({popM}M Pop)</span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium">{city.city_name} Urban Zone</div>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* 4. ConTech Budget & Schemes Layer */}
            {activeLayers.budget && mapData.map(city => {
              return (
                <AdvancedMarker
                  key={`budget-${city.city_id}`}
                  position={{ lat: city.location.lat - 0.045, lng: city.location.lng }}
                  onClick={() => onCityClick(city)}
                >
                  <div className="px-2.5 py-1.5 rounded-lg bg-[#170924]/95 border border-purple-400/60 shadow-[0_0_20px_rgba(192,132,252,0.25)] text-white text-xs flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform backdrop-blur-md">
                    <Coins className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-purple-300 text-[11px]">{city.contech_estimates.projected_cost_inr}</span>
                        <span className="text-[9px] text-purple-200 bg-purple-900/60 px-1 rounded font-mono">
                          {city.funding_scheme.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 truncate max-w-[140px]">
                        {city.contech_estimates.suggested_structure}
                      </div>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* 5. Government Builds Layer */}
            {activeLayers.builds && activeBuilds.map(build => {
              return (
                <AdvancedMarker
                  key={`gov-build-${build.id}`}
                  position={{ lat: build.location.lat, lng: build.location.lng }}
                  onClick={() => {
                    const city = MOCK_CITIES[build.city];
                    if (city) onCityClick(city);
                  }}
                >
                  <div className="px-2 py-1 rounded-lg bg-[#0e1610]/95 border border-emerald-400 text-white text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer hover:scale-110 transition-transform">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-emerald-400 text-[10px] uppercase">
                          {build.status === 'Completed' ? 'Built' : 'Building'}
                        </span>
                        <span className="text-[9px] text-slate-300 font-mono font-bold">
                          {build.totalCostINR}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-200 font-medium truncate max-w-[130px]">
                        {build.title}
                      </div>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      ) : (
        <div className="w-full h-full relative">
          <MapContainer
            center={[22.5, 79.0]}
            zoom={5}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              key={leafletStyle}
              url={
                leafletStyle === 'dark'
                  ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              }
              attribution={leafletStyle === 'dark' ? "&copy; OpenStreetMap contributors" : "Tiles &copy; Esri"}
              className={leafletStyle === 'satellite' ? 'leaflet-tile-pane-satellite' : ''}
            />
            <LeafletMapEffect activeCity={activeCity} focalPoint={focalPoint} />

            {/* 1. Hotspots Layer (Leaflet) */}
            {activeLayers.hotspots && mapData.map(city => {
              const color = getPriorityColor(city.priorityLevel);
              const isSelected = activeCity?.city_id === city.city_id;
              const radius = city.priorityLevel === 'High' ? 14 : city.priorityLevel === 'Medium' ? 10 : 7;

              return (
                <React.Fragment key={`leaflet-hotspot-group-${city.city_id}`}>
                  <CircleMarker
                    center={[city.location.lat, city.location.lng]}
                    radius={isSelected ? radius * 1.5 : radius}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.8 : 0.45,
                      weight: isSelected ? 3 : 1.5,
                    }}
                    eventHandlers={{
                      click: () => onCityClick(city),
                    }}
                  >
                    <Popup>
                      <div className="font-bold text-gray-900">{city.city_name}</div>
                      <div className="text-xs text-gray-600 mt-1">Priority: <span style={{ color }} className="font-bold">{city.priorityLevel}</span></div>
                      <div className="text-xs text-gray-600">Risk Score: <span className="font-bold text-gray-900">{city.risk_score}</span></div>
                    </Popup>
                  </CircleMarker>

                  {/* Citizen feed mini markers */}
                  {city.recent_feed.map((feed, idx) => {
                    const offsetLat = idx === 0 ? 0.025 : -0.02;
                    const offsetLng = idx === 0 ? -0.03 : 0.032;
                    return (
                      <CircleMarker
                        key={`leaflet-feed-${feed.id}`}
                        center={[city.location.lat + offsetLat, city.location.lng + offsetLng]}
                        radius={5}
                        pathOptions={{
                          color: '#00FF87',
                          fillColor: feed.type === 'voice' ? '#00FF87' : feed.type === 'image' ? '#00E5FF' : '#FFCC00',
                          fillOpacity: 0.9,
                          weight: 1.5,
                        }}
                        eventHandlers={{
                          click: () => onCityClick(city),
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                          <div className="text-[10px] font-bold">[{feed.type.toUpperCase()}] {feed.category}</div>
                          <div className="text-[9px] text-gray-600">{feed.transcript}</div>
                        </Tooltip>
                      </CircleMarker>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* 2. Infrastructure Deficit Layer (Leaflet) */}
            {activeLayers.infrastructure && mapData.map(city => {
              const deficit = 100 - parseInt(city.demographics.infrastructure_index);
              return (
                <React.Fragment key={`leaflet-infra-group-${city.city_id}`}>
                  {/* Deficit stress radius */}
                  <Circle
                    center={[city.location.lat, city.location.lng]}
                    radius={18000}
                    pathOptions={{
                      color: '#00E5FF',
                      fillColor: '#00E5FF',
                      fillOpacity: 0.08,
                      dashArray: '6, 6',
                      weight: 1.5,
                    }}
                  />
                  <CircleMarker
                    center={[city.location.lat + 0.035, city.location.lng + 0.035]}
                    radius={9}
                    pathOptions={{
                      color: '#00E5FF',
                      fillColor: '#0891B2',
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                    eventHandlers={{ click: () => onCityClick(city) }}
                  >
                    <Popup>
                      <div className="font-bold text-cyan-900">{city.city_name} Infrastructure Deficit</div>
                      <div className="text-xs text-gray-700 mt-1">Deficit: <span className="font-bold text-cyan-700">{deficit}%</span></div>
                      <div className="text-xs text-gray-700">Index: {city.demographics.infrastructure_index}</div>
                      <div className="text-xs text-gray-700">Urgent Focus: <span className="font-medium text-gray-900">{city.complaints_summary.top_category}</span></div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* 3. Demographic Density Layer (Leaflet) */}
            {activeLayers.demographics && mapData.map(city => {
              const radius = city.demographics.population > 2000000 ? 26000 : city.demographics.population > 1000000 ? 19000 : 13000;
              return (
                <React.Fragment key={`leaflet-demo-group-${city.city_id}`}>
                  <Circle
                    center={[city.location.lat, city.location.lng]}
                    radius={radius}
                    pathOptions={{
                      color: '#F59E0B',
                      fillColor: '#F59E0B',
                      fillOpacity: 0.12,
                      weight: 1.5,
                    }}
                  />
                  <CircleMarker
                    center={[city.location.lat + 0.035, city.location.lng - 0.035]}
                    radius={8}
                    pathOptions={{
                      color: '#F59E0B',
                      fillColor: '#D97706',
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                    eventHandlers={{ click: () => onCityClick(city) }}
                  >
                    <Popup>
                      <div className="font-bold text-amber-900">{city.city_name} Demographics</div>
                      <div className="text-xs text-gray-700 mt-1">Density: <span className="font-bold text-amber-800">{city.demographics.density_sq_km.toLocaleString()} /km²</span></div>
                      <div className="text-xs text-gray-700">Population: {city.demographics.population.toLocaleString()}</div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* 4. ConTech Budget Layer (Leaflet) */}
            {activeLayers.budget && mapData.map(city => {
              return (
                <CircleMarker
                  key={`leaflet-budget-${city.city_id}`}
                  center={[city.location.lat - 0.035, city.location.lng]}
                  radius={9}
                  pathOptions={{
                    color: '#C084FC',
                    fillColor: '#9333EA',
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                  eventHandlers={{ click: () => onCityClick(city) }}
                >
                  <Popup>
                    <div className="font-bold text-purple-900">{city.city_name} ConTech Scheme</div>
                    <div className="text-xs text-gray-700 mt-1">Allocation: <span className="font-bold text-purple-800">{city.contech_estimates.projected_cost_inr}</span></div>
                    <div className="text-xs text-gray-700">Scheme: {city.funding_scheme}</div>
                    <div className="text-xs text-gray-700">Structure: {city.contech_estimates.suggested_structure}</div>
                    <div className="text-xs text-gray-700 mt-1 font-mono text-[11px]">
                      Concrete: {city.contech_estimates.estimated_concrete_m3} m³ | Steel: {city.contech_estimates.estimated_steel_tons} T
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* 5. Government Builds Layer (Leaflet) */}
            {activeLayers.builds && activeBuilds.map(build => {
              return (
                <CircleMarker
                  key={`leaflet-build-${build.id}`}
                  center={[build.location.lat, build.location.lng]}
                  radius={7}
                  pathOptions={{
                    color: '#10B981',
                    fillColor: build.status === 'Completed' ? '#10B981' : '#F59E0B',
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => {
                      const city = MOCK_CITIES[build.city];
                      if (city) onCityClick(city);
                    },
                  }}
                >
                  <Popup>
                    <div className="font-bold text-gray-900">{build.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{build.ward}, {build.city} (Tier {build.tier})</div>
                    <div className="text-xs font-mono font-bold text-emerald-600 mt-1">Cost: {build.totalCostINR}</div>
                    <div className="text-xs text-gray-700">Timeline: {build.timeline} • Built by {build.governingBody}</div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* Indore AI Prompts & Mega Construction Intelligence Modal */}
      <IndoreAIProjectsModal
        isOpen={isIndorePromptsOpen}
        onClose={() => setIsIndorePromptsOpen(false)}
        onPlotOnMap={(coords, title) => {
          setActiveLayers(prev => ({ ...prev, builds: true }));
          setFocalPoint({ lat: coords.lat, lng: coords.lng, zoom: 16 });
          setFocalTitle(title);
          const indore = MOCK_CITIES['Indore'];
          if (indore) {
            onCityClick(indore);
          }
        }}
      />
    </div>
  );
}
