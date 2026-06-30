import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../theme/colors';

const ErrorView: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.msg}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btn} onPress={onRetry} accessibilityRole="button">
          <Text style={styles.btnText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFF3F2', borderRadius: 8, margin: 12, borderColor: Colors.danger, borderWidth: 1 },
  title: { fontWeight: '700', color: Colors.danger, marginBottom: 6 },
  msg: { color: Colors.textPrimary, marginBottom: 8 },
  btn: { backgroundColor: Colors.primary, padding: 10, borderRadius: 8, alignSelf: 'flex-start' },
  btnText: { color: '#fff', fontWeight: '600' },
});

export default ErrorView;
