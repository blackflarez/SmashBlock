import { StatusBar } from 'expo-status-bar'
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ImageBackground,
  SafeAreaView,
} from 'react-native'
import Expo from 'expo'
import * as THREE from 'three'
import ExpoTHREE, { Renderer, TextureLoader } from 'expo-three'
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl'
import * as React from 'react'
import {
  PanGestureHandler,
  PinchGestureHandler,
} from 'react-native-gesture-handler'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Asset } from 'expo-asset'
import { decode, encode } from 'base-64'

if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

export default function Canvas(props) {
  var cube,
    renderer,
    scene,
    camera,
    speed,
    deltaX = 0,
    deltaY = 0,
    scale = 0

  async function onContextCreate(gl) {
    function loadModel(url) {
      return new Promise((resolve) => {
        new GLTFLoader().load(url, resolve)
      })
    }

    function loadTexture(url) {
      return new Promise((resolve) => {
        new TextureLoader().load(url, resolve)
      })
    }

    async function init() {
      //scene
      scene = new THREE.Scene()
      //scene.background = new THREE.Color(0xffffff)

      //renderer
      renderer = new Renderer({ gl })
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight)
      renderer.antialias = false
      renderer.setClearColor(0x000000, 0)

      //camera
      camera = new THREE.PerspectiveCamera(
        2,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      )
      camera.position.z = 500
      camera.position.y = 2
      camera.rotation.x = -0.5

      //materials
      const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(),
      })

      //lights
      const light = new THREE.SpotLight(0xffffff, 5)
      light.position.set(0, 50, 30)
      const light2 = new THREE.SpotLight(0xffffff, 5)
      light2.position.set(0, -50, -30)
      const light3 = new THREE.SpotLight(0xffffff, 5)
      light3.position.set(25, 30, 50)
      const light4 = new THREE.SpotLight(0xffffff, 5)
      light4.position.set(-25, -30, -50)
      scene.add(light)
      scene.add(light2)
      scene.add(light3)
      scene.add(light4)

      //models
      const uri = Asset.fromModule(require('../assets/models/cube.glb')).uri
      const tex = Asset.fromModule(require('../assets/models/cube.png')).uri

      let model, texture
      let m1 = loadModel(uri).then((result) => {
        model = result.scene.children[0]
      })
      let t1 = loadTexture(tex).then((result) => {
        texture = result
      })

      Promise.all([m1, t1]).then(() => {
        cube = model
        texture.flipY = false
        texture.magFilter = THREE.NearestFilter
        texture.anisotropy = 16
        cube.traverse((o) => {
          if (o.isMesh) o.material.map = texture
        })
        cube.rotation.x = 0.2
        cube.rotation.y = 0.77
        scene.add(cube)
        animate()
      })
    }

    var rotationSpeed = 0.002
    function animate() {
      //rotate cube
      cube.rotation.x += deltaY * 0.003
      cube.rotation.y += deltaX * 0.003

      if (cube.rotation.x > 1.2) {
        cube.rotation.x = 1.2
      }
      if (cube.rotation.x < -0.1) {
        cube.rotation.x = -0.1
      }

      if (deltaX > 0) {
        deltaX -= 1
      }
      if (deltaX < 0) {
        deltaX += 1
      }
      if (deltaY > 0) {
        deltaY -= 1
      }
      if (deltaY < 0) {
        deltaY += 1
      }

      //scale cube
      const minimum = 4
      const maximum = 7
      const threshold = 0.5

      camera.position.z -= scale / 10

      if (camera.position.z < minimum) {
        camera.position.z = minimum
      }
      if (camera.position.z > maximum) {
        camera.position.z = maximum
      }

      camera.lookAt(cube.position)
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      gl.endFrameEXP()
    }

    init()
  }

  function longPress() {
    console.log('pressed in')
  }

  async function press() {
    console.log('pressed')
    props.click()
  }

  function pressOut() {}

  let handlePan = (evt) => {
    console.log('pan')
    let { nativeEvent } = evt
    deltaX = Math.round(nativeEvent.translationX)
    deltaY = Math.round(nativeEvent.translationY)
  }

  let handlePinch = (evt) => {
    let { nativeEvent } = evt
    console.log(nativeEvent)

    scale = nativeEvent.velocity
  }

  return (
    <SafeAreaView style={styles.container}>
      <PinchGestureHandler onGestureEvent={handlePinch}>
        <PanGestureHandler onGestureEvent={handlePan}>
          <View style={styles.wrapper}>
            <Pressable onLongPress={longPress} onPress={press}>
              <GLView
                onContextCreate={onContextCreate}
                style={styles.content}
              />
            </Pressable>
          </View>
        </PanGestureHandler>
      </PinchGestureHandler>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(52, 52, 52, 0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    justifyContent: 'center',
    zIndex: 1,
    borderWidth: 0,
    borderColor: '#ffffff',
    padding: 10,
    marginTop: 350,
    backgroundColor: '#000000',
  },
  wrapper: {
    alignItems: 'center',
    transform: [{ scale: 1 }],
  },
  content: {
    width: 500,
    height: 500,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
})
