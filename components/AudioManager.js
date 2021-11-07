import { Audio } from 'expo-av'

// import * as AssetUtils from 'expo-asset-utils';
import Assets from '../components/Assets'

class AudioManager {
  sounds = {}

  playAsync = async (name, isLooping) => {
    if (name in this.sounds) {
      const soundObject = this.sounds[name]
      console.log(this.sounds)
      try {
        //await soundObject.setIsLoopingAsync(isLooping)
        //await soundObject.setPositionAsync(0)
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
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: true,
    })
  }

  setupAudioAsync = async () => {
    console.log('setting up audio')
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
