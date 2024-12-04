import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ListRenderItem,
  ImageBackground,
} from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import AuthCheck from '@/app/validations/AuthCheck';
import apiClient from '@/app/api-component/apiClient';

type Request = {
  id: string;
  from_user: string; // Username of the consumer sending the request
  to_user: string; // Username of the producer receiving the request
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string; // Timestamp for when the request was created
};

type Neighbour = {
  id: string;
  name: string;
};

const AddNeighbour: React.FC = () => {
  const [showRequests, setShowRequests] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [acceptedNeighbours, setAcceptedNeighbours] = useState<Neighbour[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<Request[]>([]);

  const getFriendRequests = async () => {
    try {
      const response = await apiClient.get('/friend-requests/');
      const requests = response.data;

      // Categorize requests based on status
      const pending = requests.filter(
        (req: Request) => req.status === 'pending'
      );
      const accepted = requests.filter(
        (req: Request) => req.status === 'accepted'
      );
      const rejected = requests.filter(
        (req: Request) => req.status === 'rejected'
      );

      // Update state
      setPendingRequests(pending);
      setRejectedRequests(rejected);

      // Map accepted requests to the format used for neighbours
      const acceptedNeighboursList = accepted.map((req) => ({
        id: req.id,
        name: req.from_user, // The name of the user who made the request
      }));
      setAcceptedNeighbours(acceptedNeighboursList);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch friend requests');
    }
  };

  const handleResponse = async (
    id: string,
    fromUser: string,
    action: 'accepted' | 'rejected'
  ) => {
    try {
      const response = await apiClient.post(`/friend-request/manage/${id}/`, {
        action: action === 'accepted' ? 'accept' : 'reject',
      });

      if (response.status === 200) {
        // Update the lists accordingly
        if (action === 'accepted') {
          setAcceptedNeighbours((prev) => [
            ...prev,
            { id, name: fromUser },
          ]);
        }
        setPendingRequests((prev) =>
          prev.filter((request) => request.id !== id)
        );

        if (action === 'rejected') {
          setRejectedRequests((prev) => [
            ...prev,
            { id, from_user: fromUser, status: 'rejected', created_at: new Date().toISOString() },
          ]);
        }

        Alert.alert(
          `Request ${action}`,
          `You have ${action} the connection request from ${fromUser}.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error managing request:', error);
      Alert.alert('Error', `Failed to ${action} the request`);
    }
  };

  const removeNeighbour = async (id: string) => {
    try {
      const response = await apiClient.delete(`/friend/${id}/`);
      if (response.status === 200) {
        const updatedNeighbours = acceptedNeighbours.filter(
          (neighbour) => neighbour.id !== id
        );
        setAcceptedNeighbours(updatedNeighbours);
        Alert.alert('Removed', 'The neighbour has been removed from your list.');
      }
    } catch (error) {
      console.error('Error removing neighbour:', error);
      Alert.alert('Error', 'Failed to remove the neighbour.');
    }
  };

  useEffect(() => {
    getFriendRequests();
    const intervalId = setInterval(() => {
        getFriendRequests();
      }, 5000); // 5000 ms = 5 seconds
    
      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
  }, []);

  const renderRequestItem: ListRenderItem<Request> = ({ item }) => (
    <View style={styles.requestContainer}>
      <Text style={styles.requestText}>
        {item.from_user} (to {item.to_user}) wants to connect as your neighbour
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleResponse(item.id, item.from_user, 'accepted')}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleResponse(item.id, item.from_user, 'rejected')}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNeighbourItem: ListRenderItem<Neighbour> = ({ item }) => (
    <View style={[styles.requestContainer, styles.acceptedContainer]}>
      <Text style={styles.requestText}>{item.name}</Text>
      <TouchableOpacity
        style={styles.rejectButton}
        onPress={() => removeNeighbour(item.id)}
      >
        <AntDesign name="delete" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <AuthCheck>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ImageBackground
          source={{
            uri: 'https://st2.depositphotos.com/1000356/5730/i/450/depositphotos_57307849-stock-photo-green-leaves-background.jpg',
          }}
          style={styles.background}
        >
          <View style={styles.container}>
            <Text style={styles.title}>Neighbours Management</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  showRequests ? styles.activeTab : styles.inactiveTab,
                ]}
                onPress={() => setShowRequests(true)}
              >
                <Ionicons name="people" size={20} color="black" />
                <Text style={styles.buttonText}>Requests</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  !showRequests ? styles.activeTab : styles.inactiveTab,
                ]}
                onPress={() => setShowRequests(false)}
              >
                <FontAwesome6 name="people-group" size={20} color="black" />
                <Text style={styles.buttonText}>Neighbours</Text>
              </TouchableOpacity>
            </View>

            {showRequests ? (
              <FlatList
                data={pendingRequests}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <Text style={styles.noRequests}>No pending requests</Text>
                }
              />
            ) : (
              <FlatList
                data={acceptedNeighbours}
                renderItem={renderNeighbourItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <Text style={styles.noRequests}>
                    No connected neighbours
                  </Text>
                }
              />
            )}
          </View>
        </ImageBackground>
      </GestureHandlerRootView>
    </AuthCheck>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: 'lightblue',
  },
  inactiveTab: {
    backgroundColor: '#E0E0E0',
  },
  requestContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acceptedContainer: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  requestText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noRequests: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

export default AddNeighbour;
