import React, { useState, useEffect } from 'react';  
import {  
  View,  
  Text,  
  StyleSheet,  
  Dimensions,  
  ImageBackground,  
  ScrollView  
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
    setSelectedPost(post);  
  };  

  const handleRejectPost = (post) => {  
    setRejectedPosts((prev) => [...prev, post]);  
    setAvailablePosts((prev) => prev.filter((p) => p.id !== post.id));  
  };  

  const handleCheckoutComplete = (post) => {  
    const transactionDetails = {  
      id: `TXN-${Math.floor(Math.random() * 1000000)}`,  
      postId: post.id,  
      title: post.title,  
      amount: post.price,  
      date: new Date().toLocaleString(),  
      paymentMethod: 'Credit Card',  
      status: 'Completed'  
    };  
    setTransactionDetails(transactionDetails);  
    setAvailablePosts((prev) => prev.filter((p) => p.id !== post.id));  
    setSelectedPost(null);  
  };  

  const handleBack = () => {  
    setSelectedPost(null);  
  };  

  const renderRatingStars = (rating) => {  
    return [...Array(5)].map((_, index) => (  
      <Icon  
        key={index}  
        name={index < Math.floor(rating) ? 'star' : 'star-outline'}  
        color="#FFD700"  
        size={16}  
      />  
    ));  
  };  

  const PostCard = ({ post, onAccept, onReject }) => (  
    <Surface style={styles.postCard} elevation={2}>  
      <View style={styles.postHeader}>  
        <Title>{post.title}</Title>  
        <Paragraph>By: {post.producer}</Paragraph>  
      </View>  

      <View style={styles.postContent}>  
        <View style={styles.postDetails}>  
          <Paragraph>  
            <Text style={styles.detailLabel}>Price: </Text>  
            ${post.price}  
          </Paragraph>  
          <Paragraph>  
            <Text style={styles.detailLabel}>Capacity: </Text>  
            {post.kilowatts} kW  
          </Paragraph>  
          <Paragraph>  
            <Text style={styles.detailLabel}>Available: </Text>  
            {post.start_time} - {post.end_time}  
          </Paragraph>  
          <Paragraph>  
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
          Accept & Checkout  
        </Button>  
        <Button  
          mode="outlined"  
          onPress={() => onReject(post)}  
          color="#F44336"  
        >  
          Reject  
        </Button>  
      </View>  
    </Surface>  
  );  

  if (loading) {  
    return (  
      <View style={styles.loadingContainer}>  
        <Text>Loading posts...</Text>  
      </View>  
    );  
  }  

  if (error) {  
    return (  
      <View style={styles.errorContainer}>  
        <Text>{error}</Text>  
      </View>  
    );  
  }  

  return (  
    <ConCheck>  
      <ImageBackground  
        source={{ uri: 'https://cdn.ecommercedns.uk/files/5/235315/5/12792415/solar-power.jpg' }}  
        style={styles.background}  
        blurRadius={5}  
      >  
        <ScrollView contentContainerStyle={styles.container}>  
          {selectedPost ? (  
            <Checkout  
              post={selectedPost}  
              onCheckoutComplete={handleCheckoutComplete}  
              onBack={handleBack}  
            />  
          ) : transactionDetails ? (  
            <TransactionHistory  
              transaction={transactionDetails}  
              onBack={() => setTransactionDetails(null)}  
            />  
          ) : (  
            <>  
              <View style={styles.sectionHeader}>  
                <Title style={styles.sectionTitle}>Available Solar Posts</Title>  
                <Chip icon="information" onPress={() => {}}>  
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
   backgroundColor: 'rgba(0,0,0,0.1)',  
  },  
  container: {  
   padding: 15,  
  },  
  sectionHeader: {  
   flexDirection: 'row',  
   justifyContent: 'space-between',  
   alignItems: 'center',  
   marginBottom: 15,  
  },  
  sectionTitle: {  
   fontSize: 22,  
   fontWeight: 'bold',  
   color: '#333',  
  },  
  postCard: {  
   marginBottom: 15,  
   borderRadius: 10,  
   padding: 15,  
  },  
  postHeader: {  
   flexDirection: 'row',  
   justifyContent: 'space-between',  
   alignItems: 'center',  
   marginBottom: 10,  
  },  
  ratingContainer: {  
   flexDirection: 'row',  
  },  
  postContent: {  
   marginBottom: 15,  
  },  
  postDetails: {  
   marginBottom: 10,  
  },  
  detailLabel: {  
   fontWeight: 'bold',  
  },  
  postActions: {  
   flexDirection: 'row',  
   justifyContent: 'space-between',  
  },  
  acceptButton: {  
   flex: 0.7,  
   backgroundColor: '#4CAF50',  
  },  
});  
  

export default ViewPost;
