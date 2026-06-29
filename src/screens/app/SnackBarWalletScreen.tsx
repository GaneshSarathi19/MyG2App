import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts } from '../../theme';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';
import SectionCard from '../../components/common/SectionCard';
import { SnackBarService } from '../../services/SnackBarService';
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
} from '../../api/interfaces/SnackBarTypes';

type LoadState<T> = { data: T | null; loading: boolean; error: string | null };

const initialLoadState = <T,>(): LoadState<T> => ({
  data: null,
  loading: true,
  error: null,
});

const formatCurrency = (amount: number): string =>
  `Rs.${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ─── Section Loading / Error / Empty wrappers ─────────────────────── */

const SectionLoader: React.FC = () => (
  <View style={styles.placeholderRow}>
    <ActivityIndicator size="small" color={Colors.primary} />
    <Text style={styles.placeholderText}>Loading...</Text>
  </View>
);

const SectionError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <View style={styles.placeholderRow}>
    <Text style={styles.errorText}>{message}</Text>
    <TouchableOpacity onPress={onRetry}>
      <Text style={styles.retryLink}>Retry</Text>
    </TouchableOpacity>
  </View>
);

const SectionEmpty: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.placeholderRow}>
    <Text style={styles.placeholderText}>{message}</Text>
  </View>
);

/* ─── Summary Card ──────────────────────────────────────────────────── */

const SummaryCard: React.FC<{ summary: SnackBarSummary }> = ({ summary }) => (
  <View style={styles.summaryContainer}>
    <View style={styles.summaryMain}>
      <Text style={styles.summaryLabel}>Total Spent</Text>
      <Text style={styles.summaryAmount}>
        {formatCurrency(summary.totalSpent)}
      </Text>
      <Text style={styles.summarySub}>
        This month: {formatCurrency(summary.currentMonthSpent)}
      </Text>
    </View>
    <View style={styles.summaryDivider} />
    <View style={styles.summaryStats}>
      <View style={styles.summaryStat}>
        <Text style={[styles.summaryStatVal, styles.summaryStatGreen]}>
          {formatCurrency(summary.monthlyAverage)}
        </Text>
        <Text style={styles.summaryStatLabel}>Monthly Avg</Text>
      </View>
      <View style={styles.summaryStat}>
        <Text style={[styles.summaryStatVal, { color: Colors.danger }]}>
          {formatCurrency(summary.salaryDeduction)}
        </Text>
        <Text style={styles.summaryStatLabel}>Salary Deduction</Text>
      </View>
    </View>
  </View>
);

/* ─── Info Pill ──────────────────────────────────────────────────────── */

const InfoPill: React.FC<{ label: string; value: string; color?: string }> = ({
  label,
  value,
  color,
}) => (
  <View style={styles.infoPill}>
    <Text style={styles.infoPillLabel}>{label}</Text>
    <Text style={[styles.infoPillValue, color ? { color } : null]}>{value}</Text>
  </View>
);

/* ─── Purchase Row ──────────────────────────────────────────────────── */

const statusColors: Record<string, string> = {
  completed: '#22C55E',
  pending: '#F59E0B',
  refunded: '#EF4444',
  in_progress: '#3B82F6',
};

const PurchaseRow: React.FC<{ item: PurchaseItem }> = ({ item }) => (
  <View style={styles.purchaseRow}>
    <View style={styles.purchaseLeft}>
      <View style={[styles.purchaseIndicator, { backgroundColor: statusColors[item.status] }]} />
      <View style={styles.purchaseInfo}>
        <Text style={styles.purchaseName}>{item.itemName}</Text>
        <Text style={styles.purchaseMeta}>
          {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.category} &middot; {formatDate(item.date)}
        </Text>
      </View>
    </View>
    <Text style={styles.purchaseAmount}>{formatCurrency(item.amount)}</Text>
  </View>
);

/* ─── Category Bar ────────────────────────────────────────────────────── */

const CategoryBar: React.FC<{
  category: string;
  amount: number;
  percentage: number;
  color: string;
}> = ({ category, amount, percentage, color }) => (
  <View style={styles.catRow}>
    <View style={styles.catHeader}>
      <Text style={styles.catName}>{category}</Text>
      <Text style={styles.catAmount}>{formatCurrency(amount)}</Text>
    </View>
    <View style={styles.catBarBg}>
      <View style={[styles.catBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.catPercent}>{percentage.toFixed(0)}%</Text>
  </View>
);

const CAT_COLORS = [Colors.primary, Colors.secondary, Colors.danger, '#7C3AED', '#0891B2', '#16A34A'];

/* ─── Frequent Item Row ──────────────────────────────────────────────── */

const FrequentItemRow: React.FC<{ item: FrequentItem; index: number }> = ({ item, index }) => (
  <View style={styles.freqRow}>
    <View style={styles.freqRank}>
      <Text style={styles.freqRankText}>{index + 1}</Text>
    </View>
    <View style={styles.freqInfo}>
      <Text style={styles.freqName}>{item.name}</Text>
      <Text style={styles.freqMeta}>{item.count} purchases</Text>
    </View>
    <Text style={styles.freqAmount}>{formatCurrency(item.totalSpent)}</Text>
  </View>
);

/* ─── Menu Card ────────────────────────────────────────────────────────── */

const MenuCard: React.FC<{ item: TodayMenuItem }> = ({ item }) => {
  const dotColor = item.available ? '#22C55E' : '#EF4444';
  return (
  <View style={[styles.menuCard, !item.available && styles.menuCardUnavailable]}>
    <View style={styles.menuTop}>
      <View style={[styles.menuDot, { backgroundColor: dotColor }]} />
      <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
    </View>
    <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
    <View style={styles.menuBottom}>
      <Text style={styles.menuPrice}>{formatCurrency(item.price)}</Text>
      <Text style={styles.menuCategory}>{item.category}</Text>
    </View>
  </View>
  );
};

/* ─── Notification Row ────────────────────────────────────────────────── */

const notifyColors: Record<string, string> = {
  info: Colors.primary,
  warning: '#F59E0B',
  promo: '#22C55E',
};

const NotificationRow: React.FC<{ item: SnackBarNotification }> = ({ item }) => (
  <View style={[styles.notifyRow, !item.read && styles.notifyRowUnread]}>
    <View style={[styles.notifyDot, { backgroundColor: notifyColors[item.type] }]} />
    <View style={styles.notifyContent}>
      <Text style={styles.notifyTitle}>{item.title}</Text>
      <Text style={styles.notifyMsg} numberOfLines={2}>{item.message}</Text>
      <Text style={styles.notifyDate}>{formatDate(item.date)}</Text>
    </View>
  </View>
);

/* ─── Main Screen ────────────────────────────────────────────────────── */

const SnackBarWalletScreen: React.FC = () => {
  const [summary, setSummary] = useState<LoadState<SnackBarSummary>>(initialLoadState);
  const [monthlySpending, setMonthlySpending] = useState<LoadState<MonthlySpending[]>>(initialLoadState);
  const [recentPurchases, setRecentPurchases] = useState<LoadState<PurchaseItem[]>>(initialLoadState);
  const [allPurchases, setAllPurchases] = useState<LoadState<PurchaseItem[]>>(initialLoadState);
  const [analytics, setAnalytics] = useState<LoadState<SpendingAnalytics>>(initialLoadState);
  const [insights, setInsights] = useState<LoadState<EmployeeInsight>>(initialLoadState);
  const [frequentItems, setFrequentItems] = useState<LoadState<FrequentItem[]>>(initialLoadState);
  const [todayMenu, setTodayMenu] = useState<LoadState<TodayMenuItem[]>>(initialLoadState);
  const [pendingTxns, setPendingTxns] = useState<LoadState<PendingTransaction[]>>(initialLoadState);
  const [notifications, setNotifications] = useState<LoadState<SnackBarNotification[]>>(initialLoadState);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');

  const runQuery = useCallback(async () => {
    const withErr = <T,>(
      setter: React.Dispatch<React.SetStateAction<LoadState<T>>>,
      promise: Promise<any>,
    ) => {
      setter(s => ({ ...s, loading: true, error: null }));
      promise
        .then((res: any) => {
          if (res?.IsSuccess) {
            setter({ data: res.Data as T, loading: false, error: null });
          } else {
            setter({ data: null, loading: false, error: res?.Message || 'Request failed' });
          }
        })
        .catch((err: any) => {
          setter({ data: null, loading: false, error: err?.message || 'Network error' });
        });
    };

    withErr(setSummary, SnackBarService.getSummary());
    withErr(setMonthlySpending, SnackBarService.getMonthlySpending());
    withErr(setRecentPurchases, SnackBarService.getRecentPurchases());
    withErr(setAllPurchases, SnackBarService.getPurchaseHistory());
    withErr(setAnalytics, SnackBarService.getAnalytics());
    withErr(setInsights, SnackBarService.getInsights());
    withErr(setFrequentItems, SnackBarService.getFrequentItems());
    withErr(setTodayMenu, SnackBarService.getTodayMenu());
    withErr(setPendingTxns, SnackBarService.getPendingTransactions());
    withErr(setNotifications, SnackBarService.getNotifications());
  }, []);

  useEffect(() => {
    runQuery();
  }, [runQuery]);

  const filteredPurchases = useMemo(() => {
    if (!allPurchases.data) return [];
    let list = [...allPurchases.data];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        p =>
          p.itemName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'amount') return b.amount - a.amount;
      return a.itemName.localeCompare(b.itemName);
    });

    return list;
  }, [allPurchases.data, searchQuery, sortBy]);

  const isInitialLoading =
    summary.loading &&
    monthlySpending.loading &&
    recentPurchases.loading &&
    allPurchases.loading &&
    analytics.loading;

  if (isInitialLoading) {
    return (
      <AppScreen>
        <AppHeader title="Snack Bar Wallet" showBack />
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your wallet...</Text>
        </View>
      </AppScreen>
    );
  }

  const allFailed =
    summary.error && monthlySpending.error && recentPurchases.error && analytics.error;

  return (
    <AppScreen>
      <AppHeader title="Snack Bar Wallet" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dashboard Summary */}
        {summary.data ? (
          <SummaryCard summary={summary.data} />
        ) : summary.error ? (
          <SectionError message={summary.error} onRetry={() => runQuery()} />
        ) : (
          <SectionLoader />
        )}

        {/* Insights Row */}
        {insights.data && (
          <View style={styles.insightsRow}>
            <InfoPill
              label="Rank"
              value={`#${insights.data.rank} / ${insights.data.totalEmployees}`}
              color={Colors.primary}
            />
            <InfoPill
              label="Percentile"
              value={`${insights.data.percentile}%`}
              color={Colors.secondary}
            />
            <InfoPill
              label="Dept Avg"
              value={formatCurrency(insights.data.departmentAverage)}
              color="#22C55E"
            />
          </View>
        )}

        {/* Monthly Spending */}
        <SectionCard title="Monthly Summary">
          {monthlySpending.loading ? (
            <SectionLoader />
          ) : monthlySpending.error ? (
            <SectionError message={monthlySpending.error} onRetry={() => runQuery()} />
          ) : monthlySpending.data && monthlySpending.data.length > 0 ? (
            monthlySpending.data.map((m, i) => (
              <View key={`${m.month}-${m.year}`}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.monthRow}>
                  <View style={styles.monthInfo}>
                    <Text style={styles.monthLabel}>{m.month} {m.year}</Text>
                    <Text style={styles.monthCount}>{m.transactionCount} transactions</Text>
                  </View>
                  <View style={styles.monthRight}>
                    <Text style={styles.monthAmount}>{formatCurrency(m.amount)}</Text>
                    {m.deductionAmount > 0 && (
                      <Text style={styles.monthDeduction}>
                        Deduction: {formatCurrency(m.deductionAmount)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <SectionEmpty message="No monthly data available" />
          )}
        </SectionCard>

        {/* Salary Deduction */}
        {summary.data && summary.data.salaryDeduction > 0 && (
          <SectionCard title="Salary Deduction">
            <View style={styles.deductionCard}>
              <View style={styles.deductionLeft}>
                <Text style={styles.deductionLabel}>Monthly Snack Bar Deduction</Text>
                <Text style={styles.deductionSub}>
                  Automatically deducted from your salary
                </Text>
              </View>
              <Text style={styles.deductionAmount}>
                {formatCurrency(summary.data.salaryDeduction)}
              </Text>
            </View>
          </SectionCard>
        )}

        {/* Recent Purchases */}
        <SectionCard title="Recent Purchases">
          {recentPurchases.loading ? (
            <SectionLoader />
          ) : recentPurchases.error ? (
            <SectionError message={recentPurchases.error} onRetry={() => runQuery()} />
          ) : recentPurchases.data && recentPurchases.data.length > 0 ? (
            recentPurchases.data.map((item, i) => (
              <View key={item.id}>
                {i > 0 && <View style={styles.divider} />}
                <PurchaseRow item={item} />
              </View>
            ))
          ) : (
            <SectionEmpty message="No recent purchases" />
          )}
        </SectionCard>

        {/* Full Purchase History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Purchase History</Text>
        </View>
        <View style={styles.historyControls}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items or category..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.sortRow}>
            {(['date', 'amount', 'name'] as const).map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.sortChip, sortBy === s && styles.sortChipActive]}
                onPress={() => setSortBy(s)}
              >
                <Text style={[styles.sortChipText, sortBy === s && styles.sortChipTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.historyCard}>
          {allPurchases.loading ? (
            <SectionLoader />
          ) : allPurchases.error ? (
            <SectionError message={allPurchases.error} onRetry={() => runQuery()} />
          ) : filteredPurchases.length > 0 ? (
            filteredPurchases.map((item, i) => (
              <View key={item.id}>
                {i > 0 && <View style={styles.divider} />}
                <PurchaseRow item={item} />
              </View>
            ))
          ) : (
            <SectionEmpty message={searchQuery ? 'No matching purchases' : 'No purchase history'} />
          )}
        </View>

        {/* Spending Analytics */}
        {(() => {
          const a = analytics.data;
          if (!a) return null;
          const maxTrend = a.monthlyTrend.length > 0 ? Math.max(...a.monthlyTrend.map(x => x.amount)) : 1;
          return (
          <SectionCard title="Spending Analytics">
            <View style={styles.analyticsStatsRow}>
              <InfoPill label="Transactions" value={String(a.totalTransactions)} color={Colors.primary} />
              <InfoPill label="Total" value={formatCurrency(a.totalSpent)} color={Colors.secondary} />
              <InfoPill label="Avg/Txn" value={formatCurrency(a.averagePerTransaction)} color="#22C55E" />
            </View>
            <View style={styles.analyticsMeta}>
              <Text style={styles.analyticsMetaText}>
                Busiest: {a.busiestDay} at {a.busiestTime}
              </Text>
            </View>
            {a.categoryBreakdown.length > 0 && (
              <View style={styles.catSection}>
                <Text style={styles.catSectionTitle}>Category Breakdown</Text>
                {a.categoryBreakdown.map((cat, i) => (
                  <CategoryBar
                    key={cat.category}
                    category={cat.category}
                    amount={cat.amount}
                    percentage={cat.percentage}
                    color={CAT_COLORS[i % CAT_COLORS.length]}
                  />
                ))}
              </View>
            )}
            {a.monthlyTrend.length > 0 && (
              <View style={styles.catSection}>
                <Text style={styles.catSectionTitle}>Monthly Trend</Text>
                {a.monthlyTrend.map((t, i) => (
                  <View key={i} style={styles.trendRow}>
                    <Text style={styles.trendMonth}>{t.month} {t.year}</Text>
                    <View style={styles.trendBarBg}>
                      <View
                        style={[
                          styles.trendBarFill,
                          {
                            width: `${Math.min((t.amount / maxTrend) * 100, 100)}%`,
                            backgroundColor: Colors.secondary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.trendAmount}>{formatCurrency(t.amount)}</Text>
                  </View>
                ))}
              </View>
            )}
          </SectionCard>
          );
        })()}

        {/* Frequently Purchased Items */}
        {frequentItems.data && frequentItems.data.length > 0 && (
          <SectionCard title="Frequently Purchased Items">
            {frequentItems.data.map((item, i) => (
              <View key={item.name}>
                {i > 0 && <View style={styles.divider} />}
                <FrequentItemRow item={item} index={i} />
              </View>
            ))}
          </SectionCard>
        )}

        {/* Today's Menu */}
        {todayMenu.data && todayMenu.data.length > 0 && (
          <SectionCard title="Today's Menu">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.menuRow}>
                {todayMenu.data.map(item => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </View>
            </ScrollView>
          </SectionCard>
        )}

        {/* Pending Transactions */}
        {pendingTxns.data && pendingTxns.data.length > 0 && (
          <SectionCard title="Pending Transactions">
            {pendingTxns.data.map((item, i) => (
              <View key={item.id}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.pendingRow}>
                  <View style={styles.pendingLeft}>
                    <Text style={styles.pendingName}>{item.itemName}</Text>
                    <Text style={styles.pendingMeta}>
                      {formatDate(item.date)} &middot; Est. {item.estimatedCompletion}
                    </Text>
                  </View>
                  <View style={styles.pendingRight}>
                    <Text style={styles.pendingAmount}>{formatCurrency(item.amount)}</Text>
                    <View style={[styles.pendingBadge, { backgroundColor: `${statusColors[item.status]}20` }]}>
                      <Text style={[styles.pendingBadgeText, { color: statusColors[item.status] }]}>
                        {item.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Notifications */}
        {notifications.data && notifications.data.length > 0 && (
          <SectionCard title="Snack Bar Notifications">
            {notifications.data.map((item, i) => (
              <View key={item.id}>
                {i > 0 && <View style={styles.divider} />}
                <NotificationRow item={item} />
              </View>
            ))}
          </SectionCard>
        )}

        {/* Global Error State */}
        {allFailed && (
          <View style={styles.globalError}>
            <Text style={styles.globalErrorTitle}>Unable to load Snack Bar data</Text>
            <Text style={styles.globalErrorMsg}>
              Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.globalRetryBtn}>
              <Text style={styles.globalRetryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.subtle,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
  },

  /* Summary */
  summaryContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryMain: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
  },
  summarySub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  summaryStats: {
    flexDirection: 'row',
    padding: 16,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatVal: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryStatGreen: {
    color: '#22C55E',
  },
  summaryStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  /* Insights */
  insightsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  infoPill: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  infoPillLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoPillValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  /* Monthly */
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  monthInfo: {
    flex: 1,
    marginRight: 12,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  monthCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  monthRight: {
    alignItems: 'flex-end',
  },
  monthAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  monthDeduction: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 2,
  },

  /* Deduction */
  deductionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deductionLeft: {
    flex: 1,
    marginRight: 12,
  },
  deductionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  deductionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  deductionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.danger,
  },

  /* Purchase Row */
  purchaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  purchaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  purchaseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  purchaseMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  purchaseAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  /* Purchase History */
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionHeaderTitle: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  historyControls: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortChipTextActive: {
    color: Colors.white,
  },
  historyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },

  /* Analytics */
  analyticsStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  analyticsMeta: {
    marginBottom: 12,
  },
  analyticsMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  catSection: {
    marginTop: 12,
  },
  catSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  catRow: {
    marginBottom: 10,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catName: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  catBarBg: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    marginBottom: 2,
  },
  catBarFill: {
    height: 8,
    borderRadius: 4,
  },
  catPercent: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
  },

  /* Trend */
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  trendMonth: {
    width: 60,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  trendBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
  },
  trendBarFill: {
    height: 8,
    borderRadius: 4,
  },
  trendAmount: {
    width: 70,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'right',
  },

  /* Frequent Items */
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  freqRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  freqRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  freqInfo: {
    flex: 1,
    marginRight: 12,
  },
  freqName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  freqMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  freqAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  /* Menu */
  menuRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  menuCard: {
    width: 150,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuCardUnavailable: {
    opacity: 0.55,
  },
  menuTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  menuDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  menuName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  menuDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginBottom: 8,
  },
  menuBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  menuCategory: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  /* Pending */
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  pendingLeft: {
    flex: 1,
    marginRight: 12,
  },
  pendingName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pendingMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pendingRight: {
    alignItems: 'flex-end',
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  /* Notifications */
  notifyRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  notifyRowUnread: {
    backgroundColor: `${Colors.primary}06`,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  notifyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 12,
  },
  notifyContent: {
    flex: 1,
  },
  notifyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  notifyMsg: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 4,
  },
  notifyDate: {
    fontSize: 11,
    color: '#A0A0A0',
  },

  /* Placeholder / Error */
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    flex: 1,
  },
  retryLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  left: {
    marginLeft: 16,
  },

  /* Global Error */
  globalError: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 24,
    backgroundColor: '#FFF3F2',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  globalErrorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: 6,
  },
  globalErrorMsg: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  globalRetryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  globalRetryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default SnackBarWalletScreen;
