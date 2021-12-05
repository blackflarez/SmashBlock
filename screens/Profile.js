import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, Animated, Pressable } from 'react-native'
import { Firebase } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { Button, Font } from '../components'

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
    <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
      <Animated.View
        style={{
          ...props.style,
          opacity: fadeAnim,
          flex: 1,
        }}
      >
        <StatusBar style="light" />

        <View style={styles.quarterHeight}>
          <Font style={styles.title}>{username}</Font>
        </View>
        <View style={styles.halfHeight}>
          <Font style={styles.title}>Friends</Font>
        </View>
        <View style={styles.quarterHeight}>
          <Button
            title="Log Out"
            onPress={handleSignOut}
            width={120}
            titleSize={18}
            backgroundColor={'#eee'}
            containerStyle={{ marginBottom: 48, alignSelf: 'center' }}
          />
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  halfHeight: {
    flex: 3,
    backgroundColor: '#fff',
    margin: 24,
  },
  quarterHeight: {
    flex: 1,
    backgroundColor: '#fff',
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
