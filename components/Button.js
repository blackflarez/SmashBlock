import React from 'react'
import { StyleSheet, Pressable, View, ActivityIndicator } from 'react-native'
import { Font } from '../components'

const Button = ({
  title,
  backgroundColor = 'rgba(256, 256, 256, 0.5)',
  borderRadius = 10,
  titleColor = '#000',
  titleSize = 14,
  onPress,
  width = '100%',
  containerStyle,
  pending,
  enabled,
}) => {
  if (pending) {
    return (
      <Pressable
        style={(args) => {
          if (args.pressed) {
            return [
              styles.base,
              {
                opacity: 0.5,
                backgroundColor,
                width,
                borderRadius,
              },
              containerStyle,
            ]
          }

          return [
            styles.base,
            {
              opacity: 1,
              backgroundColor,
              width,
              borderRadius,
            },
            containerStyle,
          ]
        }}
      >
        <View>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Pressable>
    )
  }

  if (enabled) {
    return (
      <Pressable
        onPress={onPress}
        style={(args) => {
          if (args.pressed) {
            return [
              styles.base,
              {
                opacity: 0.5,
                backgroundColor: 'rgba(52, 52, 52, 0.5)',
                width,
                borderRadius,
              },
              containerStyle,
            ]
          }

          return [
            styles.base,
            {
              opacity: 1,
              backgroundColor: 'rgba(52, 52, 52, 0.5)',
              width,
              borderRadius,
            },
            containerStyle,
          ]
        }}
      >
        <Font style={{ color: titleColor, fontSize: titleSize }}>{title}</Font>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      style={(args) => {
        if (args.pressed) {
          return [
            styles.base,
            {
              opacity: 0.5,
              backgroundColor,
              width,
              borderRadius,
            },
            containerStyle,
          ]
        }

        return [
          styles.base,
          {
            opacity: 1,
            backgroundColor,
            width,
            borderRadius,
          },
          containerStyle,
        ]
      }}
    >
      <Font style={{ color: titleColor, fontSize: titleSize }}>{title}</Font>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderRadius: 4,
    paddingHorizontal: 12,
    borderRadius: 0,
  },
})

export default Button
