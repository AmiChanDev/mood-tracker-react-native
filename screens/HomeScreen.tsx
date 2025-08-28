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
import uuid from 'react-native-uuid';
import * as ImagePicker from 'expo-image-picker';

type navigatorParamList = {
  Home: undefined,
  History: undefined
}

type HomeScreenNavigationProp = NativeStackNavigationProp<
  navigatorParamList,
  "Home"
>;

export const HomeScreen = () => {
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const STORAGE_KEY = "@moodList:key"
  const moodList: string[] = ["😊", "😐", "😢"];

  const saveMood = async () => {
    if (!selectedMood) {
      ToastAndroid.showWithGravity(
        "Please select a mood",
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );
      return;
    }

    const moodEntry: Mood & { image?: string } = {
      id: uuid.v4().toString(),
      mood: selectedMood,
      note,
      date: new Date().toISOString(),
      image: imageUri || undefined,
    };

    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedData: (Mood & { image?: string })[] = existingData ? JSON.parse(existingData) : [];
      parsedData.push(moodEntry);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));

      ToastAndroid.showWithGravity(
        "Mood saved successfully!",
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );

      setSelectedMood("");
      setNote("");
      setImageUri(null);
    } catch (error) {
      ToastAndroid.showWithGravity(
        (error as Error).message,
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      ToastAndroid.show("Permission denied!", ToastAndroid.SHORT);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.7,
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if needed
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>How Are You Feeling Today?</Text>

          <View style={styles.moodContainer}>
            {moodList.map((mood) => (
              <Pressable
                key={mood}
                onPress={() => setSelectedMood(mood)}
                style={[
                  styles.moodButton,
                  selectedMood === mood ? styles.selectedMood : null,
                ]}
              >
                <Text style={styles.moodText}>{mood}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            placeholder="Enter a note (optional)"
            value={note}
            onChangeText={setNote}
            style={styles.input}
          />

          <Pressable style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerText}>
              {imageUri ? "Change Image" : "Pick Image"}
            </Text>
          </Pressable>

          {imageUri && (
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Image source={{ uri: imageUri }} style={{ width: 150, height: 150, borderRadius: 10 }} />
            </View>
          )}

          <Pressable style={styles.saveButton} onPress={saveMood}>
            <Text style={styles.saveText}>Save Mood</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('History')} style={styles.historyButton}>
            <Text style={styles.historyText}>View History</Text>
          </Pressable>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  moodContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  moodButton: { padding: 15, borderRadius: 50, backgroundColor: "#f5d6d6ff" },
  selectedMood: { backgroundColor: "#c6e4e6ff" },
  moodText: { fontSize: 35 },
  input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 10 },
  imagePickerButton: { backgroundColor: "#54d6fdff", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginBottom: 16, flexDirection: "row", justifyContent: "center", },
  imagePickerText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  saveButton: { backgroundColor: "#4caf50", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  saveText: { color: "#fff", fontWeight: "bold" },
  historyButton: { backgroundColor: "#2196f3", padding: 15, borderRadius: 10, alignItems: "center" },
  historyText: { color: "#fff", fontWeight: "bold" },
});

export default HomeScreen;
