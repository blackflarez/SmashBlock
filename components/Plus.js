import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, Text, Animated } from 'react-native'

const Plus = ({ currentBlockColour, amount, currentBlock, bonus }, props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const riseAnim = useRef(new Animated.Value(600)).current
  const [horizontalPosition, setHorizontalPosition] = useState(-50)

  useEffect(() => {
    setHorizontalPosition(
      (horizontalPosition) =>
        (horizontalPosition = Math.random() * (-55 - -60) + -55)
    )
    Animated.sequence([
      Animated.timing(riseAnim, {
        toValue: 600,
        duration: 1,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(riseAnim, {
          toValue: 700,
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
        bottom: riseAnim,
        width: 300,
        position: 'absolute',
        left: horizontalPosition,
      }}
    >
      <Text
        style={{
          ...props.style,
          color: currentBlockColour,
          fontSize: 26,
        }}
      >
        +{amount} {currentBlock}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({})

export default Plus
