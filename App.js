import React from 'react'
import { StatusBar } from 'react-native'
import Routes from './navigation/index'

StatusBar.setBarStyle('light-content', true)

export default function App() {
  return <Routes />
}
