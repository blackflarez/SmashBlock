import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, Animated, FlatList } from 'react-native'
import { Firebase, Database } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { Amount, Font } from '../components'
import { BlurView } from 'expo-blur'

const auth = Firebase.auth()

export default function Scores({ navigation }, props) {
  const [leaderboard, setLeaderboard] = useState()
  const [levels, setLevels] = useState()
  const [totalLevel, setTotalLevel] = useState()
  const { user } = useContext(AuthenticatedUserContext)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const handleBack = async () => {
    try {
      navigation.navigate('Home')
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    async function init() {
      await Firebase.database()
        .ref(`scores`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            var scores = []
            snapshot.forEach(function (childNodes) {
              scores.push({
                name: childNodes.val().name,
                score: childNodes.val().score ? childNodes.val().score : 0,
              })
            })
            scores.sort((a, b) =>
              a.score < b.score ? 1 : b.score < a.score ? -1 : 4
            )
            setLeaderboard(scores)
          } else {
            console.log('No data available')
          }
        })

      try {
        await Firebase.database()
          .ref(`users/${user.uid}/userData/levels`)
          .get()
          .then(async (snapshot) => {
            if (snapshot.exists()) {
              var levels = []
              var sum = []
              snapshot.forEach(function (childNodes) {
                if (
                  !childNodes.key.includes('XP') &&
                  childNodes.key != 'Level'
                ) {
                  levels.push({ name: childNodes.key, level: childNodes.val() })
                  sum.push(childNodes.val())
                } else if (childNodes.key == 'Level') {
                  setTotalLevel(childNodes.val())
                }
              })
              setLevels(levels)
            } else {
              setLevels([
                { name: 'Crafting', level: 1 },
                { name: 'Mining', level: 1 },
                { name: 'Smelting', level: 1 },
                { name: 'Woodcutting', level: 1 },
              ])
              setTotalLevel(4)

              await Firebase.database()
                .ref(`users/${user.uid}/userData/levels`)
                .set({
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
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: false,
            }).start()
          })
      } catch (error) {}
    }
    init()
  }, [])

  const leaderboardButton = ({ item }) =>
    leaderboard !== null ? (
      <Font style={{ fontSize: 18 }}>
        {item.score} - {item.name}
      </Font>
    ) : null

  const levelsButton = ({ item }) =>
    leaderboard !== null ? (
      <Font style={{ fontSize: 18 }}>
        {item.name} - {item.level}
      </Font>
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
        <StatusBar style="light" />
        <View style={[styles.halfHeight, { marginTop: 72 }]}>
          <Font style={{ fontSize: 18 }}>Total Level - {totalLevel}</Font>
          <FlatList
            data={levels}
            renderItem={levelsButton}
            keyExtractor={(item) => item.name}
            numColumns={1}
            scrollEnabled={false}
            contentContainerStyle={{
              marginVertical: 20,
            }}
          />
        </View>
        <View style={styles.halfHeight}>
          <Font style={styles.title}>Leaderboard</Font>
          <FlatList
            data={leaderboard}
            renderItem={leaderboardButton}
            keyExtractor={(item) => item.name}
            numColumns={1}
            scrollEnabled={false}
            contentContainerStyle={{
              marginVertical: 20,
            }}
          />
        </View>
        <View style={styles.quarterHeight}></View>
      </Animated.View>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  halfHeight: {
    flex: 3,
    margin: 24,
  },
  quarterHeight: {
    flex: 1,
    margin: 24,
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
  buttonText: {
    color: '#000',
    fontSize: 16,
  },
})
