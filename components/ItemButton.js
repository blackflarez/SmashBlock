import React from 'react'
import { Pressable, StyleSheet, View, Text, Platform } from 'react-native'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { Badge } from 'react-native-paper'
import { Amount, ItemIcon } from '../components'
import * as Haptics from 'expo-haptics'

function haptics(style) {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(style)
  }
}

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
        onPress={() => {
          onPress()
          haptics(Haptics.ImpactFeedbackStyle.Light)
        }}
      >
        <Text
          style={{ ...props.style, color: c, position: 'absolute', top: 1 }}
        >
          {name}
        </Text>
        <ItemIcon name={name} />

        <Badge
          visible={true}
          size={20}
          style={{
            ...props.style,
            color: c,
            backgroundColor: 'transparent',
            position: 'absolute',
            top: 60,
            right: 3,
            fontSize: 12,
          }}
        >
          {Amount(amount)}
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
