import React, { useState } from 'react';
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
import { useProducerApi } from './useProducerApi';
import { ProducerCard } from './ProducerCard';
import { FriendRequestButton } from './FriendRequestButton';

const AddProducer = () => {
  const [username, setUsername] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const {
    foundProducer,
    acceptedProducers,
    loading,
    acceptedLoading,
    error,
    requestStatus,
    searchProducer,
    sendFriendRequest,
  } = useProducerApi();

  const handleSearch = async () => {
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Please enter a username');
      return;
    }
    await searchProducer(username);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ImageBackground
      source={{ uri: 'https://cdn.ecommercedns.uk/files/5/235315/5/12792415/solar-power.jpg' }}
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

        {loading && <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />}

        <Animated.View style={[styles.result, { opacity: fadeAnim }]}>
          {foundProducer && (
            <ProducerCard producer={foundProducer}>
              <FriendRequestButton
                status={foundProducer.status}
                requestStatus={requestStatus}
                onPress={() => sendFriendRequest(foundProducer.id)}
              />
            </ProducerCard>
          )}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accepted Producers</Text>
        </View>
        {acceptedLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
        ) : acceptedProducers.length > 0 ? (
          acceptedProducers.map((producer) => (
            <ProducerCard key={producer.id} producer={producer} />
          ))
        ) : (
          <Text style={styles.noDataText}>No accepted producers found.</Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover', justifyContent: 'center' },
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
  },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    marginRight: 10,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: { backgroundColor: '#D3D3D3' },
  loading: { marginTop: 20 },
  result: { marginTop: 20 },
  errorContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderRadius: 5,
  },
  errorText: { color: '#721c24', fontSize: 16 },
  sectionHeader: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  noDataText: { fontSize: 16, color: '#555', textAlign: 'center' },
});

export default AddProducer;