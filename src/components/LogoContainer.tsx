import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Color } from 'react-native/types_generated/Libraries/Animated/AnimatedExports';
import { Colors } from '../theme';

/* ──────────────────────────────────────────────────────────────────
   LogoContainer
   ──────────────────────────────────────────────────────────────────
   Renders the company logo placeholder.  Swap the `source` prop
   for your actual PNG once the asset is in src/resources/images/.

   Variants
   --------
   • "full"    – large centred block for the login card
   • "compact" – smaller inline version for the dashboard header
   • "header"  – minimal logo in the drawer / top bar

   Usage
   -----
   <LogoContainer
     variant="full"
     source={require('../../resources/images/g2-logo.png')}
   />
   ────────────────────────────────────────────────────────────────── */

export type LogoVariant = 'full' | 'compact' | 'header';

interface Props {
  /** branding variant */
  variant?: LogoVariant;
  /** actual logo image; omit to show a styled placeholder */
  source?: any;
  /** overrides */
  style?: ViewStyle;
}

/* ── Corporate colour constants ── */

const LogoContainer: React.FC<Props> = ({ variant = 'full', source, style }) => {
  const isPlaceholder = !source;

  return (
    <View style={[styles.wrapper, style]}>
      {/* Image area */}
      <View style={[styles.logoBox, logoSizeStyles[variant]]}>
        {source ? (
          <Image
            source={source}
            style={[styles.image, imageSizeStyles[variant]]}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.placeholder, placeholderStyles[variant]]}>
            <Text style={styles.placeholderText}>G2</Text>
          </View>
        )}
      </View>

      {/* Text lockup – only for full variant */}
      {variant === 'full' && (
        <>
          <Text style={styles.companyName}>
            G2 Technology Solutions India Pvt Ltd.
          </Text>
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
