import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from 'react-native'
import { IconButton } from '../components'
import { Firebase, Database } from '../config/firebase'
import Canvas from '../components/Canvas'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'

let flag = false

export default function HomeScreen({ navigation }) {
  const auth = Firebase.auth()
  const [myText, setMyText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useContext(AuthenticatedUserContext)
  const [userData, setUserData] = useState({
    name: '',
    balance: 0,
    strength: 1,
    strengthPrice: 10,
    automation: 0,
    automationPrice: 5,
    timeOffline: 0,
  })

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      flag = false
    } catch (error) {
      console.log(error)
    }
  }

  const handleScores = async () => {
    try {
      navigation.navigate('Scores')
      flag = false
    } catch (error) {
      console.log(error)
    }
  }

  async function init() {
    let data = await Firebase.database()
      .ref(`users/${user.uid}`)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.val().userData)
          console.log(userData)
          setMyText(userData.balance)
          setIsLoading(false)
        } else {
          console.log('No data available')
          userData.name = user.uid
          setIsLoading(false)
        }
      })
  }

  async function click() {
    userData.balance += userData.strength
    console.log(userData.balance)
    setMyText(userData.balance)
    await Firebase.database().ref(`users/${user.uid}`).set({ userData })
  }

  if (flag === false) {
    init()
    flag = true
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
        }}
      ></View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark-content" />
      <View style={styles.row}>
        <Text style={styles.title}>Welcome {user.email}!</Text>
        <IconButton
          name="linechart"
          size={24}
          color="#fff"
          onPress={handleScores}
        />
        <IconButton
          name="logout"
          size={24}
          color="#fff"
          onPress={handleSignOut}
        />
      </View>
      <Text style={styles.title}> Clicks: {myText}</Text>
      <View style={styles.canvas}>
        <Canvas click={click} />
      </View>
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
