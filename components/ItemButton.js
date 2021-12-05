import React from 'react'
import { Pressable, StyleSheet, View, Text, Platform } from 'react-native'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { Badge } from 'react-native-paper'
import { Amount, ItemIcon, Font } from '../components'
import * as Haptics from 'expo-haptics'

function haptics(style) {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(style)
  }
}

const ItemButton = (
  {
    color,
    size,
    onPress,
    name,
    amount,
    visible,
    notifications,
    colour,
    margin,
    equipped,
    newItem,
  },
  props
) => {
  if (notifications > 0) {
    visible = true
  } else {
    visible = false
  }
  let c = 'grey'
  let borderWidth = 0
  if (equipped === name) {
    borderWidth = 1.15
  }
  return (
    <View>
      <Pressable
        style={(args) => {
          if (args.pressed) {
            return [
              {
                alignItems: 'center',
                justifyContent: 'center',
                margin: margin,
                opacity: 0.5,
                backgroundColor: '#fff',
                borderRadius: 10,
                borderColor: '#818181',
                borderWidth: borderWidth,
                width: 80,
                height: 80,
              },
            ]
          }

          return [
            {
              alignItems: 'center',
              justifyContent: 'center',
              margin: margin,
              opacity: 1,
              backgroundColor: '#fff',
              borderRadius: 10,
              borderColor: '#818181',
              borderWidth: borderWidth,
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
        <Badge
          visible={newItem}
          size={20}
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
          }}
        >
          New!
        </Badge>
        <ItemIcon name={name} size={60} />

        <Badge
          visible={isNaN(amount) ? false : true}
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
          <Font>{Amount(amount)}</Font>
        </Badge>
      </Pressable>
    </View>
  )
}

export default ItemButton
