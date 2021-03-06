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
import { Button, Levels, Items } from '../components'
import { Firebase, Database } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { CraftingButton, Font, ItemIcon, Amount } from '../components'
import { useStateIfMounted } from 'use-state-if-mounted'
import _ from 'lodash'
import { BlurView } from 'expo-blur'

const auth = Firebase.auth()

export default function Crafting({ navigation }, props) {
  const [pending, setPending] = useStateIfMounted(false)
  const [inventory, setInventory] = useStateIfMounted(null)
  const [filterType, setFilterType] = useStateIfMounted('all')
  const [craftingAmount, setCraftingAmount] = useStateIfMounted(1)
  const [modalVisible, setModalVisible] = useStateIfMounted(false)
  const [currentItem, setCurrentItem] = useStateIfMounted(Items[4])
  const [craftingItems, setCraftingItems] = useStateIfMounted(
    Items.filter((data) => data.recipe)
  )
  const { user } = useContext(AuthenticatedUserContext)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [currentLevel, setCurrentLevel] = useStateIfMounted(1)
  const [levelUpModal, setLevelUpModal] = useStateIfMounted(false)
  const [levelUpSkill, setLevelUpSkill] = useStateIfMounted()
  const [levelUpAmount, setLevelUpAmount] = useStateIfMounted()
  const [levelUpDescription, setLevelUpDescription] = useStateIfMounted()
  const [unableCraftModal, setUnableCraftModal] = useStateIfMounted(false)

  const handleBack = async () => {
    try {
      navigation.navigate('Home')
    } catch (error) {
      console.log(error)
    }
  }

  function getRecipe() {
    let list = []
    for (let i in currentItem.recipe) {
      let amount = 0
      try {
        amount =
          inventory.find((e) => e.name === i).amount -
          craftingAmount * currentItem.recipe[i]
      } catch (err) {}
      list.push(
        <Font style={styles.textLight} key={i}>
          {Amount(amount)}/{Amount(currentItem.recipe[i])} {i}
        </Font>
      )
    }
    return list
  }

  function getAmount() {
    let have = 0
    let minimums = []
    for (let i in currentItem.recipe) {
      try {
        have = inventory.find((e) => e.name === i).amount
        minimums.push(Math.floor(have / currentItem.recipe[i]))
      } catch (error) {}
    }
    let amount = Math.min.apply(null, minimums)
    if (craftingAmount > amount && amount > 0) {
      setCraftingAmount(amount)
    }
    return amount
  }

  async function updateLevel(block) {
    await Firebase.database()
      .ref(`users/${user.uid}/userData/levels`)
      .child(`CraftingXP`)
      .set(
        Firebase.firebase_.database.ServerValue.increment(
          block.xpAmount * craftingAmount
        )
      )

    await Firebase.database()
      .ref(`users/${user.uid}/userData/levels`)
      .get()
      .then((snapshot) => {
        let level = snapshot.child(`Crafting`).val()
        let xp = 0.095 * Math.sqrt(snapshot.child(`CraftingXP`).val())
        if (Math.floor(xp) > level) {
          Firebase.database()
            .ref(`users/${user.uid}/userData/levels`)
            .child(`Crafting`)
            .set(Firebase.firebase_.database.ServerValue.increment(1))
            .then(() => {
              setLevelUpModal(true)
              setLevelUpSkill(`Crafting`)
              setLevelUpAmount(level + 1)
              setCurrentLevel(level + 1)
              let description = []
              Object.entries(Levels).forEach(([key, value]) => {
                if (key == 'Crafting') {
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

  const handleCraft = async (item) => {
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
      .then(setPending(false), setModalVisible(false), updateLevel(item))

    setCraftingAmount(1)
  }

  const handleOpen = async (item) => {
    setCurrentItem(item)
    setModalVisible(true)
  }

  const handleOpenLocked = async (item) => {
    setCurrentItem(item)
    setUnableCraftModal(true)
  }

  useEffect(() => {
    Firebase.database()
      .ref(`users/${user.uid}/userData/levels/Crafting`)
      .get()
      .then((snapshot) => {
        setCurrentLevel(snapshot.val())
      })
  }, [])

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
        onPressLocked={() => handleOpenLocked(item)}
        colour={item.name}
        description={item.description}
        recipe={item.recipe}
        inventory={inventory}
        currentItem={currentItem}
        locked={currentLevel < item.craftLevel}
      />
    ) : null

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
          visible={unableCraftModal}
          onRequestClose={() => {
            setUnableCraftModal(false)
          }}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { height: 200 }]}>
              <Font style={styles.text}>
                You must Crafting level {currentItem.craftLevel} to craft{' '}
                {currentItem.name}.
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
                    setUnableCraftModal(false)
                  }}
                ></Button>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={levelUpModal}
          onRequestClose={() => {
            setLevelUpModal(false)
          }}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { height: 300 }]}>
              <Font style={styles.text}>Level Up!</Font>
              <Font
                style={[
                  styles.textLight,
                  { marginBottom: 20, color: '#757575' },
                ]}
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

              {getRecipe()}

              <View
                style={{
                  position: 'absolute',
                  bottom: 20,
                  width: 120,
                }}
              >
                <Font style={{ alignSelf: 'center' }}>
                  {craftingAmount + '/' + getAmount()}
                </Font>
                <Slider
                  style={{ width: 200, height: 40, alignSelf: 'center' }}
                  minimumValue={1}
                  maximumValue={getAmount()}
                  minimumTrackTintColor="#eee"
                  maximumTrackTintColor="#eee"
                  thumbTintColor="#6DA34D"
                  step={Math.ceil(getAmount() / 100)}
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
                    setModalVisible(false)
                    setCraftingAmount(1)
                  }}
                ></Button>
              </View>
            </View>
          </View>
        </Modal>

        <StatusBar style="light" />
        <View style={{ margin: 24, marginTop: 72 }}></View>

        <View style={[styles.halfHeight]}>
          <FlatList
            data={craftingItems}
            renderItem={craftingButton}
            keyExtractor={(item) => item.name}
          />
        </View>
        <View style={styles.row}>
          <Button
            title={'All'}
            titleSize={12}
            width={90}
            containerStyle={{ alignSelf: 'center', margin: 5 }}
            onPress={() => {
              setCraftingItems(Items.filter((data) => data.recipe)),
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
              setCraftingItems(
                Items.filter((data) => data.recipe && data.type === 'tool'),
                setFilterType('tool')
              )
            }}
            enabled={filterType === 'tool'}
          ></Button>
          <Button
            title={'Resources'}
            titleSize={12}
            width={90}
            containerStyle={{ alignSelf: 'center', margin: 5 }}
            onPress={() => {
              setCraftingItems(
                Items.filter((data) => data.recipe && data.type === 'resource'),
                setFilterType('resource')
              )
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
