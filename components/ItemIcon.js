import React from 'react'
import { Image, StyleSheet } from 'react-native'
import Assets from '../components/Assets'

export default function ItemIcon(name) {
  return <Image source={Assets.icons[name.name]} style={styles.image} />
}

const styles = StyleSheet.create({
  image: {
    width: 60,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
})
