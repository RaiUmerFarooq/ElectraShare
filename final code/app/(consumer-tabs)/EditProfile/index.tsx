import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import apiClient from "@/app/api-component/apiClient";

export default function EditProfile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Re-added email state
  const [contactNo, setContactNo] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation();

  // Fetch initial profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/users/profile/");
        console.log("Profile data:", response.data);
        const { username, email, contactNo, image } = response.data; // Added email
        setUsername(username || "");
        setEmail(email || ""); // Set email
        setContactNo(contactNo || "");
        setImage(image ? `data:image/jpeg;base64,${image}` : "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Request permission and pick image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Save profile changes, including image upload
  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email); // Added email to FormData
      formData.append("contactNo", contactNo);

      if (image && image.startsWith("file://")) {
        const fileName = image.split("/").pop();
        const fileType = `image/${fileName.split(".").pop()}`;
        formData.append("image", {
          uri: image,
          name: fileName,
          type: fileType,
        } as any);
      }

      const response = await apiClient.put("/edit-profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Save response:", response.data); // Log response for debugging

      if (response.status === 200) {
        const { image: updatedImage, email: updatedEmail } = response.data.data; // Added email
        setImage(updatedImage ? `data:image/jpeg;base64,${updatedImage}` : "");
        setEmail(updatedEmail || email); // Update email state
        Alert.alert("Success", "Profile updated successfully.");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: "https://th.bing.com/th/id/OIP.srerCJPIm2TKd1ZKp-N6EwAAAA?w=400&h=600&rs=1&pid=ImgDetMain" }}
      style={styles.container}
      imageStyle={{ opacity: 0.3 }}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("profile/index")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: image || "https://placehold.co/150x150" }} // Updated placeholder
            style={styles.profileImage}
            onError={(e) => console.log("Image load error:", e.nativeEvent.error)} // Added error logging
          />
          <View style={styles.editOverlay}>
            <Ionicons name="camera" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          value={contactNo}
          onChangeText={setContactNo}
          placeholder="Enter contact number"
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 15,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 123, 255, 0.7)",
    borderRadius: 20,
    padding: 5,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    margin: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
});