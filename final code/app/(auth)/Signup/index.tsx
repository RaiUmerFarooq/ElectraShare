import React, { useState,useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RadioButtonGroup from '../components/RadioButtonGroup'; // Custom radio button component
import axios from 'axios';
import { useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/app/api-component/apiClient';

interface FormData {
  email: string;
  username: string;
  contactNo: string;
  password: string;
  reenter: string;
  userRole: string;
}

const SignUp = () => {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkSessionExpiry = async () => {
      const sessionExpiry = await AsyncStorage.getItem('sessionExpiry');
      if (sessionExpiry) {
        const expiryDate = new Date(sessionExpiry);
        if (new Date() > expiryDate) {
          await AsyncStorage.clear();
          Alert.alert('Session Expired', 'Please log in again.');
          navigation.navigate('(auth)/Signin/index');
        }
      }
    };
    checkSessionExpiry();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.reenter) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const response = await apiClient.post('/register/', {
        username: data.username,
        email: data.email,
        contactNo: data.contactNo,
        userRole: data.userRole,
        password: data.password,
      });

      if (response.status === 201) {
        Alert.alert('Success', 'User registered successfully!');

        const { access, refresh } = response.data;
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 2);

        await AsyncStorage.setItem('accessToken', access);
        await AsyncStorage.setItem('refreshToken', refresh);
        await AsyncStorage.setItem('sessionExpiry', expiration.toISOString());

        setValue('email', '');
        setValue('username', '');
        setValue('contactNo', '');
        setValue('password', '');
        setValue('reenter', '');
        setValue('userRole', 'producer');

        navigation.navigate('(auth)/Signin/index');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'An error occurred during registration. Please try again later.');
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoiding}
    >
      <View style={styles.container}>
        {/* Background Image */}
        <Image
          source={{
            uri: 'https://img.freepik.com/premium-vector/drawing-house-with-solar-panels-top_987686-21891.jpg',
          }}
          style={styles.backgroundImage}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            {/* Avatar Image */}
            <Image
              source={{
                uri: 'https://www.pureintegration.com/hubfs/PureIntegration_May2022/image/pi-icon-person-500x500-1.png',
              }} // Replace with desired URL
              style={styles.avatar}
            />
            <Text style={styles.title}>Create an Account</Text>
          </View>

          {/* Email Field */}
          <Controller
            control={control}
            rules={{
              required: true,
              pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter Email"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
            name="email"
            defaultValue=""
          />
          {errors.email && <Text style={styles.error}>Please enter a valid email.</Text>}

          {/* Username Field */}
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter Username"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="username"
            defaultValue=""
          />
          {errors.username && <Text style={styles.error}>Username is required.</Text>}

          {/* Contact Number Field */}
          <Controller
            control={control}
            rules={{
              required: true,
              pattern: /^[0-9]{10,15}$/, // Validate as a string of digits
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter Contact Number"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="phone-pad"
                maxLength={15}
              />
            )}
            name="contactNo"
            defaultValue=""
          />
          {errors.contactNo && <Text style={styles.error}>Please enter a valid contact number.</Text>}

          {/* Password Field */}
          <Controller
            control={control}
            rules={{
              required: true,
              minLength: 6,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="grey" />
                </TouchableOpacity>
              </View>
            )}
            name="password"
            defaultValue=""
          />
          {errors.password && <Text style={styles.error}>Password must be at least 6 characters long.</Text>}

          {/* Confirm Password Field */}
          <Controller
            control={control}
            rules={{
              required: true,
              minLength: 6,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={toggleShowConfirmPassword} style={styles.eyeIcon}>
                  <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="grey" />
                </TouchableOpacity>
              </View>
            )}
            name="reenter"
            defaultValue=""
          />
          {errors.reenter && <Text style={styles.error}>Password must be at least 6 characters long.</Text>}

          {/* User Role Radio Button */}
          <Controller
            control={control}
            name="userRole"
            defaultValue="producer"
            render={({ field: { onChange, value } }) => (
              <RadioButtonGroup
                options={['producer', 'consumer']}
                selectedOption={value}
                onSelect={onChange}
              />
            )}
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.submitButtonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            style={styles.signinLink}
            onPress={() => navigation.navigate('(auth)/Signin/index')}
          >
            <Text style={styles.signinText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Ensure the background image stays behind
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Make the content background slightly transparent
    borderRadius: 10,
    zIndex: 1, // Ensure content is above the background image
  },
  header: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  signinLink: {
    alignItems: 'center',
  },
  signinText: {
    color: '#007BFF',
  },
});

export default SignUp;
