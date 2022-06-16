import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Badge } from 'react-native-paper'
import { ImageIcon } from '../components'

const ImageButton = ({
  color,
  size,
  onPress,
  name,
  visible,
  notifications,
  containerStyle,
  borderRadius = 25,
  borderSize = 50,
  buttonDisabled,
  backgroundColor = 'rgba(256, 256, 256, 0.9)',
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
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 10,
              },
              containerStyle,
            ]
          }}
          onPress={() => {
            onPress()
          }}
        >
          <ImageIcon name={name} size={60} />
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

export default ImageButton
