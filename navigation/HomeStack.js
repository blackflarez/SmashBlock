import React from 'react'
import { Platform } from 'react-native'
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack'
import HomeScreen from '../screens/HomeScreen'
import Scores from '../screens/Scores'
import Inventory from '../screens/Inventory'
import Profile from '../screens/Profile'
import Crafting from '../screens/Crafting'
import Furnace from '../screens/Furnace'
import Settings from '../screens/Settings'
import { AntDesign } from '@expo/vector-icons'
import { Font } from '../components'

const Stack = createStackNavigator()

var transparent = 'transparent'
var animation = true

if (Platform.OS === 'android') {
  transparent = '#fff'
}
if (Platform.OS === 'web') {
  animation = false
}

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        detachPreviousScreen: false,
        headerShown: false,
        headerTransparent: true,
        gestureEnabled: true,
        gestureDirection: 'vertical',
        animationEnabled: animation,
        gestureResponseDistance: 200,
        headerBackTitleVisible: false,
        headerBackImage: () => (
          <AntDesign name={'down'} size={24} style={{ padding: 15 }} />
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
          title: <Font>Skills</Font>,
          headerShown: true,
          headerTitleStyle: {
            fontSize: 22,
            marginTop: 10,
          },
          headerShown: true,
          ...TransitionPresets.ModalTransition,
          cardStyle: { backgroundColor: transparent },
        }}
      />
      <Stack.Screen
        name="Inventory"
        component={Inventory}
        options={{
          title: <Font>Inventory</Font>,
          headerShown: true,
          headerTitleStyle: {
            fontSize: 22,
            marginTop: 10,
          },
          ...TransitionPresets.ModalTransition,
          cardStyle: { backgroundColor: transparent, flex: 1 },
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          title: <Font>Profile</Font>,
          headerShown: true,
          headerTitleStyle: {
            fontSize: 22,
            marginTop: 10,
          },
          headerShown: true,
          ...TransitionPresets.ModalTransition,
          cardStyle: { backgroundColor: transparent },
        }}
      />
      <Stack.Screen
        name="Crafting"
        component={Crafting}
        options={{
          title: <Font>Crafting</Font>,
          headerShown: true,
          headerTitleStyle: {
            fontSize: 22,
            marginTop: 10,
          },
          ...TransitionPresets.ModalTransition,
          cardStyle: { backgroundColor: transparent, flex: 1 },
        }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          title: <Font>Settings</Font>,
          headerShown: true,
          headerTitleStyle: {
            fontSize: 22,
            marginTop: 10,
          },
          headerShown: true,
          presentation: 'transparentModal',

          ...TransitionPresets.ModalTransition,
          cardStyle: { backgroundColor: transparent },
        }}
      />
      <Stack.Screen
        name="Furnace"
        component={Furnace}
        options={{
          title: <Font>Furnace</Font>,
          headerShown: true,
          headerTitleStyle: {
            fontSize: 22,
            marginTop: 10,
          },
          headerShown: true,
          presentation: 'transparentModal',

          ...TransitionPresets.ModalTransition,
          cardStyle: { backgroundColor: transparent },
        }}
      />
    </Stack.Navigator>
  )
}
