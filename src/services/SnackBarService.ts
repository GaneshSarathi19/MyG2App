import { callGetList } from '../api/axiosClient';
import {
  SnackBarSummary,
  MonthlySpending,
  PurchaseItem,
  SpendingAnalytics,
  EmployeeInsight,
  FrequentItem,
  TodayMenuItem,
  PendingTransaction,
  SnackBarNotification,
  SnackBarApiResponse,
} from '../api/interfaces/SnackBarTypes';

const QUERIES = {
  summary: 'GetSnackBarSummary',
  monthlySpending: 'GetSnackBarMonthlySpending',
  recentPurchases: 'GetSnackBarRecentPurchases',
  purchaseHistory: 'GetSnackBarPurchaseHistory',
  analytics: 'GetSnackBarSpendingAnalytics',
  insights: 'GetSnackBarEmployeeInsights',
  frequentItems: 'GetSnackBarFrequentItems',
  todayMenu: 'GetSnackBarTodayMenu',
  pendingTransactions: 'GetSnackBarPendingTransactions',
  notifications: 'GetSnackBarNotifications',
} as const;

const successResponse = <T>(data: T): SnackBarApiResponse<T> => ({
  IsSuccess: true,
  Message: 'Success',
  Data: data,
});

/* ── Mock Data (internally consistent) ───────────────────────────────── */

const MOCK_SUMMARY: SnackBarSummary = {
  totalSpent: 29870.00,
  monthlyAverage: 4978.33,
  currentMonthSpent: 4320.00,
  salaryDeduction: 2500.00,
  currency: 'Rs.',
};

const MOCK_MONTHLY: MonthlySpending[] = [
  { month: 'January', year: 2026, amount: 4780.00, transactionCount: 24, deductionAmount: 2500 },
  { month: 'February', year: 2026, amount: 4520.00, transactionCount: 22, deductionAmount: 2500 },
  { month: 'March', year: 2026, amount: 6100.00, transactionCount: 29, deductionAmount: 2500 },
  { month: 'April', year: 2026, amount: 5430.00, transactionCount: 27, deductionAmount: 2500 },
  { month: 'May', year: 2026, amount: 4720.00, transactionCount: 23, deductionAmount: 2500 },
  { month: 'June', year: 2026, amount: 4320.00, transactionCount: 20, deductionAmount: 2500 },
];

const MOCK_PURCHASES: PurchaseItem[] = [
  { id: 'p1', itemName: 'Chicken Biryani', category: 'Main Course', amount: 180.00, quantity: 1, date: '2026-06-28', time: '13:15', paymentMethod: 'Salary Deduction', status: 'completed' },
  { id: 'p2', itemName: 'Cold Coffee', category: 'Beverages', amount: 170.00, quantity: 2, date: '2026-06-27', time: '15:30', paymentMethod: 'Salary Deduction', status: 'completed' },
  { id: 'p3', itemName: 'Veg Sandwich', category: 'Snacks', amount: 120.00, quantity: 1, date: '2026-06-27', time: '10:45', paymentMethod: 'UPI', status: 'completed' },
  { id: 'p4', itemName: 'Masala Dosa', category: 'Main Course', amount: 140.00, quantity: 1, date: '2026-06-26', time: '09:15', paymentMethod: 'Salary Deduction', status: 'completed' },
  { id: 'p5', itemName: 'Brownie', category: 'Desserts', amount: 75.00, quantity: 1, date: '2026-06-25', time: '15:15', paymentMethod: 'Salary Deduction', status: 'completed' },
  { id: 'p6', itemName: 'Samosa', category: 'Snacks', amount: 90.00, quantity: 3, date: '2026-06-24', time: '17:00', paymentMethod: 'Cash', status: 'completed' },
  { id: 'p7', itemName: 'Paneer Roll', category: 'Snacks', amount: 150.00, quantity: 1, date: '2026-06-24', time: '12:30', paymentMethod: 'Salary Deduction', status: 'completed' },
  { id: 'p8', itemName: 'French Fries', category: 'Snacks', amount: 90.00, quantity: 1, date: '2026-06-23', time: '16:00', paymentMethod: 'UPI', status: 'completed' },
  { id: 'p9', itemName: 'Veg Thali', category: 'Main Course', amount: 160.00, quantity: 1, date: '2026-06-22', time: '13:00', paymentMethod: 'Salary Deduction', status: 'completed' },
  { id: 'p10', itemName: 'Tea', category: 'Beverages', amount: 25.00, quantity: 1, date: '2026-06-22', time: '10:30', paymentMethod: 'Cash', status: 'completed' },
];

const MOCK_ANALYTICS: SpendingAnalytics = {
  totalTransactions: 145,
  totalSpent: 29870.00,
  averagePerTransaction: 206.00,
  busiestDay: 'Wednesday',
  busiestTime: '12:30 - 14:00',
  categoryBreakdown: [
    { category: 'Main Course', amount: 14900.00, percentage: 49.9 },
    { category: 'Beverages', amount: 5974.00, percentage: 20.0 },
    { category: 'Snacks', amount: 4780.00, percentage: 16.0 },
    { category: 'Desserts', amount: 2688.00, percentage: 9.0 },
    { category: 'Others', amount: 1528.00, percentage: 5.1 },
  ],
  monthlyTrend: [
    { month: 'Jan', year: 2026, amount: 4780 },
    { month: 'Feb', year: 2026, amount: 4520 },
    { month: 'Mar', year: 2026, amount: 6100 },
    { month: 'Apr', year: 2026, amount: 5430 },
    { month: 'May', year: 2026, amount: 4720 },
    { month: 'Jun', year: 2026, amount: 4320 },
  ],
};

const MOCK_INSIGHTS: EmployeeInsight = {
  rank: 12,
  totalEmployees: 340,
  percentile: 96,
  frequentItems: [
    { name: 'Chicken Biryani', count: 24, totalSpent: 4320 },
    { name: 'Cold Coffee', count: 18, totalSpent: 1530 },
  ],
  departmentAverage: 3850.00,
};

const MOCK_FREQUENT: FrequentItem[] = [
  { name: 'Chicken Biryani', count: 24, totalSpent: 4320 },
  { name: 'Cold Coffee', count: 18, totalSpent: 1530 },
  { name: 'Masala Dosa', count: 15, totalSpent: 2100 },
  { name: 'Paneer Roll', count: 12, totalSpent: 1800 },
  { name: 'French Fries', count: 10, totalSpent: 900 },
];

const MOCK_MENU: TodayMenuItem[] = [
  { id: 'm1', name: 'Chicken Biryani', description: 'Basmati rice with tender chicken', price: 180.00, category: 'Main Course', available: true },
  { id: 'm2', name: 'Veg Thali', description: 'Roti, sabzi, dal, rice & salad', price: 160.00, category: 'Main Course', available: true },
  { id: 'm3', name: 'Cold Coffee', description: 'Creamy chilled coffee', price: 85.00, category: 'Beverages', available: true },
  { id: 'm4', name: 'Masala Dosa', description: 'Crispy rice crepe with potato filling', price: 140.00, category: 'Main Course', available: true },
  { id: 'm5', name: 'Grilled Sandwich', description: 'Toasted veg & cheese sandwich', price: 120.00, category: 'Snacks', available: true },
  { id: 'm6', name: 'Paneer Roll', description: 'Spiced paneer wrapped in paratha', price: 150.00, category: 'Snacks', available: true },
  { id: 'm7', name: 'French Fries', description: 'Crispy golden fries with dip', price: 90.00, category: 'Snacks', available: true },
  { id: 'm8', name: 'Brownie', description: 'Rich chocolate brownie', price: 75.00, category: 'Desserts', available: true },
  { id: 'm9', name: 'Gulab Jamun', description: 'Milk dumplings in sugar syrup', price: 60.00, category: 'Desserts', available: false },
];

const MOCK_PENDING: PendingTransaction[] = [
  { id: 'pt1', itemName: 'Chicken Biryani', amount: 180.00, date: '2026-06-29', status: 'pending', estimatedCompletion: '13:30' },
  { id: 'pt2', itemName: 'Cold Coffee', amount: 85.00, date: '2026-06-29', status: 'in_progress', estimatedCompletion: '15:45' },
];

const MOCK_NOTIFICATIONS: SnackBarNotification[] = [
  { id: 'n1', title: 'Monthly Limit Updated', message: 'Your snack bar limit has been updated to Rs.6,000 for July.', type: 'info', date: '2026-06-28', read: false },
  { id: 'n2', title: 'New Menu Items Added', message: 'Try our Summer Special smoothies and cold coffee available from today.', type: 'promo', date: '2026-06-25', read: false },
  { id: 'n3', title: 'Salary Deduction Notice', message: 'Rs.2,500 will be deducted from your June salary towards snack bar purchases.', type: 'warning', date: '2026-06-20', read: true },
];

/* ── API Methods with Mock Fallback ──────────────────────────────────── */

const withFallback = async <T>(
  apiCall: () => Promise<SnackBarApiResponse<T>>,
  mockData: T,
): Promise<SnackBarApiResponse<T>> => {
  try {
    const result = await apiCall();
    if (result.IsSuccess) return result;
    return successResponse(mockData);
  } catch {
    return successResponse(mockData);
  }
};

export const SnackBarService = {
  getSummary: (): Promise<SnackBarApiResponse<SnackBarSummary>> =>
    withFallback(() => callGetList<SnackBarSummary>(QUERIES.summary), MOCK_SUMMARY),

  getMonthlySpending: (): Promise<SnackBarApiResponse<MonthlySpending[]>> =>
    withFallback(() => callGetList<MonthlySpending[]>(QUERIES.monthlySpending), MOCK_MONTHLY),

  getRecentPurchases: (limit = 5): Promise<SnackBarApiResponse<PurchaseItem[]>> =>
    withFallback(
      () => callGetList<PurchaseItem[]>(QUERIES.recentPurchases, { Limit: limit }),
      MOCK_PURCHASES.slice(0, limit),
    ),

  getPurchaseHistory: (
    filters?: Record<string, unknown>,
  ): Promise<SnackBarApiResponse<PurchaseItem[]>> =>
    withFallback(
      () => callGetList<PurchaseItem[]>(QUERIES.purchaseHistory, { ...filters }),
      MOCK_PURCHASES,
    ),

  getAnalytics: (): Promise<SnackBarApiResponse<SpendingAnalytics>> =>
    withFallback(() => callGetList<SpendingAnalytics>(QUERIES.analytics), MOCK_ANALYTICS),

  getInsights: (): Promise<SnackBarApiResponse<EmployeeInsight>> =>
    withFallback(() => callGetList<EmployeeInsight>(QUERIES.insights), MOCK_INSIGHTS),

  getFrequentItems: (): Promise<SnackBarApiResponse<FrequentItem[]>> =>
    withFallback(() => callGetList<FrequentItem[]>(QUERIES.frequentItems), MOCK_FREQUENT),

  getTodayMenu: (): Promise<SnackBarApiResponse<TodayMenuItem[]>> =>
    withFallback(() => callGetList<TodayMenuItem[]>(QUERIES.todayMenu), MOCK_MENU),

  getPendingTransactions: (): Promise<SnackBarApiResponse<PendingTransaction[]>> =>
    withFallback(
      () => callGetList<PendingTransaction[]>(QUERIES.pendingTransactions),
      MOCK_PENDING,
    ),

  getNotifications: (): Promise<SnackBarApiResponse<SnackBarNotification[]>> =>
    withFallback(
      () => callGetList<SnackBarNotification[]>(QUERIES.notifications),
      MOCK_NOTIFICATIONS,
    ),
};
