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

  const handleSignOut = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.log(error)
    }
  }

  const handleScores = async () => {
    try {
      navigation.navigate('Scores')
    } catch (error) {
      console.log(error)
    }
  }

  async function setDatabase() {
    await Firebase.database().ref(`users/${user.uid}/userData/gold`).set(gold)
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
            setGold(snapshot.val().userData.gold)
            setStone(snapshot.val().userData.stone)
            setStrength(snapshot.val().userData.strength)
            setStrengthPrice(snapshot.val().userData.strengthPrice)
            setAutomation(snapshot.val().userData.automation)
            setAutomationPrice(snapshot.val().userData.automationPrice)
            setTimeOffline(snapshot.val().userData.timeOffline)
          } else {
            console.log('No data available')
            setDatabase()
          }
          setIsLoading(false)
        })
    }
    init()
  }, [])

  async function updateBalance(type, isBonus) {
    let bonus = 0
    if (isBonus) {
      bonus = strength
    }
    await Firebase.database()
      .ref(`users/${user.uid}/userData/${type}`)
      .set(eval(type))
    if (type === 'gold') {
      setGold(gold + strength + bonus)
      await Firebase.database().ref(`scores/${user.uid}/score`).set(gold)
      await Firebase.database().ref(`scores/${user.uid}/name`).set(user.uid)
    }
    if (type === 'stone') {
      setStone(stone + strength + bonus)
    }
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
      <Text style={styles.title}> Gold: {gold}</Text>
      <Text style={styles.title}> Stone: {stone}</Text>
      <View style={styles.canvas}>
        <Canvas click={updateBalance} generate={generateBlock} ref={canvas} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 650,
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
    zIndex: 1,
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
    width: '100%',
    height: '100%',
    zIndex: -1,
    position: 'absolute',
  },
})
