import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PostItemProps {
  post: {
    id: number;
    title: string;
    price: number;
    kilowatts: number;
    start_time: string;
    end_time: string;
    created_at: string;
    producer: string;
    paid: boolean;
  };
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.producer}>Producer: {post.producer}</Text>
      <Text style={styles.detail}>Price: ${post.price.toFixed(2)}</Text>
      <Text style={styles.detail}>Kilowatts: {post.kilowatts} kW</Text>
      <Text style={styles.detail}>Time: {post.start_time} - {post.end_time}</Text>
      <Text style={styles.detail}>Created: {new Date(post.created_at).toLocaleDateString()}</Text>
      <Text style={[styles.detail, styles.paidStatus, { color: post.paid ? '#2E7D32' : '#D32F2F' }]}>
        Status: {post.paid ? 'Paid' : 'Not Paid'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  producer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 5,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  paidStatus: {
    fontWeight: 'bold',
  },
});

export default PostItem;