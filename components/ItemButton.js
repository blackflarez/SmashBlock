import React from 'react'
import { Pressable, StyleSheet, View, Text } from 'react-native'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { Badge } from 'react-native-paper'

const ItemButton = (
  { color, size, onPress, name, amount, visible, notifications, colour },
  props
) => {
  if (notifications > 0) {
    visible = true
  } else {
    visible = false
  }
  let c

  if (colour === 'iron') {
    c = 'slategray'
  } else if (colour === 'stone') {
    c = 'gray'
  } else if (colour === 'gold') {
    c = 'gold'
  } else if (colour === 'wood') {
    c = 'saddlebrown'
  }
  return (
    <View>
      <Pressable
        style={(args) => {
          if (args.pressed) {
            return [
              styles.base,
              {
                opacity: 0.5,
                backgroundColor: '#fff',
                borderRadius: 10,
                width: 80,
                height: 80,
              },
            ]
          }

          return [
            styles.base,
            {
              opacity: 1,
              backgroundColor: '#fff',
              borderRadius: 10,
              width: 80,
              height: 80,
            },
          ]
        }}
        onPress={onPress}
      >
        <Text style={{ ...props.style, marginTop: -15, color: c }}>{name}</Text>
        <Ionicons name={'cube'} size={32} color={c} />

        <Badge
          visible={true}
          size={20}
          style={{
            ...props.style,
            color: c,
            backgroundColor: 'transparent',
            position: 'absolute',
            top: 55,
            right: 5,
            fontSize: 12,
          }}
        >
          {amount}
        </Badge>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
})

export default ItemButton
