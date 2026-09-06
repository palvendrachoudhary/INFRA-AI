import { City, Hotspot, ChartData, TimeSeriesData, BudgetData, AIRecommendation } from './types';

export const CITIES: City[] = [
  { id: 'indore', name: 'Indore', coordinates: [22.7196, 75.8577] },
  { id: 'delhi', name: 'Delhi', coordinates: [28.6139, 77.2090] },
  { id: 'mumbai', name: 'Mumbai', coordinates: [19.0760, 72.8777] },
  { id: 'bangalore', name: 'Bangalore', coordinates: [12.9716, 77.5946] },
];

export const HOTSPOTS: Hotspot[] = [
  // Indore Hotspots
  {
    id: 'h1',
    cityId: 'indore',
    locationName: 'Vijay Nagar Square',
    coordinates: [22.7533, 75.8937],
    issueType: 'Traffic Congestion',
    priorityScore: 92,
    reportCount: 145,
    description: 'Severe traffic bottlenecks during peak hours due to ongoing BRTS corridor maintenance and unregulated parking.',
    recommendedAction: 'Deploy smart traffic signaling and strict parking enforcement. Consider temporary rerouting.',
    demographicCorrelation: 'Correlated with 18% commercial growth in Sector 5.',
  },
  {
    id: 'h2',
    cityId: 'indore',
    locationName: 'Rajwada Palace Area',
    coordinates: [22.7185, 75.8550],
    issueType: 'Waterlogging & Sanitation',
    priorityScore: 85,
    reportCount: 89,
    description: 'Drainage overflow during moderate rainfall, leading to unhygienic conditions in the heritage market area.',
    recommendedAction: 'Desilt primary drainage channels. Assess for capacity upgrade using smart sensors.',
    demographicCorrelation: 'Cross-referenced with 15% population density increase in Ward 42.',
  },
  {
    id: 'h3',
    cityId: 'indore',
    locationName: 'Palasia Point',
    coordinates: [22.7244, 75.8839],
    issueType: 'Potholes / Road Damage',
    priorityScore: 78,
    reportCount: 56,
    description: 'Multiple deep potholes on the main arterial road causing vehicular damage and slowing down emergency services.',
    recommendedAction: 'Immediate patchwork required. Schedule for full resurfacing post-monsoon.',
    demographicCorrelation: 'Matched with heavily utilized transit corridor (30,000+ commuters daily).',
  },
  {
    id: 'h4',
    cityId: 'indore',
    locationName: 'Scheme 78',
    coordinates: [22.7666, 75.8876],
    issueType: 'Street Lighting',
    priorityScore: 65,
    reportCount: 450,
    description: 'Non-functional streetlights across a 1km stretch, raising safety concerns for residents in this residential hub.',
    recommendedAction: 'Replace faulty fixtures with IoT-enabled LED lamps.',
    demographicCorrelation: 'Correlated with high-risk nighttime safety issues in Sector C.',
  },
  
  // Delhi Hotspots
  {
    id: 'd1',
    cityId: 'delhi',
    locationName: 'Connaught Place',
    coordinates: [28.6304, 77.2177],
    issueType: 'Air Quality / Pollution',
    priorityScore: 95,
    reportCount: 312,
    description: 'Hazardous AQI levels compounded by localized construction dust.',
    recommendedAction: 'Deploy anti-smog guns and halt non-essential construction.',
  },
];

export const TOP_ISSUES_DATA: ChartData[] = [
  { name: 'Road Damage', value: 450 },
  { name: 'Waterlogging', value: 320 },
  { name: 'Street Lights', value: 210 },
  { name: 'Traffic Signals', value: 180 },
  { name: 'Waste Mgmt', value: 150 },
];

export const PREDICTION_DATA: TimeSeriesData[] = [
  { month: 'Jan', reports: 120, resolved: 100 },
  { month: 'Feb', reports: 150, resolved: 130 },
  { month: 'Mar', reports: 180, resolved: 140 },
  { month: 'Apr', reports: 220, resolved: 160 },
  { month: 'May', reports: 310, resolved: 190 }, // Spike predicted
  { month: 'Jun', reports: 380, resolved: 210 }, // Monsoon impact
];

export const BUDGET_COMPLAINTS_DATA: BudgetData[] = [
  { department: 'Roads & Transport', complaints: 450, budgetAllocated: 2.5 },
  { department: 'Water & Sanitation', complaints: 320, budgetAllocated: 1.8 },
  { department: 'Power & Light', complaints: 480, budgetAllocated: 1.1 },
  { department: 'Public Safety', complaints: 150, budgetAllocated: 1.2 },
];

export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  { 
    id: 'rec1', 
    title: 'Project Brief: Ward 18 Road Repair', 
    description: 'Alert: 450 requests for pothole repairs in Scheme 78/Ward 18. AI Recommendation: Reallocate 5% of Sector C budget to resolve high-risk safety issues. | Estimated ROI: 8.8/10', 
    impact: 'Critical' 
  },
  { 
    id: 'rec2', 
    title: 'Project Brief: Rajwada Drainage Upgrade', 
    description: 'Cross-referencing 89 waterlogging complaints with 15% population density increase. Recommend immediate desilting before monsoon. | Estimated ROI: 9.2/10', 
    impact: 'High' 
  },
  { 
    id: 'rec-rural-1', 
    title: 'Project Brief: Dharampuri Agri-Storage Hub', 
    description: 'High volume of voice reports regarding post-harvest rot in Block 2. Rural infrastructure index is at 38/100. Recommend immediate allocation for a 50MT mini cold storage unit. | Estimated ROI: 9.5/10 (Economic Stability)', 
    impact: 'Critical' 
  }
];

export const DATA_SOURCES = [
  { name: 'Municipal Corporation Public Investment Plans 2025-2026', type: 'Gov Data', status: 'Active Sync' },
  { name: 'Rural Development & Panchayati Raj Dept (GPDP)', type: 'Rural Data', status: 'Active Sync' },
  { name: 'Demographic Census Data API', type: 'Gov Data', status: 'Active Sync' },
  { name: 'Citizen Reports via WhatsApp & Voice (Rural + Urban)', type: 'Crowdsourced', status: 'Live Stream' },
  { name: 'National Remote Sensing Centre (NRSC) Land Records', type: 'Satellite', status: 'Live Stream' },
  { name: 'Smart City IoT Sensor Network (Traffic & Weather)', type: 'IoT Telemetry', status: 'Live Stream' },
];
