import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";

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

const HomeStyles: NativeStackNavigationOptions = { title: "My Mood Tracker", headerTitleAlign: 'center', headerTintColor: 'blue', };
const HistoryStyles: NativeStackNavigationOptions = { title: "History", headerTitleAlign: 'center', headerTintColor: 'red', headerBackButtonDisplayMode: "minimal" }