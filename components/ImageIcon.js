import React from 'react'
import { Image, StyleSheet } from 'react-native'
import Assets from './Assets'

const ImageIcon = ({ name, size, shadowOffset = 1 }, props) => {
  return (
    <Image
      source={Assets.ui[name]}
      style={{
        ...props.style,
        width: size,
        height: size,
        alignSelf: 'center',
      }}
    />
  )
}

export default ImageIcon
