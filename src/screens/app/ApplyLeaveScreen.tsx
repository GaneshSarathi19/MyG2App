import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {Colors} from '../../theme';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';
import {LeaveService} from '../../services/LeaveService';
import {
  LeaveDetail,
  LeaveSummaryRecord,
  UpdateLeaveDetail,
} from '../../api/interfaces/LeaveTypes';

/* ─── Constants ───────────────────────────────────────────────────── */

interface LeaveTypeOption {
  id: string;
  label: string;
}

const LEAVE_TYPES: LeaveTypeOption[] = [
  {id: '27ADC15C-130F-458A-BF20-2F44D092B28B', label: 'Casual Leave'},
  {id: '2E5A2B6C-3D4E-4F5A-6B7C-8D9E0A1B2C3D', label: 'Sick Leave'},
  {id: '3F6B3C7D-4E5F-5A6B-7C8D-9E0A1B2C3D4E', label: 'Earned Leave'},
  {id: '4A7C4D8E-5E6F-6A7B-8C9D-0E1A2B3C4D5E', label: 'Unpaid Leave'},
];

/* ─── Helpers ──────────────────────────────────────────────────────── */

const formatISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const validateDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

const getLeaveTypeLabel = (id: string): string => {
  return LEAVE_TYPES.find(t => t.id === id)?.label || 'Leave';
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
 * Formats an ISO date string into YYYY-MM-DD.
 */
const formatApiDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
    if (raw[camelKey] !== undefined && raw[camelKey] !== null) return raw[camelKey];
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

const ApplyLeaveScreen: React.FC = () => {
  const navigation = useNavigation();

  /* ── Mode ────────────────────────────────────────────────────────── */
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LeaveSummaryRecord | null>(null);

  /* ── List state ────────────────────────────────────────────────── */
  const [leaves, setLeaves] = useState<LeaveSummaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  /* ── Form state ────────────────────────────────────────────────── */
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveHours, setLeaveHours] = useState('8');
  const [reason, setReason] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [leaveFile, setLeaveFile] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeOption>(LEAVE_TYPES[0]);
  const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);

  /* ── Touched / errors ──────────────────────────────────────────── */
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── Submit / feedback ─────────────────────────────────────────── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /* ── Fetch list ──────────────────────────────────────────────────── */
  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const response = await LeaveService.getEmployeeLeaveSummary();
      // eslint-disable-next-line no-console
      console.log('[ApplyLeaveScreen] Raw response:', JSON.stringify(response, null, 2));

      if (response.IsSuccess) {
        const rawData = response.Data || [];
        const normalized = rawData.map(normalizeRecord);
        // eslint-disable-next-line no-console
        console.log('[ApplyLeaveScreen] Normalized records:', JSON.stringify(normalized, null, 2));
        setLeaves(normalized);
      } else {
        setListError(response.Message || 'Failed to fetch leave records');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ApplyLeaveScreen] fetchLeaves error:', err);
      setListError(err instanceof Error ? err.message : 'Failed to fetch leave records');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (viewMode === 'list') {
        fetchLeaves();
      }
    }, [viewMode, fetchLeaves]),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLeaves();
  };

  /* ── Validation ─────────────────────────────────────────────────── */
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!leaveDate.trim()) {
      newErrors.leaveDate = 'Leave date is required';
    } else if (!validateDate(leaveDate)) {
      newErrors.leaveDate = 'Enter a valid date (e.g., 6/1/2026)';
    }
    if (!leaveHours.trim()) {
      newErrors.leaveHours = 'Leave hours are required';
    } else if (Number(leaveHours) <= 0 || Number(leaveHours) > 24) {
      newErrors.leaveHours = 'Hours must be between 1 and 24';
    }
    if (!appliedDate.trim()) {
      newErrors.appliedDate = 'Applied date is required';
    } else if (!validateDate(appliedDate)) {
      newErrors.appliedDate = 'Enter a valid date (YYYY-MM-DD)';
    }
    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
    }
    return newErrors;
  }, [leaveDate, leaveHours, appliedDate, reason]);

  /* ── Reset form ──────────────────────────────────────────────────── */
  const resetForm = () => {
    setLeaveDate('');
    setLeaveHours('8');
    setReason('');
    setAppliedDate(formatISODate(new Date()));
    setLeaveFile('');
    setSelectedLeaveType(LEAVE_TYPES[0]);
    setTouched({});
    setErrors({});
    setSubmitMessage(null);
    setIsTypePickerVisible(false);
    setIsEditing(false);
    setEditingRecord(null);
  };

  /* ── Open form for new leave ────────────────────────────────────── */
  const openNewForm = () => {
    resetForm();
    setIsEditing(false);
    setEditingRecord(null);
    setViewMode('form');
  };

  /* ── Open form for edit ─────────────────────────────────────────── */
  const openEditForm = (record: LeaveSummaryRecord) => {
    setLeaveDate(record.LeaveDate);
    setLeaveHours(record.LeaveHours);
    setReason(record.Reason);
    setAppliedDate(record.AppliedDate || formatISODate(new Date()));
    setLeaveFile(record.LeaveFile || '');
    const matchedType = LEAVE_TYPES.find(t => t.id === record.LeaveTypeID) || LEAVE_TYPES[0];
    setSelectedLeaveType(matchedType);
    setTouched({});
    setErrors({});
    setSubmitMessage(null);
    setIsEditing(true);
    setEditingRecord(record);
    setViewMode('form');
  };

  /* ── Submit handler ─────────────────────────────────────────────── */
  const handleSubmit = useCallback(async () => {
    const validationErrors = validate();
    setTouched({
      leaveDate: true,
      leaveHours: true,
      appliedDate: true,
      reason: true,
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
          LeaveHours: leaveHours,
          CompensationRequired: 1,
          CompensationDate: formatISODate(new Date()),
          LeaveDetailsID: editingRecord.LeaveDetailsID,
        };

        const response = await LeaveService.updateEmployeeLeave(updateDetail);

        if (response.IsSuccess) {
          setSubmitSuccess(true);
          setSubmitMessage(response.Message || 'Leave updated successfully');
          setTimeout(() => {
            resetForm();
            setViewMode('list');
          }, 1500);
        } else {
          setSubmitSuccess(false);
          setSubmitMessage(response.Message || 'Failed to update leave');
        }
      } else {
        /* ── CREATE ───────────────────────────────────────────────── */
        const leaveDetail: LeaveDetail = {
          LeaveDate: leaveDate,
          LeaveHours: leaveHours,
          AppliedDate: appliedDate,
          Reason: reason.trim(),
          LeaveFile: leaveFile,
          LeaveTypeID: selectedLeaveType.id,
        };

        const leaveDetailsPayload = JSON.stringify([leaveDetail]);
        // eslint-disable-next-line no-console
        console.log('[ApplyLeaveScreen] POST LeaveDetails payload:', leaveDetailsPayload);

        const response = await LeaveService.postEmployeeLeave(leaveDetail);

        if (response.IsSuccess) {
          setSubmitSuccess(true);
          setSubmitMessage(response.Message || 'Leave applied successfully');
          setTimeout(() => {
            resetForm();
            setViewMode('list');
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
  }, [leaveDate, leaveHours, appliedDate, reason, leaveFile, selectedLeaveType, isEditing, editingRecord, validate]);

  /* ── Delete handler ────────────────────────────────────────────── */
  const handleDelete = (record: LeaveSummaryRecord) => {
    Alert.alert(
      'Delete Leave',
      `Are you sure you want to delete this leave record for ${record.LeaveDate}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await LeaveService.deleteEmployeeLeave(record.LeaveId);
              if (response.IsSuccess) {
                setLeaves(prev => prev.filter(l => l.LeaveId !== record.LeaveId));
              } else {
                Alert.alert('Error', response.Message || 'Failed to delete leave');
              }
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete leave');
            }
          },
        },
      ],
    );
  };

  /* ── Input helpers ──────────────────────────────────────────────── */
  const handleChangeText = (field: string, value: string) => {
    switch (field) {
      case 'leaveDate':
        setLeaveDate(value);
        break;
      case 'leaveHours':
        setLeaveHours(value);
        break;
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
      const newErrors = {...prev};
      delete newErrors[field];
      return newErrors;
    });
  };

  const selectLeaveType = (option: LeaveTypeOption) => {
    setSelectedLeaveType(option);
    setIsTypePickerVisible(false);
  };

  /* ── Leave Card ──────────────────────────────────────────────────── */
  const LeaveCard: React.FC<{record: LeaveSummaryRecord}> = ({record}) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardHeader}>
          <View style={[styles.leaveTypeDot, {backgroundColor: Colors.primary}]} />
          <Text style={styles.cardTitle} numberOfLines={1}>
            Leave Request
          </Text>
        </View>
        {record.Status && (
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(record.Status) + '20'}]}>
            <Text style={[styles.statusText, {color: getStatusColor(record.Status)}]}>
              {record.Status}
            </Text>
          </View>
        )}
      </View>

      {/* From / To dates */}
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>From:</Text>
        <Text style={styles.cardValue}>{formatApiDate(record.From)}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>To:</Text>
        <Text style={styles.cardValue}>{formatApiDate(record.To)}</Text>
      </View>

      {/* Total days */}
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Total Days:</Text>
        <Text style={styles.cardValue}>{record.TotalDays}</Text>
      </View>

      {/* Approved By */}
      {record.ApprovedBy && (
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Approved By:</Text>
          <Text style={styles.cardValue}>{record.ApprovedBy}</Text>
        </View>
      )}

      {/* Leave ID (for debugging / reference) */}
      <Text style={styles.cardId} numberOfLines={1} ellipsizeMode="tail">
        ID: {record.LeaveId}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEditForm(record)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(record)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
              <TouchableOpacity onPress={fetchLeaves} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : leaves.length === 0 ? (
            <ScrollView
              contentContainerStyle={styles.centered}
              refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            >
              <Text style={styles.emptyText}>No leave records found.</Text>
              <Text style={styles.emptySubText}>Tap "Apply" to create one.</Text>
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            >
              {leaves.map(record => (
                <LeaveCard key={record.LeaveId} record={record} />
              ))}
            </ScrollView>
          )}
        </>
      ) : (
        /* ── Form View ────────────────────────────────────────────── */
        <>
          <AppHeader
            title={isEditing ? 'Edit Leave' : 'Apply Leave'}
            showBack={true}
          />
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
                    style={styles.selectInput}
                    onPress={() => setIsTypePickerVisible(!isTypePickerVisible)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.selectText}>
                      {selectedLeaveType.label}
                    </Text>
                    <Text style={styles.selectArrow}>
                      {isTypePickerVisible ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isTypePickerVisible && (
                  <View style={styles.typePickerDropdown}>
                    {LEAVE_TYPES.map(option => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.typeOption,
                          selectedLeaveType.id === option.id &&
                            styles.typeOptionSelected,
                        ]}
                        onPress={() => selectLeaveType(option)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.typeOptionText,
                            selectedLeaveType.id === option.id &&
                              styles.typeOptionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {selectedLeaveType.id === option.id && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* ── Leave Date ─────────────────────────────────────── */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Leave Date</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.leaveDate && errors.leaveDate && styles.inputError,
                    ]}
                    placeholder="e.g., 6/1/2026"
                    placeholderTextColor={Colors.textSecondary}
                    value={leaveDate}
                    onChangeText={text => handleChangeText('leaveDate', text)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {touched.leaveDate && errors.leaveDate && (
                    <Text style={styles.errorText}>{errors.leaveDate}</Text>
                  )}
                </View>

                {/* ── Leave Hours ────────────────────────────────────── */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Leave Hours</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.leaveHours && errors.leaveHours && styles.inputError,
                    ]}
                    placeholder="e.g., 8"
                    placeholderTextColor={Colors.textSecondary}
                    value={leaveHours}
                    onChangeText={text => handleChangeText('leaveHours', text)}
                    keyboardType="numeric"
                  />
                  {touched.leaveHours && errors.leaveHours && (
                    <Text style={styles.errorText}>{errors.leaveHours}</Text>
                  )}
                </View>

                {/* ── Applied Date ─────────────────────────────────────── */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Applied Date</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.appliedDate && errors.appliedDate && styles.inputError,
                    ]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textSecondary}
                    value={appliedDate}
                    onChangeText={text => handleChangeText('appliedDate', text)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
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
                      touched.leaveFile && errors.leaveFile && styles.inputError,
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
                      submitSuccess ? styles.feedbackSuccess : styles.feedbackError,
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

                {/* ── Submit / Cancel ────────────────────────────────── */}
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
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
                  )
                              }
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
        </>
      )}
    </AppScreen>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────── */

const getTypeColor = (typeId: string): string => {
  switch (typeId) {
    case '27ADC15C-130F-458A-BF20-2F44D092B28B': return '#22C55E'; // Casual - green
    case '2E5A2B6C-3D4E-4F5A-6B7C-8D9E0A1B2C3D': return '#EF4444'; // Sick - red
    case '3F6B3C7D-4E5F-5A6B-7C8D-9E0A1B2C3D4E': return '#3B82F6'; // Earned - blue
    case '4A7C4D8E-5E6F-6A7B-8C9D-0E1A2B3C4D5E': return '#F59E0B'; // Unpaid - orange
    default: return Colors.primary;
  }
};

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
  listContent: {
    padding: 16,
    paddingBottom: 32,
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

  /* ── Leave Card ───────────────────────────────────────────── */
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
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
    shadowOffset: {width: 0, height: 2},
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
    shadowOffset: {width: 0, height: 2},
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
});

export default ApplyLeaveScreen;
