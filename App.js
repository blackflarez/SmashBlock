import React from 'react'
import { StatusBar } from 'react-native'
import Routes from './navigation/index'
import { LogBox } from 'react-native'

//LogBox.ignoreAllLogs()

StatusBar.setBarStyle('light-content', true)

export default function App() {
  return <Routes />
}
