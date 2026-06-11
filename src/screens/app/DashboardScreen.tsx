import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
const DashboardScreen = () => {
  const { logout } = useAuth();
  const navigation = useNavigation();

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
    padding: 20,
    backgroundColor: '#F5F5F5',
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
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
  },
  listButton: {
    marginTop: 20,
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
