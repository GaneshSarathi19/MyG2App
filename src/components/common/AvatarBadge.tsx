import React, {useState} from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../theme';

interface AvatarBadgeProps {
  initials: string;
  size?: number;
  imageUrl?: string | null;
}

/**
 * Circular avatar badge displaying user initials or an image.
 * Falls back to initials when no imageUrl is provided or on load error.
 */
export const AvatarBadge: React.FC<AvatarBadgeProps> = ({ initials, size = 80, imageUrl }) => {
  const [imgError, setImgError] = useState(false);
  const half = size / 2;
  const fontSize = Math.round(size * 0.3);
  const showImage = !!imageUrl && !imgError;

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
      {showImage ? (
        <Image
          source={{uri: imageUrl}}
          style={{width: size, height: size, borderRadius: half}}
          onError={() => setImgError(true)}
        />
      ) : (
        <Text style={[styles.text, { fontSize }]}>{initials}</Text>
      )}
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
