import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import EnergyDrinkList from "./screens/EnergyDrinkList";
import AddCanScreen from "./screens/AddCan";

const Stack = createStackNavigator();

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="EnergyDrinkList"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="EnergyDrinkList" component={EnergyDrinkList} />
        <Stack.Screen name="AddCan" component={AddCanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </GestureHandlerRootView>
);

export default App;
