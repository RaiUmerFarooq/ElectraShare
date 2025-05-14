import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as yup from 'yup';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';

const loginSchema = yup.object().shape({
  username: yup.string().required('User-Name is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters long'),
});

const SignIn = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    try {
      setLoading(true);
      // Validate inputs
      await loginSchema.validate({ username, password }, { abortEarly: false });

      // If validation passes, send request
      const response = await axios.post('http://localhost:8000/api/login/', { username, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
console.log(response.data);
      if (response.status === 200 && response.data.access) {
        // Store tokens and session expiry
        const { access: accessToken, refresh: refreshToken, status } = response.data;
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 2); // 2-day expiry

        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('sessionExpiry', expiration.toISOString());

        Alert.alert('Sign In Successful', 'You have successfully signed in.');
        if(status=="producer"){

          navigation.navigate('(tabs)');
        }
        else{
          navigation.navigate('(consumer-tabs)');
        }
      } else {
        Alert.alert('Sign In Failed', 'Invalid User-Name or Password.');
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: 'https://img.freepik.com/premium-vector/drawing-house-with-solar-panels-top_987686-21891.jpg' }}
        style={styles.backgroundImage}
      />

      <View style={styles.content}>
        <Text style={styles.title}>ElectraShare</Text>

        {/* Avatar Image */}
        <Image
          source={{ uri: 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg' }}
          style={styles.avatar}
        />

        {/* User-Name Field */}
        <TextInput
          style={styles.input}
          placeholder="User-Name"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

        {/* Password Field */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Link to Signup Screen */}
        <TouchableOpacity
          onPress={() => navigation.navigate('(auth)/Signup/index')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#2E7D32',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#2E7D32',
    fontSize: 16,
  },
});

export default SignIn;
