import React from 'react'
import { Image, StyleSheet } from 'react-native'
import Assets from '../components/Assets'

const ItemIcon = ({ name, size, shadowOffset = 1 }, props) => {
  return (
    <Image
      source={Assets.icons[name]}
      style={{
        ...props.style,
        width: size,
        height: size,
        alignSelf: 'center',
      }}
    />
  )
}

export default ItemIcon
