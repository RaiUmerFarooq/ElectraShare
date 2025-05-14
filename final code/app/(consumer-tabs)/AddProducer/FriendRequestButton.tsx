import React from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface FriendRequestButtonProps {
  status: string;
  requestStatus: 'idle' | 'loading' | 'pending' | 'accepted' | 'rejected';
  onPress: () => void;
}

export const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({
  status,
  requestStatus,
  onPress,
}) => {
  // Hide button if status is not 'not connected' (i.e., already connected or pending)
  if (status !== 'not connected') {
    return null;
  }

  // Render based on requestStatus when status is 'not connected'
  switch (requestStatus) {
    case 'loading':
      return (
        <View style={styles.button}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      );
    case 'accepted':
      return (
        <View style={[styles.button, styles.accepted]}>
          <Text style={styles.buttonText}>Request Accepted ✓</Text>
        </View>
      );
    case 'rejected':
      return (
        <View style={[styles.button, styles.rejected]}>
          <Text style={styles.buttonText}>Request Rejected ✗</Text>
        </View>
      );
    case 'pending':
      return (
        <View style={[styles.button, styles.pending]}>
          <Text style={styles.buttonText}>Pending...</Text>
        </View>
      );
    case 'idle':
    default:
      return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Send Friend Request</Text>
        </TouchableOpacity>
      );
  }
};

const styles = StyleSheet.create({
  button: {
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
  pending: {
    backgroundColor: '#FF9800',
  },
  accepted: {
    backgroundColor: '#4CAF50',
  },
  rejected: {
    backgroundColor: '#FF0000',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});