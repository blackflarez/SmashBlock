import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, Platform, Animated } from 'react-native'
import { Font, ItemIcon } from '../components'

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
        <View style={{ flexDirection: 'row', alignContent: 'center' }}>
          <ItemIcon name={currentBlock} size={35} />
          <Font
            style={{
              color: currentBlockColour,
              fontSize: 35,
              paddingLeft: 5,
              paddingRight: 30,
              textShadowColor: '#fff',
              textShadowOffset: { width: 1, height: 1 },
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
