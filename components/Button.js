import React from 'react'
import { StyleSheet, Pressable, Text } from 'react-native'

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
      <Text style={[styles.text, { color: titleColor, fontSize: titleSize }]}>
        {title}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
  },
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
