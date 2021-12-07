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
import {
  InputField,
  ErrorMessage,
  Plus,
  MenuBar,
  Items,
  EquippedButton,
} from '../components'
import { Firebase } from '../config/firebase'
import Canvas from '../components/Canvas'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { useFocusEffect } from '@react-navigation/native'

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
  const [newItems, setNewItems] = useState([])
  const [equipped, setEquipped] = useState()
  const [blocks, setBlocks] = useState(Items.filter((o) => o.type === 'block'))
  const [plusses, setPlusses] = useState([])
  const introFadeAnim = useRef(new Animated.Value(0)).current

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true

      const onFocus = async () => {
        setNotifications()
        let item
        try {
          await Firebase.database()
            .ref(`users/${user.uid}/userData/equipped`)
            .get()
            .then((snapshot) => {
              if (snapshot.exists()) {
                item = Items.find((data) => data.name === snapshot.val())
              } else {
                item = {
                  name: 'Wood Pickaxe',
                  strength: 1,
                  efficiency: 1,
                  colour: '#322111',
                }
              }
            })

          if (isActive) {
            setEquipped(item)
            canvas.current.setTool(item)
          }
        } catch (error) {
          console.log(error)
        }
      }

      onFocus()

      return () => {
        isActive = false
      }
    }, [inventory])
  )

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

  const handleInventory = async (f) => {
    let filter
    f ? (filter = f) : (filter = 'all')
    try {
      navigation.navigate('Inventory', { filter: filter })
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
      .ref(`users/${user.uid}/userData/equipped`)
      .set(equipped)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .set(inventory)
  }

  async function setNotifications() {
    await Firebase.database()
      .ref(`users/${user.uid}/userData/newItems`)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          var notifications = 0
          snapshot.forEach(function (childNodes) {
            notifications += 1
          })
          setInventoryNotificaitons(notifications)
        } else {
          setInventoryNotificaitons(0)
        }
      })
  }

  useEffect(() => {
    async function init() {
      //AudioManager.setupAsync()
      await Firebase.database()
        .ref(`users/${user.uid}`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            setInventory(snapshot.val().userData.inventory)
            setName(snapshot.val().userData.name)
            setFirstTimeDialog(false)
          } else {
            setDatabase()
          }
          setIsLoading(false)
          Animated.timing(introFadeAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }).start()
        })
    }
    init()
  }, [])

  async function updateBalance(block, bonus, destroy, coordinates) {
    var amount = Math.ceil(equipped.efficiency * bonus)

    setPlusses((plusses) => [
      ...(plusses.length > 15 ? plusses.splice(plusses.length - 10) : plusses),
      <Plus
        currentBlockColour={block.colour}
        amount={amount}
        bonus={bonus}
        currentBlock={block.name}
        key={Math.random(1000)}
        coordinates={coordinates}
      />,
    ])

    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(`${block.name}`)
      .get()
      .then(async (snapshot) => {
        if (!snapshot.exists()) {
          await Firebase.database()
            .ref(`users/${user.uid}/userData/newItems`)
            .child(`${block.name}`)
            .set(Firebase.firebase_.database.ServerValue.increment(1))
          setNotifications()
        }
      })

    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(`${block.name}`)
      .set(Firebase.firebase_.database.ServerValue.increment(amount))

    if (block.name === 'Gold') {
      await Firebase.database().ref(`scores/${user.uid}/name`).set(`${name}`)
      await Firebase.database()
        .ref(`scores/${user.uid}/score`)
        .set(inventory.Gold)
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
        />
      </Animated.View>
      <Animated.View
        style={{
          opacity: introFadeAnim,
          position: 'absolute',
          top: 60,
          left: 20,
        }}
      >
        <EquippedButton
          name={equipped ? equipped.name : null}
          onPress={() => handleInventory('tool')}
        />
      </Animated.View>
      <View style={{ flex: 1 }}>{plusses}</View>

      <View style={styles.canvas}>
        <Canvas
          equipped={equipped}
          updateBalance={updateBalance}
          generateBlock={generateBlock}
          ref={canvas}
        />
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
    overflow: 'hidden',
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
