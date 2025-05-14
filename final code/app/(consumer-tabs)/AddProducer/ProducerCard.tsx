import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Producer = {
  id: string;
  username: string;
  description: string;
  status: string;
};

interface ProducerCardProps {
  producer: Producer;
  children?: React.ReactNode; // Add children prop
}

export const ProducerCard: React.FC<ProducerCardProps> = ({ producer, children }) => (
  <View style={styles.card}>
    <Text style={styles.producerUsername}>{producer.username}</Text>
    <Text style={styles.producerDescription}>{producer.description}</Text>
    <Text style={styles.connectionStatus}>Connection Status: {producer.status}</Text>
    {children} {/* Render children (e.g., FriendRequestButton) */}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  producerUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  producerDescription: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
  connectionStatus: {
    fontSize: 16,
    marginTop: 10,
    color: '#777',
  },
});