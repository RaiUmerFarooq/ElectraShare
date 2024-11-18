import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SignIn = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const onSubmit = async () => {
    // Reset errors
    setErrors({});
  
    // Validation
    const newErrors: { username?: string; password?: string } = {};
    if (!username) {
      newErrors.username = 'User-Name is required';
    } 
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop execution if there are errors
    }
  
    // Make an Axios POST request to the sign-in API with JSON content
    const response = await axios.post('http://localhost:8000/api/login/', {
      username,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json', // Explicitly set Content-Type to application/json
      },
    }).catch((error) => error); // Catch the error here
    if (response.status === 200 && response.data.access) {
      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      // Save the access token and refresh token in AsyncStorage
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      console.log('Access token saved:', accessToken);
    }
    // Check for a response
    if (response && response.status) {
      if (response.status === 200) {
        // Handle successful sign-in
        Alert.alert('Sign In Successful', 'You have successfully signed in.');
        // Navigate to Dashboard
        navigation.navigate('(tabs)'); // Use the correct path
      } else if (response.status === 400) {
        // Specific handling for 400 Bad Request
        Alert.alert('Sign In Failed', 'Invalid User-Name or Password. Please try again.');
      } else {
        // Handle other status codes
        Alert.alert('Sign In Failed', response.data.message || 'An error occurred. Please try again.');
      }
    } else {
      // Handle the case where no response is received
      Alert.alert('Sign In Failed', 'No response from the server. Please try again later.');
    }
  
    // Reset form fields after submission
    setUsername('');
    setPassword('');
  };
  

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
   
    <GestureHandlerRootView style={styles.keyboardAvoiding}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <Text style={styles.title}>Sign In</Text>

        {/* User-Name Field */}
        <TextInput
          style={styles.input}
          placeholder="Enter User-Name"
          value={username}
          onChangeText={setUsername}
          keyboardType="default"
          autoCapitalize="none"
        />
        {/* {errors.username && <Text style={styles.error}>{errors.username}12</Text>} Show specific error message */}

        {/* Password Field */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="grey" />
          </TouchableOpacity>
        </View>
        {/* {errors.password && <Text style={styles.error}>{errors.password}</Text>} Show specific error message */}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>Sign In</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
   
  );
};

// Your styles here...
const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignIn;
