import { ChartColorSet, ChartType } from "@/app/(website)/insights-dashboard/types";

export const chartColorSets: Record<ChartType, ChartColorSet> = {
  depreciatedAPI: {
    title: "Deprecated API usage",
    colorSets: [
      {
        line: '#60A5FA',  // Jasnoniebieski
        gradientStart: '#93C5FD',
        gradientEnd: '#EFF6FF',
      },
      {
        line: '#4ADE80',  // Jasnozielony
        gradientStart: '#86EFAC',
        gradientEnd: '#ECFDF5',
      }
    ]
  },
  prsMerged: {
    title: "PRs merged",
    colorSets: [
      {
        line: '#F59E0B',  // Pomarańczowy
        gradientStart: '#FCD34D',
        gradientEnd: '#FFFBEB',
      },
      {
        line: '#EC4899',  // Różowy (dla kontrastu, jeśli potrzebny drugi zestaw)
        gradientStart: '#F9A8D4',
        gradientEnd: '#FDF2F8',
      }
    ]
  }
};

