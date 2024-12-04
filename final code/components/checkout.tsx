// components/Checkout.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper'; // Using Paper's Button for consistency

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
  onBack: () => void; // New prop for handling back navigation
};

const Checkout: React.FC<Props> = ({ post, onCheckoutComplete, onBack }) => {
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
      onCheckoutComplete(post);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="outlined"
          icon="arrow-left"
          onPress={onBack}
          style={styles.backButton}
        >
          Back
        </Button>
        <Text style={styles.title}>Checkout</Text>
      </View>

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
        <Button
          mode="contained"
          onPress={handleCheckout}
          style={styles.checkoutButton}
        >
          Complete Checkout
        </Button>
      )}

      {paymentStatus && <Text style={styles.statusText}>{`Payment Status: ${paymentStatus}`}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 50, // To offset the back button width and maintain center alignment
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
  checkoutButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
  },
});

export default Checkout;