import { Link } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Link href="./Signup" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </Link>
      <Link href="./Signin" asChild>
        <TouchableOpacity style={ styles.signinButton}>
          <Text style={ styles.signinText}>Sign In</Text>
        </TouchableOpacity>
      </Link>
      <Link  href="./Post" asChild>
      <TouchableOpacity style={ styles.signinButton}>
          <Text style={ styles.signinText}>Add Post</Text>
        </TouchableOpacity>
       </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    // For web support, consider using box-shadow instead of elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signinButton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    // For web support, consider using box-shadow instead of elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
 //   backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  signinText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#4CAF50',
  },
});
