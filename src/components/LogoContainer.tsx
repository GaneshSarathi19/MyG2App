import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../theme';
import type {Organisation} from '../redux/slices/organisationSlice';

export type LogoVariant = 'full' | 'compact' | 'header';

interface Props {
  variant?: LogoVariant;
  source?: any;
  style?: ViewStyle;
  organisation?: Organisation;
}

const ORG_CONFIG: Record<string, {name: string; initials: string}> = {
  'G2': {name: 'G2 Technology Solutions India Pvt Ltd.', initials: 'G2'},
  'CG-Vak': {name: 'CG-Vak Software & Exports Ltd.', initials: 'CG'},
};

const LogoContainer: React.FC<Props> = ({
  variant = 'full',
  source,
  style,
  organisation = 'G2',
}) => {
  const config = ORG_CONFIG[organisation] ?? ORG_CONFIG.G2;

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.logoBox, logoSizeStyles[variant]]}>
        {source ? (
          <Image
            source={source}
            style={[styles.image, imageSizeStyles[variant]]}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.placeholder, placeholderStyles[variant]]}>
            <Text style={styles.placeholderText}>{config.initials}</Text>
          </View>
        )}
      </View>

      {variant === 'full' && (
        <>
          <Text style={styles.companyName}>{config.name}</Text>
          <Text style={styles.tagline}>Sign in to continue</Text>
        </>
      )}
    </View>
  );
};

/* ── Logo / image sizing per variant ── */
const logoSizeStyles: Record<LogoVariant, ViewStyle> = {
  full: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 14,
  },
  compact: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  header: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
};

const imageSizeStyles: Record<LogoVariant, ViewStyle> = {
  full: { width: 56, height: 56 },
  compact: { width: 28, height: 28 },
  header: { width: 22, height: 22 },
};

const placeholderStyles: Record<LogoVariant, ViewStyle> = {
  full: {},
  compact: {},
  header: {},
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },

  /* ── Logo box (background plate) ──────────────────────────────── */
  logoBox: {
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',

    /* subtle depth */
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  image: {
    /* Image source handles the content */
  },

  /* ── Placeholder (shown until a real logo PNG is provided) ── */
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },

  /* ── Typography lockup (full variant) ──────────────────────────── */
  companyName: {
    fontSize: 18,
    fontWeight: '800',
    color: "#000000",
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  tagline: {
    fontSize: 13,
    color: "#706B6B",
    textAlign: 'center',
  },
});

export default LogoContainer;
