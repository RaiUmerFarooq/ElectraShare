import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground,
  Animated,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(0));

  const navigation = useNavigation();

  const handlePostSubmit = async () => {
    if (!title.trim() || !price || !kilowatts || !startTime.trim() || !endTime.trim()) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    const numericPrice = Number(price);
    const numericKilowatts = Number(kilowatts);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      showMessage('Please enter a valid price', 'error');
      return;
    }

    if (isNaN(numericKilowatts) || numericKilowatts <= 0) {
      showMessage('Please enter valid kilowatts', 'error');
      return;
    }

    setIsLoading(true);
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
        showMessage('Post created successfully', 'success');
        setTitle('');
        setPrice('');
        setKilowatts('');
        setStartTime('');
        setEndTime('');
      } else {
        showMessage('Failed to create the post', 'error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showMessage('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          setMessage(null);
          setMessageType(null);
        });
      }, 3000);
    });
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
        <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']} style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>Add New Post</Text>

            {/* Post Title */}
            <Text style={styles.label}>Post Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter post title"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />

            {/* Price */}
            <Text style={styles.label}>Price (Numeric)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price"
              placeholderTextColor="#999"
              value={price}
              onChangeText={(value) => setPrice(value.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />

            {/* Kilowatts */}
            <Text style={styles.label}>Kilowatts Available (Numeric)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter kilowatts available"
              placeholderTextColor="#999"
              value={kilowatts}
              onChangeText={(value) => setKilowatts(value.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />

            {/* Start Time */}
            <Text style={styles.label}>Start Time (HH:mm)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter start time"
              placeholderTextColor="#999"
              value={startTime}
              onChangeText={setStartTime}
            />

            {/* End Time */}
            <Text style={styles.label}>End Time (HH:mm)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter end time"
              placeholderTextColor="#999"
              value={endTime}
              onChangeText={setEndTime}
            />

            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handlePostSubmit}
              disabled={isLoading}
            >
              <LinearGradient 
                colors={['#11998e', '#38ef7d']} 
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Post</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Popup Message */}
          {message && (
            <Animated.View 
              style={[
                styles.popup,
                { 
                  transform: [{ scale: scaleAnim }],
                  backgroundColor: messageType === 'success' 
                    ? 'rgba(0, 255, 0, 0.9)' 
                    : 'rgba(255, 0, 0, 0.9)',
                }
              ]}
            >
              <Text style={styles.popupText}>
                {message}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  Animated.spring(scaleAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                  }).start(() => {
                    setMessage(null);
                    setMessageType(null);
                  });
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </LinearGradient>
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
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: '#fff',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  popup: {
    position: 'absolute',
    width: '80%',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  popupText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPost;