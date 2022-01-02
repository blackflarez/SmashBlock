import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Animated,
  FlatList,
  Modal,
  Platform,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { Button, Items, ItemButton, ItemIcon, Font } from '../components'
import { Firebase, Database } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { useStateIfMounted } from 'use-state-if-mounted'
import { BlurView } from 'expo-blur'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const auth = Firebase.auth()

var lastOreAmount, lastFuelAmount

export default function Furnace({ navigation }, props) {
  const [increment, setIncrement] = useStateIfMounted(0)
  const [loading, setLoading] = useStateIfMounted(true)
  const [inventory, setInventory] = useStateIfMounted(null)
  const [inventoryFiltered, setInventoryFiltered] = useStateIfMounted(null)
  const [filterType, setFilterType] = useStateIfMounted('all')
  const [modalVisible, setModalVisible] = useStateIfMounted(false)
  const [removeModalVisible, setRemoveModalVisible] = useStateIfMounted(false)
  const [currentItem, setCurrentItem] = useStateIfMounted(Items[0])
  const [currentFuel, setCurrentFuel] = useStateIfMounted({
    name: null,
    amount: null,
  })
  const [currentOre, setCurrentOre] = useStateIfMounted({
    name: null,
    amount: null,
  })
  const [currentOutput, setCurrentOutput] = useStateIfMounted({
    name: null,
    amount: null,
  })
  const [cooking, setCooking] = useStateIfMounted(false)
  const [setAmount, setSetAmount] = useStateIfMounted(1)
  const { user } = useContext(AuthenticatedUserContext)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const handleBack = async () => {
    try {
      navigation.navigate('Home')
    } catch (error) {
      console.log(error)
    }
  }

  useMemo(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start()
      if (filterType === 'all') {
        setInventoryFiltered(
          inventory.filter(
            (data) => data.category === 'ore' || data.category === 'fuel'
          )
        )
      } else {
        setInventoryFiltered(
          inventory.filter((data) => data.category === filterType)
        )
      }
    }
  }, [inventory, filterType])

  useMemo(async () => {
    try {
      if (
        currentFuel.amount >= 1 &&
        currentOre.amount >= 1 &&
        currentFuel.name !== null &&
        currentOre.name !== null &&
        currentFuel.amount != lastFuelAmount &&
        currentOre.amount != lastOreAmount
      ) {
        lastFuelAmount = currentFuel.amount
        lastOreAmount = currentOre.amount
        if (
          !currentOutput ||
          Items.find((o) => currentOre.name === o.name).output ===
            currentOutput.name
        ) {
          setCooking(true)
          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentOutput/name`)
            .set(Items.find((o) => currentOre.name === o.name).output)

          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentOutput/amount`)
            .set(
              Firebase.firebase_.database.ServerValue.increment(
                Math.round(Math.random() * 2)
              )
            )
          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentOre/amount`)
            .set(Firebase.firebase_.database.ServerValue.increment(-1))
          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentFuel/amount`)
            .set(Firebase.firebase_.database.ServerValue.increment(-1))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/inventory`)
            .child(currentOutput.name)
            .get()
            .then(async (snapshot) => {
              if (!snapshot.exists()) {
                Firebase.database()
                  .ref(`users/${user.uid}/userData/newItems`)
                  .child(currentOutput.name)
                  .set(Firebase.firebase_.database.ServerValue.increment(1))
              }
            })
        }
      } else {
        setCooking(false)
        lastOreAmount = null
        lastFuelAmount = null
      }
    } catch (error) {}
  }, [increment])

  function getAmount() {
    try {
      let amount = inventory.find((o) => o.name === currentItem.name).amount
      if (setAmount > amount && amount > 0) {
        setSetAmount(amount)
      }
      return amount
    } catch (e) {
      return 0
    }
  }

  const handleRemove = async (item) => {
    setModalVisible(false)

    if (currentItem.category === 'fuel') {
      setCurrentFuel({ name: null, amount: null })
      await Firebase.database()
        .ref(`users/${user.uid}/userData/furnace/currentFuel/amount`)
        .set(0)

      await Firebase.database()
        .ref(`users/${user.uid}/userData/inventory`)
        .child(item)
        .set(
          Firebase.firebase_.database.ServerValue.increment(currentFuel.amount)
        )
        .then(setRemoveModalVisible(false))
    }
    if (currentItem.category === 'ore') {
      setCurrentOre({ name: null, amount: null })
      await Firebase.database()
        .ref(`users/${user.uid}/userData/furnace/currentOre/amount`)
        .set(0)

      await Firebase.database()
        .ref(`users/${user.uid}/userData/inventory`)
        .child(item)
        .set(
          Firebase.firebase_.database.ServerValue.increment(currentOre.amount)
        )
        .then(setRemoveModalVisible(false))
    }
    if (currentItem.category === 'ingot') {
      setCurrentOutput({ name: null, amount: null })
      await Firebase.database()
        .ref(`users/${user.uid}/userData/furnace/currentOutput/amount`)
        .set(0)

      await Firebase.database()
        .ref(`users/${user.uid}/userData/inventory`)
        .child(item)
        .set(
          Firebase.firebase_.database.ServerValue.increment(
            currentOutput.amount
          )
        )
        .then(setRemoveModalVisible(false))
    }
  }

  const handleOpen = async (item) => {
    setSetAmount(1)
    setModalVisible(true)
    setCurrentItem(item)
  }

  const handleOpenOre = async () => {
    setCurrentItem({
      name: currentOre.name,
      category: 'ore',
      amount: currentOre.amount,
    })
    setSetAmount(1)
    setRemoveModalVisible(true)
  }

  const handleOpenFuel = async () => {
    setCurrentItem({
      name: currentFuel.name,
      category: 'fuel',
      amount: currentFuel.amount,
    })
    setSetAmount(1)
    setRemoveModalVisible(true)
  }

  const handleOpenOutput = async () => {
    setCurrentItem({
      name: currentOutput.name,
      category: 'ingot',
      amount: currentOutput.amount,
    })
    setSetAmount(1)
    setRemoveModalVisible(true)
  }

  const handleAddOre = async () => {
    if (currentOre) {
      if (currentOre.name === currentItem.name) {
        try {
          await Firebase.database()
            .ref(`users/${user.uid}/userData/inventory`)
            .child(currentItem.name)
            .set(Firebase.firebase_.database.ServerValue.increment(-setAmount))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentOre/amount`)
            .set(Firebase.firebase_.database.ServerValue.increment(setAmount))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentOre/name`)
            .set(currentItem.name)
            .then(setModalVisible(false))
        } catch (error) {
          console.log(error)
        }
      } else {
        try {
          setCurrentOre({ name: currentItem.name, amount: setAmount })
          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentOre/name`)
            .set(currentItem.name)
            .then(setModalVisible(false))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentOre/amount`)
            .set(setAmount)

          await Firebase.database()
            .ref(`users/${user.uid}/userData/inventory`)
            .child(currentItem.name)
            .set(Firebase.firebase_.database.ServerValue.increment(-setAmount))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/inventory`)
            .child(currentOre.name)
            .set(
              Firebase.firebase_.database.ServerValue.increment(
                currentOre.amount
              )
            )
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
          .ref(`users/${user.uid}/userData/furnace/currentOre/amount`)
          .set(Firebase.firebase_.database.ServerValue.increment(setAmount))

        await Firebase.database()
          .ref(`users/${user.uid}/userData/furnace/currentOre/name`)
          .set(currentItem.name)
          .then(setModalVisible(false))
      } catch (error) {
        console.log(error)
      }
    }
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
            .ref(`users/${user.uid}/userData/furnace/currentFuel/amount`)
            .set(Firebase.firebase_.database.ServerValue.increment(setAmount))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentFuel/name`)
            .set(currentItem.name)
            .then(setModalVisible(false))
        } catch (error) {
          console.log(error)
        }
      } else {
        try {
          setCurrentFuel({ name: currentItem.name, amount: setAmount })
          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentFuel/name`)
            .set(currentItem.name)
            .then(setModalVisible(false))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/furnace/currentFuel/amount`)
            .set(setAmount)

          await Firebase.database()
            .ref(`users/${user.uid}/userData/inventory`)
            .child(currentItem.name)
            .set(Firebase.firebase_.database.ServerValue.increment(-setAmount))

          await Firebase.database()
            .ref(`users/${user.uid}/userData/inventory`)
            .child(currentFuel.name)
            .set(
              Firebase.firebase_.database.ServerValue.increment(
                currentFuel.amount
              )
            )
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
          .ref(`users/${user.uid}/userData/furnace/currentFuel/amount`)
          .set(Firebase.firebase_.database.ServerValue.increment(setAmount))

        await Firebase.database()
          .ref(`users/${user.uid}/userData/furnace/currentFuel/name`)
          .set(currentItem.name)
          .then(setModalVisible(false))
      } catch (error) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    async function init() {
      setIncrement((prevCount) => prevCount + 1)
      await Firebase.database()
        .ref(`users/${user.uid}/userData/furnace`)
        .get()
        .then(async (snapshot) => {
          let ore
          let fuel
          let output
          if (snapshot.exists()) {
            try {
              fuel = snapshot.val().currentFuel
              setCurrentFuel(snapshot.val().currentFuel)
            } catch (err) {
              setCurrentFuel({ name: null, amount: null })
              fuel = { name: null, amount: null }
            }
            try {
              ore = snapshot.val().currentOre
              setCurrentOre(snapshot.val().currentOre)
            } catch (err) {
              setCurrentOre({ name: null, amount: null })
              ore = { name: null, amount: null }
            }
            try {
              output = snapshot.val().currentOutput
              setCurrentOutput(snapshot.val().currentOutput)
            } catch (err) {
              setCurrentOutput({ name: null, amount: null })
              output = { name: null, amount: null }
            }
          }
          try {
            if (fuel.amount < 1) {
              setRemoveModalVisible(false)
              setCurrentFuel({ name: null, amount: null })
              await Firebase.database()
                .ref(`users/${user.uid}/userData/furnace/currentFuel`)
                .set({ name: null, amount: null })
            }
          } catch (error) {}
          try {
            if (ore.amount < 1) {
              setRemoveModalVisible(false)
              setCurrentOre({ name: null, amount: null })
              await Firebase.database()
                .ref(`users/${user.uid}/userData/furnace/currentOre`)
                .set({ name: null, amount: null })
            }
          } catch (error) {}
          try {
            if (output.amount < 1) {
              setCurrentOutput({ name: null, amount: null })
              await Firebase.database()
                .ref(`users/${user.uid}/userData/furnace/currentOutput`)
                .set({ name: null, amount: null })
            }
          } catch (error) {}
        })

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
            setInventory(items)
            setLoading(false)
          } else {
            console.log('No data available')
          }
        })
    }
    init()

    const interval = setInterval(() => init(), 1000)
    return () => clearInterval(interval)
  }, [])

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

  return (
    <BlurView
      intensity={100}
      tint="light"
      style={{
        flex: 1,
        flexDirection: 'column',
      }}
    >
      <Animated.View
        style={{
          ...props.style,
          opacity: fadeAnim,
          flex: 1,
        }}
      >
        <Modal
          animationType="fade"
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
                  pending={cooking}
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
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.')
            setModalVisible(false)
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <ItemIcon name={currentItem.name} size={120} />
              <Font style={styles.text}>{currentItem.name}</Font>
              <Font
                style={[
                  styles.textLight,
                  { marginBottom: 20, color: '#757575' },
                ]}
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
                  minimumTrackTintColor="#eee"
                  maximumTrackTintColor="#eee"
                  thumbTintColor="#6DA34D"
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

                {currentItem.category === 'ore' ? (
                  <Button
                    title={'Add Ore'}
                    backgroundColor={'#eee'}
                    containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                    onPress={() => {
                      handleAddOre()
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
        <StatusBar style="light" />
        <View style={{ margin: 24, marginTop: 72 }}></View>
        <View style={[styles.row]}>
          <View style={{ flexDirection: 'column' }}>
            <ItemButton
              onPress={() => handleOpenOre()}
              margin={20}
              equipped={false}
              newItem={false}
              name={currentOre ? currentOre.name : null}
              amount={currentOre ? currentOre.amount : null}
            />

            <ItemButton
              onPress={() => handleOpenFuel()}
              margin={20}
              equipped={false}
              newItem={false}
              name={currentFuel ? currentFuel.name : null}
              amount={currentFuel ? currentFuel.amount : null}
            />
          </View>

          <MaterialCommunityIcons
            name={'arrow-right-bold'}
            size={64}
            color={cooking ? 'rgba(211, 84, 0, 0.2)' : 'rgba(52, 52, 52, 0.1)'}
          />
          <ItemButton
            onPress={() => handleOpenOutput()}
            margin={20}
            equipped={false}
            newItem={false}
            name={currentOutput ? currentOutput.name : null}
            amount={currentOutput ? currentOutput.amount : null}
          />
        </View>
        <View style={[styles.halfHeight]}>
          <FlatList
            data={inventoryFiltered}
            renderItem={renderItem}
            keyExtractor={(item) => item.name}
            numColumns={3}
            scrollEnabled={true}
            contentContainerStyle={{ marginLeft: 3 }}
            refreshing={true}
          />
        </View>
        <View style={styles.row}>
          <Button
            title={'All'}
            titleSize={12}
            width={90}
            containerStyle={{ alignSelf: 'center', margin: 5 }}
            onPress={() => {
              setFilterType('all')
            }}
            enabled={filterType === 'all'}
          ></Button>
          <Button
            title={'Ores'}
            titleSize={12}
            width={90}
            containerStyle={{ alignSelf: 'center', margin: 5 }}
            onPress={() => {
              setFilterType('ore')
            }}
            enabled={filterType === 'ore'}
          ></Button>
          <Button
            title={'Fuels'}
            titleSize={12}
            width={90}
            containerStyle={{ alignSelf: 'center', margin: 5 }}
            onPress={() => {
              setFilterType('fuel')
            }}
            enabled={filterType === 'fuel'}
          ></Button>
        </View>
        <View style={styles.quarterHeight}></View>
      </Animated.View>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 250,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfHeight: {
    flex: 6,
    backgroundColor: 'rgba(52, 52, 52, 0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    margin: 20,
    width: 363,
  },
  quarterHeight: {
    flex: 1,
    margin: 24,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
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
  textLight: {
    fontSize: 12,
    fontWeight: '200',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: 300,
    height: 500,
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
