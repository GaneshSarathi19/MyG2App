import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../theme';

interface AvatarBadgeProps {
  initials: string;
  size?: number;
}

/**
 * Circular avatar badge displaying user initials.
 * Defaults to an 80x80 circle; override with the `size` prop.
 */
export const AvatarBadge: React.FC<AvatarBadgeProps> = ({ initials, size = 80 }) => {
  const half = size / 2;
  const fontSize = Math.round(size * 0.3);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: half,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
});

export default AvatarBadge;
