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
        shadowColor: '#000',
        shadowOffset: { width: shadowOffset, height: shadowOffset },
        shadowOpacity: 1,
        shadowRadius: 0.05,
        alignSelf: 'center',
      }}
    />
  )
}

export default ItemIcon
