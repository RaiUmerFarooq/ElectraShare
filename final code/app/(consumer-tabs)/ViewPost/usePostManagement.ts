import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/app/api-component/apiClient';
import { loadStripe } from '@stripe/stripe-js';

export const usePostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [availablePosts, setAvailablePosts] = useState([]);
  const [rejectedPosts, setRejectedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const initializeStripe = async () => {
      const stripe = await loadStripe('pk_test_51PsVavGFxGSFALoaoxetGEh95HNTP8pusS8VzRS2bQ8GDh5Pa3yXhsqXAgZVSoumrIUXwuOFDJ56KLMPwvz3GOTQ00RbxD5gXM');
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
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Failed to fetch posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleAcceptPost = useCallback((post) => {
    setSelectedPost({ post, mode: 'payment' });
  }, []);

  const handleRejectPost = useCallback((post) => {
    setRejectedPosts((prev) => [...prev, post]);
    setAvailablePosts((prev) => prev.filter((p) => p.id !== post.id));
  }, []);

  const handleCheckoutComplete = useCallback((post) => {
    const transaction = {
      id: `TXN-${Math.floor(Math.random() * 1000000)}`,
      postId: post.id,
      title: post.title,
      amount: post.price,
      date: new Date().toLocaleString(),
      paymentMethod: 'Credit Card',
      status: 'Completed',
    };
    setTransactionDetails(transaction);
    setAvailablePosts((prev) => prev.filter((p) => p.id !== post.id));
    setSelectedPost(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPost(null);
    setTransactionDetails(null);
  }, []);

  return {
    posts,
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
  };
};