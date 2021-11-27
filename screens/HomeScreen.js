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
import { InputField, ErrorMessage, Plus, MenuBar, Items } from '../components'
import { Firebase } from '../config/firebase'
import Canvas from '../components/Canvas'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'

export default function HomeScreen({ navigation }, props) {
  const canvas = useRef()
  const auth = Firebase.auth()
  const [isLoading, setIsLoading] = useState(true)
  const [firstTimeDialog, setFirstTimeDialog] = useState(true)
  const [userTakenError, setUserTakenError] = useState('')
  const { user } = useContext(AuthenticatedUserContext)
  const [name, setName] = useState('')
  const [inventory, setInventory] = useState({})
  const [inventoryNotificaitons, setInventoryNotificaitons] = useState(0)
  const [currentTool, setCurrentTool] = useState({ strength: 1, efficiency: 1 })
  const [blocks, setBlocks] = useState(Items.blocks)
  const [plusses, setPlusses] = useState([])
  const introFadeAnim = useRef(new Animated.Value(0)).current

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

  const handleInventory = async () => {
    try {
      setInventoryNotificaitons(0)
      navigation.navigate('Inventory')
    } catch (error) {
      console.log(error)
    }
  }

  const handleProfile = async () => {
    try {
      navigation.navigate('Profile')
    } catch (error) {
      console.log(error)
    }
  }

  const handleCrafting = async () => {
    try {
      navigation.navigate('Crafting')
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
      .ref(`users/${user.uid}/userData/currentTool`)
      .set(currentTool)
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
            setCurrentTool(snapshot.val().userData.currentTool)
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

  async function updateBalance(block, bonus) {
    var amount = currentTool.efficiency * bonus

    setInventoryNotificaitons(
      (inventoryNotificaitons) =>
        inventoryNotificaitons + currentTool.efficiency
    )

    setPlusses((plusses) => [
      ...plusses,
      <Plus
        currentBlockColour={block.colour}
        amount={amount}
        bonus={bonus}
        currentBlock={block.name}
        key={Math.random(1000)}
      />,
    ])

    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(`${block.name}`)
      .set(Firebase.firebase_.database.ServerValue.increment(amount))

    if (block.name === 'Gold') {
      await Firebase.database().ref(`scores/${user.uid}/name`).set(`${name}`)
    }
  }

  function generateBlock() {
    let chance = Math.random() * 100
    let block = blocks[Math.floor(Math.random() * blocks.length)]
    if (block.probability > chance) {
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
          position: 'absolute',
          bottom: 50,
        }}
      >
        <MenuBar
          onHandleInventory={handleInventory}
          onHandleCrafting={handleCrafting}
          onHandleProfile={handleProfile}
          onHandleScores={handleScores}
          inventoryNotificaitons={inventoryNotificaitons}
        ></MenuBar>
      </Animated.View>
      <View style={{ flex: 1 }}>{plusses}</View>

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
