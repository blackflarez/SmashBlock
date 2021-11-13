import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native'
import { InputField, ErrorMessage } from '../components'
import { IconButton } from '../components'
import { Firebase, Database } from '../config/firebase'
import Canvas from '../components/Canvas'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import * as Haptics from 'expo-haptics'
import AudioManager from '../components/AudioManager'

const blocks = [
  {
    name: 'gold',
    health: 15,
    colour: 'darkgoldenrod',
    metal: true,
    probability: 5,
  },
  { name: 'stone', health: 5, colour: 'gray', metal: false, probability: 90 },
  {
    name: 'iron',
    health: 10,
    colour: 'slategray',
    metal: true,
    probability: 50,
  },
]

export default function HomeScreen({ navigation }, props) {
  const canvas = useRef()
  const auth = Firebase.auth()
  const [isLoading, setIsLoading] = useState(true)
  const [firstTimeDialog, setFirstTimeDialog] = useState(true)
  const [userTakenError, setUserTakenError] = useState('')
  const { user } = useContext(AuthenticatedUserContext)
  const [name, setName] = useState('')
  const [inventory, setInventory] = useState({ gold: 0, stone: 0, iron: 0 })
  const [strength, setStrength] = useState(1)
  const [strengthPrice, setStrengthPrice] = useState(10)
  const [automation, setAutomation] = useState(0)
  const [automationPrice, setAutomationPrice] = useState(5)
  const [timeOffline, setTimeOffline] = useState(0)
  const [inventoryNotificaitons, setinventoryNotificaitons] = useState(0)
  const [profileNotifications, setProfileNotifications] = useState(0)
  const [currentBlock, setCurrentBlock] = useState('')
  const [currentBlockColour, setCurrentBlockColour] = useState('gray')
  const introFadeAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const riseAnim = useRef(new Animated.Value(550)).current

  function haptics(style) {
    if (Platform.OS === 'ios') {
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
      setinventoryNotificaitons(0)
      haptics(Haptics.ImpactFeedbackStyle.Light)
      navigation.navigate('Inventory')
    } catch (error) {
      console.log(error)
    }
  }

  const handleProfile = async () => {
    try {
      setProfileNotifications(0)
      haptics(Haptics.ImpactFeedbackStyle.Light)
      navigation.navigate('Profile')
    } catch (error) {
      console.log(error)
    }
  }

  const onHandleUsername = async () => {
    if (name === '' || name === null) {
      setUserTakenError('Please enter a valid username.')
      return
    } else if (name.length >= 10) {
      setUserTakenError('Usernames must be less than 10 characters.')
      return
    } else {
      await Firebase.database()
        .ref(`usernames`)
        .get()
        .then(async (snapshot) => {
          let exists = false
          if (snapshot.exists()) {
            snapshot.forEach(function (childNodes) {
              if (childNodes.val().toLowerCase() === name.toLowerCase()) {
                exists = true
                setUserTakenError('This username is taken.')
              }
            })
          } else {
            console.log('No data available')
          }
          if (exists) {
            return
          } else {
            await Firebase.database()
              .ref(`usernames/${user.uid}`)
              .set(`${name}`)
            await Firebase.database()
              .ref(`users/${user.uid}/userData/name`)
              .set(name)
            setFirstTimeDialog(false)
          }
        })
    }
  }

  async function setDatabase() {
    await Firebase.database()
      .ref(`users/${user.uid}/userData/strength`)
      .set(strength)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .set(inventory)
  }

  useEffect(() => {
    async function init() {
      //AudioManager.setupAsync()
      await Firebase.database()
        .ref(`users/${user.uid}`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            setStrength(snapshot.val().userData.strength)
            setInventory(snapshot.val().userData.inventory)
            setName(snapshot.val().userData.name)
            setFirstTimeDialog(false)
          } else {
            setDatabase()
          }
          setIsLoading(false)
          Animated.timing(introFadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start()
        })
    }
    init()
  }, [])

  async function updateBalance(block) {
    setinventoryNotificaitons(
      (inventoryNotificaitons) => inventoryNotificaitons + strength
    )
    setCurrentBlock(block.name)
    setCurrentBlockColour(block.colour)

    Animated.sequence([
      Animated.timing(riseAnim, {
        toValue: 550,
        duration: 1,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(riseAnim, {
          toValue: 700,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    ]).start()

    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(`${block.name}`)
      .set(Firebase.firebase_.database.ServerValue.increment(strength))

    if (block.name === 'gold') {
      await Firebase.database().ref(`scores/${user.uid}/name`).set(`${name}`)
      await Firebase.database()
        .ref(`scores/${user.uid}/${name}/score`)
        .set(inventory.gold)
    }
  }

  async function generateBlock() {
    let chance = Math.random() * 100
    let block = blocks[Math.floor(Math.random() * blocks.length)]
    if (block.probability > chance) {
      //AudioManager.playAsync('break', false)
      canvas.current.setFromOutside(block)
    } else {
      generateBlock()
    }
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <StatusBar style="dark" />
      </View>
    )
  }

  if (firstTimeDialog) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 50,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar style="dark" />
          <View>
            <Text style={styles.title}>Pick a username</Text>

            <InputField
              inputStyle={{
                fontSize: 14,
              }}
              containerStyle={{
                backgroundColor: '#fff',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#000',
              }}
              leftIcon="account"
              placeholder="Enter username"
              autoCapitalize="none"
              autoFocus={false}
              value={name}
              onChangeText={(text) => setName(text)}
            />
          </View>
          {userTakenError ? (
            <ErrorMessage error={userTakenError} visible={true} />
          ) : null}

          <TouchableOpacity onPress={onHandleUsername} style={styles.button}>
            <Text style={styles.buttonText}>DONE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} style={styles.button}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Animated.View
        style={{
          ...props.style,
          opacity: introFadeAnim,

          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 650,
        }}
      >
        <IconButton
          name="logout"
          size={32}
          color="#000"
          onPress={handleSignOut}
          visible={false}
        />
        <IconButton
          name="user"
          size={32}
          color="#000"
          onPress={handleProfile}
          visible={false}
        />
        <IconButton
          name="linechart"
          size={32}
          color="#000"
          onPress={handleScores}
          visible={false}
        />
        <IconButton
          name="wallet"
          size={32}
          color="#000"
          onPress={handleInventory}
          notifications={inventoryNotificaitons}
        />
      </Animated.View>
      <Animated.View
        style={{
          ...props.style,
          justifyContent: 'center',
          opacity: fadeAnim,
          bottom: riseAnim,
        }}
      >
        <Text
          style={{
            ...props.style,
            color: currentBlockColour,
            fontSize: 26,
          }}
        >
          +{strength} {currentBlock}
        </Text>
      </Animated.View>

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
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    alignSelf: 'center',
    paddingBottom: 24,
    margin: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000',
    zIndex: 1,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#fff',
    padding: 10,
    paddingHorizontal: 125,
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
