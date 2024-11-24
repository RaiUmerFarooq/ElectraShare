import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthCheck from '@/app/validations/AuthCheck';
import apiClient from '@/app/api-component/apiClient';
const AddPost = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [kilowatts, setKilowatts] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handlePostSubmit = async() => {
    if (!title || !price || !kilowatts || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill in all fields');
      console.log('Error');
      return;
    }

    // Alert.alert(
    //   'Success',
    //   `Post submitted:\nTitle: ${title}\nPrice: ${price}\nKilowatts: ${kilowatts}\nAvailable from: ${startTime} to ${endTime}`
    // );
    const postData = {
      title,
      price,
      kilowatts,
      start_time: startTime,
      end_time: endTime,
    };
    const response = await apiClient.post("/post/",postData);
    if(response.status===201){
      console.log("data Entered successfully")
    }
    console.log(
      'Success',
      `Post submitted:\nTitle: ${title}\nPrice: ${price}\nKilowatts: ${kilowatts}\nAvailable from: ${startTime} to ${endTime}`
    );
    setTitle('');
    setPrice(0);
    setKilowatts(0);
    setStartTime('');
    setEndTime('');
  };

  const navigation = useNavigation(); // Hook to access navigation

  // Check for accessToken on mount
  useEffect(() => {
    const checkAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          // Redirect to login if token is missing
          navigation.navigate('(auth)/Signin/index'); 
        }
      } catch (error) {
        console.error('Error reading accessToken:', error);
        navigation.navigate('(auth)/Signin/index'); // Redirect in case of error
      }
    };

    checkAccessToken();
  }, [navigation]);

  return (
    <AuthCheck>
      <ImageBackground
        source={{ uri: 'https://st2.depositphotos.com/1000356/5730/i/450/depositphotos_57307849-stock-photo-green-leaves-background.jpg' }} // Replace with your image URL
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Add New Post</Text>

          {/* Basic Info Section */}
          <Text style={styles.sectionHeader}>1. Basic Information</Text>
          <Text style={styles.label}>Post Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter post title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Post Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter post price"
            value={price.toString()}
            onChangeText={(value) => setPrice(Number(value))}
            keyboardType="numeric"
          />

          {/* Selling Info Section */}
          <Text style={styles.sectionHeader}>2. Selling Information</Text>
          <Text style={styles.label}>Kilowatts for Selling</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter kilowatts for selling"
            value={kilowatts.toString()}
            onChangeText={(value) => setKilowatts(Number(value))}
            keyboardType="numeric"
          />

          {/* Time Range Section */}
          <Text style={styles.sectionHeader}>3. Time Availability</Text>
          <Text style={styles.label}>Start Time (HH:mm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter start time"
            value={startTime}
            onChangeText={setStartTime}
            keyboardType="numeric"
          />

          <Text style={styles.label}>End Time (HH:mm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter end time"
            value={endTime}
            onChangeText={setEndTime}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handlePostSubmit}>
            <Text style={styles.submitButtonText}>Submit Post</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </AuthCheck>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Ensures the image covers the entire screen
    justifyContent: 'center', // Centers content in the screen
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Transparent white background to allow the image to show through
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4682B4',
    marginBottom: 10,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F2F2F2',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddPost;
