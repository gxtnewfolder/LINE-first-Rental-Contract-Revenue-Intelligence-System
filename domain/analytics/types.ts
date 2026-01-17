// Analytics domain types
// See docs/analytics.md for design details

export interface AnalyticsSnapshot {
  period: { year: number; month: number };
  
  income: {
    total: number;
    byBuilding: { name: string; amount: number }[];
    vsLastMonth: number;
    vsLastYear: number;
  };
  
  occupancy: {
    current: number;
    vacant: { room: string; building: string; daysSinceVacant: number }[];
  };
  
  collection: {
    rate: number;
    overdue: { room: string; amount: number; daysPastDue: number }[];
    avgDaysToCollect: number;
  };
  
  contracts: {
    expiringSoon: { room: string; tenant: string; daysRemaining: number }[];
    recentRenewals: number;
    recentTerminations: number;
  };
  
  inflation: {
    currentRate: number;
    avgRentGrowth: number;
    roomsBelowInflation: { room: string; gap: number }[];
  };
}

export interface MonthlyIncome {
  year: number;
  month: number;
  total: number;
  byBuilding: { buildingId: string; name: string; amount: number }[];
}

export interface OccupancyReport {
  date: Date;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
}
