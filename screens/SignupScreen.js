import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  View,
  Platform,
} from 'react-native'

import { InputField, ErrorMessage } from '../components'
import Firebase from '../config/firebase'

const auth = Firebase.auth()

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisibility, setPasswordVisibility] = useState(true)
  const [rightIcon, setRightIcon] = useState('eye')
  const [signupError, setSignupError] = useState('')

  const handlePasswordVisibility = () => {
    if (rightIcon === 'eye') {
      setRightIcon('eye-off')
      setPasswordVisibility(!passwordVisibility)
    } else if (rightIcon === 'eye-off') {
      setRightIcon('eye')
      setPasswordVisibility(!passwordVisibility)
    }
  }

  const onHandleSignup = async () => {
    try {
      if (email !== '' && password !== '') {
        await auth.createUserWithEmailAndPassword(email, password)
      }
    } catch (error) {
      setSignupError(error.message)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 50,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar style="dark" />
        <View>
          <Text style={styles.title}>Create new account</Text>
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
        </View>
        {signupError ? (
          <ErrorMessage error={signupError} visible={true} />
        ) : null}
        <TouchableOpacity onPress={onHandleSignup} style={styles.button}>
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.subButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.subButtonText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 118,
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
