import React from 'react'
import { StyleSheet, Pressable, Text } from 'react-native'
import { Font } from '../components'

const Button = ({
  title,
  backgroundColor = '#fff',
  borderRadius = 10,
  titleColor = '#000',
  titleSize = 14,
  onPress,
  width = '100%',
  containerStyle,
}) => {
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
