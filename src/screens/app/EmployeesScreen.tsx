import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';
import { ScrollableList } from '../../components/scrollable/ScrollableList';
import { EmployeeService } from '../../services/EmployeeService';
import { EmployeeRecord } from '../../api/interfaces/EmployeeTypes';
import { Colors, Fonts } from '../../theme';
import useDebouncedValue from '../../utils/useDebouncedValue';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface EmployeeCardProps {
  item: EmployeeRecord;
}

interface FilterChipBarProps {
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  label: string;
}

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
      {options.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => onToggle(opt)}
          style={[styles.chip, selected.has(opt) && styles.chipActive]}
        >
          <Text
            style={[
              styles.chipText,
              selected.has(opt) && styles.chipTextActive,
            ]}
            numberOfLines={1}
          >
            {opt}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
);

/* ─── Employee Card ──────────────────────────────────────────────────── */

const EmployeeCard: React.FC<EmployeeCardProps> = ({ item }) => {
  const initials = useMemo(() => {
    const parts = item.Name.trim()
      .split(' ')
      .filter(Boolean)
      .filter((p) => /^[A-Za-z]/.test(p)); // skip parts starting with non-letter (e.g. "(Contractor)")

    if (parts.length >= 2) {
      return `${parts[0][0].toUpperCase()}${parts[parts.length - 1][0].toUpperCase()}`;
    }
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return item.Name.trim().charAt(0).toUpperCase();
  }, [item.Name]);

  return (
    <View style={styles.empCard}>
      <View style={styles.empTopRow}>
        <View style={styles.empAvatar}>
          <Text style={styles.empAvatarText}>{initials}</Text>
        </View>
        <View style={styles.empInfo}>
          <Text style={styles.empName} numberOfLines={1}>
            {item.Name}
          </Text>
          <Text style={styles.empDesignation}>{item.Designation}</Text>
        </View>
      </View>

      <View style={styles.empDivider} />

      <View style={styles.empBottomRow}>
        <View style={styles.empMeta}>
          <Text style={styles.empMetaLabel}>Department</Text>
          <Text style={styles.empMetaValue} numberOfLines={1}>
            {item.Department}
          </Text>
        </View>
        <View style={styles.empMeta}>
          <Text style={styles.empMetaLabel}>Mentor</Text>
          <Text style={styles.empMetaValue} numberOfLines={1}>
            {item.Mentor}
          </Text>
        </View>
      </View>
    </View>
  );
};

/* ─── Screen ─────────────────────────────────────────────────────────── */

const EmployeesScreen: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  /* ── Fetch Data ────────────────────────────────────────────────── */

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await EmployeeService.getEmployeeMasterList();
      if (response.IsSuccess) {
        setEmployees(response.Data);
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

    return result;
  }, [debouncedSearch, selectedDepts, selectedDesignations, employees]);

  /* ── Render ──────────────────────────────────────────────────────── */

  const keyExtractor = useCallback(
    (item: EmployeeRecord) => item.EmployeeId,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: EmployeeRecord }) => <EmployeeCard item={item} />,
    [],
  );

  return (
    <AppScreen>
      <AppHeader title="My Organisation" showBack />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, designation..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
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

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {filtered.length} {filtered.length === 1 ? 'employee' : 'employees'}
        </Text>
      </View>

      {/* Employee List */}
      <View style={styles.listContainer}>
        <ScrollableList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          isLoading={isLoading}
          emptyText="No employees found"
          contentContainerStyle={styles.listContent}
        />
      </View>
    </AppScreen>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
  },

  // Filters
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
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Chips
  chipList: {
    paddingVertical: 2,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 6,
    minWidth: 44,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },

  // Results
  resultsRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  resultsText: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },

  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Employee Card
  empCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  empTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  empAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${Colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  empAvatarText: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.bold,
    color: Colors.primary,
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
  empDesignation: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  empDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: `${Colors.border}80`,
    marginVertical: 12,
  },
  empBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  empMeta: {
    flex: 1,
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
});

export default EmployeesScreen;
