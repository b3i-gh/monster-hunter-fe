import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CanListScreen from "./screens/CanListScreen";
import AddCanScreen from "./screens/AddCanScreen";
import CanDetailsScreen from "./screens/CanDetailsScreen";

const Stack = createStackNavigator();

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CanListScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="CanListScreen" component={CanListScreen} />
        <Stack.Screen name="AddCanScreen" component={AddCanScreen} />
        <Stack.Screen name="CanDetailsScreen" component={CanDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </GestureHandlerRootView>
);

export default App;
