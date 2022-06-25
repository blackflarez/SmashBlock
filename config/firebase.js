import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import Constants from 'expo-constants'

// Initialize Firebase
const firebaseConfig = {
  apiKey: Constants.manifest.extra.apiKey,
  authDomain: Constants.manifest.extra.authDomain,
  projectId: Constants.manifest.extra.projectId,
  storageBucket: Constants.manifest.extra.storageBucket,
  messagingSenderId: Constants.manifest.extra.messagingSenderId,
  appId: Constants.manifest.extra.appId,
  databaseURL: Constants.manifest.extra.databaseURL,
}

let Firebase
let Database

if (firebase.apps.length === 0) {
  Firebase = firebase.initializeApp(firebaseConfig)
  Database = firebase.database()

  console.log(Database)
}

export { Database, Firebase }
export default Firebase
