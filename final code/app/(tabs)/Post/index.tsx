import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const AddPost = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [units, setUnits] = useState(0);

  const handlePostSubmit = () => {
    if (!title || !price || !units) {
      Alert.alert('Error', 'Please fill in all fields');
      console.log('Error');
      return;
    }

    Alert.alert('Success', `Post submitted:\nTitle: ${title}\nPrice: ${price}\nUnits: ${units}`);
    console.log('Success', `Post submitted:\nTitle: ${title}\nPrice: ${price}\nUnits: ${units}`);
    setTitle('');
    setPrice(0);
    setUnits(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Post</Text>

      {/* Basic Info Section */}
      <Text style={styles.sectionHeader}>1. Basic Information</Text>
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
        value={price.toString()}
        onChangeText={(value) => setPrice(Number(value))}
        keyboardType="numeric"
      />

      {/* Selling Info Section */}
      <Text style={styles.sectionHeader}>2. Selling Information</Text>
      <Text style={styles.label}>Units for Selling</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter units for selling"
        value={units.toString()}
        onChangeText={(value) => setUnits(Number(value))}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handlePostSubmit}>
        <Text style={styles.submitButtonText}>Submit Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    marginTop: 20,
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
