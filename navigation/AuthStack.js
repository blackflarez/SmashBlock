import React from 'react'
import { Platform } from 'react-native'
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack'
import LoginScreen from '../screens/LoginScreen'
import SignupScreen from '../screens/SignupScreen'

const Stack = createStackNavigator()
var animation = true

if (Platform.OS === 'web') {
  animation = false
}

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        gestureEnabled: true,
        animationEnabled: animation,
        gestureDirection: 'horizontal',
        gestureResponseDistance: 700,
        title: '',
        headerBackTitleVisible: false,
        headerTintColor: 'black',
        headerStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          headerShown: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  )
}
