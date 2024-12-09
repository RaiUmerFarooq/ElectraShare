import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ImageBackground 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthCheck from '@/app/validations/AuthCheck';
import apiClient from '@/app/api-component/apiClient';

const AddPost = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [kilowatts, setKilowatts] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const navigation = useNavigation();

  const handlePostSubmit = async () => {
    if (!title.trim() || !price || !kilowatts || !startTime.trim() || !endTime.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    const numericPrice = Number(price);
    const numericKilowatts = Number(kilowatts);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return;
    }

    if (isNaN(numericKilowatts) || numericKilowatts <= 0) {
      Alert.alert('Validation Error', 'Please enter valid kilowatts');
      return;
    }

    try {
      const postData = {
        title: title.trim(),
        price: numericPrice,
        kilowatts: numericKilowatts,
        start_time: startTime.trim(),
        end_time: endTime.trim(),
      };

      const response = await apiClient.post('/post/', postData);

      if (response.status === 201) {
        Alert.alert('Success', 'Post created successfully');
        setTitle('');
        setPrice('');
        setKilowatts('');
        setStartTime('');
        setEndTime('');
      } else {
        Alert.alert('Error', 'Failed to create the post');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'An unexpected error occurred while creating the post');
    }
  };

  useEffect(() => {
    const checkAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          navigation.navigate('(auth)/Signin/index');
        }
      } catch (error) {
        console.error('Error reading accessToken:', error);
        navigation.navigate('(auth)/Signin/index');
      }
    };

    checkAccessToken();
  }, [navigation]);

  return (
    <AuthCheck>
      <ImageBackground
        source={{ uri: 'https://st2.depositphotos.com/1000356/5730/i/450/depositphotos_57307849-stock-photo-green-leaves-background.jpg' }}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Add New Post</Text>

          {/* Post Title */}
          <Text style={styles.label}>Post Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter post title"
            value={title}
            onChangeText={setTitle}
          />

          {/* Price */}
          <Text style={styles.label}>Price (Numeric)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            value={price}
            onChangeText={(value) => setPrice(value.replace(/[^0-9]/g, ''))} // Numeric-only input
            keyboardType="numeric"
          />

          {/* Kilowatts */}
          <Text style={styles.label}>Kilowatts Available (Numeric)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter kilowatts available"
            value={kilowatts}
            onChangeText={(value) => setKilowatts(value.replace(/[^0-9]/g, ''))} // Numeric-only input
            keyboardType="numeric"
          />

          {/* Start Time */}
          <Text style={styles.label}>Start Time (HH:mm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter start time"
            value={startTime}
            onChangeText={setStartTime}
          />

          {/* End Time */}
          <Text style={styles.label}>End Time (HH:mm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter end time"
            value={endTime}
            onChangeText={setEndTime}
          />

          {/* Submit Button */}
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
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
