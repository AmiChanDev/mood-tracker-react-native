import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Platform } from "react-native";

import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";

type navigatorParamList = {
  Home: undefined,
  History: undefined
}

const Stack = createNativeStackNavigator<navigatorParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={HomeStyles} />
        <Stack.Screen name="History" component={HistoryScreen} options={HistoryStyles} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const HomeStyles: NativeStackNavigationOptions = {
  title: "My Mood Tracker",
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#F7F4F2',
  },
  headerTitleStyle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2D2D',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  headerShadowVisible: true,
  headerTintColor: '#10B981',
};

const HistoryStyles: NativeStackNavigationOptions = {
  title: "Mood History",
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#F7F4F2',
  },
  headerTitleStyle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2D2D',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  headerShadowVisible: true,
  headerTintColor: '#EF4444',
  headerBackButtonDisplayMode: "minimal",
};