export interface SnackBarSummary {
  totalSpent: number;
  monthlyAverage: number;
  currentMonthSpent: number;
  salaryDeduction: number;
  currency: string;
}

export interface MonthlySpending {
  month: string;
  year: number;
  amount: number;
  transactionCount: number;
  deductionAmount: number;
}

export interface PurchaseItem {
  id: string;
  itemName: string;
  category: string;
  amount: number;
  quantity: number;
  date: string;
  time: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'refunded';
  receipt?: string;
}

export interface SpendingAnalytics {
  totalTransactions: number;
  totalSpent: number;
  averagePerTransaction: number;
  busiestDay: string;
  busiestTime: string;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  amount: number;
}

export interface EmployeeInsight {
  rank: number;
  totalEmployees: number;
  percentile: number;
  frequentItems: FrequentItem[];
  departmentAverage: number;
}

export interface FrequentItem {
  name: string;
  count: number;
  totalSpent: number;
}

export interface TodayMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
}

export interface PendingTransaction {
  id: string;
  itemName: string;
  amount: number;
  date: string;
  status: 'pending' | 'in_progress';
  estimatedCompletion: string;
}

export interface SnackBarNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'promo';
  date: string;
  read: boolean;
}

export interface SnackBarDashboardData {
  summary: SnackBarSummary | null;
  recentPurchases: PurchaseItem[];
  monthlySpending: MonthlySpending[];
  analytics: SpendingAnalytics | null;
  insights: EmployeeInsight | null;
  frequentItems: FrequentItem[];
  todayMenu: TodayMenuItem[];
  pendingTransactions: PendingTransaction[];
  notifications: SnackBarNotification[];
}

export interface SnackBarApiResponse<T> {
  IsSuccess: boolean;
  Message: string;
  Data: T;
}
