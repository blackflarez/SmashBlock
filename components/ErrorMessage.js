import React from 'react'
import { StyleSheet, Text } from 'react-native'

const ErrorMessage = ({ error, visible }) => {
  if (!error || !visible) {
    return null
  }
  let errorMessage
  if (
    error === 'The email address is badly formatted.' ||
    error ===
      'There is no user record corresponding to this identifier. The user may have been deleted.'
  ) {
    errorMessage = 'Invalid email.'
  } else if (
    error === 'The password is invalid or the user does not have a password.'
  ) {
    errorMessage = 'Invalid password.'
  } else if (error == 'Password should be at least 6 characters') {
    errorMessage = 'Password should be at least 6 characters.'
  } else if (
    error === 'The email address is already in use by another account.'
  ) {
    errorMessage = 'That email address is already in use.'
  } else {
    errorMessage = error
  }
  return <Text style={styles.errorText}>{errorMessage}</Text>
}

const styles = StyleSheet.create({
  errorText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 10,
    fontWeight: '600',
  },
})

export default ErrorMessage
