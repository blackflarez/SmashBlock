import React from 'react'
import { Pressable, StyleSheet, View, Text, Platform } from 'react-native'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { Badge, ProgressBar } from 'react-native-paper'
import { Amount, ItemIcon } from '../components'
import * as Haptics from 'expo-haptics'

function haptics(style) {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(style)
  }
}

const EquippedButton = (
  {
    size,
    onPress,
    name,
    amount,
    visible,
    notifications,
    colour,
    margin,
    health,
  },
  props
) => {
  if (notifications > 0) {
    visible = true
  } else {
    visible = false
  }
  let c = 'grey'
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
                backgroundColor: 'rgba(52, 52, 52, 0.4)',
                borderRadius: 10,
                width: 70,
                height: 70,
              },
            ]
          }

          return [
            {
              alignItems: 'center',
              justifyContent: 'center',
              margin: margin,
              opacity: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 10,
              width: 70,
              height: 70,
            },
          ]
        }}
        onPress={() => {
          onPress()
          haptics(Haptics.ImpactFeedbackStyle.Light)
        }}
      >
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
          {Amount(amount)}
        </Badge>
        <ProgressBar
          progress={health}
          color={'green'}
          style={{ width: 60, borderRadius: 10 }}
          visible={false}
        />
      </Pressable>
    </View>
  )
}

export default EquippedButton
