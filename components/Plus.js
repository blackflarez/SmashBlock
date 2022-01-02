import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, Platform, Animated } from 'react-native'
import { Font } from '../components'

const Plus = (
  { currentBlockColour, amount, currentBlock, bonus, coordinates },
  props
) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const riseAnim = useRef(new Animated.Value(coordinates.y)).current
  const [horizontalPosition, setHorizontalPosition] = useState(coordinates.x)
  var width = '100%'
  var adjustment = 260

  if (Platform.OS === 'web') {
    width = 1000
    adjustment = 315
  }

  useEffect(() => {
    setHorizontalPosition(coordinates.x)
    Animated.sequence([
      Animated.timing(riseAnim, {
        toValue: coordinates.y - 200,
        duration: 1,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(riseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    ]).start()
  }, [])

  return (
    <View>
      <Animated.View
        style={{
          opacity: fadeAnim,
          top: riseAnim,
          width: width,
          position: 'absolute',
          left: horizontalPosition - adjustment,
        }}
      >
        <Font
          style={{
            color: currentBlockColour,
            fontSize: 26,
            paddingLeft: 30,
            paddingRight: 30,
            textShadowColor: '#fff',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 1,
          }}
        >
          {`+` + amount}
        </Font>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({})

export default Plus
