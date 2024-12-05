import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ImageBackground, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AuthCheck from '@/app/validations/AuthCheck';
import apiClient from '@/app/api-component/apiClient';

const AddPost = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [kilowatts, setKilowatts] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useNavigation();

  // Validation functions
  const validateTime = (time: string) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
  };

  const handlePostSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a post title');
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return;
    }

    if (!kilowatts || isNaN(Number(kilowatts)) || Number(kilowatts) <= 0) {
      Alert.alert('Validation Error', 'Please enter valid kilowatts');
      return;
    }

    if (!validateTime(startTime)) {
      Alert.alert('Validation Error', 'Please enter a valid start time (HH:mm)');
      return;
    }

    if (!validateTime(endTime)) {
      Alert.alert('Validation Error', 'Please enter a valid end time (HH:mm)');
      return;
    }

    const [startHours, startMins] = startTime.split(':').map(Number);
    const [endHours, endMins] = endTime.split(':').map(Number);
    
    if (endHours < startHours || (endHours === startHours && endMins <= startMins)) {
      Alert.alert('Validation Error', 'End time must be after start time');
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        title: title.trim(),
        price: Number(price),
        kilowatts: Number(kilowatts),
        start_time: startTime,
        end_time: endTime,
      };

      const response = await apiClient.post("/post/", postData);
      
      if (response.status === 201) {
        Alert.alert('Success', 'Post submitted successfully');
        setTitle('');
        setPrice('');
        setKilowatts('');
        setStartTime('');
        setEndTime('');
      } else {
        Alert.alert('Error', 'Failed to submit post');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
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
        blurRadius={3}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <Text style={styles.title}>Create Energy Listing</Text>

              <View style={styles.inputGroup}>
                <Ionicons name="text" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Post Title"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="cash" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Price per Unit"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="flash" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Kilowatts Available"
                  value={kilowatts}
                  onChangeText={setKilowatts}
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.timeContainer}>
                <View style={styles.timeInputGroup}>
                  <Ionicons name="time" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.timeInput}
                    placeholder="Start Time"
                    value={startTime}
                    onChangeText={setStartTime}
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                    maxLength={5}
                  />
                </View>
                <View style={styles.timeInputGroup}>
                  <Ionicons name="time-outline" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.timeInput}
                    placeholder="End Time"
                    value={endTime}
                    onChangeText={setEndTime}
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                    maxLength={5}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  isSubmitting && styles.submitButtonDisabled
                ]}
                onPress={handlePostSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="white" style={styles.submitIcon} />
                    <Text style={styles.submitButtonText}>Submit Listing</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </AuthCheck>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 25,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
    color: '#7f8c8d',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2c3e50',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    paddingHorizontal: 15,
    width: '48%',
  },
  timeInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2c3e50',
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitIcon: {
    marginRight: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AddPost;
