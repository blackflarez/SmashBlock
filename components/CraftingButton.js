import React, { useState, useEffect } from 'react'
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { Badge } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Amount, ItemIcon, Font } from '../components'

const CraftingButton = (
  {
    color,
    size,
    onPress,
    onPressLocked,
    name,
    amount,
    visible,
    notifications,
    colour,
    description,
    recipe,
    inventory,
    pending,
    currentItem,
    locked,
  },
  props
) => {
  const [craftable, setCraftable] = useState(true)
  const [recipeString, setRecipeString] = useState()

  useEffect(() => {
    setCraftable(true)
    function init() {
      if (notifications > 0) {
        visible = true
      } else {
        visible = false
      }

      let list = []
      for (let i in recipe) {
        let amount = 0
        try {
          amount = inventory.find((e) => e.name === i).amount
        } catch (err) {}

        if (amount < recipe[i]) {
          setCraftable(false)
        }

        list.push(
          <Font style={{ color: '#fff', fontSize: 12, margin: 1 }} key={i}>
            {Amount(amount)}/{Amount(recipe[i])} {i}
          </Font>
        )
      }
      setRecipeString(list)
    }
    init()
  }, [inventory])

  if (locked) {
    return (
      <View>
        <View
          style={{
            opacity: 1,
            backgroundColor: 'rgba(256, 256, 256, 0.5)',
            borderRadius: 10,
            width: 340,
            height: 80,
            flexDirection: 'row',
            margin: 10,
          }}
        >
          <View style={{ position: 'absolute', top: 10, left: 3 }}>
            <ItemIcon name={name} size={60} />
          </View>
          <View style={{ position: 'absolute', left: 65, top: 42 }}>
            <Font style={{ ...props.style, marginTop: -20, fontSize: 16 }}>
              {name}
            </Font>
            <Font style={{ fontSize: 10 }}>{description}</Font>
          </View>
          <View style={{ position: 'absolute', left: 20, top: 50 }}></View>
          <Pressable
            style={() => {
              return [
                styles.base,
                {
                  opacity: 1,
                  backgroundColor: 'rgba(128, 128, 128, 0.8)',
                  width: 110,
                  height: 65,
                  borderRadius: 10,
                  marginEnd: -42,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  right: 50,
                  top: -13,
                },
              ]
            }}
            onPress={() => {
              if (!pending) {
                onPressLocked()
              }
            }}
          >
            <View>
              <MaterialCommunityIcons name={'lock'} size={32} color={'#fff'} />
            </View>
          </Pressable>

          <Badge
            visible={true}
            size={20}
            style={{
              ...props.style,
              backgroundColor: 'transparent',
              position: 'absolute',
              top: 55,
              right: 5,
              fontSize: 12,
            }}
          >
            {amount}
          </Badge>
        </View>
      </View>
    )
  }

  if (pending && currentItem.name === name) {
    return (
      <View>
        <View
          style={{
            opacity: 1,
            backgroundColor: '#fff',
            borderRadius: 10,
            width: 340,
            height: 80,
            flexDirection: 'row',
            margin: 10,
          }}
        >
          <View style={{ position: 'absolute', top: 10, left: 3 }}>
            <ItemIcon name={name} size={60} />
          </View>
          <View style={{ position: 'absolute', left: 65, top: 42 }}>
            <Font style={{ ...props.style, marginTop: -20, fontSize: 16 }}>
              {name}
            </Font>
            <Font style={{ fontSize: 10 }}>{description}</Font>
          </View>
          <View style={{ position: 'absolute', left: 20, top: 50 }}></View>
          <Pressable
            style={() => {
              return [
                styles.base,
                {
                  opacity: 1,
                  backgroundColor: craftable
                    ? 'rgba(109, 163, 77, 0.8)'
                    : 'rgba(128, 128, 128, 0.8)',
                  width: 110,
                  height: 65,
                  borderRadius: 10,
                  marginEnd: -42,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  right: 50,
                  top: -13,
                },
              ]
            }}
          >
            <View>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          </Pressable>

          <Badge
            visible={true}
            size={20}
            style={{
              ...props.style,
              backgroundColor: 'transparent',
              position: 'absolute',
              top: 55,
              right: 5,
              fontSize: 12,
            }}
          >
            {amount}
          </Badge>
        </View>
      </View>
    )
  }

  return (
    <View>
      <View
        style={{
          opacity: 1,
          backgroundColor: 'rgba(256, 256, 256, 0.5)',
          borderRadius: 10,
          width: 340,
          height: 80,
          flexDirection: 'row',
          margin: 10,
        }}
      >
        <View style={{ position: 'absolute', top: 10, left: 3 }}>
          <ItemIcon name={name} size={60} />
        </View>
        <View style={{ position: 'absolute', left: 65, top: 42 }}>
          <Font style={{ ...props.style, marginTop: -20, fontSize: 16 }}>
            {name}
          </Font>
          <Font style={{ fontSize: 10 }}>{description}</Font>
        </View>
        <View style={{ position: 'absolute', left: 20, top: 50 }}></View>
        <Pressable
          style={(args) => {
            if (args.pressed) {
              return [
                styles.base,
                {
                  opacity: craftable ? 0.5 : 1,
                  backgroundColor: craftable
                    ? 'rgba(109, 163, 77, 0.8)'
                    : 'rgba(128, 128, 128, 0.8)',
                  width: 110,
                  height: 65,
                  borderRadius: 10,
                  marginEnd: -42,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  right: 50,
                  top: -13,
                },
              ]
            }

            return [
              styles.base,
              {
                opacity: 1,
                backgroundColor: craftable
                  ? 'rgba(109, 163, 77, 0.8)'
                  : 'rgba(128, 128, 128, 0.8)',
                width: 110,
                height: 65,
                borderRadius: 10,
                marginEnd: -42,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                right: 50,
                top: -13,
              },
            ]
          }}
          onPress={() => {
            if (craftable && !pending) {
              onPress()
            }
          }}
        >
          <View>{recipeString}</View>
        </Pressable>

        <Badge
          visible={true}
          size={20}
          style={{
            ...props.style,
            backgroundColor: 'transparent',
            position: 'absolute',
            top: 55,
            right: 5,
            fontSize: 12,
          }}
        >
          {amount}
        </Badge>
      </View>
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

export default CraftingButton
