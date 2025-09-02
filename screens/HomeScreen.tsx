import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ToastAndroid,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Mood } from "../types/Mood";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import uuid from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";

type NavigatorParamList = {
  Home: undefined;
  History: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  NavigatorParamList,
  "Home"
>;

const HomeScreen = () => {
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const STORAGE_KEY = "@moodList:key";
  const moodList = ["😊", "😐", "😢"];

  const PUBLIC_URL = "https://2b064a527674.ngrok-free.app";

  const saveMood = async () => {
    if (!selectedMood) {
      ToastAndroid.show("Please select a mood", ToastAndroid.SHORT);
      return;
    }

    const moodToString = (selectedMood: string): string => {
      if (selectedMood === "😊") return "happy";
      if (selectedMood === "😐") return "neutral";
      if (selectedMood === "😢") return "sad";
      return "undefined";
    };

    const now = new Date();

    const pad = (n: number) => (n < 10 ? "0" + n : n);

    const formattedDate =
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate()) +
      " " +
      pad(now.getHours()) +
      ":" +
      pad(now.getMinutes()) +
      ":" +
      pad(now.getSeconds());


    const moodEntry: Mood & { image?: string } = {
      id: String(uuid.v4()),
      mood: moodToString(selectedMood),
      note,
      date: formattedDate,
      image: imageUri || undefined,
    };


    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedData: (Mood & { image?: string })[] =
        existingData ? JSON.parse(existingData) : [];
      parsedData.push(moodEntry);

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));

      // Save to backend
      const response = await fetch(PUBLIC_URL + "/MoodTrackerBackend/SaveMood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      const resJson = await response.json();
      if (resJson.ok) {
        ToastAndroid.show("Mood saved successfully!", ToastAndroid.SHORT);
      } else {
        ToastAndroid.show("Failed to save the record!", ToastAndroid.SHORT);
      }

      setSelectedMood("");
      setNote("");
      setImageUri(null);
    } catch (error) {
      ToastAndroid.show((error as Error).message, ToastAndroid.SHORT);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      ToastAndroid.show("Permission denied!", ToastAndroid.SHORT);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 1,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      ToastAndroid.show("Image selected!", ToastAndroid.SHORT);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.scrollView}
      >
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>How Are You Feeling Today?</Text>

          <View style={styles.moodContainer}>
            {moodList.map((mood) => (
              <Pressable
                key={mood}
                onPress={() => setSelectedMood(mood)}
                style={[
                  styles.moodButton,
                  selectedMood === mood
                    ? styles.selectedMood
                    : styles.unselectedMood,
                ]}
              >
                <Text style={styles.moodText}>{mood}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            placeholder="Add a note about your mood..."
            placeholderTextColor="#8B8989"
            value={note}
            onChangeText={setNote}
            style={styles.input}
            multiline
            numberOfLines={4}
          />

          <Pressable style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerText}>
              {imageUri ? "Change Image" : "Add a Photo"}
            </Text>
          </Pressable>

          {imageUri && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}

          <Pressable style={styles.saveButton} onPress={saveMood}>
            <Text style={styles.saveText}>Save Your Mood</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("History")}
            style={styles.historyButton}
          >
            <Text style={styles.historyText}>View Mood History</Text>
          </Pressable>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: "#F7F4F2",
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 60,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D2D2D",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
  },
  moodButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  unselectedMood: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  selectedMood: {
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#D4A017",
    transform: [{ scale: 1.1 }],
  },
  moodText: {
    fontSize: 40,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2D2D2D",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
    textAlignVertical: "top",
  },
  imagePickerButton: {
    backgroundColor: "#6B7280",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  imagePickerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  historyButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  historyText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
