import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  ToastAndroid,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mood } from "../types/Mood";

const STORAGE_KEY = "@moodList:key";
const PUBLIC_URL = "https://a7393b4d069f.ngrok-free.app";

const HistoryScreen = () => {
  const [moods, setMoods] = useState<Mood[]>([]);

  const loadMoods = async () => {
    try {
      // 1. Fetch moods from backend
      const response = await fetch(PUBLIC_URL + "/MoodTrackerBackend/GetMoods");
      const backendMoods: Mood[] = await response.json();

      // 2. Get images from AsyncStorage
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const localMoods: (Mood & { image?: string })[] = stored
        ? JSON.parse(stored)
        : [];

      // 3. Merge backend moods with local images (by id)
      const mergedMoods = backendMoods.map((m) => {
        const local = localMoods.find((lm) => String(lm.id) === String(m.id));
        return {
          ...m,
          image: m.image || local?.image || null,
        };
      });


      setMoods(mergedMoods);
    } catch (error) {
      console.log("Failed to load moods:", error);
      ToastAndroid.show("Failed to load moods", ToastAndroid.SHORT);
    }
  };


  const removeMood = async (id: string) => {
    Alert.alert("Delete Mood", "Are you sure you want to delete this mood?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await fetch(`${PUBLIC_URL}/MoodTrackerBackend/DeleteMood?id=${id}`, {
            method: "DELETE",
          });
          const filtered = moods.filter((m) => m.id !== id);
          setMoods(filtered);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
          ToastAndroid.show("Record Deleted Successfully!", ToastAndroid.SHORT);
        },
      },
    ]);
  };

  useEffect(() => {
    loadMoods();
  }, []);

  const moodToEmoji = (selectedMood: string): string => {
    if (selectedMood === "happy") return "😊";
    if (selectedMood === "neutral") return "😐";
    if (selectedMood === "sad") return "😢";
    return "undefined";
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.reportButton}>
        <Text style={styles.title}>Mood Report</Text>
      </Pressable>

      <FlatList
        data={moods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.dateString}>
                {(item.dateString)}
              </Text>
              <Pressable
                style={styles.deleteButton}
                onPress={() => removeMood(item.id)}
              >
                <Text style={styles.deleteText}>🗑️</Text>
              </Pressable>
            </View>
            <Text style={styles.mood}>{moodToEmoji(item.mood)}</Text>
            {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No moods recorded yet.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 80,
  },
  entry: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateString: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
  deleteButton: {
    backgroundColor: "#F87171",
    padding: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  mood: {
    fontSize: 28,
    marginBottom: 8,
    color: "#111827",
  },
  note: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 40,
  },
  reportButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
});

export default HistoryScreen;
