import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

const AddPost = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [units, setUnits] = useState(0);  // Added state for units

  const handlePostSubmit = () => {
    if (!title || !price || !units) {
      Alert.alert('Error', 'Please fill in all fields');
      console.log('Error', 'Please fill in all fields');
      return;
    }

    // Handle post submission (e.g., send it to an API or store it locally)
    Alert.alert('Success', `Post submitted:\nTitle: ${title}\nPrice: ${price}\nUnits: ${units}`);
    console.log('Success', `Post submitted:\nTitle: ${title}\nPrice: ${price}\nUnits: ${units}`);
    
    // Reset fields
    setTitle(''); // Resetting title field
    setPrice(0);  // Resetting price field
    setUnits(0);  // Resetting units field
  };

  return (
    <View style={styles.container}>
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
        value={price.toString()} // Convert number to string for TextInput
        onChangeText={(value) => setPrice(Number(value))} // Ensure input is converted to a number
        keyboardType="numeric"
      />

      <Text style={styles.label}>Units for Selling</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter units for selling"
        value={units.toString()} // Convert number to string for TextInput
        onChangeText={(value) => setUnits(Number(value))} // Ensure input is converted to a number
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handlePostSubmit}>
        <Text style={styles.textButton}>Submit Post</Text>
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  submitButton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    marginLeft: 30,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  textButton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddPost;
