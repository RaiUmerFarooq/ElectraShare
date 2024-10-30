import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView

const Dashboard = () => {
  const router = useRouter();

  return (
    <GestureHandlerRootView style={styles.container}> 
      
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
      <TouchableOpacity style={styles.button} onPress={() => router.push('/Post')}>
        <Text style={styles.buttonText}>Add Post</Text>
      </TouchableOpacity>

      
      <TouchableOpacity style={styles.button} onPress={() => router.push('/addNeighbour')}>
        <Text style={styles.buttonText}>Neighbours</Text>
      </TouchableOpacity>
        
    </GestureHandlerRootView>
  );
};

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
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    width: '80%', // Reduced width
    alignItems: 'center',
    alignSelf: 'center', // Centers the button horizontally
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Dashboard;
