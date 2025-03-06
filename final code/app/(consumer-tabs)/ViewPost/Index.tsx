import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ImageBackground, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  TextInput 
} from 'react-native';
import { 
  Button, 
  Chip, 
  Surface, 
  Title, 
  Paragraph 
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Checkout from '@/components/checkout';
import TransactionHistory from '@/components/TransactionHistory';
import ConCheck from '@/app/validations/conCheck';
import apiClient from '@/app/api-component/apiClient';

const { width } = Dimensions.get('window');

const ViewPost = () => {
  const [posts, setPosts] = useState([]);
  const [availablePosts, setAvailablePosts] = useState([]);
  const [rejectedPosts, setRejectedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
  });

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

  const validateCardDetails = () => {
    const { number, expiry, cvc } = cardDetails;
    if (!number || !expiry || !cvc) {
      Alert.alert('Validation Error', 'Please fill in all card details.');
      return false;
    }
    if (number.length < 16 || !/^\d+$/.test(number)) {
      Alert.alert('Validation Error', 'Please enter a valid 16-digit card number.');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      Alert.alert('Validation Error', 'Please enter expiry in MM/YY format (e.g., 12/25).');
      return false;
    }
    if (cvc.length < 3 || !/^\d+$/.test(cvc)) {
      Alert.alert('Validation Error', 'Please enter a valid 3-4 digit CVC.');
      return false;
    }
    return true;
  };

  const handleStripePayment = async () => {
    if (!validateCardDetails()) return;

    setPaymentLoading(true);
    try {
      const cardData = {
        number: cardDetails.number.replace(/\s/g, ''),
        exp_month: parseInt(cardDetails.expiry.split('/')[0], 10),
        exp_year: parseInt(cardDetails.expiry.split('/')[1], 10) + 2000,
        cvc: cardDetails.cvc,
      };

      const response = await apiClient.post('/payments/stripe/payment/', {
        amount: selectedPost.post.price,
        post_id: selectedPost.post.id,
      });

      if (!response.data.client_secret) {
        throw new Error('Payment intent creation failed');
      }

      // Simulate real payment flow by checking card details (mock for now)
      if (cardData.number === '4242424242424242') { // Test card for Stripe
        // Here, we’d normally confirm the payment with Stripe, but we’ll simulate success
        if (response.data.status === 'pending') {
          handleCheckoutComplete(selectedPost.post);
          Alert.alert('Success', 'Payment completed successfully for this post.');
        } else {
          throw new Error('Payment failed. Status: ' + response.data.status);
        }
      } else {
        throw new Error('Invalid card details for testing. Use test card 4242 4242 4242 4242.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
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

  const handleCardChange = (field, value) => {
    setCardDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const PaymentForm = ({ onSubmit, onCancel }) => (
    <Surface style={styles.paymentCard} elevation={4}>
      <Title style={styles.paymentTitle}>Enter Card Details</Title>
      <View style={styles.paymentForm}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardDetails.number}
          onChangeText={(value) => handleCardChange('number', value)}
          keyboardType="numeric"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
        />
        <Text style={styles.label}>Expiry Date (MM/YY)</Text>
        <TextInput
          style={styles.input}
          value={cardDetails.expiry}
          onChangeText={(value) => handleCardChange('expiry', value)}
          placeholder="12/25"
          maxLength={5}
        />
        <Text style={styles.label}>CVC</Text>
        <TextInput
          style={styles.input}
          value={cardDetails.cvc}
          onChangeText={(value) => handleCardChange('cvc', value)}
          keyboardType="numeric"
          placeholder="123"
          maxLength={4}
        />
        <View style={styles.paymentActions}>
          <Button
            mode="contained"
            onPress={onSubmit}
            loading={paymentLoading}
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
          {selectedPost ? (
            selectedPost.mode === 'payment' ? (
              <PaymentForm
                onSubmit={handleStripePayment}
                onCancel={() => setSelectedPost(null)}
              />
            ) : (
              <Checkout
                post={selectedPost.post}
                onCheckoutComplete={handleCheckoutComplete}
                onBack={handleBack}
              />
            )
          ) : transactionDetails ? (
            <TransactionHistory
              transaction={transactionDetails}
              onBack={() => setTransactionDetails(null)}
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

              {rejectedPosts.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Title style={styles.sectionTitle}>Rejected Posts</Title>
                  </View>
                  {rejectedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onAccept={handleAcceptPost}
                      onReject={() => {}}
                    />
                  ))}
                </>
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32', // Dark green for solar theme
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  chip: {
    backgroundColor: '#BBDEFB',
    borderRadius: 20,
  },
  postCard: {
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6, // Android shadow
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#388E3C', // Medium green for titles
  },
  producerText: {
    fontSize: 16,
    color: '#555',
  },
  postContent: {
    marginBottom: 15,
  },
  postDetails: {
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#388E3C',
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acceptButton: {
    flex: 0.7,
    backgroundColor: '#4CAF50', // Vibrant green for payment
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  rejectButton: {
    flex: 0.3,
    borderWidth: 2,
    borderColor: '#F44336', // Red for rejection
    borderRadius: 12,
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F', // Red for errors
    textAlign: 'center',
    padding: 20,
  },
  paymentCard: {
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6, // Android shadow
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
    textAlign: 'center',
  },
  paymentForm: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#388E3C',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payButton: {
    flex: 0.7,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  cancelButton: {
    flex: 0.3,
    borderWidth: 2,
    borderColor: '#F44336',
    borderRadius: 12,
    paddingVertical: 10,
  },
});

export default ViewPost;