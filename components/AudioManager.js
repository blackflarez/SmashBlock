import { Audio } from 'expo-av'

import Assets from '../components/Assets'

class AudioManager {
  sounds = {}

  playAsync = async (name, isLooping) => {
    if (name in this.sounds) {
      const soundObject = this.sounds[name]
      try {
        //await soundObject.setIsLoopingAsync(isLooping)
        //await soundObject.setPositionAsync(0)
        await soundObject.setIsLoopingAsync(isLooping)
        await soundObject.playFromPositionAsync(0)
      } catch ({ message }) {
        console.warn(`Error playing audio: ${message}`)
      }
    } else {
      console.warn("Audio doesn't exist", name)
    }
  }

  stopAsync = async (name) => {
    if (name in this.sounds) {
      const soundObject = this.sounds[name]
      try {
        await soundObject.stopAsync()
      } catch ({ message }) {
        console.warn(`Error stopping audio: ${message}`)
      }
    } else {
      console.warn("Audio doesn't exist", name)
    }
  }

  configureExperienceAudioAsync = async () => {
    await Audio.setIsEnabledAsync(true)
    return Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      playThroughEarpieceAndroid: false,
    })
  }

  setupAudioAsync = async () => {
    const keys = Object.keys(Assets.audio)
    for (let key of keys) {
      const item = Assets.audio[key]
      this.sounds[key.split('.')[0]] = (
        await Audio.Sound.createAsync(item, {
          shouldPlay: false,
          progressUpdateIntervalMillis: 1,
          downloadFirst: true,
        })
      ).sound
    }
  }

  setupAsync = () =>
    Promise.all([this.configureExperienceAudioAsync(), this.setupAudioAsync()])
}

export default new AudioManager()
