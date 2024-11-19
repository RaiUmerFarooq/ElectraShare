import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ListRenderItem, Platform, ImageBackground } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import AuthCheck from '@/app/validations/AuthCheck';

type Request = {
    id: string;
    name: string;
};

type Neighbour = {
    id: string;
    name: string;
};

const AddNeighbour: React.FC = () => {
    const [showRequests, setShowRequests] = useState(true);
    const [requests, setRequests] = useState<Request[]>([
        { id: '1', name: 'Buyer A' },
        { id: '2', name: 'Buyer B' },
        { id: '3', name: 'Buyer C' },
    ]);

    const [acceptedNeighbours, setAcceptedNeighbours] = useState<Neighbour[]>([]);
    const [rejectedRequests, setRejectedRequests] = useState<Request[]>([]);

    const handleResponse = (id: string, name: string, action: 'accepted' | 'rejected') => {
        const updatedRequests = requests.filter((request) => request.id !== id);
        setRequests(updatedRequests);

        if (action === 'accepted') {
            setAcceptedNeighbours((prev) => [...prev, { id, name }]);
        } else {
            setRejectedRequests((prev) => [...prev, { id, name }]);
        }

        Alert.alert(
            `Request ${action === 'accepted' ? 'Accepted' : 'Rejected'}`,
            `You have ${action} the connection request from ${name}.`,
            [{ text: 'OK' }]
        );
    };

    const deleteRejectedRequest = (id: string) => {
        const updatedRejectedRequests = rejectedRequests.filter((request) => request.id !== id);
        setRejectedRequests(updatedRejectedRequests);
        Alert.alert('Deleted', 'The rejected request has been deleted.');
    };

    const renderRequestItem: ListRenderItem<Request> = ({ item }) => (
        <View style={styles.requestContainer}>
            <Text style={styles.requestText}>{item.name} wants to connect as your neighbour.</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleResponse(item.id, item.name, 'accepted')}
                >
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleResponse(item.id, item.name, 'rejected')}
                >
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderNeighbourItem: ListRenderItem<Neighbour> = ({ item }) => (
        <View style={styles.requestContainer}>
            <Text style={styles.requestText}>{item.name} is your neighbour.</Text>
        </View>
    );

    const renderRejectedItem: ListRenderItem<Request> = ({ item }) => (
        <View style={styles.requestContainer}>
            <Text style={styles.requestText}>{item.name} was rejected as your neighbour.</Text>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteRejectedRequest(item.id)}
            >
                <AntDesign name="delete" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    return (
        <AuthCheck>
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={{ uri: 'https://st2.depositphotos.com/1000356/5730/i/450/depositphotos_57307849-stock-photo-green-leaves-background.jpg' }} // Replace with your image URL
                style={styles.background}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>Neighbours Management</Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.tabButton, showRequests ? styles.activeTab : styles.inactiveTab]}
                            onPress={() => setShowRequests(true)}
                        >
                            <View style={styles.tabContent}>
                                <Ionicons name="people" size={20} color="black" />
                                <Text style={[styles.buttonText, { color: 'black' }]}> Neighbours</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, !showRequests ? styles.activeTab : styles.inactiveTab]}
                            onPress={() => setShowRequests(false)}
                        >
                            <View style={styles.tabContent}>
                                <Text style={[styles.buttonText, { color: 'black' }]}>See All </Text>
                                <FontAwesome6 name="people-group" size={20} color="black" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {showRequests ? (
                        <FlatList
                            data={requests}
                            renderItem={renderRequestItem}
                            keyExtractor={(item) => item.id}
                            ListEmptyComponent={<Text style={styles.noRequests}>No pending requests</Text>}
                        />
                    ) : (
                        <>
                            <FlatList
                                data={acceptedNeighbours}
                                renderItem={renderNeighbourItem}
                                keyExtractor={(item) => item.id}
                                ListEmptyComponent={<Text style={styles.noRequests}>No accepted neighbours</Text>}
                            />
                            <FlatList
                                data={rejectedRequests}
                                renderItem={renderRejectedItem}
                                keyExtractor={(item) => item.id}
                                ListEmptyComponent={<Text style={styles.noRequests}>No rejected requests</Text>}
                            />
                        </>
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
        resizeMode: 'cover', // Ensures the image covers the entire screen
        justifyContent: 'center', // Centers content in the screen
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Transparent background to let the image show through
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
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#000000',
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requestText: {
        fontSize: Platform.OS === 'web' ? 16 : 14,
        color: '#000000',
        flex: 1,
        marginRight: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
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
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        marginLeft: 10,
    },
});

export default AddNeighbour;
