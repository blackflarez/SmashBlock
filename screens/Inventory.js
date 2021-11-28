import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Animated,
  FlatList,
  Modal,
  Platform,
} from 'react-native'
import { Button, Items, ItemButton, ItemIcon } from '../components'
import { Firebase, Database } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { useStateIfMounted } from 'use-state-if-mounted'
import * as Haptics from 'expo-haptics'

const auth = Firebase.auth()

function haptics(style) {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(style)
  }
}

export default function Inventory({ navigation }, props) {
  const [inventory, setInventory] = useStateIfMounted(null)
  const [modalVisible, setModalVisible] = useStateIfMounted(false)
  const [currentItem, setCurrentItem] = useState(Items[0])
  const { user } = useContext(AuthenticatedUserContext)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [equipped, setEquipped] = useStateIfMounted()

  const handleBack = async () => {
    try {
      navigation.navigate('Home')
    } catch (error) {
      console.log(error)
    }
  }

  function getAmount() {
    try {
      return inventory.find((o) => o.name === currentItem.name).amount
    } catch (e) {}
  }

  const handleEquip = async (item) => {
    haptics(Haptics.ImpactFeedbackStyle.Light)
    setModalVisible(false)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/equipped`)
      .set(item)
      .then(setModalVisible(false))
  }

  const handleDestroy = async (item) => {
    haptics(Haptics.ImpactFeedbackStyle.Light)
    setModalVisible(false)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(item)
      .set(Firebase.firebase_.database.ServerValue.increment(-1))
    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(item)
      .get()
      .then(async (snapshot) => {
        if (snapshot.val() === 0) {
          handleUnequip()
        }
      })
  }

  const handleUnequip = async () => {
    haptics(Haptics.ImpactFeedbackStyle.Light)
    setModalVisible(false)
    await Firebase.database()
      .ref(`users/${user.uid}/userData/equipped`)
      .set(null)
      .then(setModalVisible(false))
  }

  const handleOpen = async (item) => {
    haptics(Haptics.ImpactFeedbackStyle.Light)
    setModalVisible(true)
    setCurrentItem(Items.find((o) => item.name === o.name))
  }

  useEffect(() => {
    async function init() {
      await Firebase.database()
        .ref(`users/${user.uid}`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            setEquipped(snapshot.val().userData.equipped)
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
                let item = childNodes.key
                let amount = childNodes.val()
                items.push({ name: item, amount: amount })
              }
            })
            setInventory(items)
          } else {
            console.log('No data available')
          }

          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }).start()
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
    />
  )

  return (
    <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
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
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.')
            setModalVisible(false)
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <ItemIcon name={currentItem.name} size={120} />
              <Text style={styles.text}>{currentItem.name}</Text>
              <Text style={styles.textLight}>{currentItem.description}</Text>
              <View style={{ alignSelf: 'center', alignContent: 'flex-start' }}>
                {currentItem.type === 'tool' ? (
                  <Text style={styles.textLight}>
                    {`\n`}
                    Efficiency: {currentItem.efficiency}
                    {`\n`}
                    Strength: {currentItem.strength}
                  </Text>
                ) : null}
                {currentItem.type === 'block' ? (
                  <Text style={styles.textLight}>
                    {`\n`}
                    Rarity: {currentItem.probability}%
                  </Text>
                ) : null}

                {inventory !== null ? (
                  <Text style={styles.textLight}>Quantity: {getAmount()}</Text>
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
                      handleEquip(currentItem.name)
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
                <Button
                  title={'Destroy'}
                  backgroundColor={'#eee'}
                  containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                  onPress={() => {
                    handleDestroy(currentItem.name)
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
        <StatusBar style="light" />
        <View style={styles.quarterHeight}>
          <Text style={styles.title}>Inventory</Text>
        </View>
        <View style={[styles.halfHeight]}>
          <FlatList
            data={inventory}
            renderItem={renderItem}
            keyExtractor={(item) => item.name}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={{ marginLeft: 3 }}
            refreshing={true}
          />
        </View>
        <View style={styles.quarterHeight}></View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 250,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfHeight: {
    flex: 6,
    backgroundColor: '#eee',
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  quarterHeight: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 24,
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
    color: '#000',
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
    height: 475,
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
