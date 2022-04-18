import React from 'react'
import { Pressable, StyleSheet, View, Text, Platform } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Badge, ProgressBar } from 'react-native-paper'
import { Amount, ItemIcon, ImageIcon } from '../components'
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
    buttonVisible,
    borderRadius = 20,
    borderSize,
    backgroundColor = 'rgba(0, 0, 0, 0.4)',
  },
  props
) => {
  if (!buttonVisible) {
    return null
  } else {
    let c = 'grey'
    if (name && name !== 'Fists') {
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
                    borderRadius: borderRadius,
                    width: borderSize,
                    height: borderSize,
                    borderColor: '#BFCBD7',
                    borderWidth: 0,
                    backgroundColor: backgroundColor,
                  },
                ]
              }

              return [
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: margin,
                  opacity: 1,
                  borderRadius: borderRadius,
                  width: borderSize,
                  height: borderSize,
                  borderColor: '#BFCBD7',
                  borderWidth: 0,
                  backgroundColor: backgroundColor,
                },
              ]
            }}
            onPress={() => {
              onPress()
              haptics(Haptics.ImpactFeedbackStyle.Light)
            }}
          >
            <ItemIcon name={name} size={52} />
            <ProgressBar
              visible={health}
              progress={health}
              color={['hsl(', (health * 100).toString(10), ',100%,50%)'].join(
                ''
              )}
              style={{
                width: 55,
                borderRadius: borderRadius,
                marginBottom: 2,
                marginTop: 2,
              }}
            />
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
          </Pressable>
        </View>
      )
    } else {
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
                    borderRadius: borderRadius,
                    width: borderSize,
                    height: borderSize,
                    borderColor: '#BFCBD7',
                    borderWidth: 0,
                    backgroundColor: backgroundColor,
                  },
                ]
              }

              return [
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: margin,
                  opacity: 1,
                  borderRadius: borderRadius,
                  width: borderSize,
                  height: borderSize,
                  borderColor: '#BFCBD7',
                  borderWidth: 0,
                  backgroundColor: backgroundColor,
                },
              ]
            }}
            onPress={() => {
              onPress()
            }}
          >
            <ImageIcon name={'tool'} size={60} />
          </Pressable>
        </View>
      )
    }
  }
}

export default EquippedButton
