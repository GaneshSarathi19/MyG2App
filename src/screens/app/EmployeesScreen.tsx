import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';
import { EmployeeService } from '../../services/EmployeeService';
import { EmployeeRecord } from '../../api/interfaces/EmployeeTypes';
import { Colors, Fonts } from '../../theme';
import useDebouncedValue from '../../utils/useDebouncedValue';

/* ─── Types ──────────────────────────────────────────────────────────── */

type ListItem =
  | { type: 'letter'; letter: string; count: number }
  | { type: 'employee'; data: EmployeeRecord };

interface EmployeeCardProps {
  item: EmployeeRecord;
}

interface FilterChipBarProps {
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  label: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const AVATAR_COLORS = [
  '#003C64', '#F86F18', '#C5122C', '#2E7D32', '#6A1B9A',
  '#00838F', '#E65100', '#37474F', '#01579B', '#827717',
];

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const hashName = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getAvatarColor = (name: string): string =>
  AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];





/* ─── Filter Chip Bar ────────────────────────────────────────────────── */

const FilterChipBar: React.FC<FilterChipBarProps> = ({
  options,
  selected,
  onToggle,
  label,
}) => (
  <View style={styles.filterSection}>
    <Text style={styles.filterLabel}>{label}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipList}
    >
      {options.map((opt) => {
        const active = selected.has(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => onToggle(opt)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                active && styles.chipTextActive,
              ]}
              numberOfLines={1}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  </View>
);

/* ─── Employee Card ──────────────────────────────────────────────────── */

const EmployeeCard: React.FC<EmployeeCardProps> = ({ item }) => {
  const [callTarget, setCallTarget] = useState<{ name: string; phone: string } | null>(null);

  const initials = useMemo(() => {
    const parts = item.Name.trim()
      .split(' ')
      .filter(Boolean)
      .filter((p) => /^[A-Za-z]/.test(p));

    if (parts.length >= 2) {
      return `${parts[0][0].toUpperCase()}${parts[parts.length - 1][0].toUpperCase()}`;
    }
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return item.Name.trim().charAt(0).toUpperCase();
  }, [item.Name]);

  const avatarColor = useMemo(() => getAvatarColor(item.Name), [item.Name]);

  return (
    <View style={styles.empCard}>
      <View style={styles.empCardAccent} />
      <View style={styles.empCardBody}>
        <View style={styles.empTopRow}>
          <View style={styles.empAvatarWrapper}>
            <View style={[styles.empAvatar, { backgroundColor: avatarColor + '18' }]}>
              <Text style={[styles.empAvatarText, { color: avatarColor }]}>
                {initials}
              </Text>
            </View>
            <View style={[styles.statusDot, item.EmployeeStatus ? styles.statusOnline : styles.statusOffline]} />
          </View>
          <View style={styles.empInfo}>
            <Text style={styles.empName} numberOfLines={1}>
              {item.Name}
            </Text>
            <View style={styles.empDesignationRow}>
              <Text style={styles.empDesignation}>{item.Designation}</Text>
            </View>
          </View>
        </View>

        <View style={styles.empBottomRow}>
          <View style={styles.empMeta}>
            <Text style={styles.empMetaLabel}>Department</Text>
            <Text style={styles.empMetaValue} numberOfLines={1}>
              {item.Department}
            </Text>
          </View>
          <View style={styles.empMetaDivider} />
          <View style={styles.empMeta}>
            <Text style={styles.empMetaLabel}>Backup Lead</Text>
            <Text style={styles.empMetaValue} numberOfLines={1}>
              {item.Mentor}
            </Text>
          </View>
        </View>

        {(item.EmployeeContact || item.MentorContact) && (
          <View style={styles.contactSection}>
            {item.EmployeeContact && (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Contact</Text>
                <Text style={styles.contactValue} numberOfLines={1}>
                  {item.EmployeeContact}
                </Text>
                <Pressable
                  onPress={() => setCallTarget({ name: item.Name, phone: item.EmployeeContact! })}
                  style={styles.callBtn}
                >
                  <Text style={styles.callBtnText}>Call</Text>
                </Pressable>
              </View>
            )}
            {item.MentorContact && (
              <View style={[styles.contactRow, styles.contactRowPadded]}>
                <Text style={styles.contactLabel}>Backup Lead</Text>
                <Text style={styles.contactValue} numberOfLines={1}>
                  {item.MentorContact}
                </Text>
                <Pressable
                  onPress={() => setCallTarget({ name: item.Mentor, phone: item.MentorContact! })}
                  style={styles.callBtn}
                >
                  <Text style={styles.callBtnText}>Call</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>

      <Modal visible={callTarget !== null} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Call</Text>
            <Text style={styles.modalMessage}>
              Are you sure to call "{callTarget?.name}"?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setCallTarget(null)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const t = callTarget;
                  setCallTarget(null);
                  if (t) {
                    Linking.openURL(`tel:${t.phone}`);
                  }
                }}
                style={styles.modalCallBtn}
              >
                <Text style={styles.modalCallText}>Call</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/* ─── Letter Section Header ──────────────────────────────────────────── */

const LetterHeader: React.FC<{ letter: string; count: number }> = ({ letter, count }) => (
  <View style={styles.letterHeader}>
    <View style={styles.letterHeaderContent}>
      <Text style={styles.letterHeaderText}>{letter}</Text>
      <View style={styles.letterBadge}>
        <Text style={styles.letterBadgeText}>{count}</Text>
      </View>
    </View>
    <View style={styles.letterHeaderLine} />
  </View>
);

/* ─── Screen ─────────────────────────────────────────────────────────── */

const EmployeesScreen: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<ListItem> | null>(null);

  /* Search + Filters */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(new Set());
  const [selectedDesignations, setSelectedDesignations] = useState<Set<string>>(new Set());

  /* Debounced search - 400ms */
  const debouncedSearch = useDebouncedValue(searchQuery, 400);

  /* ── Derived filter options ─────────────────────────────────────── */

  const { departments, designations } = useMemo(() => {
    const depts = Array.from(
      new Set(employees.map((e) => e.Department)),
    ).sort();
    const desigs = Array.from(
      new Set(employees.map((e) => e.Designation)),
    ).sort();
    return {
      departments: depts,
      designations: desigs,
    };
  }, [employees]);

  /* ── Clear filters helper ───────────────────────────────────────── */

  const hasActiveFilters = selectedDepts.size > 0 || selectedDesignations.size > 0 || searchQuery.trim().length > 0;

  const clearFilters = useCallback(() => {
    setSelectedDepts(new Set());
    setSelectedDesignations(new Set());
    setSearchQuery('');
  }, []);

  /* ── Fetch Data ────────────────────────────────────────────────── */

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await EmployeeService.getEmployeeMasterList();
      if (res.IsSuccess) {
        setEmployees(res.Data);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /* ── Toggle handlers ───────────────────────────────────────────── */

  const toggleDept = useCallback((dept: string) => {
    setSelectedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) {
        next.delete(dept);
      } else {
        next.add(dept);
      }
      return next;
    });
  }, []);

  const toggleDesignation = useCallback((desig: string) => {
    setSelectedDesignations((prev) => {
      const next = new Set(prev);
      if (next.has(desig)) {
        next.delete(desig);
      } else {
        next.add(desig);
      }
      return next;
    });
  }, []);

  /* ── Filter Logic ──────────────────────────────────────────────── */

  const filtered = useMemo(() => {
    let result = employees;

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((e) =>
        e.Name?.toLowerCase().includes(q),
      );
    }

    if (selectedDepts.size > 0) {
      result = result.filter((e) => selectedDepts.has(e.Department));
    }

    if (selectedDesignations.size > 0) {
      result = result.filter((e) => selectedDesignations.has(e.Designation));
    }

    result.sort((a, b) => a.Name.localeCompare(b.Name));

    return result;
  }, [debouncedSearch, selectedDepts, selectedDesignations, employees]);

  /* ── Build Sectioned Data ──────────────────────────────────────── */

  const sectionedData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    let currentLetter = '';
    let letterCount = 0;

    filtered.forEach((emp) => {
      const firstLetter = (emp.Name?.charAt(0) || '#').toUpperCase();
      if (firstLetter !== currentLetter) {
        if (currentLetter) {
          const prevHeader = items[items.length - 1 - letterCount];
          if (prevHeader && prevHeader.type === 'letter') {
            (prevHeader as { type: 'letter'; letter: string; count: number }).count = letterCount;
          }
        }
        currentLetter = firstLetter;
        letterCount = 0;
        items.push({ type: 'letter', letter: currentLetter, count: 0 });
      }
      letterCount++;
      items.push({ type: 'employee', data: emp });
    });

    if (currentLetter && letterCount > 0) {
      const headerIndex = items.length - 1 - letterCount;
      if (headerIndex >= 0 && items[headerIndex] && items[headerIndex].type === 'letter') {
        (items[headerIndex] as { type: 'letter'; letter: string; count: number }).count = letterCount;
      }
    }

    return items;
  }, [filtered]);

  /* ── Available Letters ─────────────────────────────────────────── */

  const availableLetters = useMemo<string[]>(() => {
    const letters = new Set<string>();
    filtered.forEach((emp) => {
      const letter = (emp.Name?.charAt(0) || '').toUpperCase();
      if (letter) { letters.add(letter); }
    });
    return ALPHABET.filter((l) => letters.has(l));
  }, [filtered]);

  /* ── Alphabet Scroller ─────────────────────────────────────────── */

  const scrollToLetter = useCallback((letter: string) => {
    const index = sectionedData.findIndex(
      (item) => item.type === 'letter' && item.letter === letter,
    );
    if (index >= 0) {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
    }
  }, [sectionedData]);

  /* ── Render ──────────────────────────────────────────────────────── */

  const keyExtractor = useCallback(
    (item: ListItem, _index: number) =>
      item.type === 'letter' ? `letter-${item.letter}` : item.data.EmployeeId,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'letter') {
        return <LetterHeader letter={item.letter} count={item.count} />;
      }
      return <EmployeeCard item={item.data} />;
    },
    [],
  );

  return (
    <AppScreen>
      <AppHeader title="My Organisation" showBack />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInner}>
          <Text style={styles.searchIcon}>&#128269;</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, designation..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.searchClear}>
              <Text style={styles.searchClearText}>x</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FilterChipBar
          label="Department"
          options={departments}
          selected={selectedDepts}
          onToggle={toggleDept}
        />
        <FilterChipBar
          label="Designation"
          options={designations}
          selected={selectedDesignations}
          onToggle={toggleDesignation}
        />
      </View>

      {/* Results count + Clear filters */}
      <View style={styles.resultsRow}>
        <View style={styles.resultsPill}>
          <Text style={styles.resultsText}>
            {filtered.length} {filtered.length === 1 ? 'employee' : 'employees'}
          </Text>
        </View>
        {hasActiveFilters && filtered.length > 0 && (
          <Pressable onPress={clearFilters} style={styles.clearFilterButton}>
            <Text style={styles.clearFilterText}>Clear filters</Text>
          </Pressable>
        )}
      </View>

      {/* Employee List with Alphabet Scroller */}
      <View style={styles.listContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
        <FlatList
          ref={flatListRef}
          data={sectionedData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            isLoading ? null : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No employees found</Text>
              </View>
            )
          }
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: true,
            });
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0,
              });
            }, 200);
          }}
        />
        {availableLetters.length > 1 && (
          <View style={styles.alphabetBar}>
            {availableLetters.map((letter) => (
              <Pressable
                key={letter}
                onPress={() => scrollToLetter(letter)}
                style={styles.alphabetItem}
              >
                <Text style={styles.alphabetText}>{letter}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </AppScreen>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.regular,
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

  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  chipList: {
    paddingVertical: 2,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    minWidth: 44,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  chipText: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },

  resultsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultsText: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  clearFilterButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFilterText: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.secondary,
  },

  listContainer: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  empCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  empCardAccent: {
    width: 4,
    backgroundColor: Colors.secondary,
  },
  empCardBody: {
    flex: 1,
    padding: 14,
  },
  empTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  empAvatarWrapper: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  empAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  statusOnline: {
    backgroundColor: '#2E7D32',
  },
  statusOffline: {
    backgroundColor: '#BDBDBD',
  },
  empAvatarText: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.bold,
  },
  empInfo: {
    flex: 1,
  },
  empName: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  empDesignationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  empDesignation: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  empBottomRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${Colors.border}80`,
  },
  empMeta: {
    flex: 1,
  },
  empMetaDivider: {
    width: 1,
    backgroundColor: `${Colors.border}80`,
    marginHorizontal: 12,
  },
  empMetaLabel: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  empMetaValue: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },

  contactSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${Colors.border}80`,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  contactRowPadded: {
    marginTop: 2,
  },
  contactLabel: {
    width: 60,
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  contactValue: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  callBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  callBtnText: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },

  letterHeader: {
    paddingTop: 16,
    paddingBottom: 6,
  },
  letterHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  letterHeaderText: {
    fontSize: Fonts.sizes.lg,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginRight: 8,
  },
  letterBadge: {
    backgroundColor: Colors.primary + '12',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  letterBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  letterHeaderLine: {
    height: 1,
    backgroundColor: `${Colors.border}60`,
    marginTop: 4,
  },

  alphabetBar: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    width: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  alphabetItem: {
    width: 20,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alphabetText: {
    fontSize: 9,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },

  /* ── Call Confirmation Modal ──────────────────────────────── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: Fonts.sizes.lg,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  modalCallBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalCallText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
});

export default EmployeesScreen;
