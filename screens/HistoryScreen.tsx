import { useEffect, useState } from "react";
import { Mood } from "../types/mood";
import { View, Text, Pressable, FlatList, StyleSheet, Image } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const HistoryScreen = () => {
  const [moods, setMoods] = useState<Mood[]>([]);

  const clearHistory = async () => {
    await AsyncStorage.removeItem('moods');
    setMoods([]);
  }

  const loadMoods = async () => {
    const stored = await AsyncStorage.getItem('moods');
    stored ? setMoods(JSON.parse(stored)) : console.log("error in mood loading");
  }

  useEffect(() => {
    loadMoods();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood History</Text>
      <FlatList
        data={moods}
        keyExtractor={(item) => item.id} // use id instead of index
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.mood}>{item.mood}</Text>
            {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : null}
          </View>
        )}
      />
      <Pressable onPress={clearHistory} style={styles.clearButton}>
        <Text style={styles.clearText}>Clear History</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  entry: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  date: { fontSize: 12, color: '#555' },
  mood: { fontSize: 24 },
  note: { fontSize: 16, color: '#333' },
  image: { width: 150, height: 150, marginTop: 10, borderRadius: 10 },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20
  },
  clearText: { color: '#fff', fontWeight: 'bold' },
});

export default HistoryScreen;
