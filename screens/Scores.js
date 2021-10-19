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

export default function HomeScreen({ navigation }) {
  const [leaderboard, setLeaderboard] = useState([])
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
        .ref(`scores`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            var scores = []
            snapshot.forEach(function (childNodes) {
              scores.push(
                childNodes.val().score + ' - ' + childNodes.val().name + '\n'
              )
            })
            setLeaderboard(scores)
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
      <IconButton name="left" size={24} color="#fff" onPress={handleBack} />
      <Text style={styles.title}>Leaderboard</Text>
      <Text> </Text>
      <Text style={styles.text}>{leaderboard}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    color: '#fff',
  },
  text: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#fff',
  },
  button: {
    backgroundColor: '#000',
    padding: 30,
    borderColor: '#fff',
    borderWidth: 1,
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  canvas: {
    width: 250,
    height: 400,
    margin: 50,
  },
})
