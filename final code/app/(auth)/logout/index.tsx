import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";

export default function Logout() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    // Remove the access token from AsyncStorage
    await AsyncStorage.removeItem("accessToken");
    console.log("Access token removed");
    await AsyncStorage.removeItem("refreshToken");
  //  console.log(navigation.getState());

    // Redirect the user to the SignIn screen after logout
    navigation.navigate("(auth)/Signin/index"); // Change this if your SignIn route is different
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Are you sure you want to log out?</Text>
      <TouchableOpacity 
      style={styles.logoutButton} 
      onPress={handleLogout} 
      accessibilityLabel="Logout">
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  message: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});