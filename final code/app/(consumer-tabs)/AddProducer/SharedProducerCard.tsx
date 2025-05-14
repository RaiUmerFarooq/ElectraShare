// SharedProducerCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Producer = {
  id: string;
  username: string;
  description: string;
  status: string;
};

export const SharedProducerCard: React.FC<{ producer: Producer }> = ({ producer }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.username}>{producer.username}</Text>
      <Text style={styles.description}>{producer.description}</Text>
      <Text style={styles.status}>Status: {producer.status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32', // Green for emphasis
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  status: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
});