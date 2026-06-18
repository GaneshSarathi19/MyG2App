import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = true,
}) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>
            ←
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.title}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
  },

  backButton: {
    marginRight: 12,
  },

  backIcon: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
  },

  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
});

export default AppHeader;