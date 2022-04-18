import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native'
import {
  InputField,
  ErrorMessage,
  Plus,
  MenuBar,
  Items,
  EquippedButton,
  Config,
  ItemButton,
  ImageButton,
  Font,
  Button,
  Levels,
  ItemIcon,
} from '../components'
import { Firebase } from '../config/firebase'
import Canvas from '../components/Canvas'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { useFocusEffect } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { set } from 'lodash'
import Slider from '@react-native-community/slider'

var lastFuelAmount

export default function HomeScreen({ navigation }, props) {
  const canvas = useRef()
  const [canvasLoading, setCanvasLoading] = useState(true)
  const auth = Firebase.auth()
  const [isLoading, setIsLoading] = useState(true)
  const [firstTimeDialog, setFirstTimeDialog] = useState(true)
  const [placedModal, setPlacedModal] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [removeModalVisible, setRemoveModalVisible] = useState(false)
  const [levelUpModal, setLevelUpModal] = useState(false)
  const [levelUpSkill, setLevelUpSkill] = useState()
  const [levelUpAmount, setLevelUpAmount] = useState()
  const [levelUpDescription, setLevelUpDescription] = useState()
  const [userTakenError, setUserTakenError] = useState('')
  const { user } = useContext(AuthenticatedUserContext)
  const [name, setName] = useState('')
  const [inventory, setInventory] = useState({})
  const [inventoryFiltered, setInventoryFiltered] = useState(null)
  const [inventoryNotificaitons, setInventoryNotificaitons] = useState(0)
  const [newItems, setNewItems] = useState([])
  const [equipped, setEquipped] = useState(null)
  const [equippedDurability, setEquippedDurability] = useState(null)
  const [equippedPending, setEquippedPending] = useState(false)
  const [location, setLocation] = useState()
  const [blocks, setBlocks] = useState(Items.filter((o) => o.type === 'block'))
  const [plusses, setPlusses] = useState([])
  const [mapIcon, setMapIcon] = useState('map-outline')
  const introFadeAnim = useRef(new Animated.Value(0)).current
  const introFadeAnimMap = useRef(new Animated.Value(0)).current
  const [config, setConfig] = useState(Config)
  const [menuVisible, setMenuVisible] = useState(true)
  const [mapButtonVisible, setMapButtonVisible] = useState(true)
  const locationAnim = useRef(new Animated.Value(0)).current
  const locationRiseAnim = useRef(new Animated.Value(30)).current
  const fists = { name: 'Fists', strength: 1, efficiency: 1 }
  const [currentFuel, setCurrentFuel] = useState({
    name: null,
    amount: null,
  })
  const [currentItem, setCurrentItem] = useState(Items[0])
  const [setAmount, setSetAmount] = useState(1)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [mining, setMining] = useState(false)
  const [increment, setIncrement] = useState(0)

  function haptics(style) {
    if (Platform.OS === 'ios' && config.hapticsEnabled === true) {
      Haptics.impactAsync(style)
    }
  }

  async function setPlaced(newLocation) {
    try {
      if (newLocation) {
        await Firebase.database()
          .ref(`users/${user.uid}/userData/placed/${newLocation}/type`)
          .get()
          .then((snapshot) => {
            if (snapshot.exists() && snapshot.val()) {
              canvas.current.setPlaced(snapshot.val())
            } else {
              canvas.current.setPlaced(null)
            }
          })
      } else {
        canvas.current.setPlaced(null)
        setPlacedModal(false)
        await Firebase.database()
          .ref(`users/${user.uid}/userData/placed/${location}/type`)
          .get()
          .then(async (snapshot) => {
            if (snapshot.exists()) {
              await Firebase.database()
                .ref(`users/${user.uid}/userData/inventory`)
                .child(snapshot.val())
                .set(Firebase.firebase_.database.ServerValue.increment(1))
              await Firebase.database()
                .ref(`users/${user.uid}/userData/placed/${location}/type`)
                .set(null)
            }
          })
      }
    } catch (error) {}
  }

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true
      const onFocus = async () => {
        setNotifications()
        let item
        try {
          await Firebase.database()
            .ref(`users/${user.uid}/userData/levels/Smelting`)
            .get()
            .then((snapshot) => {
              setCurrentLevel(snapshot.val())
            })

          await Firebase.database()
            .ref(`users/${user.uid}/userData/equipped`)
            .get()
            .then((snapshot) => {
              if (snapshot.exists()) {
                item = Items.find((data) => data.name === snapshot.val())
              } else {
                item = fists
              }
            })

          if (isActive) {
            setEquipped(item)
            canvas.current.setTool(item)
            await Firebase.database()
              .ref(`users/${user.uid}/userData/durability/${item.name}`)
              .get()
              .then(async (snapshot) => {
                if (snapshot.exists()) {
                  setEquippedDurability(snapshot.val())
                } else {
                  setEquippedDurability(null)
                }
              })
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
      setPlaced(location)

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
      Animated.sequence([
        Animated.timing(locationRiseAnim, {
          toValue: 175,
          duration: 0.1,
          useNativeDriver: false,
        }),
        Animated.timing(locationAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),

        Animated.parallel([
          Animated.timing(locationRiseAnim, {
            toValue: -700,
            duration: 6000,
            useNativeDriver: false,
          }),
          Animated.timing(locationAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      ]).start()
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
    await Firebase.database().ref(`users/${user.uid}/userData/levels`).set({
      Level: 4,
      Woodcutting: 1,
      WoodcuttingXP: 0,
      Mining: 1,
      MiningXP: 0,
      Smelting: 1,
      SmeltingXP: 0,
      Crafting: 1,
      CraftingXP: 0,
    })
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
      await Firebase.database()
        .ref(`users/${user.uid}/userData/inventory`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            var items = []
            snapshot.forEach(function (childNodes) {
              if (childNodes.val() > 0) {
                let name = childNodes.key
                let amount = childNodes.val()
                let stats = Items.find((o) => name === o.name)
                items.push({ ...stats, amount: amount })
              }
            })
            setInventory(snapshot.val())
            setInventoryFiltered(
              items.filter((data) => data.category === 'fuel')
            )
          } else {
            console.log('No data available')
          }
        })
      //AudioManager.setupAsync()
      await Firebase.database()
        .ref(`users/${user.uid}`)
        .get()
        .then(async (snapshot) => {
          if (snapshot.exists()) {
            // setInventory(snapshot.val().userData.inventory)
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
                .set(snapshot.val().userData.levels.Level)
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
            duration: 1500,
            useNativeDriver: true,
          }).start()
          Animated.timing(introFadeAnimMap, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }).start()
        })
    }
    init()
  }, [])

  async function updateLevel(block) {
    Firebase.database()
      .ref(`users/${user.uid}/userData/levels`)
      .child(`${block.xpType}XP`)
      .set(Firebase.firebase_.database.ServerValue.increment(block.xpAmount))

    Firebase.database()
      .ref(`users/${user.uid}/userData/levels`)
      .get()
      .then((snapshot) => {
        let level = snapshot.child(`${block.xpType}`).val()
        let xp = 0.095 * Math.sqrt(snapshot.child(`${block.xpType}XP`).val())
        if (Math.floor(xp) > level) {
          Firebase.database()
            .ref(`users/${user.uid}/userData/levels`)
            .child(`${block.xpType}`)
            .set(Firebase.firebase_.database.ServerValue.increment(1))
            .then(() => {
              setLevelUpModal(true)
              setLevelUpSkill(block.xpType)
              setLevelUpAmount(level + 1)
              let description = []
              Object.entries(Levels).forEach(([key, value]) => {
                if (key == block.xpType) {
                  Object.entries(value).forEach(([key, value]) => {
                    if (key == level + 1) {
                      Object.entries(value).forEach(([key, value]) => {
                        description.push(`${key}: ${value} \n`)
                      })
                    }
                  })
                }
              })
              setLevelUpDescription(description)
            })
          Firebase.database()
            .ref(`users/${user.uid}/userData/levels`)
            .child(`Level`)
            .set(Firebase.firebase_.database.ServerValue.increment(1))
        }
      })
  }

  async function updateDurability() {
    if (equipped.name !== 'Fists') {
      await Firebase.database()
        .ref(`users/${user.uid}/userData/durability/${equipped.name}`)
        .get()
        .then(async (snapshot) => {
          if (snapshot.exists()) {
            setEquippedDurability(snapshot.val())
            if (snapshot.val() === 0 || snapshot.val() < 0) {
              await Firebase.database()
                .ref(`users/${user.uid}/userData/durability/${equipped.name}`)
                .set(null)

              await Firebase.database()
                .ref(`users/${user.uid}/userData/inventory/${equipped.name}`)
                .set(Firebase.firebase_.database.ServerValue.increment(-1))

              await Firebase.database()
                .ref(`users/${user.uid}/userData/inventory/${equipped.name}`)
                .get()
                .then(async (snapshot) => {
                  if (snapshot.val() === 0) {
                    setEquipped(fists)
                    canvas.current.setTool(fists)
                    await Firebase.database()
                      .ref(`users/${user.uid}/userData/equipped`)
                      .set(null)
                    setEquippedDurability(null)
                    await Firebase.database()
                      .ref(
                        `users/${user.uid}/userData/durability/${equipped.name}`
                      )
                      .set(null)
                  }
                })
            } else {
              await Firebase.database()
                .ref(`users/${user.uid}/userData/durability/${equipped.name}`)
                .set(
                  await Firebase.firebase_.database.ServerValue.increment(
                    -equipped.durability
                  )
                )
            }
          } else {
            setEquippedDurability(10000 - equipped.durability)
            await Firebase.database()
              .ref(`users/${user.uid}/userData/durability/${equipped.name}`)
              .set(10000 - equipped.durability)
          }
        })
    }
  }

  async function updateBalance(block, destroy, coordinates, damage) {
    if (destroy) {
      haptics(Haptics.ImpactFeedbackStyle.Heavy)
      var amount = Math.floor(
        1 + equipped.efficiency * (Math.random() * (1.5 - 0.75) + 0.75)
      )

      setPlusses((plusses) => [
        ...(plusses.length > 15
          ? plusses.splice(plusses.length - 10)
          : plusses),
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

      updateLevel(block)
    } else {
      haptics(Haptics.ImpactFeedbackStyle.Light)
    }

    await updateDurability()
  }

  async function isUnlocked(map) {
    let unlocked = false
    let location = Items.find((o) => o.name === map)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/levels`)
      .get()
      .then(async (snapshot) => {
        let level = snapshot.child(location.skill).val()
        if (level >= location.unlockLevel) {
          unlocked = true
        }
      })
    return unlocked
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

  useEffect(() => {
    async function init() {
      try {
        setIncrement((prevCount) => prevCount + 1)

        await Firebase.database()
          .ref(`users/${user.uid}/userData/placed/${location}`)
          .get()
          .then(async (snapshot) => {
            if (snapshot.exists()) {
              console.log(snapshot.val())
              try {
                setCurrentFuel({
                  name: snapshot.val().name,
                  amount: snapshot.val().amount,
                })
              } catch (err) {
                setCurrentFuel({ name: null, amount: null })
              }

              try {
                if (snapshot.val().amount < 1) {
                  setRemoveModalVisible(false)
                  setCurrentFuel({ name: null, amount: null })
                  await Firebase.database()
                    .ref(`users/${user.uid}/userData/placed/${location}/name`)
                    .set(null)
                  await Firebase.database()
                    .ref(`users/${user.uid}/userData/placed/${location}/amount`)
                    .set(0)
                } else {
                }
              } catch (error) {
                console.log(error)
              }
            }
          })
      } catch (error) {
        console.log(error)
      }
    }
    init()

    const interval = setInterval(() => init(), 200)
    return () => clearInterval(interval)
  }, [])

  useMemo(async () => {
    try {
      if (currentFuel.name !== null && currentFuel.name) {
        lastFuelAmount = currentFuel.amount
        setMining(true)
        await Firebase.database()
          .ref(`users/${user.uid}/userData/placed/${location}/amount`)
          .set(Firebase.firebase_.database.ServerValue.increment(-1))
        canvas.current.hitBlockFromOutside()
      } else {
        setMining(false)
        lastFuelAmount = null
      }
    } catch (error) {}
  }, [increment])

  const handleOpen = async (item) => {
    if (currentLevel >= item.smeltLevel) {
      setSetAmount(1)
      setPlacedModal(false)
      setModalVisible(true)
      setCurrentItem(item)
    } else {
      setCurrentItem(item)
      setUnableSmeltModal(true)
    }
  }

  const handleOpenFuel = async () => {
    setPlacedModal(false)
    setCurrentItem({
      name: currentFuel.name,
      category: 'fuel',
      amount: currentFuel.amount,
    })
    setSetAmount(1)
    setRemoveModalVisible(true)
  }

  const handleAddFuel = async () => {
    if (currentFuel) {
      if (currentFuel.name === currentItem.name) {
        try {
          await Firebase.database()
            .ref(`users/${user.uid}/userData/inventory`)
            .child(currentItem.name)
            .set(Firebase.firebase_.database.ServerValue.increment(-setAmount))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/placed/${location}/amount`)
            .set(Firebase.firebase_.database.ServerValue.increment(setAmount))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/placed/${location}/name`)
            .set(currentItem.name)
            .then(setModalVisible(false))
        } catch (error) {
          console.log(error)
        }
      } else {
        try {
          setCurrentFuel({ name: currentItem.name, amount: setAmount })
          await Firebase.database()
            .ref(`users/${user.uid}/userData/placed/${location}/name`)
            .set(currentItem.name)
            .then(setModalVisible(false))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/placed/${location}/amount`)
            .set(setAmount)

          await Firebase.database()
            .ref(`users/${user.uid}/userData/inventory`)
            .child(currentItem.name)
            .set(Firebase.firebase_.database.ServerValue.increment(-setAmount))
        } catch (error) {
          console.log(error)
        }
      }
    } else {
      try {
        await Firebase.database()
          .ref(`users/${user.uid}/userData/inventory`)
          .child(currentItem.name)
          .set(Firebase.firebase_.database.ServerValue.increment(-setAmount))

        await Firebase.database()
          .ref(`users/${user.uid}/userData/placed/${location}/amount`)
          .set(Firebase.firebase_.database.ServerValue.increment(setAmount))

        await Firebase.database()
          .ref(`users/${user.uid}/userData/placed/${location}/name`)
          .set(currentItem.name)
          .then(setModalVisible(false))
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleRemove = async (item) => {
    setModalVisible(false)

    if (currentItem.category === 'fuel') {
      setCurrentFuel({ name: null, amount: null })
      await Firebase.database()
        .ref(`users/${user.uid}/userData/placed/${location}/amount`)
        .set(null)

      await Firebase.database()
        .ref(`users/${user.uid}/userData/inventory`)
        .child(item)
        .set(
          Firebase.firebase_.database.ServerValue.increment(currentFuel.amount)
        )
        .then(setRemoveModalVisible(false))
    }
  }

  async function setSceneMode(currentLocation) {
    let unlocked = false
    let location = Items.find((o) => o.name === currentLocation)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/levels`)
      .get()
      .then(async (snapshot) => {
        let level = snapshot.child(location.skill).val()
        if (level >= location.unlockLevel) {
          await Firebase.database()
            .ref(`users/${user.uid}/userData/location`)
            .set(currentLocation)
          setLocation(currentLocation)
          setPlaced(currentLocation)
          unlocked = true

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
      })

    return unlocked
  }

  function getAmount() {
    try {
      let amount = inventoryFiltered.find(
        (o) => o.name === currentItem.name
      ).amount
      if (setAmount > amount && amount > 0) {
        setSetAmount(amount)
      }
      return amount
    } catch (e) {
      return 0
    }
  }
  const renderItem = ({ item }) => (
    <ItemButton
      name={item.name}
      amount={item.amount}
      onPress={() => handleOpen(item)}
      colour={item.name}
      margin={20}
      equipped={false}
      newItem={false}
    />
  )

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
        <StatusBar style='dark' />
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
          keyboardShouldPersistTaps='handled'
        >
          <StatusBar style='dark' />
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
              leftIcon='account'
              placeholder='Enter username'
              autoCapitalize='none'
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
      <StatusBar style='dark' />

      <Modal
        animationType='fade'
        transparent={true}
        visible={removeModalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.')
          setRemoveModalVisible(false), setSetAmount(1)
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { height: 400 }]}>
            <ItemIcon name={currentItem.name} size={120} />
            <Font style={styles.text}>Collect {currentItem.name}</Font>
            <View
              style={{
                position: 'absolute',
                bottom: 20,
                width: 120,
              }}
            >
              <Button
                title={'Collect'}
                backgroundColor={'#eee'}
                containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                onPress={() => {
                  handleRemove(currentItem.name), setRemoveModalVisible(false)
                }}
              ></Button>
              <Button
                title={'Close'}
                backgroundColor={'#eee'}
                containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                onPress={() => {
                  setRemoveModalVisible(false)
                }}
              ></Button>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType='fade'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.')
          setModalVisible(false)
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { height: 500, width: 350 }]}>
            <ItemIcon name={currentItem.name} size={120} />
            <Font style={styles.text}>{currentItem.name}</Font>
            <Font
              style={[styles.textLight, { marginBottom: 20, color: '#757575' }]}
            >
              {currentItem.description}
            </Font>

            <View
              style={{
                position: 'absolute',
                bottom: 20,
                width: 120,
              }}
            >
              <Font style={{ alignSelf: 'center' }}>{setAmount}</Font>

              <Slider
                style={{ width: 200, height: 40, alignSelf: 'center' }}
                minimumValue={1}
                maximumValue={getAmount()}
                minimumTrackTintColor='#eee'
                maximumTrackTintColor='#eee'
                thumbTintColor='#6DA34D'
                step={Math.ceil(getAmount() / 100)}
                onValueChange={(value) => setSetAmount(value)}
              />

              {currentItem.category === 'fuel' ? (
                <Button
                  title={'Add Fuel'}
                  backgroundColor={'#eee'}
                  containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                  onPress={() => {
                    handleAddFuel()
                  }}
                ></Button>
              ) : null}

              <Button
                title={'Close'}
                backgroundColor={'#eee'}
                containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                onPress={() => {
                  setModalVisible(false)
                }}
              ></Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType='fade'
        transparent={true}
        visible={placedModal}
        onRequestClose={() => {
          setPlacedModal(false)
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { height: 500, width: 350 }]}>
            <Font style={styles.text}>Miner</Font>

            <ItemButton
              onPress={() => handleOpenFuel()}
              margin={20}
              equipped={false}
              newItem={false}
              name={currentFuel ? currentFuel.name : null}
              amount={currentFuel ? currentFuel.amount : null}
            />
            <FlatList
              data={inventoryFiltered}
              renderItem={renderItem}
              keyExtractor={(item) => item.name}
              numColumns={2}
              scrollEnabled={true}
              contentContainerStyle={{ marginLeft: 3 }}
              refreshing={true}
            />

            <Font style={styles.textLight}>{levelUpDescription}</Font>

            <View
              style={{
                position: 'absolute',
                bottom: 20,
                width: 120,
              }}
            >
              <Button
                title={'Remove'}
                backgroundColor={'#eee'}
                containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                onPress={() => {
                  setPlaced(null)
                }}
              ></Button>
              <Button
                title={'Close'}
                backgroundColor={'#eee'}
                containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                onPress={() => {
                  setPlacedModal(false)
                }}
              ></Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType='fade'
        transparent={true}
        visible={levelUpModal}
        onRequestClose={() => {
          setLevelUpModal(false)
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Font style={styles.text}>Level Up!</Font>
            <Font
              style={[styles.textLight, { marginBottom: 20, color: '#757575' }]}
            >
              You are now {levelUpSkill} level {levelUpAmount}.
            </Font>

            <Font style={styles.textLight}>{levelUpDescription}</Font>

            <View
              style={{
                position: 'absolute',
                bottom: 20,
                width: 120,
              }}
            >
              <Button
                title={'Close'}
                backgroundColor={'#eee'}
                containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                onPress={() => {
                  setLevelUpModal(false)
                }}
              ></Button>
            </View>
          </View>
        </View>
      </Modal>

      <Animated.View
        style={{
          opacity: locationAnim,
          top: locationRiseAnim,
          alignContent: 'center',
        }}
      >
        <Font
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 24,
            paddingLeft: 30,
            paddingRight: 30,
          }}
        >
          {location.replace('_', ' ')}
        </Font>
      </Animated.View>

      <Animated.View
        style={{
          opacity: introFadeAnim,
          position: 'absolute',
          flex: 1,
          top: 60,
          left: 20,
        }}
      >
        <EquippedButton
          name={equipped ? equipped.name : null}
          onPress={() => handleInventory('tool')}
          buttonVisible={menuVisible}
          health={equippedDurability / 10000}
          borderSize={75}
        />
      </Animated.View>

      <Animated.View
        style={{
          opacity: introFadeAnimMap,
          position: 'absolute',
          flex: 1,
          top: 60,
          right: 20,
        }}
      >
        <ImageButton
          name={'map'}
          size={38}
          borderSize={75}
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
          isUnlocked={isUnlocked}
          openPlacedModal={() => setPlacedModal(true)}
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: 300,
    height: 300,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
})
