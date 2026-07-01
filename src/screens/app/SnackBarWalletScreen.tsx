import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
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
  TodayMenuItem,
  SnackBarNotification,
  SnackBarOrderResponse,
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

/* ─── Stat Card ──────────────────────────────────────────────────────── */

const StatCard: React.FC<{ label: string; value: string; accent?: boolean }> = ({
  label,
  value,
  accent,
}) => (
  <View style={[styles.statCard, accent && styles.statCardAccent]}>
    <Text style={[styles.statValue, accent && styles.statValueLight]}>{value}</Text>
    <Text style={[styles.statLabel, accent && styles.statLabelLight]}>{label}</Text>
  </View>
);

/* ─── Purchase Row ───────────────────────────────────────────────────── */

const statusConfig: Record<string, { color: string; label: string }> = {
  completed: { color: '#22C55E', label: 'Completed' },
  pending: { color: '#F59E0B', label: 'Pending' },
  refunded: { color: '#EF4444', label: 'Refunded' },
  in_progress: { color: '#3B82F6', label: 'In Progress' },
};

const PurchaseRow: React.FC<{ item: PurchaseItem }> = ({ item }) => {
  const cfg = statusConfig[item.status] || statusConfig.completed;
  return (
    <View style={styles.purchaseRow}>
      <View style={styles.purchaseLeft}>
        <View style={[styles.purchaseDot, { backgroundColor: cfg.color }]} />
        <View style={styles.purchaseInfo}>
          <Text style={styles.purchaseName}>{item.itemName}</Text>
          <Text style={styles.purchaseMeta}>
            {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.category}
            {' \u00B7 '}
            {formatDate(item.date)}
          </Text>
        </View>
      </View>
      <View style={styles.purchaseRight}>
        <Text style={styles.purchaseAmount}>{formatCurrency(item.amount)}</Text>
        <View style={[styles.purchaseBadge, { backgroundColor: `${cfg.color}18` }]}>
          <Text style={[styles.purchaseBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
    </View>
  );
};

/* ─── Menu Card ──────────────────────────────────────────────────────── */

const MenuCard: React.FC<{ item: TodayMenuItem; onOrder: (item: TodayMenuItem) => void }> = ({
  item,
  onOrder,
}) => (
  <TouchableOpacity
    activeOpacity={item.available ? 0.7 : 1}
    onPress={() => item.available && onOrder(item)}
    style={[styles.menuCard, !item.available && styles.menuCardUnavailable]}
  >
    {item.available ? (
      <View style={styles.menuAvailBadge}>
        <Text style={styles.menuAvailText}>Available</Text>
      </View>
    ) : (
      <View style={[styles.menuAvailBadge, styles.menuSoldOutBadge]}>
        <Text style={[styles.menuAvailText, styles.menuSoldOutText]}>Sold Out</Text>
      </View>
    )}
    <View style={styles.menuIconWrap}>
      <View style={styles.menuIconDot} />
    </View>
    <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
    <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
    <View style={styles.menuBottom}>
      <Text style={styles.menuPrice}>{formatCurrency(item.price)}</Text>
      <View style={styles.menuCategoryPill}>
        <Text style={styles.menuCategoryText}>{item.category}</Text>
      </View>
    </View>
    {item.available && (
      <View style={styles.menuOrderOverlay}>
        <Text style={styles.menuOrderText}>Order</Text>
      </View>
    )}
  </TouchableOpacity>
);

/* ─── Notification Row ───────────────────────────────────────────────── */

const notifyColors: Record<string, string> = {
  info: Colors.primary,
  warning: '#F59E0B',
  promo: '#22C55E',
};

const NotificationRow: React.FC<{ item: SnackBarNotification }> = ({ item }) => {
  const dotColor = notifyColors[item.type] || notifyColors.info;
  return (
    <View style={[styles.notifyRow, !item.read && styles.notifyRowUnread]}>
      {!item.read && <View style={[styles.notifyAccent, { backgroundColor: dotColor }]} />}
      <View style={[styles.notifyTypeDot, { backgroundColor: dotColor }]} />
      <View style={styles.notifyContent}>
        <View style={styles.notifyTitleRow}>
          <Text style={styles.notifyTitle}>{item.title}</Text>
          {!item.read && <View style={[styles.notifyUnreadDot, { backgroundColor: dotColor }]} />}
        </View>
        <Text style={styles.notifyMsg} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifyDate}>{formatDate(item.date)}</Text>
      </View>
    </View>
  );
};

/* ─── Order Modal ─────────────────────────────────────────────────────── */

const OrderModal: React.FC<{
  visible: boolean;
  item: TodayMenuItem | null;
  quantity: number;
  notes: string;
  placing: boolean;
  orderResult: SnackBarOrderResponse | null;
  onQuantityChange: (q: number) => void;
  onNotesChange: (n: string) => void;
  onPlaceOrder: () => void;
  onClose: () => void;
}> = ({
  visible,
  item,
  quantity,
  notes,
  placing,
  orderResult,
  onQuantityChange,
  onNotesChange,
  onPlaceOrder,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        {orderResult ? (
          <>
            <View style={styles.orderSuccessIcon}>
              <Text style={styles.orderSuccessIconText}>{'\u2713'}</Text>
            </View>
            <Text style={styles.orderSuccessTitle}>Order Confirmed!</Text>
            <View style={styles.orderSuccessDetails}>
              <View style={styles.orderSuccessRow}>
                <Text style={styles.orderSuccessLabel}>Item</Text>
                <Text style={styles.orderSuccessValue}>{orderResult.itemName}</Text>
              </View>
              <View style={styles.orderSuccessRow}>
                <Text style={styles.orderSuccessLabel}>Qty</Text>
                <Text style={styles.orderSuccessValue}>{orderResult.quantity}</Text>
              </View>
              <View style={styles.orderSuccessRow}>
                <Text style={styles.orderSuccessLabel}>Total</Text>
                <Text style={styles.orderSuccessValue}>{formatCurrency(orderResult.totalAmount)}</Text>
              </View>
              <View style={styles.orderSuccessRow}>
                <Text style={styles.orderSuccessLabel}>Est. Time</Text>
                <Text style={styles.orderSuccessValue}>{orderResult.estimatedTime}</Text>
              </View>
              <View style={styles.orderSuccessRow}>
                <Text style={styles.orderSuccessLabel}>Order ID</Text>
                <Text style={[styles.orderSuccessValue, styles.orderSuccessId]}>{orderResult.orderId}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.orderDoneBtn} onPress={onClose}>
              <Text style={styles.orderDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </>
        ) : item ? (
          <>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Order</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.modalClose}>{'\u2715'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalItemPreview}>
              <View style={styles.modalItemIcon}>
                <View style={styles.modalItemDot} />
              </View>
              <View style={styles.modalItemInfo}>
                <Text style={styles.modalItemName}>{item.name}</Text>
                <Text style={styles.modalItemPrice}>{formatCurrency(item.price)}</Text>
                <Text style={styles.modalItemCategory}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.modalDivider} />
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                  onPress={() => onQuantityChange(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Text style={[styles.qtyBtnText, quantity <= 1 && styles.qtyBtnTextDisabled]}>-</Text>
                </TouchableOpacity>
                <View style={styles.qtyValueWrap}>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => onQuantityChange(quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)..."
              placeholderTextColor={Colors.textSecondary}
              value={notes}
              onChangeText={onNotesChange}
              multiline
            />
            <View style={styles.modalTotalRow}>
              <Text style={styles.modalTotalLabel}>Total</Text>
              <Text style={styles.modalTotalValue}>{formatCurrency(item.price * quantity)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.placeOrderBtn, placing && styles.placeOrderBtnDisabled]}
              onPress={onPlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.placeOrderBtnText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  </Modal>
);

/* ─── Main Screen ────────────────────────────────────────────────────── */

const SnackBarWalletScreen: React.FC = () => {
  const [summary, setSummary] = useState<LoadState<SnackBarSummary>>(initialLoadState);
  const [monthlySpending, setMonthlySpending] = useState<LoadState<MonthlySpending[]>>(initialLoadState);
  const [allPurchases, setAllPurchases] = useState<LoadState<PurchaseItem[]>>(initialLoadState);
  const [todayMenu, setTodayMenu] = useState<LoadState<TodayMenuItem[]>>(initialLoadState);
  const [notifications, setNotifications] = useState<LoadState<SnackBarNotification[]>>(initialLoadState);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');

  const [orderItem, setOrderItem] = useState<TodayMenuItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState<SnackBarOrderResponse | null>(null);

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
    withErr(setAllPurchases, SnackBarService.getPurchaseHistory());
    withErr(setTodayMenu, SnackBarService.getTodayMenu());
    withErr(setNotifications, SnackBarService.getNotifications());
  }, []);

  useEffect(() => {
    runQuery();
  }, [runQuery]);

  const openOrderModal = useCallback((item: TodayMenuItem) => {
    setOrderItem(item);
    setOrderQuantity(1);
    setOrderNotes('');
    setOrderResult(null);
    setOrderPlacing(false);
  }, []);

  const closeOrderModal = useCallback(() => {
    setOrderItem(null);
    setOrderResult(null);
    setOrderPlacing(false);
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (!orderItem) return;
    setOrderPlacing(true);
    const res = await SnackBarService.placeOrder({
      itemId: orderItem.id,
      itemName: orderItem.name,
      quantity: orderQuantity,
      notes: orderNotes.trim() || undefined,
    });
    if (res.IsSuccess) {
      setOrderResult(res.Data);
    }
    setOrderPlacing(false);
  }, [orderItem, orderQuantity, orderNotes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      SnackBarService.getSummary(),
      SnackBarService.getMonthlySpending(),
      SnackBarService.getPurchaseHistory(),
      SnackBarService.getTodayMenu(),
      SnackBarService.getNotifications(),
    ]);
    runQuery();
    setRefreshing(false);
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
    allPurchases.loading &&
    todayMenu.loading &&
    notifications.loading;

  if (isInitialLoading) {
    return (
      <AppScreen>
        <AppHeader title="Snack Bar Wallet" showBack />
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your snack bar...</Text>
        </View>
      </AppScreen>
    );
  }

  const allFailed =
    summary.error && monthlySpending.error && allPurchases.error;

  return (
    <AppScreen>
      <AppHeader title="Snack Bar Wallet" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Stats Grid: Total Spent | This Month | Monthly Avg | Salary Deduction */}
        {summary.data ? (
          <View style={styles.statsGrid}>
            <StatCard label="Total Spent" value={formatCurrency(summary.data.totalSpent)} accent />
            <StatCard label="This Month" value={formatCurrency(summary.data.currentMonthSpent)} />
            <StatCard label="Monthly Avg" value={formatCurrency(summary.data.monthlyAverage)} />
            <StatCard
              label="Salary Deduction"
              value={formatCurrency(summary.data.salaryDeduction)}
            />
          </View>
        ) : summary.error ? (
          <SectionError message={summary.error} onRetry={() => runQuery()} />
        ) : (
          <SectionLoader />
        )}

        {/* Monthly Summary */}
        <SectionCard title="Monthly Summary">
          {monthlySpending.loading ? (
            <SectionLoader />
          ) : monthlySpending.error ? (
            <SectionError message={monthlySpending.error} onRetry={() => runQuery()} />
          ) : monthlySpending.data && monthlySpending.data.length > 0 ? (
            (() => {
              const maxAmount = Math.max(...monthlySpending.data.map(m => m.amount));
              const isCurrentMonth = (m: MonthlySpending) => {
                const now = new Date();
                const monthNames = ['January','February','March','April','May','June','July',
                  'August','September','October','November','December'];
                return m.month === monthNames[now.getMonth()] && m.year === now.getFullYear();
              };
              return monthlySpending.data.map((m, i) => {
                const current = isCurrentMonth(m);
                return (
                  <View key={`${m.month}-${m.year}`}>
                    {i > 0 && <View style={styles.divider} />}
                    <View style={[styles.monthRow, current && styles.monthRowCurrent]}>
                      {current && (
                        <View style={styles.monthCurrentTab}>
                          <Text style={styles.monthCurrentTabText}>Now</Text>
                        </View>
                      )}
                      <View style={styles.monthLeft}>
                        <View style={styles.monthInfo}>
                          <Text style={[styles.monthLabel, current && styles.monthLabelCurrent]}>
                            {m.month.slice(0, 3)} {m.year}
                          </Text>
                          <Text style={styles.monthCount}>{m.transactionCount} txns</Text>
                        </View>
                        <View style={styles.monthBarWrap}>
                          <View
                            style={[
                              styles.monthBar,
                              {
                                width: `${Math.max((m.amount / maxAmount) * 100, 4)}%`,
                                backgroundColor: current ? Colors.secondary : `${Colors.primary}60`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                      <View style={styles.monthRight}>
                        <Text style={[styles.monthAmount, current && styles.monthAmountCurrent]}>
                          {formatCurrency(m.amount)}
                        </Text>
                        {m.deductionAmount > 0 && (
                          <Text style={styles.monthDeduction}>
                            -{formatCurrency(m.deductionAmount)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              });
            })()
          ) : (
            <SectionEmpty message="No monthly data available" />
          )}
        </SectionCard>

        {/* Purchase History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Purchase History</Text>
          {allPurchases.data && (
            <View style={styles.sectionHeaderBadge}>
              <Text style={styles.sectionHeaderBadgeText}>
                {allPurchases.data.length} total
              </Text>
            </View>
          )}
        </View>
        <View style={styles.historyControls}>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items or category..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
                <Text style={styles.searchClearText}>{'\u2715'}</Text>
              </TouchableOpacity>
            )}
          </View>
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

        {/* Today's Goodies */}
        <SectionCard title="Today's Goodies">
          {todayMenu.loading ? (
            <SectionLoader />
          ) : todayMenu.error ? (
            <SectionError message={todayMenu.error} onRetry={() => runQuery()} />
          ) : todayMenu.data && todayMenu.data.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.menuRow}>
                {todayMenu.data.map(item => (
                  <MenuCard key={item.id} item={item} onOrder={openOrderModal} />
                ))}
              </View>
            </ScrollView>
          ) : (
            <SectionEmpty message="No items available today" />
          )}
        </SectionCard>

        {/* Snack Bar News */}
        <SectionCard title="Snack Bar News">
          {notifications.loading ? (
            <SectionLoader />
          ) : notifications.error ? (
            <SectionError message={notifications.error} onRetry={() => runQuery()} />
          ) : notifications.data && notifications.data.length > 0 ? (
            notifications.data.map((item, i) => (
              <View key={item.id}>
                {i > 0 && <View style={styles.divider} />}
                <NotificationRow item={item} />
              </View>
            ))
          ) : (
            <SectionEmpty message="No news available" />
          )}
        </SectionCard>

        {allFailed && (
          <View style={styles.globalError}>
            <Text style={styles.globalErrorTitle}>Unable to load Snack Bar data</Text>
            <Text style={styles.globalErrorMsg}>
              Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.globalRetryBtn} onPress={runQuery}>
              <Text style={styles.globalRetryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <OrderModal
          visible={orderItem !== null}
          item={orderItem}
          quantity={orderQuantity}
          notes={orderNotes}
          placing={orderPlacing}
          orderResult={orderResult}
          onQuantityChange={setOrderQuantity}
          onNotesChange={setOrderNotes}
          onPlaceOrder={handlePlaceOrder}
          onClose={closeOrderModal}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
};

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

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  statCardAccent: {
    backgroundColor: Colors.primary,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statValueLight: {
    color: Colors.white,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statLabelLight: {
    color: 'rgba(255,255,255,0.75)',
  },

  /* Monthly */
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 4,
    position: 'relative',
  },
  monthRowCurrent: {
    backgroundColor: `${Colors.secondary}08`,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  monthCurrentTab: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: Colors.secondary,
    borderBottomRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  monthCurrentTabText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  monthLeft: {
    flex: 1,
    marginRight: 12,
  },
  monthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  monthLabelCurrent: {
    color: Colors.secondary,
  },
  monthCount: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  monthBarWrap: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  monthBar: {
    height: 6,
    borderRadius: 3,
  },
  monthRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  monthAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  monthAmountCurrent: {
    color: Colors.secondary,
  },
  monthDeduction: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 2,
  },

  /* Purchase History */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 16,
    gap: 10,
  },
  sectionHeaderTitle: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  sectionHeaderBadge: {
    backgroundColor: `${Colors.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sectionHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  historyControls: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },
  searchClear: {
    padding: 4,
    marginLeft: 4,
  },
  searchClearText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },

  /* Purchase Row */
  purchaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  purchaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  purchaseDot: {
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
    marginBottom: 2,
  },
  purchaseMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  purchaseRight: {
    alignItems: 'flex-end',
  },
  purchaseAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  purchaseBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  purchaseBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  /* Menu */
  menuRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  menuCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  menuCardUnavailable: {
    opacity: 0.6,
  },
  menuAvailBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#22C55E',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  menuSoldOutBadge: {
    backgroundColor: '#EF4444',
  },
  menuAvailText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  menuSoldOutText: {
    color: Colors.white,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuIconDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  menuName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginBottom: 10,
  },
  menuBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  menuCategoryPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  menuCategoryText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  /* Notifications */
  notifyRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingLeft: 4,
    position: 'relative',
  },
  notifyRowUnread: {
    backgroundColor: `${Colors.primary}06`,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  notifyAccent: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  notifyContent: {
    flex: 1,
  },
  notifyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  notifyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  notifyUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
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
  notifyTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    marginTop: 5,
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

  /* Menu Order Overlay */
  menuOrderOverlay: {
    marginTop: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  menuOrderText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Order Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  modalClose: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '700',
    padding: 4,
  },
  modalItemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  modalItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalItemDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 2,
  },
  modalItemCategory: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  qtyBtnTextDisabled: {
    color: Colors.textSecondary,
  },
  qtyValueWrap: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: Colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 4,
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
  },
  placeOrderBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderBtnDisabled: {
    opacity: 0.7,
  },
  placeOrderBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  /* Order Success */
  orderSuccessIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22C55E20',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  orderSuccessIconText: {
    fontSize: 32,
    color: '#22C55E',
    fontWeight: '800',
  },
  orderSuccessTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  orderSuccessDetails: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  orderSuccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderSuccessLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  orderSuccessValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  orderSuccessId: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  orderDoneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  orderDoneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default SnackBarWalletScreen;
