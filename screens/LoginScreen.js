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
import { InputField, ErrorMessage, Font, Button } from '../components'
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        scrollEnabled={false}
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
          <Font
            style={{
              fontSize: 24,
              fontWeight: '600',
              color: '#000',
              alignSelf: 'center',
              paddingBottom: 24,
              margin: 10,
            }}
          >
            Login
          </Font>

          <InputField
            inputStyle={{
              fontSize: 14,
            }}
            containerStyle={{
              backgroundColor: '#fff',
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#000',
              borderRadius: 10,
            }}
            leftIcon="email"
            placeholder="Enter email"
            autoCapitalize="none"
            autoFocus={false}
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
              borderRadius: 10,
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
        {loginError ? <ErrorMessage error={loginError} visible={true} /> : null}

        <Button
          title={'LOGIN'}
          onPress={onLogin}
          backgroundColor={'#eee'}
          width={300}
        ></Button>

        <TouchableOpacity
          style={{ position: 'absolute', alignSelf: 'center', bottom: 50 }}
          onPress={() => navigation.navigate('Signup')}
        >
          <Font
            style={{
              color: '#000',
              textDecorationLine: 'underline',
            }}
          >
            Don't have an account? Sign Up
          </Font>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    padding: 10,
    paddingHorizontal: 125,
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
