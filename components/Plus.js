import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, Text, Animated } from 'react-native'
import { Font } from '../components'

const Plus = (
  { currentBlockColour, amount, currentBlock, bonus, coordinates },
  props
) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const riseAnim = useRef(new Animated.Value(coordinates.y)).current
  const [horizontalPosition, setHorizontalPosition] = useState(coordinates.x)

  useEffect(() => {
    setHorizontalPosition(coordinates.x)
    Animated.sequence([
      Animated.timing(riseAnim, {
        toValue: coordinates.y - 150,
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
    <Animated.View
      style={{
        opacity: fadeAnim,
        top: riseAnim,
        width: '100%',
        position: 'absolute',
        left: horizontalPosition - 260,
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
  )
}

const styles = StyleSheet.create({})

export default Plus
