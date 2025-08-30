import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, Image, Modal, TouchableOpacity, Alert, ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mood } from "../types/Mood";

const STORAGE_KEY = "@moodList:key";

const HistoryScreen = () => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadMoods = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      setMoods(JSON.parse(stored));
    }
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setMoods([]);
    ToastAndroid.show("Records Cleared!", ToastAndroid.SHORT);
  };

  const removeMood = async (id: string) => {
    Alert.alert("Delete Mood", "Are you sure you want to delete this mood?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const filtered = moods.filter(m => m.id !== id);
          setMoods(filtered);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
          ToastAndroid.show("Record Deleted Successfully!", ToastAndroid.SHORT);
        },
      },
    ]);
  };

  const openImage = (uri: string) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    loadMoods();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood History</Text>

      <FlatList
        data={moods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
              <Pressable style={styles.deleteButton} onPress={() => removeMood(item.id)}>
                <Text style={styles.deleteText}>❌</Text>
              </Pressable>
            </View>
            <Text style={styles.mood}>{item.mood}</Text>
            {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            {item.image && (
              <TouchableOpacity onPress={() => item.image && openImage(item.image)}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="cover"
                  blurRadius={1}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <Pressable onPress={clearHistory} style={styles.clearButton}>
        <Text style={styles.clearText}>Clear History</Text>
      </Pressable>

      <Modal visible={modalVisible} transparent={true}>
        <TouchableOpacity style={styles.modalContainer} onPress={closeModal}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  entry: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 12, color: "#555" },
  deleteButton: { backgroundColor: "#f3ada8ff", paddingHorizontal: 30, paddingVertical: 15, borderRadius: 10 },
  deleteText: { color: "#fff", fontWeight: "bold" },
  mood: { fontSize: 24 },
  note: { fontSize: 16, color: "#333" },
  image: { width: 150, height: 150, borderRadius: 10, marginTop: 8 },
  clearButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  clearText: { color: "#fff", fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(65, 65, 65, 0.38)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: { width: "90%", height: "90%" },
});

export default HistoryScreen;
