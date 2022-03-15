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

const auth = Firebase.auth()

export default function Inventory({ navigation, route }, props) {
  const { filter } = route.params
  const [loading, setLoading] = useStateIfMounted(true)
  const [inventory, setInventory] = useStateIfMounted(null)
  const [inventoryFiltered, setInventoryFiltered] = useStateIfMounted(null)
  const [filterType, setFilterType] = useStateIfMounted(filter)
  const [modalVisible, setModalVisible] = useStateIfMounted(false)
  const [destroyModalVisible, setDestroyModalVisible] = useStateIfMounted(false)
  const [unableEquipModal, setUnableEquipModal] = useStateIfMounted(false)
  const [currentItem, setCurrentItem] = useState(Items[0])
  const [destroyAmount, setDestroyAmount] = useState(1)
  const { user } = useContext(AuthenticatedUserContext)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [equipped, setEquipped] = useStateIfMounted()
  const [newItems, setNewItems] = useStateIfMounted([])
  const [equippedDurability, setEquippedDurability] = useState(null)

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
        setInventoryFiltered(inventory)
      } else {
        if (filterType === 'resource') {
          setInventoryFiltered(
            inventory.filter(
              (data) => data.type === 'resource' || data.type === 'block'
            )
          )
        } else {
          setInventoryFiltered(
            inventory.filter((data) => data.type === filterType)
          )
        }
      }
    }
  }, [inventory, filterType])

  function getAmount() {
    try {
      let amount = inventory.find((o) => o.name === currentItem.name).amount
      if (destroyAmount > amount && amount > 0) {
        setDestroyAmount(amount)
      }
      return amount
    } catch (e) {}
  }

  const handleEquip = async (item) => {
    setModalVisible(false)
    if (item.equipLevel) {
      await Firebase.database()
        .ref(`users/${user.uid}/userData/levels/${item.skill}`)
        .get()
        .then(async (snapshot) => {
          if (snapshot.val() >= item.equipLevel) {
            await Firebase.database()
              .ref(`users/${user.uid}/userData/equipped`)
              .set(item.name)
              .then(handleBack())
          } else {
            setUnableEquipModal(true)
          }
        })
    }
  }

  const handleFurnace = async () => {
    setModalVisible(false)
    navigation.navigate('Furnace')
  }

  const handleDestroy = async (item) => {
    setModalVisible(false)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(item)
      .set(Firebase.firebase_.database.ServerValue.increment(-destroyAmount))
    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(item)
      .get()
      .then(async (snapshot) => {
        if (snapshot.val() === 0) {
          handleUnequip()
        }
      })
    setDestroyAmount(1)
  }

  const handleUnequip = async () => {
    setModalVisible(false)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/equipped`)
      .set(null)
      .then(setModalVisible(false))
  }

  const handleOpen = async (item) => {
    setModalVisible(true)
    setCurrentItem(item)
    try {
      await Firebase.database()
        .ref(`users/${user.uid}/userData/newItems/${item.name}`)
        .set(null)
    } catch (error) {}
  }

  useEffect(() => {
    async function init() {
      Firebase.database()
        .ref(`users/${user.uid}`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            setEquipped(snapshot.val().userData.equipped)
          }
        })

      Firebase.database()
        .ref(`users/${user.uid}/userData/newItems`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            var items = []
            snapshot.forEach(function (childNodes) {
              items.push(childNodes.key)
            })
            setNewItems(items)
          } else {
            setNewItems([])
          }
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
    const interval = setInterval(() => init(), 500)
    return () => clearInterval(interval)
  }, [])

  const renderItem = ({ item }) => (
    <ItemButton
      name={item.name}
      amount={item.amount}
      onPress={() => handleOpen(item)}
      colour={item.name}
      margin={20}
      equipped={equipped}
      newItem={newItems.includes(item.name)}
      probability={item.probability}
    />
  )

  return (
    <BlurView
      intensity={100}
      tint='light'
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
          animationType='fade'
          transparent={true}
          visible={unableEquipModal}
          onRequestClose={() => {
            setUnableEquipModal(false)
          }}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { height: 200 }]}>
              <Font style={styles.text}>
                You must {currentItem.skill} level {currentItem.equipLevel} to
                equip {currentItem.name}.
              </Font>
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
                    setUnableEquipModal(false)
                  }}
                ></Button>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType='fade'
          transparent={true}
          visible={destroyModalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.')
            setDestroyModalVisible(false), setDestroyAmount(1)
          }}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { height: 400 }]}>
              <ItemIcon name={currentItem.name} size={120} />
              <Font style={styles.text}>Destroy {currentItem.name}</Font>
              <View
                style={{
                  position: 'absolute',
                  bottom: 20,
                  width: 120,
                }}
              >
                <Font style={{ alignSelf: 'center' }}>{destroyAmount}</Font>

                <Slider
                  style={{ width: 200, height: 40, alignSelf: 'center' }}
                  minimumValue={1}
                  maximumValue={getAmount()}
                  minimumTrackTintColor='#eee'
                  maximumTrackTintColor='#eee'
                  thumbTintColor='#6DA34D'
                  step={Math.ceil(getAmount() / 100)}
                  onValueChange={(value) => setDestroyAmount(value)}
                />

                <Button
                  title={'Destroy'}
                  backgroundColor={'#eee'}
                  containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                  onPress={() => {
                    handleDestroy(currentItem.name),
                      setDestroyModalVisible(false)
                  }}
                ></Button>
                <Button
                  title={'Close'}
                  backgroundColor={'#eee'}
                  containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                  onPress={() => {
                    setDestroyModalVisible(false)
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

              <View style={{ alignSelf: 'center', alignContent: 'flex-start' }}>
                {currentItem.type === 'tool' ? (
                  <Font style={styles.textLight}>
                    Efficiency: {currentItem.efficiency}
                    {`\n`}
                    Strength: {currentItem.strength}
                  </Font>
                ) : null}
                {currentItem.type === 'block' ? (
                  <Font style={styles.textLight}>
                    Rarity: {currentItem.probability}%
                  </Font>
                ) : null}

                {inventory !== null ? (
                  <Font style={styles.textLight}>Quantity: {getAmount()}</Font>
                ) : null}
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 20,
                  width: 120,
                }}
              >
                {currentItem.type === 'tool' &&
                currentItem.name !== equipped ? (
                  <Button
                    title={'Equip'}
                    backgroundColor={'#eee'}
                    containerStyle={{ marginTop: 10, alignSelf: 'center' }}
                    onPress={() => {
                      handleEquip(currentItem)
                    }}
                  ></Button>
                ) : null}

                {currentItem.name === equipped ? (
                  <Button
                    title={'Unequip'}
                    backgroundColor={'#eee'}
                    containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                    onPress={() => {
                      handleUnequip(currentItem.name)
                    }}
                  ></Button>
                ) : null}
                {currentItem.name === 'Furnace' ? (
                  <Button
                    title={'Use'}
                    backgroundColor={'#eee'}
                    containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                    onPress={() => {
                      handleFurnace()
                    }}
                  ></Button>
                ) : null}
                <Button
                  title={'Destroy'}
                  backgroundColor={'#eee'}
                  containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                  onPress={() => {
                    setModalVisible(false),
                      setDestroyAmount(1),
                      setDestroyModalVisible(true)
                  }}
                ></Button>

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
        <StatusBar style='light' />
        <View style={{ margin: 24, marginTop: 72 }}></View>
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
            title={'Tools'}
            titleSize={12}
            width={90}
            containerStyle={{ alignSelf: 'center', margin: 5 }}
            onPress={() => {
              setFilterType('tool')
            }}
            enabled={filterType === 'tool'}
          ></Button>
          <Button
            title={'Resources'}
            titleSize={12}
            width={90}
            containerStyle={{ alignSelf: 'center', margin: 5 }}
            onPress={() => {
              setFilterType('resource')
            }}
            enabled={filterType === 'resource'}
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
