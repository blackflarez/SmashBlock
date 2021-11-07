import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from 'react-native'
import { Firebase, Database } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { IconButton } from '../components'

const auth = Firebase.auth()

export default function Inventory({ navigation }) {
  const [inventory, setInventory] = useState([])
  const { user } = useContext(AuthenticatedUserContext)

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
        })
    }
    init()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="dark-content" />
      <IconButton name="left" size={24} color="#000" onPress={handleBack} />
      <Text style={styles.title}>Inventory</Text>
      <Text> </Text>
      <Text style={styles.text}>{inventory}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
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
