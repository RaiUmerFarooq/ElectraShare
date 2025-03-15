import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';
import { Button, Chip, Surface, Title } from 'react-native-paper';
import { Elements } from '@stripe/react-stripe-js';
import ConCheck from '@/app/validations/conCheck';
import Checkout from '@/components/checkout';
import TransactionHistory from '@/components/TransactionHistory';
import { usePostManagement } from './usePostManagement';
import { PaymentForm } from './PaymentForm'; 
import { PostCard } from './PostCard'; 

const ViewPost = () => {
  const {
    availablePosts,
    rejectedPosts,
    selectedPost,
    transactionDetails,
    loading,
    error,
    paymentLoading,
    setPaymentLoading,
    stripePromise,
    handleAcceptPost,
    handleRejectPost,
    handleCheckoutComplete,
    handleBack,
  } = usePostManagement();

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
                selectedPost={selectedPost.post}
                onCheckoutComplete={handleCheckoutComplete}
                onCancel={handleBack}
                paymentLoading={paymentLoading}
                setPaymentLoading={setPaymentLoading}
              />
            </Elements>
          ) : transactionDetails ? (
            <TransactionHistory transaction={transactionDetails} onBack={handleBack} />
          ) : selectedPost ? (
            <Checkout post={selectedPost.post} onCheckoutComplete={handleCheckoutComplete} onBack={handleBack} />
          ) : (
            <>
              <Section title="Available Solar Posts" count={availablePosts.length} icon="information">
                {availablePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onAccept={handleAcceptPost}
                    onReject={handleRejectPost}
                  />
                ))}
              </Section>
              <Section title="Rejected Posts" count={rejectedPosts.length} icon="cancel">
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
              </Section>
            </>
          )}
        </ScrollView>
      </ImageBackground>
    </ConCheck>
  );
};

// New Section component for reusable section headers
const Section = ({ title, count, icon, children }) => (
  <>
    <View style={styles.sectionHeader}>
      <Title style={styles.sectionTitle}>{title}</Title>
      <Chip icon={icon} style={styles.chip}>{count} Posts</Chip>
    </View>
    {children}
  </>
);

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', paddingTop: 40 },
  container: { flexGrow: 1, padding: 20, justifyContent: 'flex-start' },
  sectionHeader: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  chip: { marginVertical: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 18 },
});

export default ViewPost;