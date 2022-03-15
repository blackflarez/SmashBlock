import React, { useContext, useState, useEffect } from 'react'
import { Pressable, StyleSheet, View, Text, Platform } from 'react-native'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { Badge, ProgressBar } from 'react-native-paper'
import { Amount, ItemIcon, Font } from '../components'
import * as Haptics from 'expo-haptics'
import { Firebase, Database } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'

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
  const { user } = useContext(AuthenticatedUserContext)
  const [equippedDurability, setEquippedDurability] = useState(null)

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

  useEffect(async () => {
    await Firebase.database()
      .ref(`users/${user.uid}/userData/durability/${name}`)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          setEquippedDurability(snapshot.val() / 10000)
        }
      })
  }, [])

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
                backgroundColor: 'rgba(256, 256, 256, 0.5)',
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
              backgroundColor: 'rgba(256, 256, 256, 0.5)',
              borderRadius: 10,
              borderColor: '#818181',
              borderWidth: borderWidth,
              width: 80,
              height: 80,
            },
          ]
        }}
        onPress={
          isNaN(amount) || amount === 0 || amount === null
            ? null
            : () => {
                onPress()
              }
        }
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
        {name !== null ? <ItemIcon name={name} size={60} /> : null}
        <ProgressBar
          visible={equippedDurability}
          progress={equippedDurability}
          color={[
            'hsl(',
            (equippedDurability * 100).toString(10),
            ',100%,50%)',
          ].join('')}
          style={{
            width: 55,
            borderRadius: 10,
            top: 1,
            right: -28,
            position: 'absolute',
          }}
        />
        <Badge
          visible={
            isNaN(amount) || amount === 0 || amount === null ? false : true
          }
          size={20}
          style={{
            ...props.style,
            color: c,
            backgroundColor: 'transparent',
            position: 'absolute',
            bottom: 60,
            right: 1,
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
