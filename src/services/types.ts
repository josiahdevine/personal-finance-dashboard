export type Status = 'excellent' | 'good' | 'fair' | 'poor';

export interface ComponentScore {
  score: number;
  status: Status;
  recommendations: string[];
}

export interface FinancialHealthScore {
  overallScore: number;
  statusSummary: Status;
  components: {
    emergencySavings: ComponentScore;
    debt: ComponentScore;
    retirement: ComponentScore;
    spending: ComponentScore;
    insurance: ComponentScore;
    credit: ComponentScore;
  };
  topRecommendations: string[];
  historicalScores: Array<{
    date: string;
    score: number;
  }>;
}

export interface FinancialHealthScoreParams {
  emergencySavings: {
    availableCash: number;
    monthlyExpenses: number;
  };
  debt: {
    mortgageBalance?: number;
    homeValue?: number;
    creditCardBalance: number;
    creditCardLimit: number;
    studentLoanBalance?: number;
    autoLoanBalance?: number;
    otherDebtBalance?: number;
    monthlyIncome: number;
  };
  retirement: {
    age: number;
    retirementBalance: number;
    annualIncome: number;
    annualContribution: number;
  };
  spending: {
    monthlyIncome: number;
    monthlyExpenses: number;
    necessitiesExpenses: number;
  };
  insurance: {
    hasHealthInsurance: boolean;
    hasLifeInsurance: boolean;
    hasDisabilityInsurance: boolean;
    hasHomeInsurance: boolean;
    hasAutoInsurance: boolean;
  };
  credit: {
    creditScore?: number;
    totalAccounts?: number;
    delinquencies?: number;
    hardInquiries?: number;
  };
} 