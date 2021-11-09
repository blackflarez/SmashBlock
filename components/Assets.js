import { Asset } from 'expo-asset'

export default {
  audio: {
    'hit.m4a': Asset.fromModule(require(`../assets/sounds/hit.m4a`)),
    'break.m4a': Asset.fromModule(require(`../assets/sounds/break.m4a`)),
  },
}
