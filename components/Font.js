import React from 'react'
import { Text, StyleSheet, Platform } from 'react-native'
import { useFonts, McLaren_400Regular } from '@expo-google-fonts/mclaren'

const Font = (props) => {
  let [fontsLoaded] = useFonts({
    McLaren_400Regular,
  })
  if (!fontsLoaded) {
    return null
  } else {
    return <Text style={[props.style, styles.font]}>{props.children}</Text>
  }
}
export default Font

const styles = StyleSheet.create({
  font: { fontFamily: 'McLaren_400Regular' },
})
