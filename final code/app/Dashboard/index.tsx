import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const Dashboard = () => {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Dashboard</Text>
      </View>
      
      <View style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.cards}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Sales</Text>
            <Text style={styles.cardValue}>$0</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Orders</Text>
            <Text style={styles.cardValue}>0</Text>
          </View>
        </View>
      </View>
      <Pressable 
        style={styles.button}
        onPress={() => router.push('/Post')}
      >
        <Text style={styles.buttonText}>Create Post</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  cards: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default Dashboard