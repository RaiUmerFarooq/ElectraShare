import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  Alert,
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
  const [acceptedProducers, setAcceptedProducers] = useState<Producer[]>([]); // State for accepted producers
  const [acceptedLoading, setAcceptedLoading] = useState(false); // Loading state for accepted producers
  const [acceptedError, setAcceptedError] = useState<string>(''); // Error state for accepted producers
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchAcceptedProducers = async () => {
      setAcceptedLoading(true);
      setAcceptedError('');
      try {
        const response = await apiClient.get('/accepted-producers/');
        const producers: Producer[] = response.data.map((producer: any) => ({
          id: producer.id.toString(),
          username: producer.username,
          description: producer.description || 'No description provided.',
          status: 'accepted', // Set status to 'accepted' since these are accepted connections
        }));
        setAcceptedProducers(producers);
      } catch (error) {
        console.error('Error fetching accepted producers:', error);
        const errorMessage =
          error.response?.data?.message || 'Failed to fetch accepted producers.';
        setAcceptedError(errorMessage);
      } finally {
        setAcceptedLoading(false);
      }
    };

    fetchAcceptedProducers();
  }, []);

  const handleSearch = async () => {
    if (!username.trim()) {
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
        id: response.data.id.toString(), // Ensure id is a string for consistency
        username: response.data.username,
        description: response.data.description || 'No description provided.',
        status: response.data.status || 'not connected', // Set the status field from API
      };

      setFoundProducer(producer);
    } catch (error) {
      console.error('Error fetching producer:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch producer. Producer not found or invalid username.';
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (producerId: string) => {
    if (!producerId) {
      Alert.alert('Error', 'Producer ID is missing.');
      return;
    }

    setRequestStatus('loading');

    try {
      const response = await apiClient.post('/friend-request/send/', {
        producer_id: producerId,
      });

      if (response.status === 201) {
        setRequestStatus('pending');
        setFoundProducer((prev) => prev ? { ...prev, status: 'pending' } : null);
        Alert.alert('Success', 'Friend request sent successfully.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to send friend request.';
      setRequestStatus('rejected');
      setFoundProducer((prev) => prev ? { ...prev, status: 'rejected' } : null);
      Alert.alert('Error', errorMessage);
    }
  };

  const renderFriendRequestButton = () => {
    if (foundProducer?.status === 'pending') {
      return (
        <View style={styles.requestButtonPending}>
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
          <View style={styles.requestButtonAccepted}>
            <Text style={styles.buttonText}>Request Accepted ✓</Text>
          </View>
        );
      case 'rejected':
        return (
          <View style={styles.requestButtonRejected}>
            <Text style={styles.buttonText}>Request Rejected ✗</Text>
          </View>
        );
      default:
        if (foundProducer?.status === 'not connected') {
          return (
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => handleSendFriendRequest(foundProducer.id)}
            >
              <Text style={styles.buttonText}>Send Friend Request</Text>
            </TouchableOpacity>
          );
        }
        return null; // Hide button if already connected or in an invalid state
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
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.buttonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSearchengin} color="#fff" size={30} />
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

        {/* Section for Accepted Producers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accepted Producers</Text>
        </View>
        {acceptedLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loadingIndicator} />
        ) : acceptedError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>{acceptedError}</Text>
          </View>
        ) : (
          acceptedProducers.map((producer) => (
            <View key={producer.id} style={styles.card}>
              <Text style={styles.producerUsername}>{producer.username}</Text>
              <Text style={styles.producerDescription}>
                {producer.description}
              </Text>
              <Text style={styles.connectionStatus}>
                Connection Status: {producer.status}
              </Text>
            </View>
          ))
        )}
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
    color: '#333',
  },
  producerUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  producerDescription: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  requestButtonPending: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  requestButtonAccepted: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  requestButtonRejected: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  errorMessage: {
    color: '#721c24',
    fontSize: 16,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AddProducer;