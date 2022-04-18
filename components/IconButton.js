import React from 'react'
import { Pressable, StyleSheet, View, Platform } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Badge } from 'react-native-paper'
import { ImageIcon } from '../components'

const IconButton = ({
  color,
  size,
  onPress,
  name,
  visible,
  notifications,
  containerStyle,
  borderRadius = 20,
  borderSize = 60,
  buttonDisabled,
  image,
  backgroundColor = 'rgba(0, 0, 0, 0.4)',
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
                  borderRadius: borderRadius,
                  width: borderSize,
                  height: borderSize,
                  borderColor: '#BFCBD7',
                  borderWidth: 0,
                  backgroundColor: backgroundColor,
                },
                containerStyle,
              ]
            }

            return [
              styles.base,
              {
                opacity: 1,
                borderRadius: borderRadius,
                width: borderSize,
                height: borderSize,
                borderColor: '#BFCBD7',
                borderWidth: 0,
                backgroundColor: backgroundColor,
              },
              containerStyle,
            ]
          }}
          onPress={() => {
            onPress()
          }}
        >
          {image ? (
            <ImageIcon name={name} size={50} />
          ) : (
            <MaterialCommunityIcons name={name} size={size} color={color} />
          )}
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
