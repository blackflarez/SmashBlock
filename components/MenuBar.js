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
  },
  props
) => {
  const [profileNotifications, setProfileNotifications] = useState(0)

  return (
    <View
      style={{
        flexDirection: 'row',
      }}
    >
      <IconButton
        name="account-outline"
        size={32}
        color="#212529"
        onPress={onHandleProfile}
        visible={false}
      />
      <IconButton
        name="trophy-variant-outline"
        size={32}
        color="#212529"
        onPress={onHandleScores}
        visible={false}
      />
      <IconButton
        name="fire"
        size={32}
        color="#212529"
        onPress={onHandleFurnace}
        notifications={furnaceNotifications}
      />
      <IconButton
        name="toolbox-outline"
        size={32}
        color="#212529"
        onPress={onHandleCrafting}
      />
      <IconButton
        name="view-grid-outline"
        size={32}
        color="#212529"
        onPress={onHandleInventory}
        notifications={inventoryNotificaitons}
      />
    </View>
  )
}

const styles = StyleSheet.create({})

export default MenuBar
