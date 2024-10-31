import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RadioButtonGroup from '../components/RadioButtonGroup'; // Custom radio button component
import axios from 'axios';
import { useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface FormData {
  email: string;
  username: string;
  contactNo: string; // Change to string
  password: string;
  reenter: string;
  userRole: string;
}

const SignUp = () => {
  const navigation = useNavigation();
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.reenter) {
        Alert.alert('Password does not match');
        console.log('Password does not match');
        return;
    }

    const { email, username, contactNo, password, userRole } = data;

    const requestData = {
        username: username.toString(),
        email: email.toString(),
        contactNo: contactNo.toString(),
        userRole: userRole.toString(),
        password: password.toString(),
    };

    // Sending data to backend
    axios.post('http://localhost:8000/api/register/', requestData, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(async response => {
        if (response.status === 201) {
            Alert.alert('Success', 'User registered successfully!');

            // Store tokens in AsyncStorage
            await AsyncStorage.setItem('accessToken', response.data.access);
            await AsyncStorage.setItem('refreshToken', response.data.refresh);

            // Reset the form fields
            setValue("email", "");
            setValue("username", "");
            setValue("contactNo", "");
            setValue("password", "");
            setValue("reenter", "");
            setValue("userRole", "producer");

            // Navigate to the next screen (e.g., Home or dashboard)
            navigation.navigate('./Signin/index');
        } else {
            Alert.alert('Registration failed', 'Unable to create user.');
            console.log('Registration failed', response);
        }
    })
    .catch(error => {
        console.error('Error registering user:', error);
        Alert.alert('Error', 'An error occurred during registration. Please try again later.');
    });
};
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoiding}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>

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
              value={value} // Keep value as a string
              keyboardType="phone-pad"
              maxLength={15} // Optional: Limit input length
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
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
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
  passwordInput: { flex: 1, padding: 10 },
  eyeIcon: { padding: 10 },
  error: { color: 'red', marginBottom: 10 },
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
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default SignUp;
