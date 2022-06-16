import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, Platform, Animated } from 'react-native'
import { Font, ItemIcon, Amount } from '../components'

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

const Counters = (
  { currentBlockColour, amount, currentBlock, bonus, coordinates, animate },
  props
) => {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (animate) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start()
    } else {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start()
    }
  }, [])

  return (
    <View>
      <Animated.View
        style={{
          opacity: fadeAnim,
          marginTop: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(256, 256, 256, 0.9)',
              borderRadius: 100,
              borderColor: 'transparent',
              borderWidth: 5,
              shadowOpacity: 0.25,
              shadowRadius: 10,
            }}
          >
            <ItemIcon name={currentBlock} size={30} shadowOffset={2} />
          </View>
          <Font
            style={{
              color: '#fff',
              fontSize: 20,
              paddingLeft: 5,
              paddingRight: 30,
              textShadowColor: 'rgba( 0, 0, 0, 0.5 )',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 1,
              borderColor: 'transparent',
              borderWidth: 5,
            }}
          >
            {new Intl.NumberFormat('en-GB', {
              notation: 'standard',
              compactDisplay: 'short',
            }).format(amount)}
          </Font>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({})

export default Counters
