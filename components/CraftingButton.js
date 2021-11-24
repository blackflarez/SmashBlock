import React, { useState, useEffect } from 'react'
import { Pressable, StyleSheet, View, Text } from 'react-native'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { Badge } from 'react-native-paper'
import { Amount, ItemIcon } from '../components'

const CraftingButton = (
  {
    color,
    size,
    onPress,
    name,
    amount,
    visible,
    notifications,
    colour,
    description,
    recipe,
    inventory,
  },
  props
) => {
  const [craftable, setCraftable] = useState(false)
  const [recipeString, setRecipeString] = useState()

  useEffect(() => {
    function init() {
      if (notifications > 0) {
        visible = true
      } else {
        visible = false
      }

      let list = []
      for (let i in recipe) {
        let total = 0
        try {
          total = inventory.find((e) => e.name === i).amount
        } catch (err) {}

        setCraftable(total > recipe[i])

        list.push(
          <Text style={{ color: '#fff', fontSize: 12, margin: 1 }} key={i}>
            {Amount(total)}/{Amount(recipe[i])}{' '}
            {i.charAt(0).toUpperCase() + i.slice(1)}
          </Text>
        )
      }
      setRecipeString(list)
    }
    init()
  }, inventory)

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
          <ItemIcon name={name} />
        </View>
        <View style={{ position: 'absolute', left: 65, top: 42 }}>
          <Text style={{ ...props.style, marginTop: -20, fontSize: 18 }}>
            {name}
          </Text>
          <Text style={{ fontSize: 10 }}>{description}</Text>
        </View>
        <View style={{ position: 'absolute', left: 20, top: 50 }}></View>
        <Pressable
          style={(args) => {
            if (args.pressed) {
              return [
                styles.base,
                {
                  opacity: craftable ? 0.5 : 1,
                  backgroundColor: craftable ? 'green' : 'gray',
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
                backgroundColor: craftable ? 'green' : 'gray',
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
