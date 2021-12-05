import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, Text, Animated } from 'react-native'
import { IconButton } from '../components'

const MenuBar = (
  {
    onHandleProfile,
    onHandleScores,
    onHandleInventory,
    onHandleCrafting,
    inventoryNotificaitons,
    newItems,
  },
  props
) => {
  const [profileNotifications, setProfileNotifications] = useState(0)

  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: 'auto',
      }}
    >
      <IconButton
        name="account-outline"
        size={32}
        color="#000"
        onPress={onHandleProfile}
        visible={false}
      />
      <IconButton
        name="trophy-variant-outline"
        size={32}
        color="#000"
        onPress={onHandleScores}
        visible={false}
      />
      <IconButton
        name="view-grid-outline"
        size={32}
        color="#000"
        onPress={onHandleInventory}
        notifications={inventoryNotificaitons}
      />
      <IconButton
        name="pickaxe"
        size={32}
        color="#000"
        onPress={onHandleCrafting}
      />
    </View>
  )
}

const styles = StyleSheet.create({})

export default MenuBar
