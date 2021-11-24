import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, Animated, FlatList, Modal } from 'react-native'
import { Button } from '../components'
import { Firebase, Database } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { CraftingButton } from '../components'
import { useStateIfMounted } from 'use-state-if-mounted'

const auth = Firebase.auth()

export default function Crafting({ navigation }, props) {
  const [inventory, setInventory] = useStateIfMounted(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState('')
  const [craftingItems, setCraftingItems] = useState([
    {
      name: 'Stone Pickaxe',
      description: 'Mine blocks fast.',
      recipe: { wood: 5, stone: 10 },
      strength: 2,
      efficiency: 1,
      health: 100,
      equipable: true,
    },
    {
      name: 'Iron Pickaxe',
      description: 'Mine blocks faster.',
      recipe: { wood: 5, iron: 10 },
      strength: 4,
      efficiency: 1,
      health: 200,
      equipable: true,
    },
    {
      name: 'Gold Pickaxe',
      description: 'Mine blocks even faster.',
      recipe: { wood: 5, gold: 10 },
      strength: 8,
      efficiency: 1,
      health: 150,
      equipable: true,
    },
    {
      name: 'Diamond Pickaxe',
      description: 'Mine blocks very fast.',
      recipe: { wood: 5, diamond: 10 },
      strength: 16,
      efficiency: 1,
      health: 200,
      equipable: true,
    },
  ])
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
    setModalVisible(true)
    setCurrentItem(item)
    console.log(item)
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

  const renderItem = ({ item }) =>
    inventory !== null ? (
      <CraftingButton
        name={item.name}
        amount={item.amount}
        onPress={() => handleOpen(item)}
        colour={item.name}
        description={item.description}
        recipe={item.recipe}
        inventory={inventory}
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
              <Text style={styles.title}>{currentItem}</Text>
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
          <Text style={styles.title}>Crafting</Text>
        </View>
        <View style={[styles.halfHeight]}>
          <FlatList
            data={craftingItems}
            renderItem={renderItem}
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
