import React from 'react'
import { Pressable, StyleSheet, View, Platform } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Badge } from 'react-native-paper'
import * as Haptics from 'expo-haptics'

const IconButton = ({
  color,
  size,
  onPress,
  name,
  visible,
  notifications,
  containerStyle,
  borderRadius = 50,
  borderSize = 50,
  buttonDisabled,
}) => {
  if (buttonDisabled) {
    return null
  } else {
    if (notifications > 0) {
      visible = true
    } else {
      visible = false
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
                  backgroundColor: 'rgba(52, 52, 52, 0.4)',
                  borderRadius: borderRadius,
                  width: borderSize,
                  height: borderSize,
                },
                containerStyle,
              ]
            }

            return [
              styles.base,
              {
                opacity: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderRadius: borderRadius,
                width: borderSize,
                height: borderSize,
              },
              containerStyle,
            ]
          }}
          onPress={() => {
            onPress()
          }}
        >
          <MaterialCommunityIcons name={name} size={size} color={color} />
          <Badge
            visible={visible}
            size={20}
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
            }}
          >
            {notifications}
          </Badge>
        </Pressable>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default IconButton
