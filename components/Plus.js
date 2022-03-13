import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, Platform, Animated } from 'react-native'
import { Font, ItemIcon } from '../components'

function increaseBrightness(hex, percent) {
  hex = hex.replace(/^\s*#|\s*$/g, '')
  if (hex.length == 3) {
    hex = hex.replace(/(.)/g, '$1$1')
  }
  var r = parseInt(hex.substr(0, 2), 16),
    g = parseInt(hex.substr(2, 2), 16),
    b = parseInt(hex.substr(4, 2), 16)
  return (
    '#' +
    (0 | ((1 << 8) + r + ((256 - r) * percent) / 100)).toString(16).substr(1) +
    (0 | ((1 << 8) + g + ((256 - g) * percent) / 100)).toString(16).substr(1) +
    (0 | ((1 << 8) + b + ((256 - b) * percent) / 100)).toString(16).substr(1)
  )
}

const Plus = (
  { currentBlockColour, amount, currentBlock, bonus, coordinates },
  props
) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const riseAnim = useRef(new Animated.Value(coordinates.y)).current
  const [horizontalPosition, setHorizontalPosition] = useState(coordinates.x)
  var width = 500
  var adjustment = 260

  if (Platform.OS === 'web') {
    width = 1000
    adjustment = 260
  }

  useEffect(() => {
    setHorizontalPosition(coordinates.x)
    Animated.sequence([
      Animated.timing(riseAnim, {
        toValue: coordinates.y - 300,
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
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
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
          position: 'absolute',
          left: horizontalPosition - adjustment,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignContent: 'center',
          }}
        >
          <ItemIcon name={currentBlock} size={55} shadowOffset={2} />
          <Font
            style={{
              color: increaseBrightness(currentBlockColour, 50),
              fontSize: 42,
              paddingLeft: 5,
              paddingRight: 30,
              textShadowColor: 'rgba( 0, 0, 0, 0.5 )',
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 1,
            }}
          >
            {`+` + amount}
          </Font>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({})

export default Plus
