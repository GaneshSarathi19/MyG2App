import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppStackParamList } from '../../navigation/AppStack';
const DashboardScreen = () => {
  const { logout } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  navigation.navigate('DemoListView');
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Employee Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.name}>John Smith</Text>

        <Text>ID: EMP001</Text>

        <Text>Designation: Software Engineer</Text>

        <Text>Department: Mobile Development</Text>

        <Text>Email: john@company.com</Text>

        <Text>Experience: 3 Years</Text>
      </View>
      <TouchableOpacity
        style={styles.listButton}
        onPress={() => navigation.navigate('DemoListView' as never)}
      >
        <Text style={styles.logoutText}>Demo ListView</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: '#F5F5F5',
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    elevation: 4,
    padding: 24,
    borderRadius: 16,
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  logoutBtn: {
    marginTop: 30,
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 10,
    paddingVertical: 16,
  },
  listButton: {
    marginTop: 20,
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 10,
    paddingVertical: 16,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
