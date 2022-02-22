import React from 'react'
import { Image, StyleSheet } from 'react-native'
import Assets from '../components/Assets'

const ItemIcon = ({ name, size }, props) => {
  return (
    <Image
      source={Assets.icons[name]}
      style={{
        ...props.style,
        width: size,
        height: size,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        alignSelf: 'center',
      }}
    />
  )
}

export default ItemIcon
