import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function AppScreen({
  children,
  style,
}: Props) {
  return (

    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, style]}
    >
      {children}
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});