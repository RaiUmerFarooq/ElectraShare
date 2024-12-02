// components/Checkout.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

type Post = {
  title: string;
  provider: string;
  price: number;
  kilowatts: number;
  start_time: string;
  end_time: string;
  location: string;
};

type Props = {
  post: Post;
  onCheckoutComplete: (post: Post) => void;
};

const Checkout: React.FC<Props> = ({ post, onCheckoutComplete }) => {
  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No post data available</Text>
      </View>
    );
  }

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStatus('Completed');
      onCheckoutComplete(post); // Trigger the checkout completion with post details
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <View style={styles.postDetails}>
        <Text style={styles.detailLabel}>Title: </Text>
        <Text>{post.title}</Text>

        <Text style={styles.detailLabel}>Provider: </Text>
        <Text>{post.provider}</Text>

        <Text style={styles.detailLabel}>Price: </Text>
        <Text>${post.price}</Text>

        <Text style={styles.detailLabel}>Capacity: </Text>
        <Text>{post.kilowatts} kW</Text>

        <Text style={styles.detailLabel}>Available: </Text>
        <Text>{post.start_time} - {post.end_time}</Text>

        <Text style={styles.detailLabel}>Location: </Text>
        <Text>{post.location}</Text>
      </View>

      {isProcessing ? (
        <Text style={styles.processingText}>Processing Payment...</Text>
      ) : (
        <Button title="Complete Checkout" onPress={handleCheckout} />
      )}

      {paymentStatus && <Text style={styles.statusText}>{`Payment Status: ${paymentStatus}`}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  postDetails: {
    marginBottom: 20,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginTop: 5,
  },
  processingText: {
    color: 'blue',
    textAlign: 'center',
    marginVertical: 10,
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default Checkout;
