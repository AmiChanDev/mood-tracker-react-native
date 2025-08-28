import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ToastAndroid,
} from "react-native";
import { Mood } from "../types/mood";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import uuid from 'react-native-uuid';

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
  const navigation = useNavigation<HomeScreenNavigationProp>();

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

    const moodEntry: Mood = {
      id: uuid.v4(),
      mood: selectedMood,
      note,
      date: new Date().toISOString(),
    };

    try {
      const existingData = await AsyncStorage.getItem("moods");
      const parsedData: Mood[] = existingData ? JSON.parse(existingData) : [];
      parsedData.push(moodEntry);

      await AsyncStorage.setItem("moods", JSON.stringify(parsedData));

      ToastAndroid.showWithGravity(
        "Mood saved successfully!",
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );

      setSelectedMood("");
      setNote("");
    } catch (error) {
      ToastAndroid.showWithGravity(
        (error as Error).message,
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );
    }
  };

  return (
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
      

      <Pressable style={styles.saveButton} onPress={saveMood}>
        <Text style={styles.saveText}>Save Mood</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('History')} style={styles.historyButton}>
        <Text style={styles.historyText}>View History</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  moodButton: {
    padding: 15,
    borderRadius: 50,
    backgroundColor: "#f5d6d6ff",
  },
  selectedMood: { backgroundColor: "#c6e4e6ff" },
  moodText: { fontSize: 35 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  historyButton: {
    backgroundColor: "#2196f3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  historyText: { color: "#fff", fontWeight: "bold" },
});

export default HomeScreen;
