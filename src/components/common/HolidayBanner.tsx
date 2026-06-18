import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Colors } from '../../theme';

interface HolidayBannerProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

const HolidayBanner: React.FC<
  HolidayBannerProps
> = ({
  title,
  subtitle,
  onClose,
}) => {
  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onClose}
      >
        <Text style={styles.close}>
          ✕
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF8E7',

    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,

    padding: 12,

    borderRadius: 12,

    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  close: {
    fontSize: 18,
    color: Colors.textSecondary,
    paddingHorizontal: 4,
  },
});

export default HolidayBanner;