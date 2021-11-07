import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, Animated, Pressable } from 'react-native'
import { Firebase, Database } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { IconButton } from '../components'

const auth = Firebase.auth()

export default function Inventory({ navigation }, props) {
  const [inventory, setInventory] = useState([])
  const { user } = useContext(AuthenticatedUserContext)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const handleBack = async () => {
    try {
      navigation.navigate('Home')
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    async function init() {
      await Firebase.database()
        .ref(`users/${user.uid}/userData/inventory`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            var items = []
            snapshot.forEach(function (childNodes) {
              if (childNodes.val() > 0) {
                items.push(childNodes.key + ' - ' + childNodes.val() + '\n')
              }
            })
            setInventory(items)
          } else {
            console.log('No data available')
          }

          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start()
        })
    }
    init()
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          ...props.style,
          opacity: fadeAnim, // Bind opacity to animated value
        }}
      >
        <StatusBar style="dark-content" />
        <Text style={styles.title}>Inventory</Text>
        <Text> </Text>
        <Text style={styles.text}>{inventory}</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 250,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  text: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000',
  },
  button: {
    backgroundColor: '#fff',
    padding: 30,
    borderColor: '#000',
    borderWidth: 1,
    margin: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
  },
  canvas: {
    width: 250,
    height: 400,
    margin: 50,
  },
})
