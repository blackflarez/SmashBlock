import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef } from 'react'
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
import * as Haptics from 'expo-haptics'

const blocks = [
  {
    name: 'gold',
    health: 10,
    colour: 'darkgoldenrod',
  },
  { name: 'stone', health: 5, colour: 'grey' },
]

export default function HomeScreen({ navigation }) {
  const canvas = useRef()
  const auth = Firebase.auth()
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useContext(AuthenticatedUserContext)
  const [name, setName] = useState('')
  const [gold, setGold] = useState(0)
  const [stone, setStone] = useState(0)
  const [strength, setStrength] = useState(1)
  const [strengthPrice, setStrengthPrice] = useState(10)
  const [automation, setAutomation] = useState(0)
  const [automationPrice, setAutomationPrice] = useState(5)
  const [timeOffline, setTimeOffline] = useState(0)

  function haptics(style) {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style)
    }
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.log(error)
    }
  }

  const handleScores = async () => {
    try {
      haptics(Haptics.ImpactFeedbackStyle.Light)
      navigation.navigate('Scores')
    } catch (error) {
      console.log(error)
    }
  }

  const handleInventory = async () => {
    try {
      haptics(Haptics.ImpactFeedbackStyle.Light)
      navigation.navigate('Inventory')
    } catch (error) {
      console.log(error)
    }
  }

  async function setDatabase() {
    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory/gold`)
      .set(gold)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory/stone`)
      .set(stone)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/strength`)
      .set(strength)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/name`)
      .set(user.uid)
  }

  useEffect(() => {
    async function init() {
      await Firebase.database()
        .ref(`users/${user.uid}`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            setGold(snapshot.val().userData.inventory.gold)
            setStone(snapshot.val().userData.inventory.gold)
          } else {
            console.log('No data available')
            setDatabase()
          }
          setIsLoading(false)
        })
    }
    init()
  }, [])

  async function updateBalance(type) {
    if (type === 'gold') {
      setGold(gold + strength)
      await Firebase.database().ref(`scores/${user.uid}/score`).set(gold)
      await Firebase.database().ref(`scores/${user.uid}/name`).set(user.uid)
    }
    if (type === 'stone') {
      setStone(stone + strength)
    }
    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory/${type}`)
      .set(eval(type))
  }

  async function generateBlock() {
    canvas.current.setFromOutside(
      blocks[Math.floor(Math.random() * blocks.length)]
    )
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
      <StatusBar style="light-content" />
      <View style={styles.row}>
        <IconButton
          name="logout"
          size={32}
          color="#000"
          onPress={handleSignOut}
        />
        <IconButton
          name="linechart"
          size={32}
          color="#000"
          onPress={handleScores}
        />
        <IconButton
          name="wallet"
          size={32}
          color="#000"
          onPress={handleInventory}
        />
      </View>
      <View style={styles.canvas}>
        <Canvas click={updateBalance} generate={generateBlock} ref={canvas} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 650,
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
    zIndex: 1,
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
    width: '100%',
    height: '100%',
    zIndex: -1,
    position: 'absolute',
  },
})
