import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef, useMemo } from 'react'
import {
  StyleSheet,
  View,
  Animated,
  FlatList,
  Modal,
  Platform,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { Button, ItemButton, Items } from '../components'
import { Firebase, Database } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { CraftingButton, Font, ItemIcon, Amount } from '../components'
import { useStateIfMounted } from 'use-state-if-mounted'
import * as Haptics from 'expo-haptics'
import _ from 'lodash'

const auth = Firebase.auth()

function haptics(style) {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(style)
  }
}

export default function Crafting({ navigation }, props) {
  const [pending, setPending] = useState(false)
  const [inventory, setInventory] = useStateIfMounted(null)
  const [craftingAmount, setCraftingAmount] = useState(1)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState(Items[0])
  const [recipeString, setRecipeString] = useState()
  const [craftingItems, setCraftingItems] = useState(
    Items.filter((data) => data.recipe)
  )
  const { user } = useContext(AuthenticatedUserContext)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const handleBack = async () => {
    try {
      navigation.navigate('Home')
    } catch (error) {
      console.log(error)
    }
  }

  function getAmount() {
    let have = 0
    let minimums = []
    for (let i in currentItem.recipe) {
      try {
        have = inventory.find((e) => e.name === i).amount
        minimums.push(Math.floor(have / currentItem.recipe[i]))
      } catch (err) {}
    }
    let amount = Math.min.apply(null, minimums)
    if (craftingAmount > amount) {
      setCraftingAmount(amount)
    }
    return amount
  }

  const handleCraft = async (item) => {
    haptics(Haptics.ImpactFeedbackStyle.Light)
    setPending(true)

    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(`${item.name}`)
      .get()
      .then(async (snapshot) => {
        if (!snapshot.exists()) {
          await Firebase.database()
            .ref(`users/${user.uid}/userData/newItems`)
            .child(`${item.name}`)
            .set(Firebase.firebase_.database.ServerValue.increment(1))
        }
      })

    for (let i in item.recipe) {
      await Firebase.database()
        .ref(`users/${user.uid}/userData/inventory`)
        .child(`${i}`)
        .set(
          Firebase.firebase_.database.ServerValue.increment(
            -item.recipe[i] * craftingAmount
          )
        )
    }

    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(`${item.name}`)
      .set(Firebase.firebase_.database.ServerValue.increment(craftingAmount))
      .then(setPending(false))

    setModalVisible(false)
    setCraftingAmount(1)
  }

  const handleOpen = async (item) => {
    setCurrentItem(item)
    setModalVisible(true)
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
                let item = childNodes.key
                let amount = childNodes.val()
                items.push({ name: item, amount: amount })
              }
            })
            setInventory(items)
            //console.log(inventory)
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

  const craftingButton = ({ item }) =>
    inventory !== null ? (
      <CraftingButton
        name={item.name}
        amount={item.amount}
        onPress={() => handleOpen(item)}
        colour={item.name}
        description={item.description}
        recipe={item.recipe}
        inventory={inventory}
        currentItem={currentItem}
      />
    ) : null

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
                  <Font style={styles.textLight}>
                    Quantity:{' '}
                    {inventory.find((o) => o.name === currentItem.name).amount}
                  </Font>
                ) : null}
              </View>
              <Font
                style={[
                  styles.textLight,
                  { marginBottom: 20, color: '#757575' },
                ]}
              >
                {recipeString}
              </Font>
              <View
                style={{
                  position: 'absolute',
                  bottom: 20,
                  width: 120,
                }}
              >
                <Font style={{ alignSelf: 'center' }}>
                  {craftingAmount + '/' + getAmount(currentItem)}
                </Font>
                <Slider
                  style={{ width: 200, height: 40, alignSelf: 'center' }}
                  minimumValue={1}
                  maximumValue={getAmount(currentItem)}
                  minimumTrackTintColor="#eee"
                  maximumTrackTintColor="#eee"
                  thumbTintColor="#6DA34D"
                  step={1}
                  onValueChange={(value) => setCraftingAmount(value)}
                />
                <Button
                  title={'Craft'}
                  pending={pending}
                  backgroundColor={'#eee'}
                  containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                  onPress={() => {
                    handleCraft(currentItem)
                  }}
                ></Button>
                <Button
                  title={'Close'}
                  backgroundColor={'#eee'}
                  containerStyle={{ marginTop: 20, alignSelf: 'center' }}
                  onPress={() => {
                    setModalVisible(false), setCraftingAmount(1)
                  }}
                ></Button>
              </View>
            </View>
          </View>
        </Modal>
        <StatusBar style="light" />
        <View style={styles.quarterHeight}>
          <Font style={styles.title}>Crafting</Font>
        </View>

        <View style={[styles.halfHeight]}>
          <FlatList
            data={craftingItems}
            renderItem={craftingButton}
            keyExtractor={(item) => item.name}
            numColumns={1}
            scrollEnabled={true}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
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
    margin: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignContent: 'center',
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
