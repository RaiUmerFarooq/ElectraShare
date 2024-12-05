import React, { useState } from 'react';  
import {  
  View,  
  Text,  
  StyleSheet,  
  Dimensions,  
  ImageBackground,  
  ScrollView  
} from 'react-native';  
import {  
  Card,  
  Button,  
  Chip,  
  Surface,  
  Title,  
  Paragraph  
} from 'react-native-paper';  
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';  
import Checkout from '@/components/checkout'; // Import Checkout  
import TransactionHistory from '@/components/TransactionHistory'; // Import TransactionHistory  
import ConCheck from '@/app/validations/conCheck';
// Mock data for solar energy posts  
const DUMMY_POSTS = [  
  {  
   id: 1,  
   title: 'Urban Solar Solution',  
   provider: 'Green Energy Co.',  
   price: 100,  
   kilowatts: 10,  
   start_time: '10:00 AM',  
   end_time: '2:00 PM',  
   description: 'Sustainable urban solar energy package for residential areas.',  
   location: 'Downtown Area',  
   rating: 4.5  
  },  
  {  
   id: 2,  
   title: 'Community Solar Network',  
   provider: 'SunPower Solutions',  
   price: 150,  
   kilowatts: 15,  
   start_time: '1:00 PM',  
   end_time: '5:00 PM',  
   description: 'Community-driven solar energy sharing program.',  
   location: 'Suburban District',  
   rating: 4.8  
  },  
  {  
   id: 3,  
   title: 'Rural Renewable Package',  
   provider: 'EcoGrid Innovations',  
   price: 120,  
   kilowatts: 12,  
   start_time: '6:00 AM',  
   end_time: '10:00 AM',  
   description: 'Comprehensive solar energy solution for rural communities.',  
   location: 'Rural Outskirts',  
   rating: 4.2  
  }  
];  
  
const { width } = Dimensions.get('window');  
  
const ViewPost = () => {  
  const [posts, setPosts] = useState(DUMMY_POSTS);  
  const [availablePosts, setAvailablePosts] = useState(DUMMY_POSTS);  
  const [rejectedPosts, setRejectedPosts] = useState([]);  
  const [selectedPost, setSelectedPost] = useState(null); // Store selected post for checkout  
  const [transactionDetails, setTransactionDetails] = useState(null); // Store transaction details after payment  
  
  const handleAcceptPost = (post) => {  
   setSelectedPost(post); // Set the selected post for checkout  
  };  
  
  const handleRejectPost = (post) => {  
   setRejectedPosts((prev) => [...prev, post]);  
   setAvailablePosts((prev) => prev.filter((p) => p.id !== post.id));  
  };  
  
  const handleCheckoutComplete = (post) => {  
   // Simulate transaction details after successful payment  
   const transactionDetails = {  
    id: `TXN-${Math.floor(Math.random() * 1000000)}`,  
    postId: post.id,  
    title: post.title,  
    amount: post.price,  
    date: new Date().toLocaleString(),  
    paymentMethod: 'Credit Card', // Hardcoded payment method for now  
    status: 'Completed'  
   };  
   setTransactionDetails(transactionDetails); // Store transaction details  
   setAvailablePosts((prev) => prev.filter((p) => p.id !== post.id)); // Remove post after purchase  
   setSelectedPost(null); // Reset selected post  
  };  
  
  const handleBack = () => {  
   setSelectedPost(null); // Go back to posts list  
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
      <View style={styles.ratingContainer}>  
       {renderRatingStars(post.rating)}  
      </View>  
    </View>  
      
    <View style={styles.postContent}>  
      <View style={styles.postDetails}>  
       <Paragraph>  
        <Text style={styles.detailLabel}>Provider: </Text>  
        {post.provider}  
       </Paragraph>  
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
        <Text style={styles.detailLabel}>Location: </Text>  
        {post.location}  
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
  
  return (  
    <ConCheck>
   <ImageBackground  
    source={{ uri: 'https://cdn.ecommercedns.uk/files/5/235315/5/12792415/solar-power.jpg' }}  
    style={styles.background}  
    blurRadius={5}  
   >  
    <ScrollView contentContainerStyle={styles.container}>  
      {selectedPost ? (  
       // Show Checkout if a post is selected  
       <Checkout  
        post={selectedPost}  
        onCheckoutComplete={handleCheckoutComplete}  
        onBack={handleBack} // Go back to posts list  
       />  
      ) : transactionDetails ? (  
       // Show TransactionHistory if transaction is completed  
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
