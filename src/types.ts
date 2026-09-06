export type City = {
  id: string;
  name: string;
  coordinates: [number, number];
};

export type Hotspot = {
  id: string;
  cityId: string;
  locationName: string;
  coordinates: [number, number];
  issueType: string;
  priorityScore: number;
  reportCount: number;
  description: string;
  recommendedAction: string;
  demographicCorrelation?: string;
};

export type ChartData = {
  name: string;
  value: number;
};

export type TimeSeriesData = {
  month: string;
  reports: number;
  resolved: number;
};

export type BudgetData = {
  department: string;
  complaints: number;
  budgetAllocated: number;
};

export type AIRecommendation = {
  id: string;
  title: string;
  description: string;
  impact: 'Critical' | 'High' | 'Medium';
};
