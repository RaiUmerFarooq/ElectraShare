import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ImageBackground, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { 
  Button, 
  Chip, 
  Surface, 
  Title, 
  Paragraph 
} from 'react-native-paper';
import Checkout from '@/components/checkout';
import TransactionHistory from '@/components/TransactionHistory';
import ConCheck from '@/app/validations/conCheck';
import apiClient from '@/app/api-component/apiClient';
import { loadStripe } from '@stripe/stripe-js'; // Import Stripe.js
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js'; // Import hooks and CardElement from Stripe

const { width } = Dimensions.get('window');

// Separate PaymentForm component to isolate state and focus logic
const PaymentForm = React.memo(({ onSubmit, onCancel, paymentLoading }) => {
  console.log('PaymentForm rendered'); // Debug re-renders
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    await onSubmit(stripe, elements);
  };

  return (
    <Surface style={styles.paymentCard} elevation={4}>
      <Title style={styles.paymentTitle}>Enter Card Details</Title>
      <View style={styles.paymentForm}>
        <Text style={styles.label}>Card Number</Text>
        <CardElement
          style={{
            base: {
              fontSize: '16px',
              color: '#424770',
              letterSpacing: '0.025em',
              padding: '10px',
              backgroundColor: '#F5F5F5',
              borderRadius: '10px',
              borderWidth: '1px',
              borderColor: '#D4D4D4',
            },
          }}
        />
        <View style={styles.paymentActions}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={paymentLoading}
            disabled={paymentLoading}
            style={styles.payButton}
          >
            {paymentLoading ? 'Processing...' : 'Confirm Payment'}
          </Button>
          <Button
            mode="outlined"
            onPress={onCancel}
            color="#F44336"
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>
      </View>
    </Surface>
  );
});

const ViewPost = () => {
  const [posts, setPosts] = useState([]);
  const [availablePosts, setAvailablePosts] = useState([]);
  const [rejectedPosts, setRejectedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [stripePromise, setStripePromise] = useState(null); // Store Stripe instance

  // Initialize Stripe with your publishable key
  useEffect(() => {
    const initializeStripe = async () => {
      const stripe = await loadStripe('pk_test_51PsVavGFxGSFALoaoxetGEh95HNTP8pusS8VzRS2bQ8GDh5Pa3yXhsqXAgZVSoumrIUXwuOFDJ56KLMPwvz3GOTQ00RbxD5gXM'); // Replace with your publishable key
      setStripePromise(stripe);
    };
    initializeStripe();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get('/show-producer-posts');
        setPosts(response.data);
        setAvailablePosts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Failed to fetch posts. Please try again later.');
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleAcceptPost = (post) => {
    setSelectedPost({ post, mode: 'payment' });
  };

  const handleRejectPost = (post) => {
    setRejectedPosts((prev) => [...prev, post]);
    setAvailablePosts((prev) => prev.filter((p) => p.id !== post.id));
  };

  const handleStripePayment = async (stripe, elements) => {
    console.log('handleStripePayment triggered');

    if (!stripe || !elements) {
      Alert.alert('Error', 'Stripe is not initialized. Please try again.');
      return;
    }

    setPaymentLoading(true);
    console.log('Payment loading set to true');

    try {
      const card = elements.getElement(CardElement);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('Payment Method Created:', paymentMethod);

      // Send payment method ID to backend to confirm Payment Intent
      const response = await apiClient.post('/payments/stripe/payment/', {
        amount: selectedPost.post.price,
        post_id: selectedPost.post.id,
        payment_method_id: paymentMethod.id,
      });

      console.log('API Response:', response.data);

      if (!response.data.client_secret) {
        throw new Error('Payment intent creation failed');
      }

      // Confirm the Payment Intent (optional, depending on backend logic)
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        response.data.client_secret
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        handleCheckoutComplete(selectedPost.post);
        Alert.alert('Success', 'Payment completed successfully for this post.');
      } else {
        throw new Error(`Payment failed. Status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
      console.log('Payment loading set to false');
    }
  };

  const handleCheckoutComplete = (post) => {
    const transactionDetails = {
      id: `TXN-${Math.floor(Math.random() * 1000000)}`,
      postId: post.id,
      title: post.title,
      amount: post.price,
      date: new Date().toLocaleString(),
      paymentMethod: 'Credit Card',
      status: 'Completed',
    };
    setTransactionDetails(transactionDetails);
    setAvailablePosts((prev) => prev.filter((p) => p.id !== post.id));
    setSelectedPost(null);
  };

  const handleBack = () => {
    setSelectedPost(null);
  };

  const PostCard = ({ post, onAccept, onReject }) => (
    <Surface style={styles.postCard} elevation={4}>
      <View style={styles.postHeader}>
        <Title style={styles.postTitle}>{post.title}</Title>
        <Paragraph style={styles.producerText}>By: {post.producer}</Paragraph>
      </View>
      <View style={styles.postContent}>
        <View style={styles.postDetails}>
          <Paragraph style={styles.detailText}>
            <Text style={styles.detailLabel}>Price: </Text>
            {post.price} PKR
          </Paragraph>
          <Paragraph style={styles.detailText}>
            <Text style={styles.detailLabel}>Capacity: </Text>
            {post.kilowatts} kW
          </Paragraph>
          <Paragraph style={styles.detailText}>
            <Text style={styles.detailLabel}>Available: </Text>
            {post.start_time} - {post.end_time}
          </Paragraph>
          <Paragraph style={styles.detailText}>
            <Text style={styles.detailLabel}>Posted: </Text>
            {new Date(post.created_at).toLocaleString()}
          </Paragraph>
        </View>
      </View>
      <View style={styles.postActions}>
        <Button
          mode="contained"
          onPress={() => onAccept(post)}
          style={styles.acceptButton}
        >
          Accept & Pay
        </Button>
        <Button
          mode="outlined"
          onPress={() => onReject(post)}
          color="#F44336"
          style={styles.rejectButton}
        >
          Reject
        </Button>
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ConCheck>
      <ImageBackground
        source={{ uri: 'https://cdn.ecommercedns.uk/files/5/235315/5/12792415/solar-power.jpg' }}
        style={styles.background}
        blurRadius={8}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {selectedPost && selectedPost.mode === 'payment' ? (
            <Elements stripe={stripePromise}>
              <PaymentForm
                onSubmit={handleStripePayment}
                onCancel={handleBack}
                paymentLoading={paymentLoading}
              />
            </Elements>
          ) : transactionDetails ? (
            <TransactionHistory
              transaction={transactionDetails}
              onBack={() => setTransactionDetails(null)}
            />
          ) : selectedPost ? (
            <Checkout
              post={selectedPost.post}
              onCheckoutComplete={handleCheckoutComplete}
              onBack={handleBack}
            />
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Title style={styles.sectionTitle}>Available Solar Posts</Title>
                <Chip icon="information" style={styles.chip}>
                  {availablePosts.length} Posts Available
                </Chip>
              </View>
              {availablePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onAccept={handleAcceptPost}
                  onReject={handleRejectPost}
                />
              ))}
              <View style={styles.sectionHeader}>
                <Title style={styles.sectionTitle}>Rejected Posts</Title>
                <Chip icon="cancel" style={styles.chip}>
                  {rejectedPosts.length} Posts Rejected
                </Chip>
              </View>
              {rejectedPosts.length > 0 ? (
                rejectedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onAccept={handleAcceptPost}
                    onReject={handleRejectPost}
                  />
                ))
              ) : (
                <Text>No rejected posts.</Text>
              )}
            </>
          )}
        </ScrollView>
      </ImageBackground>
    </ConCheck>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  paymentCard: {
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  paymentForm: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333333',
  },
  paymentActions: {
    marginTop: 20,
  },
  payButton: {
    marginVertical: 10,
  },
  cancelButton: {
    marginVertical: 10,
  },
  postCard: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  postHeader: {
    marginBottom: 15,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  producerText: {
    fontSize: 14,
    color: '#757575',
  },
  postContent: {
    marginBottom: 15,
  },
  postDetails: {
    padding: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    width: '48%',
  },
  rejectButton: {
    width: '48%',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chip: {
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
});

export default ViewPost;