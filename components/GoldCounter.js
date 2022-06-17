import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, Platform, Animated } from 'react-native'
import { Font, ItemIcon, Amount } from '../components'

const GoldCounter = (
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

export default GoldCounter
