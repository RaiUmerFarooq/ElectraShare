import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Surface, Title, Paragraph } from 'react-native-paper';

export const PostCard = ({ post, onAccept, onReject }) => (
  <Surface style={styles.postCard} elevation={4}>
    <View style={styles.postHeader}>
      <Title style={styles.postTitle}>{post.title}</Title>
      <Paragraph style={styles.producerText}>By: {post.producer}</Paragraph>
    </View>
    <View style={styles.postContent}>
      <View style={styles.postDetails}>
        <Paragraph style={styles.detailText}>
          <Text style={styles.detailLabel}>Price: </Text>{post.price} PKR
        </Paragraph>
        <Paragraph style={styles.detailText}>
          <Text style={styles.detailLabel}>Capacity: </Text>{post.kilowatts} kW
        </Paragraph>
        <Paragraph style={styles.detailText}>
          <Text style={styles.detailLabel}>Available: </Text>{post.start_time} - {post.end_time}
        </Paragraph>
        <Paragraph style={styles.detailText}>
          <Text style={styles.detailLabel}>Posted: </Text>{new Date(post.created_at).toLocaleString()}
        </Paragraph>
      </View>
    </View>
    <View style={styles.postActions}>
      <Button mode="contained" onPress={() => onAccept(post)} style={styles.acceptButton}>
        Accept & Pay
      </Button>
      <Button mode="outlined" onPress={() => onReject(post)} color="#F44336" style={styles.rejectButton}>
        Reject
      </Button>
    </View>
  </Surface>
);

const styles = StyleSheet.create({
  postCard: { marginBottom: 20, padding: 15, borderRadius: 10, backgroundColor: '#ffffff' },
  postHeader: { marginBottom: 15 },
  postTitle: { fontSize: 18, fontWeight: 'bold' },
  producerText: { fontSize: 14, color: '#757575' },
  postContent: { marginBottom: 15 },
  postDetails: { padding: 10 },
  detailText: { fontSize: 14, color: '#555555', marginBottom: 5 },
  detailLabel: { fontWeight: 'bold' },
  postActions: { flexDirection: 'row', justifyContent: 'space-between' },
  acceptButton: { width: '48%' },
  rejectButton: { width: '48%' },
});