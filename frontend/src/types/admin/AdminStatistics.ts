export type AdminStatisticsFilters = {
  date_from?: string;
  date_to?: string;
  min_percentage?: number | '';
};

export type AdminStatisticsTestBreakdown = {
  id: string;
  title: string;
  total: number;
};

export type AdminStatisticsDay = {
  date: string;
  total: number;
  avg_percentage: number;
  tests: AdminStatisticsTestBreakdown[];
};

export type AdminStatisticsSummary = {
  total_completions: number;
  average_percentage: number;
  unique_tests: number;
};

export type AdminStatisticsBlock = {
  summary: AdminStatisticsSummary;
  series: AdminStatisticsDay[];
};

export type AdminStatisticsResponse = {
  finished: AdminStatisticsBlock;
  started: AdminStatisticsBlock;
};
