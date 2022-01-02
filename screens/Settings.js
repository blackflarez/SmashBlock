import { StatusBar } from 'expo-status-bar'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, Animated, Platform } from 'react-native'
import { ToggleButton } from 'react-native-paper'
import { Firebase } from '../config/firebase'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider'
import { Button, Font, IconButton, Config } from '../components'
import { BlurView } from 'expo-blur'
import { useStateIfMounted } from 'use-state-if-mounted'

const auth = Firebase.auth()

export default function Settings({ navigation }, props) {
  const auth = Firebase.auth()
  const [username, setUsername] = useState([])
  const { user } = useContext(AuthenticatedUserContext)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [config, setConfig] = useStateIfMounted(Config)

  const handleBack = async () => {
    try {
      navigation.navigate('Profile')
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

  const handleEnableHaptics = async () => {
    try {
      setConfig({ ...config, hapticsEnabled: true })
    } catch (error) {
      console.log(error)
    }
  }

  const handleDisableHaptics = async () => {
    try {
      setConfig({ ...config, hapticsEnabled: false })
    } catch (error) {
      console.log(error)
    }
  }

  const handleDisableShadows = async () => {
    try {
      setConfig({ ...config, shadowEnabled: false })
    } catch (error) {
      console.log(error)
    }
  }

  const handleLowShadows = async () => {
    try {
      setConfig({ ...config, shadowEnabled: true, shadowSize: 128 })
    } catch (error) {
      console.log(error)
    }
  }

  const handleHighShadows = async () => {
    try {
      setConfig({ ...config, shadowEnabled: true, shadowSize: 256 })
    } catch (error) {
      console.log(error)
    }
  }

  const handleEnableDestruction = async () => {
    try {
      setConfig({ ...config, destructionEnabled: true })
    } catch (error) {
      console.log(error)
    }
  }

  const handleDisableDestruction = async () => {
    try {
      setConfig({ ...config, destructionEnabled: false })
    } catch (error) {
      console.log(error)
    }
  }

  const handleEnableParticles = async () => {
    try {
      setConfig({ ...config, particlesEnabled: true })
    } catch (error) {
      console.log(error)
    }
  }

  const handleDisableParticles = async () => {
    try {
      setConfig({ ...config, particlesEnabled: false })
    } catch (error) {
      console.log(error)
    }
  }

  const handleLowResolution = async () => {
    try {
      setConfig({ ...config, renderScale: 0.25 })
    } catch (error) {
      console.log(error)
    }
  }

  const handleMediumResolution = async () => {
    try {
      setConfig({ ...config, renderScale: 0.5 })
    } catch (error) {
      console.log(error)
    }
  }

  const handleHighResolution = async () => {
    try {
      setConfig({ ...config, renderScale: 1 })
    } catch (error) {
      console.log(error)
    }
  }

  const handleApply = async () => {
    try {
      await Firebase.database()
        .ref(`users/${user.uid}/userData/config`)
        .set(config)
        .then(handleBack())
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    async function init() {
      await Firebase.database()
        .ref(`users/${user.uid}/userData/config`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            setConfig(snapshot.val())
            console.log(snapshot.val())
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
        ></View>
        <View
          style={[
            styles.halfHeight,
            {
              flexDirection: 'column',
              alignSelf: 'center',
            },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 5,
              }}
            >
              <Font style={{ fontSize: 18, marginRight: 5, width: 115 }}>
                Haptics
              </Font>
              <Button
                title="Off"
                onPress={handleDisableHaptics}
                enabled={!config.hapticsEnabled}
                width={75}
                titleSize={16}
                containerStyle={{
                  marginHorizontal: 5,
                }}
              />
              <Button
                title="On"
                onPress={handleEnableHaptics}
                enabled={config.hapticsEnabled}
                width={75}
                titleSize={16}
                containerStyle={{
                  marginHorizontal: 5,
                }}
              />
            </View>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 5,
            }}
          >
            <Font
              style={{
                fontSize: 18,
                marginRight: 5,
                width: 115,
              }}
            >
              Destruction
            </Font>
            <Button
              title="Off"
              onPress={handleDisableDestruction}
              enabled={!config.destructionEnabled}
              width={75}
              titleSize={16}
              containerStyle={{
                marginHorizontal: 5,
              }}
            />
            <Button
              title="On"
              onPress={handleEnableDestruction}
              enabled={config.destructionEnabled}
              width={75}
              titleSize={16}
              containerStyle={{
                marginHorizontal: 5,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 5,
            }}
          >
            <Font
              style={{
                fontSize: 18,
                marginRight: 5,
                width: 115,
              }}
            >
              Particles
            </Font>
            <Button
              title="Off"
              onPress={handleDisableParticles}
              enabled={!config.particlesEnabled}
              width={75}
              titleSize={16}
              containerStyle={{
                marginHorizontal: 5,
              }}
            />
            <Button
              title="On"
              onPress={handleEnableParticles}
              enabled={config.particlesEnabled}
              width={75}
              titleSize={16}
              containerStyle={{
                marginHorizontal: 5,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 5,
            }}
          >
            <Font
              style={{
                fontSize: 18,
                marginRight: 5,
                width: 115,
              }}
            >
              Shadows
            </Font>
            <Button
              title="Off"
              onPress={handleDisableShadows}
              enabled={!config.shadowEnabled}
              width={75}
              titleSize={16}
              containerStyle={{
                marginHorizontal: 5,
              }}
            />
            <Button
              title="Low"
              onPress={handleLowShadows}
              enabled={config.shadowSize < 256 && config.shadowEnabled}
              width={75}
              titleSize={16}
              containerStyle={{
                marginHorizontal: 5,
              }}
            />
            <Button
              title="High"
              onPress={handleHighShadows}
              enabled={config.shadowSize === 256 && config.shadowEnabled}
              width={75}
              titleSize={16}
              containerStyle={{
                marginHorizontal: 5,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 5,
            }}
          >
            <Font
              style={{
                fontSize: 18,
                marginRight: 5,
                width: 115,
              }}
            >
              Resolution
            </Font>
            <Button
              title="Low"
              onPress={handleLowResolution}
              enabled={config.renderScale === 0.25}
              width={75}
              titleSize={16}
              containerStyle={{
                marginHorizontal: 5,
              }}
            />
            <Button
              title="Med"
              onPress={handleMediumResolution}
              enabled={config.renderScale === 0.5}
              width={75}
              titleSize={16}
              containerStyle={{
                marginHorizontal: 5,
              }}
            />
            <Button
              title="High"
              onPress={handleHighResolution}
              enabled={config.renderScale === 1}
              width={75}
              titleSize={16}
              containerStyle={{
                marginHorizontal: 5,
              }}
            />
          </View>
        </View>
        <View
          style={[
            styles.quarterHeight,
            {
              marginTop: 72,
              flexDirection: 'row',
              justifyContent: 'center',
            },
          ]}
        >
          <Button
            title="Cancel"
            onPress={handleBack}
            width={120}
            titleSize={18}
            containerStyle={{
              marginHorizontal: 10,
              marginBottom: 64,
              alignSelf: 'center',
            }}
          />
          <Button
            title="Apply"
            onPress={handleApply}
            width={120}
            titleSize={18}
            containerStyle={{
              marginHorizontal: 10,
              marginBottom: 64,
              alignSelf: 'center',
            }}
          />
        </View>
      </Animated.View>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  halfHeight: {
    flex: 3,
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
