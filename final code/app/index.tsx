import { Link } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"; // Import axios for API requests
import { useNavigation } from "expo-router";

export default function Index() {
  const navigation = useNavigation();

  useEffect(() => {
    const validateAccessToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");

        if (accessToken) {
          // Send the token to the backend to validate and get userRole
          const response = await axios.get("http://localhost:8000/api/users/profile/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (response.status === 200) {
            const { status } = response.data; // Assuming the backend returns userRole

            // Navigate based on userRole
            if (status === "producer") {
              navigation.navigate("(tabs)"); // Replace with the actual screen for "producer"
            } else {
              navigation.navigate("(consumer-tabs)"); // Replace with the actual screen for others
            }
          } else {
            console.error("Token validation failed. Logging out...");
            // Handle invalid token (e.g., remove the token and redirect to login)
            await AsyncStorage.clear();
            navigation.navigate("./Signin");
          }
        }
      } catch (error) {
        console.error("Error validating token:", error);
        // Redirect to login on error
        await AsyncStorage.clear();
        navigation.navigate("./Signin");
      }
    };

    validateAccessToken();
  }, [navigation]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Link href={"./(auth)/Signup"} asChild>
        <TouchableOpacity style={styles.button} accessibilityLabel="Sign Up">
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </Link>
      <Link href={"./Signin"} asChild>
        <TouchableOpacity style={styles.signinButton} accessibilityLabel="Sign In">
          <Text style={styles.signinText}>Sign In</Text>
        </TouchableOpacity>
      </Link>
    </GestureHandlerRootView>
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  signinButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  signinText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
