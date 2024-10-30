import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const SignIn = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const onSubmit = () => {
    // Reset errors
    setErrors({});

    // Validation
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email.';
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

    Alert.alert('Sign In Attempt', `Email: ${email}\nPassword: ${password}`);
    console.log('Sign In Attempt', `Email: ${email}\nPassword: ${password}`);

    // Reset form fields after submission
    setEmail('');
    setPassword('');

    // Navigate to Dashboard
    navigation.navigate('(tabs)'); // Use the correct path
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
   
    <GestureHandlerRootView style={styles.keyboardAvoiding}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <Text style={styles.title}>Sign In</Text>

        {/* Email Field */}
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {/* {errors.email && <Text style={styles.error}>{errors.email}12</Text>} Show specific error message */}

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
