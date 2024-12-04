import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchengin } from '@fortawesome/free-brands-svg-icons';
import apiClient from '@/app/api-component/apiClient';

// Producer type definition
type Producer = {
  id: string;
  username: string;
  description: string;
  status: string; // Added status to track the connection status
};

type RequestStatus = 'idle' | 'loading' | 'pending' | 'accepted' | 'rejected';

const AddProducer = () => {
  const [username, setUsername] = useState('');
  const [foundProducer, setFoundProducer] = useState<Producer | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleSearch = async () => {
    if (!username) {
      Alert.alert('Validation Error', 'Please enter a username');
      return;
    }

    setLoading(true);
    setFoundProducer(null);
    setErrorMessage('');
    setRequestStatus('idle');

    try {
      // Animation for smooth UI appearance
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();

      const response = await apiClient.post('/users/find/', { username });

      const producer: Producer = {
        id: response.data.id,
        username: response.data.username,
        description: response.data.description || 'No description provided.',
        status: response.data.status || 'not connected', // Set the status field
      };

      setFoundProducer(producer);
    } catch (error) {
      console.error('Error fetching producer:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch producer.';
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (producerId: string) => {
    setRequestStatus('loading');

    try {
      const response = await apiClient.post('/friend-request/send/', {
        producer_id: producerId,
      });

      if (response.status === 201) {
        // If the status is "not connected," change it to "pending" while the request is being processed
        setRequestStatus('pending');
        Alert.alert('Success', 'Friend request sent successfully.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to send friend request.';
      setRequestStatus('rejected');
      Alert.alert('Error', errorMessage);
    }
  };

  const renderFriendRequestButton = () => {
    if (foundProducer?.status === 'not connected' && requestStatus === 'pending') {
      return (
        <View style={[styles.requestButton, { backgroundColor: '#FF9800' }]}>
          <Text style={styles.buttonText}>Pending...</Text>
        </View>
      );
    }

    switch (requestStatus) {
      case 'loading':
        return (
          <View style={styles.requestButton}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        );
      case 'accepted':
        return (
          <View style={[styles.requestButton, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.buttonText}>Request Accepted ✓</Text>
          </View>
        );
      case 'rejected':
        return (
          <View style={[styles.requestButton, { backgroundColor: '#FF0000' }]}>
            <Text style={styles.buttonText}>Request Rejected ✗</Text>
          </View>
        );
      default:
        return (
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => handleSendFriendRequest(foundProducer!.id)}
          >
            <Text style={styles.buttonText}>Send Friend Request</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://cdn.ecommercedns.uk/files/5/235315/5/12792415/solar-power.jpg',
      }}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Producer's Username"
            value={username}
            onChangeText={setUsername}
          />
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.buttonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSearchengin} color="#fff" size={40} />
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loadingIndicator} />
        )}

        <Animated.View style={[styles.result, { opacity: fadeAnim }]}>
          {foundProducer ? (
            <View style={styles.card}>
              <Text style={styles.foundTitle}>Producer Found:</Text>
              <Text style={styles.producerUsername}>{foundProducer.username}</Text>
              <Text style={styles.producerDescription}>
                {foundProducer.description}
              </Text>
              <Text style={styles.connectionStatus}>
                Connection Status: {foundProducer.status}
              </Text>
              {renderFriendRequestButton()}
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    marginRight: 10,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  searchButton: {
    padding: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#D3D3D3',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  result: {
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  foundTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  producerUsername: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  producerDescription: {
    fontSize: 16,
    color: '#555',
  },
  connectionStatus: {
    fontSize: 16,
    marginTop: 10,
    color: '#777',
  },
  requestButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderRadius: 5,
  },
  errorMessage: {
    color: '#721c24',
    fontSize: 16,
  },
});

export default AddProducer;
