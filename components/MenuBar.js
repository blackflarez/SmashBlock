import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, Text, Animated } from 'react-native'
import { IconButton } from '../components'

const MenuBar = (
  {
    onHandleProfile,
    onHandleScores,
    onHandleInventory,
    onHandleCrafting,
    onHandleFurnace,
    inventoryNotificaitons,
    furnaceNotifications,
    menuVisible,
  },
  props
) => {
  const [profileNotifications, setProfileNotifications] = useState(0)
  if (!menuVisible) {
    return null
  } else {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignContent: 'stretch',
        }}
      >
        <IconButton
          name='book'
          size={32}
          color='#212529'
          onPress={onHandleProfile}
          visible={false}
          containerStyle={{ margin: 10 }}
          image={true}
        />
        <IconButton
          name='trophy'
          size={32}
          color='#212529'
          onPress={onHandleScores}
          visible={false}
          containerStyle={{ margin: 10 }}
          image={true}
        />
        <IconButton
          name='craft'
          size={32}
          color='#212529'
          onPress={onHandleCrafting}
          containerStyle={{ margin: 10 }}
          image={true}
        />
        <IconButton
          name='bag'
          size={32}
          color='#212529'
          onPress={onHandleInventory}
          notifications={inventoryNotificaitons}
          containerStyle={{ margin: 10 }}
          image={true}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({})

export default MenuBar
