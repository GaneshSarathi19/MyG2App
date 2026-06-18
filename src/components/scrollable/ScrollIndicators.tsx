import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';

/* ── Config ───────────────────────────────────────────────────────── */

/** Predefined color palette for the indicator buttons. */
const COLORS = {
  navy: '#003C64',
  white: '#FFFFFF',
  shadow: '#000000',
};

/** Visual style variant for the scroll indicator button. */
export enum ScrollIndicatorType {
  /** Circular floating button (default). */
  FLOATING = 'floating',
  /** Compact pill-shaped inline button. */
  PILL = 'pill',
  /** Minimal arrow-only button. */
  MINIMAL = 'minimal',
}

/* ── Props ─────────────────────────────────────────────────────────── */

export interface ScrollIndicatorProps {
  /** Direction the indicator points. */
  type: 'top' | 'bottom';
  /** Called when the indicator is pressed. */
  onPress: () => void;
  /** Visual style variant. @default FLOATING */
  variant?: ScrollIndicatorType;
  /** Custom style override. */
  style?: ViewStyle;
  /** Test ID for testing. */
  testID?: string;
}

/**
 * A reusable floating or inline scroll indicator button.
 * Renders an arrow pointing up or down based on the `type` prop.
 */
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  type,
  onPress,
  variant = ScrollIndicatorType.FLOATING,
  style,
  testID,
}) => {
  const isTop = type === 'top';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.common, variantStyles[variant], style]}
      testID={testID}
      accessibilityLabel={isTop ? 'Scroll to top' : 'Scroll to bottom'}
      accessibilityRole="button"
    >
      <Triangle direction={isTop ? 'up' : 'down'} />
    </TouchableOpacity>
  );
};

/* ── Triangle (Arrow) Component ─────────────────────────────────────── */

interface TriangleProps {
  direction: 'up' | 'down';
  size?: number;
  color?: string;
}

const Triangle: React.FC<TriangleProps> = ({
  direction,
  size = 12,
  color = COLORS.white,
}) => {
  const rotation = direction === 'up' ? '180deg' : '0deg';

  return (
    <TouchableOpacity
      style={[
        styles.triangle,
        {
          width: 0,
          height: 0,
          borderLeftWidth: size / 2,
          borderRightWidth: size / 2,
          borderBottomWidth: size,
          borderBottomColor: color,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          transform: [{rotate: rotation}],
        } as ViewStyle,
      ]}
    />
  );
};

/* ── Styles ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  common: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  triangle: {
    marginTop: -2,
  },
});

/** Style overrides for each visual variant. */
const variantStyles = StyleSheet.create({
  floating: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.navy,
  },
  pill: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.navy,
  },
  minimal: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${COLORS.navy}E6`,
    elevation: 2,
  },
});
