import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  RefreshControl,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';
import { LeaveService } from '../../services/LeaveService';
import {
  LeaveDetail,
  LeaveSummaryRecord,
  UpdateLeaveDetail,
} from '../../api/interfaces/LeaveTypes';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LeaveType } from '../../api/interfaces/LeaveTypes';

/* ─── Helpers ──────────────────────────────────────────────────────── */

const formatISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Month abbreviations for display formatting */
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Parses a date string in common formats: YYYY-MM-DD, M/D/YYYY, MM/DD/YYYY.
 * Returns a Date object or null if unparseable.
 */
const parseDateString = (dateStr: string): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;

  // ISO format: YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const date = new Date(year, month, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  // US format: M/D/YYYY or MM/DD/YYYY
  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const month = parseInt(usMatch[1], 10) - 1;
    const day = parseInt(usMatch[2], 10);
    const year = parseInt(usMatch[3], 10);
    const date = new Date(year, month, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  // Fallback: try native parser for edge cases
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;

  return null;
};

const validateDate = (dateStr: string): boolean => {
  return parseDateString(dateStr) !== null;
};

/** Formats a date string into a user-friendly display like "Jun 1, 2026" */
const formatDisplayDate = (dateStr: string): string => {
  const date = parseDateString(dateStr);
  if (!date) return dateStr || 'Select date';
  return `${
    MONTH_NAMES[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * Converts a YYYY-MM-DD (ISO) string to the backend's M/D/YYYY format.
 * Example: "2026-06-24" → "6/24/2026"
 */
const convertToMDYYYY = (isoDate: string): string => {
  const date = parseDateString(isoDate);
  if (!date) return isoDate;
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

const getStatusColor = (status?: string): string => {
  if (!status) return Colors.textSecondary;
  const s = status.toLowerCase();
  if (s === 'approved') return '#34A853';
  if (s === 'rejected') return Colors.danger;
  if (s === 'pending') return Colors.secondary;
  return Colors.textSecondary;
};

/**
 * Generates an array of YYYY-MM-DD dates between two ISO date strings (inclusive).
 */
const generateDateRange = (fromStr: string, toStr: string): string[] => {
  const from = parseDateString(fromStr);
  const to = parseDateString(toStr);
  if (!from || !to) return [];
  const dates: string[] = [];
  const current = new Date(from);
  while (current <= to) {
    dates.push(formatISODate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

/**
 * Checks whether a given date is the 3rd Saturday of its month.
 */
const isSunday = (date: Date): boolean => date.getDay() === 0;

const isThirdSaturday = (date: Date): boolean => {
  if (date.getDay() !== 6) { return false; }
  const saturdayCount = Math.ceil(date.getDate() / 7);
  return saturdayCount === 3;
};

/**
 * Returns the default leave hours for a given date string.
 *   3rd Saturday → 6
 *   Weekday (Mon-Fri) → 8
 *   Weekend (Sat not 3rd, Sun) → 0
 */
const getDefaultHours = (dateStr: string): string => {
  const date = parseDateString(dateStr);
  if (!date) { return '8'; }
  const day = date.getDay();
  if (day === 0 || day === 6) {
    if (isThirdSaturday(date)) { return '6'; }
    return '0';
  }
  return '8';
};

/**
 * Formats an ISO date string into YYYY-MM-DD.
 */
const formatApiDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(d.getDate()).padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
};

/**
 * Normalizes a server response record, handling both PascalCase
 * and camelCase property names to match our LeaveSummaryRecord.
 */
const normalizeRecord = (raw: any): LeaveSummaryRecord => {
  const get = (key: string): any => {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    if (raw[camelKey] !== undefined && raw[camelKey] !== null)
      return raw[camelKey];
    return undefined;
  };

  return {
    LeaveId: get('LeaveId') || '',
    From: get('From') || '',
    To: get('To') || '',
    TotalDays: Number(get('TotalDays')) || 0,
    ApprovedBy: get('ApprovedBy') || '',
    Status: get('Status') || '',
    LeaveDetailsID: get('LeaveDetailsID') || '',
    LeaveTypeID: get('LeaveTypeID') || '',
    LeaveDate: get('LeaveDate') || '',
    AppliedDate: get('AppliedDate') || '',
    LeaveHours: String(get('LeaveHours') || ''),
    Reason: get('Reason') || '',
    LeaveFile: get('LeaveFile') || '',
    LeaveTypeName: get('LeaveTypeName'),
    CompensationRequired: get('CompensationRequired'),
    CompensationDate: get('CompensationDate'),
  };
};

/* ─── Screen ──────────────────────────────────────────────────────── */

/* ─── Leave Card ──────────────────────────────────────────────────── */

interface LeaveCardProps {
  record: LeaveSummaryRecord;
  onEdit: (record: LeaveSummaryRecord) => void;
  onDelete: (record: LeaveSummaryRecord) => void;
}

const LeaveCard: React.FC<LeaveCardProps> = ({ record, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <View style={styles.cardHeader}>
        <View
          style={[styles.leaveTypeDot, { backgroundColor: Colors.primary }]}
        />
        <Text style={styles.cardTitle} numberOfLines={1}>
          Leave Request
        </Text>
      </View>
      {record.Status && (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(record.Status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(record.Status) },
            ]}
          >
            {record.Status}
          </Text>
        </View>
      )}
    </View>

    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>From:</Text>
      <Text style={styles.cardValue}>{formatApiDate(record.From)}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>To:</Text>
      <Text style={styles.cardValue}>{formatApiDate(record.To)}</Text>
    </View>

    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Total Days:</Text>
      <Text style={styles.cardValue}>{record.TotalDays}</Text>
    </View>

    {record.ApprovedBy && (
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Approved By:</Text>
        <Text style={styles.cardValue}>{record.ApprovedBy}</Text>
      </View>
    )}

    <Text style={styles.cardId} numberOfLines={1} ellipsizeMode="tail">
      ID: {record.LeaveId}
    </Text>

    <View style={styles.cardActions}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => onEdit(record)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(record)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

/* ─── ScrollView with auto load-more ──────────────────────────────── */

const SCROLL_BUFFER = 150;

interface ScrollViewWithAutoLoadProps {
  leaves: LeaveSummaryRecord[];
  visibleCount: number;
  loadingMore: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onEdit: (record: LeaveSummaryRecord) => void;
  onDelete: (record: LeaveSummaryRecord) => void;
}

const ScrollViewWithAutoLoad: React.FC<ScrollViewWithAutoLoadProps> = ({
  leaves,
  visibleCount,
  loadingMore,
  isRefreshing,
  onRefresh,
  onLoadMore,
  onEdit,
  onDelete,
}) => {
  const hasMore = visibleCount < leaves.length;
  const isLoadingMore = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(['Pending']),
  );

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const currentScrollY = contentOffset.y;
      setScrollY(currentScrollY);

      if (isLoadingMore.current || !hasMore) { return; }
      const distanceFromBottom =
        contentSize.height - currentScrollY - layoutMeasurement.height;
      if (distanceFromBottom < SCROLL_BUFFER) {
        isLoadingMore.current = true;
        onLoadMore();
      }
    },
    [hasMore, onLoadMore],
  );

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const showScrollTop = scrollY > 400;

  useEffect(() => {
    if (!loadingMore) {
      isLoadingMore.current = false;
    }
  }, [loadingMore]);

  const paginatedLeaves = leaves.slice(0, visibleCount);

  const grouped: Record<string, LeaveSummaryRecord[]> = {};
  const order = ['Pending', 'Approved', 'Rejected'];
  paginatedLeaves.forEach(r => {
    const key = r.Status || 'Other';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  return (
    <View style={styles.scrollContainer}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <Text style={styles.paginationInfo}>
          Showing {Math.min(visibleCount, leaves.length)} of {leaves.length} records
        </Text>
        {order.map(sectionKey => {
          const items = grouped[sectionKey];
          if (!items || items.length === 0) { return null; }
          const isExpanded = expandedSections.has(sectionKey);
          return (
            <View key={sectionKey} style={styles.section}>
              <Pressable style={styles.sectionHeader} onPress={() => toggleSection(sectionKey)}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIndicator, {backgroundColor: getStatusColor(sectionKey)}]} />
                  <Text style={styles.sectionTitle}>{sectionKey} ({items.length})</Text>
                </View>
                <Text style={styles.sectionArrow}>{isExpanded ? '▲' : '▼'}</Text>
              </Pressable>
              {isExpanded && items.map((record, idx) => (
                <LeaveCard key={`${record.LeaveId}-${idx}`} record={record} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </View>
          );
        })}
        {loadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
      </ScrollView>

      {showScrollTop && (
        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Text style={styles.scrollToTopArrow}>▲</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/* ─── Hours Section (collapsible) ──────────────────────────────── */

interface HoursSectionProps {
  dateHoursMap: Record<string, string>;
  leaveDates: string[];
  setDateHoursMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  errors: Record<string, string>;
}

const HoursSection: React.FC<HoursSectionProps> = ({
  dateHoursMap,
  leaveDates,
  setDateHoursMap,
  errors,
}) => {
  const [expanded, setExpanded] = useState(false);

  const totalHours = leaveDates.reduce(
    (sum, d) => sum + (Number(dateHoursMap[d]) || 0),
    0,
  );

  return (
    <View style={styles.fieldGroup}>
      <TouchableOpacity
        style={styles.hoursSummary}
        onPress={() => setExpanded(prev => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.hoursSummaryLeft}>
          <Text style={styles.hoursSummaryLabel}>Leave Hours</Text>
          <Text style={styles.hoursSummaryTotal}>
            {totalHours} {totalHours === 1 ? 'hour' : 'hours'}
          </Text>
        </View>
        <Text style={styles.hoursSummaryArrow}>
          {expanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.hoursDetail}>
          {leaveDates.map((dateStr) => (
            <View key={dateStr} style={styles.hoursRow}>
              <Text style={styles.hoursRowDate}>
                {formatDisplayDate(dateStr)}
              </Text>
              <View style={styles.hoursRowInputGroup}>
                <TextInput
                  style={[
                    styles.hoursRowInput,
                    errors[`hours_${dateStr}`] && styles.inputError,
                  ]}
                  value={dateHoursMap[dateStr] ?? ''}
                  onChangeText={(val) =>
                    setDateHoursMap(prev => ({ ...prev, [dateStr]: val }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                />
                <Text style={styles.hoursRowUnit}>hrs</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {errors.leaveHours && (
        <Text style={styles.errorText}>{errors.leaveHours}</Text>
      )}
    </View>
  );
};

const ApplyLeaveScreen: React.FC = () => {
  const navigation = useNavigation();

  /* ── Mode ────────────────────────────────────────────────────────── */
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LeaveSummaryRecord | null>(
    null,
  );

  /* ── List state ────────────────────────────────────────────────── */
  const [leaves, setLeaves] = useState<LeaveSummaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ── Form state ────────────────────────────────────────────────── */
  const [leaveDates, setLeaveDates] = useState<string[]>([]);
  const [dateHoursMap, setDateHoursMap] = useState<Record<string, string>>({});
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [reason, setReason] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [leaveFile, setLeaveFile] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(
    null,
  );
  const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);

  /* ── Leave Type fetch state ────────────────────────────────────── */
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [typesError, setTypesError] = useState<string | null>(null);

  /* ── Date picker state ─────────────────────────────────────────── */
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [pickerField, setPickerField] = useState<
    'addDate' | 'fromDate' | 'toDate' | 'appliedDate' | null
  >(null);

  /* ── Touched / errors ──────────────────────────────────────────── */
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── Edit loading ──────────────────────────────────────────────── */
  const [isEditingLoading, setIsEditingLoading] = useState(false);

  /* ── Submit / feedback ─────────────────────────────────────────── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /* ── Fetch list ──────────────────────────────────────────────────── */
  /* ── Fetch leave types ──────────────────────────────────────────── */
  const fetchLeaveTypes = useCallback(async () => {
    setIsLoadingTypes(true);
    setTypesError(null);
    try {
      const types = await LeaveService.getLeaveTypeList();
      setLeaveTypes(types);
    } catch {
      setTypesError('Failed to load leave types');
    } finally {
      setIsLoadingTypes(false);
    }
  }, []);

  /* ── Set default leave type once loaded ─────────────────────────── */
  useEffect(() => {
    if (leaveTypes.length > 0 && !selectedLeaveType) {
      setSelectedLeaveType(leaveTypes[0]);
    }
  }, [leaveTypes, selectedLeaveType]);

  /* ── Fetch leave types on first load ──────────────────────────────── */
  useEffect(() => {
    fetchLeaveTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || visibleCount >= leaves.length) { return; }
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, visibleCount, leaves.length]);

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    setVisibleCount(10);
    try {
      const response = await LeaveService.getEmployeeLeaveSummary();
       
      console.log(
        '[ApplyLeaveScreen] Raw response:',
        JSON.stringify(response, null, 2),
      );

      if (response.IsSuccess) {
        const rawData = response.Data || [];
        const normalized = rawData.map(normalizeRecord);
         
        console.log(
          '[ApplyLeaveScreen] Normalized records:',
          JSON.stringify(normalized, null, 2),
        );
        setLeaves(normalized);
      } else {
        setListError(response.Message || 'Failed to fetch leave records');
      }
    } catch (err) {
       
      console.error('[ApplyLeaveScreen] fetchLeaves error:', err);
      setListError(
        err instanceof Error ? err.message : 'Failed to fetch leave records',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchLeaves();
    }
  }, [viewMode, fetchLeaves]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setVisibleCount(10);
    fetchLeaves();
  };

  /* ── Validation ─────────────────────────────────────────────────── */
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (leaveDates.length === 0) {
      newErrors.leLeaveDate = 'At least one leave date is required';
    }
    // Validate each date has valid hours
    for (const dateStr of leaveDates) {
      const hrs = dateHoursMap[dateStr];
      if (!hrs || !hrs.trim()) {
        newErrors[`hours_${dateStr}`] = 'Hours are required';
      } else if (Number(hrs) < 0 || Number(hrs) > 24) {
        newErrors[`hours_${dateStr}`] = 'Hours must be between 0 and 24';
      }
    }
    if (!appliedDate.trim()) {
      newErrors.appliedDate = 'Applied date is required';
    } else if (!validateDate(appliedDate)) {
      newErrors.appliedDate = 'Enter a valid date (YYYY-MM-DD)';
    }
    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
    }
    if (!selectedLeaveType?.LeaveTypeID) {
      newErrors.leaveType = 'Please select a leave type';
    }
    return newErrors;
  }, [leaveDates, dateHoursMap, appliedDate, reason, selectedLeaveType]);

  /* ── Reset form ──────────────────────────────────────────────────── */
  const resetForm = useCallback(() => {
    setLeaveDates([]);
    setDateHoursMap({});
    setFromDate('');
    setToDate('');
    setReason('');
    setAppliedDate(formatISODate(new Date()));
    setLeaveFile('');
    setSelectedLeaveType(leaveTypes[0] ?? null);
    setTouched({});
    setErrors({});
    setSubmitMessage(null);
    setIsTypePickerVisible(false);
    setIsEditing(false);
    setEditingRecord(null);
  }, [leaveTypes]);

  /* ── Open form for new leave ────────────────────────────────────── */
  const openNewForm = () => {
    if (leaveTypes.length === 0) {
      fetchLeaveTypes();
    }
    resetForm();
    setIsEditing(false);
    setEditingRecord(null);
    setViewMode('form');
  };

  /* ── Open form for edit ─────────────────────────────────────────── */
  const openEditForm = async (record: LeaveSummaryRecord) => {
    setIsEditingLoading(true);
    setViewMode('form');
    setIsEditing(true);
    setEditingRecord(record);

    try {
      // Fetch full detail from backend using the LeaveId
      const detail = await LeaveService.getEmployeeLeaveDetail(record.LeaveId);
      const src = detail ?? record;

      const dates = generateDateRange(src.From, src.To);
      setLeaveDates(dates.length > 0 ? dates : src.LeaveDate ? [src.LeaveDate] : []);
      setFromDate(src.From || '');
      setToDate(src.To || '');
      const defaultHours = src.LeaveHours || '8';
      const map: Record<string, string> = {};
      const dateList = dates.length > 0 ? dates : src.LeaveDate ? [src.LeaveDate] : [];
      dateList.forEach((d) => { map[d] = defaultHours; });
      setDateHoursMap(map);
      setReason(src.Reason || '');
      setAppliedDate(src.AppliedDate || formatISODate(new Date()));
      setLeaveFile(src.LeaveFile || '');
      const matchedType =
        leaveTypes.find(t => t.LeaveTypeID === src.LeaveTypeID) ?? null;
      setSelectedLeaveType(matchedType);
    } catch {
      // Fallback to summary record on fetch failure
      const dates = generateDateRange(record.From, record.To);
      setLeaveDates(dates.length > 0 ? dates : record.LeaveDate ? [record.LeaveDate] : []);
      setFromDate(record.From || '');
      setToDate(record.To || '');
      const defaultHours = record.LeaveHours || '8';
      const map: Record<string, string> = {};
      const dateList = dates.length > 0 ? dates : record.LeaveDate ? [record.LeaveDate] : [];
      dateList.forEach((d) => { map[d] = defaultHours; });
      setDateHoursMap(map);
      setReason(record.Reason || '');
      setAppliedDate(record.AppliedDate || formatISODate(new Date()));
      setLeaveFile(record.LeaveFile || '');
      const matchedType =
        leaveTypes.find(t => t.LeaveTypeID === record.LeaveTypeID) ?? null;
      setSelectedLeaveType(matchedType);
    } finally {
      setTouched({});
      setErrors({});
      setSubmitMessage(null);
      setIsEditingLoading(false);
    }
  };

  /* ── Submit handler ─────────────────────────────────────────────── */
  const handleSubmit = useCallback(async () => {
    const validationErrors = validate();
    setTouched({
      leaveDates: true,
      appliedDate: true,
      reason: true,
      leaveType: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    setErrors({});

    try {
      if (isEditing && editingRecord) {
        /* ── UPDATE ───────────────────────────────────────────────── */
        const updateDetail: UpdateLeaveDetail = {
          LeaveId: editingRecord.LeaveId,
          LeaveDate: convertToMDYYYY(leaveDates[0] || formatISODate(new Date())),
          LeaveHours: dateHoursMap[leaveDates[0]] || '0',
          AppliedDate: appliedDate,
          Reason: reason.trim(),
          LeaveFile: leaveFile || '',
          LeaveTypeID: selectedLeaveType!.LeaveTypeID,
          CompensationRequired: 1,
          CompensationDate: formatISODate(new Date()),
          LeaveDetailsID: editingRecord.LeaveDetailsID || '',
        };

        const response = await LeaveService.updateEmployeeLeave(updateDetail);

        if (response.IsSuccess) {
          setSubmitSuccess(true);
          setSubmitMessage(response.Message || 'Leave updated successfully');
          setTimeout(() => {
            resetForm();
            setViewMode('list');
            fetchLeaves();
          }, 1500);
        } else {
          setSubmitSuccess(false);
          setSubmitMessage(response.Message || 'Failed to update leave');
        }
      } else {
        /* ── CREATE ───────────────────────────────────────────────── */
        const leaveDetails: LeaveDetail[] = leaveDates.map(date => ({
          LeaveDate: convertToMDYYYY(date),
          LeaveHours: dateHoursMap[date] || '0',
          AppliedDate: appliedDate,
          Reason: reason.trim(),
          LeaveFile: leaveFile || '',
          LeaveTypeID: selectedLeaveType!.LeaveTypeID,
        }));

        const leaveDetailsPayload = JSON.stringify(leaveDetails);
         
        console.log(
          '[ApplyLeaveScreen] POST LeaveDetails payload:',
          leaveDetailsPayload,
        );

        const response = await LeaveService.postEmployeeLeave(leaveDetails);

        if (response.IsSuccess) {
          setSubmitSuccess(true);
          setSubmitMessage(response.Message || 'Leave applied successfully');
          setTimeout(() => {
            resetForm();
            setViewMode('list');
            fetchLeaves();
          }, 1500);
        } else {
          setSubmitSuccess(false);
          setSubmitMessage(response.Message || 'Failed to apply leave');
        }
      }
    } catch (error) {
      setSubmitSuccess(false);
      setSubmitMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    leaveDates,
    dateHoursMap,
    appliedDate,
    reason,
    leaveFile,
    selectedLeaveType,
    isEditing,
    editingRecord,
    validate,
    fetchLeaves,
    resetForm,
  ]);

  /* ── Delete handler ────────────────────────────────────────────── */
  const handleDelete = (record: LeaveSummaryRecord) => {
    Alert.alert(
      'Delete Leave',
      `Are you sure you want to delete this leave record for ${record.LeaveDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await LeaveService.deleteEmployeeLeave(
                record.LeaveId,
              );
              if (response.IsSuccess) {
                setLeaves(prev =>
                  prev.filter(l => l.LeaveId !== record.LeaveId),
                );
              } else {
                Alert.alert(
                  'Error',
                  response.Message || 'Failed to delete leave',
                );
              }
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to delete leave',
              );
            }
          },
        },
      ],
    );
  };

  /* ── Input helpers ──────────────────────────────────────────────── */
  const handleChangeText = (field: string, value: string) => {
    switch (field) {
      case 'appliedDate':
        setAppliedDate(value);
        break;
      case 'leaveFile':
        setLeaveFile(value);
        break;
      case 'reason':
        setReason(value);
        break;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const selectLeaveType = (option: LeaveType) => {
    setSelectedLeaveType(option);
    setIsTypePickerVisible(false);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.leaveType;
      return newErrors;
    });
  };

  /* ── Date picker helpers ───────────────────────────────────── */
  const openDatePicker = (field: 'addDate' | 'fromDate' | 'toDate' | 'appliedDate') => {
    let date = new Date();
    if (field === 'appliedDate' && appliedDate) {
      const parsed = parseDateString(appliedDate);
      if (parsed) date = parsed;
    }
    if (field === 'fromDate' && fromDate) {
      const parsed = parseDateString(fromDate);
      if (parsed) date = parsed;
    }
    if (field === 'toDate') {
      if (toDate) {
        const parsed = parseDateString(toDate);
        if (parsed) date = parsed;
      } else if (fromDate) {
        const parsed = parseDateString(fromDate);
        if (parsed) {
          date = new Date(parsed);
          date.setDate(date.getDate() + 1);
        }
      }
    }
    setPickerDate(date);
    setPickerField(field);
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setPickerDate(selectedDate);
      const formatted = formatISODate(selectedDate);
      if (pickerField === 'addDate') {
        // Skip Sundays
        if (!isSunday(selectedDate)) {
          setLeaveDates(prev => {
            if (prev.includes(formatted)) return prev;
            return [...prev, formatted];
          });
          setDateHoursMap(prev => {
            const hrs = getDefaultHours(formatted);
            if (prev[formatted] !== undefined) { return prev; }
            return { ...prev, [formatted]: hrs };
          });
          setTouched(prev => ({ ...prev, leaveDates: true }));
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.leaveDates;
            return newErrors;
          });
        }
      }
      if (pickerField === 'fromDate') {
        setFromDate(formatted);
      }
      if (pickerField === 'toDate') {
        setToDate(formatted);
      }
      // When both from and to are set, auto-generate the range
      if (pickerField === 'fromDate' || pickerField === 'toDate') {
        const newFrom = pickerField === 'fromDate' ? formatted : fromDate;
        const newTo = pickerField === 'toDate' ? formatted : toDate;
        if (newFrom && newTo) {
          const range = generateDateRange(newFrom, newTo).filter(
            (d) => !isSunday(parseDateString(d)!),
          );
          // Replace all dates with the new range (no merging)
          setLeaveDates(range);
          setDateHoursMap(prev => {
            const next: Record<string, string> = {};
            range.forEach((d) => {
              next[d] = prev[d] ?? getDefaultHours(d);
            });
            return next;
          });
        }
        setTouched(prev => ({ ...prev, leaveDates: true }));
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.leaveDates;
          return newErrors;
        });
      }
      if (pickerField === 'appliedDate') {
        setAppliedDate(formatted);
        setTouched(prev => ({ ...prev, appliedDate: true }));
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.appliedDate;
          return newErrors;
        });
      }
    }
    if (Platform.OS !== 'ios') {
      setPickerField(null);
    }
  };

  const removeDate = useCallback((dateStr: string) => {
    setLeaveDates(prev => prev.filter(d => d !== dateStr));
    setDateHoursMap(prev => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });
  }, []);

  const closePicker = () => {
    setShowDatePicker(false);
    setPickerField(null);
  };

  /* ── Leave Card (inline reference removed - now standalone) ──────── */

  /* ── JSX ──────────────────────────────────────────────────────────── */
  return (
    <AppScreen>
      {viewMode === 'list' ? (
        <>
          {/* ── List Header ──────────────────────────────────────────── */}
          <View style={styles.listHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>&#8249;</Text>
            </TouchableOpacity>
            <Text style={styles.listHeaderTitle}>Leave Management</Text>
            <TouchableOpacity onPress={openNewForm} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Apply</Text>
            </TouchableOpacity>
          </View>

          {/* ── List Body ────────────────────────────────────────────── */}
          {isLoading && leaves.length === 0 ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : listError ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{listError}</Text>
              <TouchableOpacity
                onPress={fetchLeaves}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : leaves.length === 0 ? (
            <ScrollView
              contentContainerStyle={styles.centered}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              <Text style={styles.emptyText}>No leave records found.</Text>
              <Text style={styles.emptySubText}>
                Tap "Apply" to create one.
              </Text>
            </ScrollView>
          ) : (
            <ScrollViewWithAutoLoad
              leaves={leaves}
              visibleCount={visibleCount}
              loadingMore={loadingMore}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
              onLoadMore={handleLoadMore}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          )}
        </>
      ) : (
        /* ── Form View ────────────────────────────────────────────── */
        <>
          <AppHeader
            title={isEditing ? 'Edit Leave' : 'Apply Leave'}
            showBack={true}
          />
          {isEditingLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading leave details...</Text>
            </View>
          ) : (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* ── Leave Type ─────────────────────────────────────── */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Leave Type</Text>
                  <TouchableOpacity
                    style={[
                      styles.selectInput,
                      touched.leaveType &&
                        errors.leaveType &&
                        styles.inputError,
                    ]}
                    onPress={() => setIsTypePickerVisible(!isTypePickerVisible)}
                    activeOpacity={0.7}
                  >
                    {isLoadingTypes ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <Text style={styles.selectText}>
                        {selectedLeaveType?.LeaveTypeDescription ??
                          typesError ??
                          'Select leave type'}
                      </Text>
                    )}
                    <Text style={styles.selectArrow}>
                      {isTypePickerVisible ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                  {touched.leaveType && errors.leaveType && (
                    <Text style={styles.errorText}>{errors.leaveType}</Text>
                  )}
                </View>

                {isTypePickerVisible && (
                  <View style={styles.typePickerDropdown}>
                    {leaveTypes.map((option, index) => (
                      <TouchableOpacity
                        key={`${option.LeaveTypeID}-${index}`}
                        style={[
                          styles.typeOption,
                          selectedLeaveType?.LeaveTypeID === option.LeaveTypeID &&
                            styles.typeOptionSelected,
                        ]}
                        onPress={() => selectLeaveType(option)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.typeOptionText,
                            selectedLeaveType?.LeaveTypeID === option.LeaveTypeID &&
                              styles.typeOptionTextSelected,
                          ]}
                        >
                          {option.LeaveTypeDescription}
                        </Text>
                        {selectedLeaveType?.LeaveTypeID === option.LeaveTypeID && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* ── Leave Dates ────────────────────────────────────── */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Leave Dates</Text>

                  {/* From / To range */}
                  <View style={styles.rangeRow}>
                    <TouchableOpacity
                      style={[
                        styles.rangeField,
                        errors.fromDate && styles.inputError,
                      ]}
                      onPress={() => openDatePicker('fromDate')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.rangeLabelText}>From</Text>
                      <Text style={fromDate ? styles.rangeValueText : styles.rangePlaceholder}>
                        {fromDate ? formatDisplayDate(fromDate) : 'Select'}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.rangeSeparator}>→</Text>
                    <TouchableOpacity
                      style={[
                        styles.rangeField,
                        errors.toDate && styles.inputError,
                      ]}
                      onPress={() => openDatePicker('toDate')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.rangeLabelText}>To</Text>
                      <Text style={toDate ? styles.rangeValueText : styles.rangePlaceholder}>
                        {toDate ? formatDisplayDate(toDate) : 'Select'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Date chips (dates only, no hours) */}
                  {leaveDates.length > 0 && (
                    <>
                      <View style={styles.dateChipsContainer}>
                        {leaveDates.map((dateStr) => (
                          <View key={dateStr} style={styles.dateChip}>
                            <Text style={styles.dateChipText}>
                              {formatDisplayDate(dateStr)}
                            </Text>
                            <TouchableOpacity
                              onPress={() => removeDate(dateStr)}
                              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                            >
                              <Text style={styles.dateChipRemove}>x</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>

                      {/* Add individual date */}
                      <TouchableOpacity
                        style={styles.addDateButton}
                        onPress={() => openDatePicker('addDate')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dateInputPlaceholder}>
                          + Add another date
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {touched.leaveDates && errors.leaveDates && (
                    <Text style={styles.errorText}>{errors.leaveDates}</Text>
                  )}
                </View>

                {/* ── Hours (collapsible) ─────────────────────────────── */}
                {leaveDates.length > 0 && (
                  <HoursSection
                    dateHoursMap={dateHoursMap}
                    leaveDates={leaveDates}
                    setDateHoursMap={setDateHoursMap}
                    errors={errors}
                  />
                )}

                {/* ── Applied Date ─────────────────────────────────────── */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Applied Date</Text>
                  <TouchableOpacity
                    style={[
                      styles.input,
                      styles.dateInput,
                      touched.appliedDate &&
                        errors.appliedDate &&
                        styles.inputError,
                    ]}
                    onPress={() => openDatePicker('appliedDate')}
                    activeOpacity={0.7}
                  >
                    {appliedDate ? (
                      <Text style={styles.dateInputText}>
                        {formatDisplayDate(appliedDate)}
                      </Text>
                    ) : (
                      <Text style={styles.dateInputPlaceholder}>
                        Select date
                      </Text>
                    )}
                  </TouchableOpacity>
                  {touched.appliedDate && errors.appliedDate && (
                    <Text style={styles.errorText}>{errors.appliedDate}</Text>
                  )}
                </View>

                {/* ── Leave File ────────────────────────────────────────── */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Leave File</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.leaveFile &&
                        errors.leaveFile &&
                        styles.inputError,
                    ]}
                    placeholder="File path or attachment (optional)"
                    placeholderTextColor={Colors.textSecondary}
                    value={leaveFile}
                    onChangeText={text => handleChangeText('leaveFile', text)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {touched.leaveFile && errors.leaveFile && (
                    <Text style={styles.errorText}>{errors.leaveFile}</Text>
                  )}
                </View>

                {/* ── Reason ──────────────────────────────────────────── */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Reason</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.multilineInput,
                      touched.reason && errors.reason && styles.inputError,
                    ]}
                    placeholder="Enter reason for leave..."
                    placeholderTextColor={Colors.textSecondary}
                    value={reason}
                    onChangeText={text => handleChangeText('reason', text)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  {touched.reason && errors.reason && (
                    <Text style={styles.errorText}>{errors.reason}</Text>
                  )}
                </View>

                {/* ── Feedback Message ───────────────────────────────── */}
                {submitMessage && (
                  <View
                    style={[
                      styles.feedbackBox,
                      submitSuccess
                        ? styles.feedbackSuccess
                        : styles.feedbackError,
                    ]}
                  >
                    <Text
                      style={
                        submitSuccess
                          ? styles.feedbackSuccessText
                          : styles.feedbackErrorText
                      }
                    >
                      {submitMessage}
                    </Text>
                  </View>
                )}

                {/* ── Date Picker ───────────────────────────────────── */}
                {showDatePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={pickerDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onValueChange={(e, date) => onDateChange(e, date)}
                      minimumDate={
                        pickerField === 'toDate' && fromDate
                          ? parseDateString(fromDate) ?? new Date()
                          : new Date()
                      }
                      maximumDate={new Date(2099, 11, 31)}
                    />
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        style={styles.pickerDoneBtn}
                        onPress={closePicker}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.pickerDoneText}>Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* ── Submit / Cancel ────────────────────────────────── */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isEditing ? 'Update Leave' : 'Submit Leave Request'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    resetForm();
                    setViewMode('list');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        )}
        </>
      )}
    </AppScreen>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  flex: { flex: 1 },

  /* ── List Header ──────────────────────────────────────────── */
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
  },
  backButton: {
    padding: 4,
    minWidth: 36,
  },
  backArrow: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: '300',
    lineHeight: 32,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  /* ── List Body ────────────────────────────────────────────── */
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scrollToTopArrow: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  paginationInfo: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '700',
  },

  /* ── Sections ─────────────────────────────────────────────── */
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  sectionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  /* ── Leave Card ───────────────────────────────────────────── */
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaveTypeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardHours: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cardReason: {
    fontSize: 13,
    color: Colors.dark,
    marginBottom: 4,
    lineHeight: 20,
  },
  cardApplied: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  cardLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  cardId: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  /* ── Form ─────────────────────────────────────────────────── */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.background,
    fontSize: 15,
    color: Colors.dark,
  },
  multilineInput: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputError: {
    borderColor: Colors.danger,
  },

  /* ── Leave Type Picker ────────────────────────────────────── */
  selectInput: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 15,
    color: Colors.dark,
  },
  selectArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  typePickerDropdown: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  typeOptionSelected: {
    backgroundColor: `${Colors.primary}10`,
  },
  typeOptionText: {
    fontSize: 15,
    color: Colors.dark,
  },
  typeOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 8,
  },

  /* ── Submit / Cancel ────────────────────────────────────── */
  submitButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: Colors.background,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },

  /* ── Feedback ─────────────────────────────────────────────── */
  feedbackBox: {
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  feedbackSuccess: {
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#34A853',
  },
  feedbackError: {
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  feedbackSuccessText: {
    color: '#137333',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackErrorText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* ── Date range row ──────────────────────────────────── */
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  rangeField: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
  },
  rangeLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rangeValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rangePlaceholder: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rangeSeparator: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  /* ── Date chips (dates only) ──────────────────────────── */
  dateChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '12',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  dateChipText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  dateChipRemove: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '700',
  },
  addDateButton: {
    height: 36,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 18,
    borderStyle: 'dashed',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  /* ── Hours section ────────────────────────────────────── */
  hoursSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hoursSummaryLeft: {
    gap: 2,
  },
  hoursSummaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hoursSummaryTotal: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  hoursSummaryArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  hoursDetail: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hoursRowDate: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  hoursRowInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hoursRowInput: {
    height: 36,
    width: 56,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingTop: 8,
    paddingHorizontal: 6,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
    backgroundColor: Colors.white,
  },
  hoursRowUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  /* ── Date picker styles ─────────────────────────────────── */
  dateInput: {
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 15,
    color: Colors.dark,
  },
  dateInputPlaceholder: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  pickerContainer: {
    backgroundColor: Colors.white,
    
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  pickerDoneBtn: {
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  pickerDoneText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ApplyLeaveScreen;
