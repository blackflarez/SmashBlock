import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import HomeScreen from '../screens/HomeScreen'
import Scores from '../screens/Scores'
import Inventory from '../screens/Inventory'

const Stack = createStackNavigator()

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Scores" component={Scores} />
      <Stack.Screen name="Inventory" component={Inventory} />
    </Stack.Navigator>
  )
}
