import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ImageBackground, ScrollView, ActivityIndicator, Animated, Easing, RefreshControl } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faSearchengin } from '@fortawesome/free-brands-svg-icons';

// Producer type definition
type Producer = {
  id: string;
  username: string;
  description: string;
};

const producers: Producer[] = [
  { id: '1', username: 'producer1', description: 'Available for sharing 100 kWh of energy daily.' },
  { id: '2', username: 'producer2', description: 'Available for sharing 50 kWh of energy daily.' },
  { id: '3', username: 'producer3', description: 'Available for sharing 200 kWh of energy daily.' },
  { id: '4', username: 'producer4', description: 'Available for sharing 100 kWh of energy daily.' },
  { id: '5', username: 'producer5', description: 'Available for sharing 50 kWh of energy daily.' },
  { id: '6', username: 'producer6', description: 'Available for sharing 200 kWh of energy daily.' },
];

const FriendRequestPage = () => {
  const [username, setUsername] = useState('');
  const [foundProducer, setFoundProducer] = useState<Producer | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestedProducers, setRequestedProducers] = useState<Producer[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];  // Animation for fade-in

  const handleSearch = async () => {
    if (!username) {
      Alert.alert('Please enter a username');
      return;
    }

    setLoading(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    const producer = producers.find((p) => p.username.toLowerCase() === username.toLowerCase());

    if (producer) {
      setFoundProducer(producer);
      setErrorMessage('');
    } else {
      setFoundProducer(null);
      setErrorMessage(`No producer found with the username "${username}".`);
    }

    setLoading(false);
  };

  const handleRequestEnergy = (producer: Producer) => {
    if (requestedProducers.find((p) => p.id === producer.id)) {
      Alert.alert('Request Already Sent', `You have already requested energy from ${producer.username}.`);
      return;
    }

    Alert.alert(
      'Energy Request Sent',
      `You have successfully requested energy from ${producer.username}.`,
      [{ text: 'OK' }]
    );

    setRequestedProducers((prev) => [...prev, producer]);
  };

  const handleRemoveRequest = (producer: Producer) => {
    setRequestedProducers((prev) => prev.filter((p) => p.id !== producer.id));

    Alert.alert('Request Removed', `You have removed your request from ${producer.username}.`);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('List refreshed');
    }, 1500);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://cdn.ecommercedns.uk/files/5/235315/5/12792415/solar-power.jpg' }}
      style={styles.background}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search Input with FontAwesome Icon */}
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
            <FontAwesomeIcon icon={faSearchengin} color="#fff" size={40} /> {/* Larger size */}
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#4CAF50" style={styles.loadingIndicator} />}

        <Animated.View style={[styles.result, { opacity: fadeAnim }]}>
          {foundProducer ? (
            <View style={styles.card}>
              <Text style={styles.foundTitle}>Producer Found:</Text>
              <Text style={styles.producerUsername}>{foundProducer.username}</Text>
              <Text style={styles.producerDescription}>{foundProducer.description}</Text>
              <TouchableOpacity
                style={styles.requestButton}
                onPress={() => handleRequestEnergy(foundProducer)}
              >
                <Text style={styles.buttonText}>Request Energy</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          ) : null}
        </Animated.View>

        <Text style={styles.title}>Available Producers for Energy Sharing</Text>
        {producers.length > 0 ? (
          producers.map((producer) => (
            !requestedProducers.find((p) => p.id === producer.id) && (
              <View key={producer.id} style={styles.card}>
                <Text style={styles.producerUsername}>{producer.username}</Text>
                <Text style={styles.producerDescription}>{producer.description}</Text>
                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={() => handleRequestEnergy(producer)}
                >
                  <Text style={styles.buttonText}>Request Energy</Text>
                </TouchableOpacity>
              </View>
            )
          ))
        ) : (
          <Text style={styles.noProducers}>No producers available for energy sharing.</Text>
        )}

        <Text style={styles.title}>Your Requested Producers</Text>
        {requestedProducers.length > 0 ? (
          requestedProducers.map((producer) => (
            <View key={producer.id} style={styles.card}>
              <Text style={styles.producerUsername}>{producer.username}</Text>
              <Text style={styles.producerDescription}>Energy request sent.</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveRequest(producer)}
              >
                <Text style={styles.buttonText}>Remove Request</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noRequests}>You have not requested any energy yet.</Text>
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
    backgroundColor: '#4CAF50', // Add a color to make the button prominent
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5, // Add elevation for Android shadow
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
  requestButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
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
  noProducers: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  noRequests: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  removeButton: {
    backgroundColor: '#FF5733',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
  },
});

export default FriendRequestPage;
