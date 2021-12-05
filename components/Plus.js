import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, Text, Animated } from 'react-native'

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
        toValue: coordinates.y - 175,
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
        ...props.style,
        justifyContent: 'center',
        opacity: fadeAnim,
        top: riseAnim,
        width: 300,
        position: 'absolute',
        left: horizontalPosition - 250,
      }}
    >
      <Text
        style={{
          ...props.style,
          color: currentBlockColour,
          fontSize: 26,
          fontWeight: '400',
        }}
      >
        +{amount} {currentBlock}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({})

export default Plus
