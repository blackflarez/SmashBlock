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
  SafeAreaView,
} from 'react-native'
import {
  InputField,
  ErrorMessage,
  Plus,
  MenuBar,
  Items,
  EquippedButton,
  Config,
  IconButton,
} from '../components'
import { Firebase } from '../config/firebase'
import Canvas from '../components/Canvas'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { useFocusEffect } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'

export default function HomeScreen({ navigation }, props) {
  const canvas = useRef()
  const [canvasLoading, setCanvasLoading] = useState(true)
  const auth = Firebase.auth()
  const [isLoading, setIsLoading] = useState(true)
  const [firstTimeDialog, setFirstTimeDialog] = useState(true)
  const [userTakenError, setUserTakenError] = useState('')
  const { user } = useContext(AuthenticatedUserContext)
  const [name, setName] = useState('')
  const [inventory, setInventory] = useState({})
  const [inventoryNotificaitons, setInventoryNotificaitons] = useState(0)
  const [newItems, setNewItems] = useState([])
  const [equipped, setEquipped] = useState(null)
  const [location, setLocation] = useState('foggyforest')
  const [blocks, setBlocks] = useState(Items.filter((o) => o.type === 'block'))
  const [plusses, setPlusses] = useState([])
  const [mapIcon, setMapIcon] = useState('map-outline')
  const introFadeAnim = useRef(new Animated.Value(0)).current
  const introFadeAnimMap = useRef(new Animated.Value(0)).current
  const [config, setConfig] = useState(Config)
  const [menuVisible, setMenuVisible] = useState(true)
  const [mapButtonVisible, setMapButtonVisible] = useState(true)

  function haptics(style) {
    if (Platform.OS === 'ios' && config.hapticsEnabled === true) {
      Haptics.impactAsync(style)
    }
  }

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
                  name: 'Fists',
                  strength: 1,
                  efficiency: 1,
                }
              }
            })

          if (isActive) {
            setEquipped(item)
            canvas.current.setTool(item)
          }
        } catch (error) {}
        try {
          await Firebase.database()
            .ref(`users/${user.uid}/userData/config`)
            .get()
            .then((snapshot) => {
              if (snapshot.exists()) {
                setConfig(snapshot.val())
                canvas.current.setConfigFromOutside(snapshot.val())
              }
            })
        } catch (error) {}
      }
      onFocus()
      return () => {
        isActive = false
      }
    }, [inventory, canvasLoading])
  )

  useEffect(() => {
    try {
      generateBlock()
    } catch (error) {}
    try {
      canvas.current.updateEnvironmentFromOutside(location)
    } catch (error) {}
  }, [location, canvasLoading])

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
    if (f) {
      filter = f
    } else {
      filter = 'all'
    }
    try {
      navigation.navigate('Inventory', { filter: filter })
    } catch (error) {
      console.log(error)
    }
  }

  const handleFurnace = async () => {
    try {
      navigation.navigate('Furnace')
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

  const handleMap = async () => {
    try {
      canvas.current.toggleMapFromOutside()
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
    await Firebase.database()
      .ref(`users/${user.uid}/userData/location`)
      .set(location)
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
        .then(async (snapshot) => {
          if (snapshot.exists()) {
            setInventory(snapshot.val().userData.inventory)
            setName(snapshot.val().userData.name)
            setFirstTimeDialog(false)
            try {
              await Firebase.database()
                .ref(`scores/${user.uid}/name`)
                .set(snapshot.val().userData.name)
            } catch (error) {}

            try {
              await Firebase.database()
                .ref(`scores/${user.uid}/score`)
                .set(snapshot.val().userData.inventory['Gold Ore'])
            } catch (error) {}
            try {
              await Firebase.database()
                .ref(`users/${user.uid}/userData/location`)
                .get()
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    setLocation(snapshot.val())
                  }
                })
            } catch (error) {}
          } else {
            setDatabase()
          }
          setIsLoading(false)

          Animated.timing(introFadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start()
          Animated.timing(introFadeAnimMap, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start()
        })
    }
    init()
  }, [])

  async function updateBalance(block, destroy, coordinates, damage) {
    var amount = Math.floor(1 + (equipped.efficiency * damage) / 10)
    if (destroy) {
      amount = Math.floor(equipped.efficiency * damage)
      haptics(Haptics.ImpactFeedbackStyle.Heavy)
    } else {
      haptics(Haptics.ImpactFeedbackStyle.Light)
    }

    setPlusses((plusses) => [
      ...(plusses.length > 15 ? plusses.splice(plusses.length - 10) : plusses),
      <Plus
        currentBlockColour={block.colour}
        amount={amount}
        bonus={destroy}
        currentBlock={block.name}
        key={Math.random(1000)}
        coordinates={coordinates}
      />,
    ])

    Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(`${block.name}`)
      .get()
      .then(async (snapshot) => {
        if (!snapshot.exists()) {
          Firebase.database()
            .ref(`users/${user.uid}/userData/newItems`)
            .child(`${block.name}`)
            .set(Firebase.firebase_.database.ServerValue.increment(1))
          setNotifications()
        }
      })

    Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(`${block.name}`)
      .set(Firebase.firebase_.database.ServerValue.increment(amount))
  }

  function generateBlock() {
    let currentBlocks = blocks.filter((o) => o.locations.includes(location))
    let chance = Math.random() * 100
    let block = currentBlocks[Math.floor(Math.random() * currentBlocks.length)]
    if (block.probability > chance) {
      canvas.current.setFromOutside(block)
    } else {
      generateBlock()
    }
  }

  function setMapMode() {
    Animated.timing(introFadeAnimMap, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {
      setMapButtonVisible(false)
    })
    Animated.timing(introFadeAnim, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false)
    })
  }

  async function setSceneMode(currentLocation) {
    await Firebase.database()
      .ref(`users/${user.uid}/userData/location`)
      .set(currentLocation)
    setLocation(currentLocation)
    Animated.timing(introFadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(setMenuVisible(true))

    Animated.timing(introFadeAnimMap, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(setMapButtonVisible(true))
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
    <SafeAreaView
      style={{
        flex: 1,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <StatusBar style="dark" />

      <Animated.View
        style={{
          opacity: introFadeAnim,
          position: 'absolute',
          flex: 1,
          top: 75,
          left: 20,
        }}
      >
        <EquippedButton
          name={equipped ? equipped.name : null}
          onPress={() => handleInventory('tool')}
          buttonVisible={menuVisible}
        />
      </Animated.View>

      <Animated.View
        style={{
          opacity: introFadeAnimMap,
          position: 'absolute',
          flex: 1,
          top: 75,
          right: 20,
        }}
      >
        <IconButton
          name={mapIcon}
          size={38}
          borderSize={70}
          borderRadius={10}
          onPress={handleMap}
          buttonDisabled={!mapButtonVisible}
        />
      </Animated.View>

      <Animated.View
        style={{
          opacity: introFadeAnim,
          position: 'absolute',
          flex: 1,
          bottom: 50,
          alignSelf: 'center',
        }}
      >
        <MenuBar
          onHandleInventory={handleInventory}
          onHandleCrafting={handleCrafting}
          onHandleProfile={handleProfile}
          onHandleScores={handleScores}
          onHandleFurnace={handleFurnace}
          inventoryNotificaitons={inventoryNotificaitons}
          menuVisible={menuVisible}
          style={{ flex: 1, alignSelf: 'center' }}
        />
      </Animated.View>
      <View style={{ flex: 1 }}>{plusses}</View>

      <View style={styles.canvas}>
        <Canvas
          equipped={equipped}
          updateBalance={updateBalance}
          generateBlock={generateBlock}
          setLoading={() => setCanvasLoading(false)}
          setMapMode={setMapMode}
          setSceneMode={setSceneMode}
          ref={canvas}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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
    zIndex: -1,
    position: 'absolute',
  },
})
