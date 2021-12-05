import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef, useMemo } from 'react'
import { StyleSheet, Text, View, Animated, FlatList, Modal } from 'react-native'
import { Button, ItemButton, Items } from '../components'
import { Firebase, Database } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { CraftingButton, Font } from '../components'
import { useStateIfMounted } from 'use-state-if-mounted'
import _ from 'lodash'

const auth = Firebase.auth()

export default function Crafting({ navigation }, props) {
  const [pending, setPending] = useState(false)
  const [inventory, setInventory] = useStateIfMounted(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState()
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

  const handleOpen = async (item) => {
    setCurrentItem(item)
    setPending(true)
    let amount = 1

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
        .set(Firebase.firebase_.database.ServerValue.increment(-item.recipe[i]))
    }

    await Firebase.database()
      .ref(`users/${user.uid}/userData/inventory`)
      .child(`${item.name}`)
      .set(Firebase.firebase_.database.ServerValue.increment(amount))
      .then(setPending(false))
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
        pending={pending}
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
              <Font style={styles.title}>{currentItem}</Font>
              <Button
                title={'Close'}
                onPress={() => {
                  setModalVisible(false)
                }}
              ></Button>
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
    width: 200,
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
