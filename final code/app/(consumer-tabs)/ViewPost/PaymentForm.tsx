import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Surface, Title } from 'react-native-paper';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiClient from '@/app/api-component/apiClient';

export const PaymentForm = React.memo(({ selectedPost, onCheckoutComplete, onCancel, paymentLoading, setPaymentLoading }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      Alert.alert('Error', 'Stripe is not initialized.');
      return;
    }

    setPaymentLoading(true);
    try {
      const card = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card,
      });

      if (error) throw new Error(error.message);

      const response = await apiClient.post('/payments/stripe/payment/', {
        amount: selectedPost.price,
        post_id: selectedPost.id,
        payment_method_id: paymentMethod.id,
      });

      if (!response.data.client_secret) throw new Error('Payment intent creation failed');

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(response.data.client_secret);
      if (confirmError) throw new Error(confirmError.message);

      if (paymentIntent.status === 'succeeded') {
        onCheckoutComplete(selectedPost);
        Alert.alert('Success', 'Payment completed successfully.');
      } else {
        throw new Error(`Payment failed. Status: ${paymentIntent.status}`);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Payment failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <Surface style={styles.paymentCard} elevation={4}>
      <Title style={styles.paymentTitle}>Enter Card Details</Title>
      <View style={styles.paymentForm}>
        <Text style={styles.label}>Card Number</Text>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                padding: '10px',
                backgroundColor: '#F5F5F5',
                borderRadius: '10px',
              },
            },
          }}
        />
        <View style={styles.paymentActions}>
          <Button mode="contained" onPress={handleSubmit} loading={paymentLoading} disabled={paymentLoading} style={styles.payButton}>
            {paymentLoading ? 'Processing...' : 'Confirm Payment'}
          </Button>
          <Button mode="outlined" onPress={onCancel} color="#F44336" style={styles.cancelButton}>
            Cancel
          </Button>
        </View>
      </View>
    </Surface>
  );
});

const styles = StyleSheet.create({
  paymentCard: { padding: 20, marginVertical: 10, borderRadius: 10, backgroundColor: '#ffffff' },
  paymentTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  paymentForm: { marginBottom: 20 },
  label: { fontSize: 14, color: '#333333' },
  paymentActions: { marginTop: 20 },
  payButton: { marginVertical: 10 },
  cancelButton: { marginVertical: 10 },
});