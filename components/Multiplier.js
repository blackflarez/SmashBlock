import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, StyleSheet, View, Image, Animated } from 'react-native'
import { Font, Assets } from '../components'

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

const Multiplier = ({ amount }, props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: amount / 10,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: amount,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start()
  }, [amount])

  return (
    <View>
      <Animated.View
        style={{
          opacity: fadeAnim,
          alignSelf: 'center',
          alignContent: 'center',
        }}
      >
        <Font
          style={{
            color: [
              'hsl(',
              (-10 * amount + 70).toString(10),
              ',100%,50%)',
            ].join(''),
            fontSize: 32,
            textShadowColor: 'rgba( 0, 0, 0, 0.5 )',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 1,
            position: 'absolute',
            top: 50,
          }}
        >
          {amount > 0 ? `x` + amount : null}
        </Font>
      </Animated.View>

      <Animated.View
        style={{
          opacity: opacityAnim,
          scaleX: 100,
        }}
      >
        <View>
          <Image
            source={Assets.ui.multiplier}
            style={{
              alignSelf: 'stretch',
              position: 'absolute',
              width: Dimensions.get('screen').width,
              height: Dimensions.get('screen').height,
            }}
          />
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({})

export default Multiplier
