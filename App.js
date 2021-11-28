import React from 'react'
import { StatusBar } from 'react-native'
import Routes from './navigation/index'
import { LogBox } from 'react-native'
import 'intl'
import 'intl/locale-data/jsonp/en'

LogBox.ignoreAllLogs()

StatusBar.setBarStyle('light-content', true)

export default function App() {
  return <Routes />
}
