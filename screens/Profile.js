import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, Animated, Pressable } from 'react-native'
import { Firebase } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { Button, Font, IconButton } from '../components'
import { BlurView } from 'expo-blur'

const auth = Firebase.auth()

export default function Profile({ navigation }, props) {
  const auth = Firebase.auth()
  const [username, setUsername] = useState([])
  const { user } = useContext(AuthenticatedUserContext)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const handleBack = async () => {
    try {
      navigation.navigate('Home')
    } catch (error) {
      console.log(error)
    }
  }

  const handleSettings = async () => {
    try {
      navigation.navigate('Settings')
    } catch (error) {
      console.log(error)
    }
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    async function init() {
      await Firebase.database()
        .ref(`users/${user.uid}/userData/name`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            setUsername(snapshot.val())
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
  }, [])

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

        <View
          style={[
            styles.quarterHeight,
            {
              marginTop: 72,
            },
          ]}
        >
          <Font style={styles.title}>{username}</Font>
        </View>
        <View style={styles.halfHeight}>
          <Font style={styles.title}>Friends</Font>
        </View>
        <View
          style={[
            styles.quarterHeight,
            { flexDirection: 'row', alignSelf: 'center' },
          ]}
        >
          <Button
            title="Log Out"
            onPress={handleSignOut}
            width={125}
            titleSize={18}
            containerStyle={{
              marginHorizontal: 10,
              marginBottom: 64,
              alignSelf: 'center',
            }}
            icon={'logout-variant'}
          />
          <Button
            title="Settings"
            onPress={handleSettings}
            width={125}
            titleSize={18}
            containerStyle={{
              marginHorizontal: 10,
              marginBottom: 64,
              alignSelf: 'center',
            }}
            icon={'cog'}
          />
        </View>
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
