import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../theme';

interface InfoRowProps {
  label: string;
  value: string | null | undefined;
}

/**
 * A single-row info display component.
 * Renders a label-value pair with consistent styling for profile / detail screens.
 */
export const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}40`,
  },
  rowLabel: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    flex: 1,
  },
  rowValue: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
    flex: 1.2,
    textAlign: 'right',
  },
});

export default InfoRow;
