import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native'
import { InputField, ErrorMessage } from '../components'
import Firebase from '../config/firebase'

const auth = Firebase.auth()

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisibility, setPasswordVisibility] = useState(true)
  const [rightIcon, setRightIcon] = useState('eye')
  const [loginError, setLoginError] = useState('')

  const handlePasswordVisibility = () => {
    if (rightIcon === 'eye') {
      setRightIcon('eye-off')
      setPasswordVisibility(!passwordVisibility)
    } else if (rightIcon === 'eye-off') {
      setRightIcon('eye')
      setPasswordVisibility(!passwordVisibility)
    }
  }

  const onLogin = async () => {
    try {
      if (email !== '' && password !== '') {
        await auth.signInWithEmailAndPassword(email, password)
      }
    } catch (error) {
      setLoginError(error.message)
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="dark-content" />
      <Text style={styles.title}>Login</Text>
      <InputField
        inputStyle={{
          fontSize: 14,
        }}
        containerStyle={{
          backgroundColor: '#fff',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#000',
        }}
        leftIcon="email"
        placeholder="Enter email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoFocus={true}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <InputField
        inputStyle={{
          fontSize: 14,
        }}
        containerStyle={{
          backgroundColor: '#fff',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#000',
        }}
        leftIcon="lock"
        placeholder="Enter password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={passwordVisibility}
        textContentType="password"
        rightIcon={rightIcon}
        value={password}
        onChangeText={(text) => setPassword(text)}
        handlePasswordVisibility={handlePasswordVisibility}
      />
      {loginError ? <ErrorMessage error={loginError} visible={true} /> : null}

      <TouchableOpacity onPress={onLogin} style={styles.button}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.subButton}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={styles.subButtonText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    alignSelf: 'center',
    paddingBottom: 24,
    margin: 10,
  },
  button: {
    backgroundColor: '#fff',
    padding: 10,
    borderColor: '#000',
    borderWidth: 1,
    margin: 10,
  },
  subButton: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
  },
  subButtonText: {
    color: '#000',
    textDecorationLine: 'underline',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
  },
})
