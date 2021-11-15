import React from 'react'
import { Pressable, StyleSheet, View, Text } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { Badge } from 'react-native-paper'

const ItemButton = ({
  color,
  size,
  onPress,
  name,
  amount,
  visible,
  notifications,
}) => {
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
        <AntDesign name={'CodeSandbox'} size={32} color={name} />

        <Badge
          visible={true}
          size={20}
          style={{
            color: '#000',
            backgroundColor: 'transparent',
            position: 'absolute',
            top: 55,
            right: 5,
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
