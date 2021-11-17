import React from 'react'
import { Platform } from 'react-native'
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack'
import HomeScreen from '../screens/HomeScreen'
import Scores from '../screens/Scores'
import Inventory from '../screens/Inventory'
import Profile from '../screens/Profile'
import Crafting from '../screens/Crafting'
import { AntDesign } from '@expo/vector-icons'

const Stack = createStackNavigator()
var animation = true

if (Platform.OS === 'web') {
  animation = false
}

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animationEnabled: animation,
        gestureDirection: 'vertical',
        gestureResponseDistance: 800,
        title: '',
        headerBackTitleVisible: false,
        headerBackImage: () => (
          <AntDesign name={'down'} size={24} style={{ padding: 24 }} />
        ),
        headerTintColor: 'black',
        headerStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Scores"
        component={Scores}
        options={{
          headerShown: true,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <Stack.Screen
        name="Inventory"
        component={Inventory}
        options={{
          headerShown: true,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: true,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <Stack.Screen
        name="Crafting"
        component={Crafting}
        options={{
          headerShown: true,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
    </Stack.Navigator>
  )
}
