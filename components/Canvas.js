import { StatusBar } from 'expo-status-bar'
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
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

var deltaX = 0,
  deltaY = 0,
  scale = 0,
  cube,
  floor,
  outerFloors = [],
  world,
  renderer,
  scene,
  camera,
  speed,
  raycaster,
  mouse,
  width = Dimensions.get('window').width,
  height = Dimensions.get('window').height,
  panning = false

export default function Canvas(props) {
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
      renderer = new Renderer({ gl, depth: false })

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
      camera.position.z = 1
      camera.position.y = 2
      camera.rotation.x = -0.5
      //camera.position.set(-0.5, 2, 1.0).multiplyScalar(20)
      mouse = new THREE.Vector2()

      //materials
      const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(),
      })

      //lights
      const light = new THREE.SpotLight(0xffffff, 2)
      light.position.set(0, 25, 30)
      const light2 = new THREE.SpotLight(0xffffff, 2)
      light2.position.set(0, -35, -30)
      const light3 = new THREE.SpotLight(0xffffff, 2)
      light3.position.set(25, 25, 50)
      const light4 = new THREE.SpotLight(0xffffff, 2)
      light4.position.set(-25, -35, -50)
      const light5 = new THREE.DirectionalLight(0xffffff, 1)
      light5.castShadow = true

      scene.add(light)
      scene.add(light2)
      scene.add(light3)
      scene.add(light4)
      scene.add(light5)

      //assets
      const uri = Asset.fromModule(require('../assets/models/cube.glb')).uri
      const tex = Asset.fromModule(require('../assets/models/cube.png')).uri
      const floorTex = Asset.fromModule(
        require('../assets/models/floor.png')
      ).uri

      //models
      let model, texture, floorModel, floorTexture
      let floorModels = []
      let ms = []
      world = new THREE.Group()
      let floors = 9

      let m1 = loadModel(uri).then((result) => {
        model = result.scene.children[0]
      })
      let t1 = loadTexture(tex).then((result) => {
        texture = result
      })
      let t2 = loadTexture(floorTex).then((result) => {
        floorTexture = result
      })
      for (let i = 0; i < floors; i++) {
        ms[i] = loadModel(uri).then((result) => {
          floorModels[i] = result.scene.children[0]
        })
      }

      Promise.all([m1, t1, t2, ms[7]]).then(() => {
        //cube
        cube = model
        texture.flipY = false
        texture.magFilter = THREE.NearestFilter
        texture.anisotropy = 16
        cube.traverse((o) => {
          if (o.isMesh) o.material.map = texture
        })
        cube.name = 'cube'
        world.add(cube)

        //outerFloors
        const unit = 0.065
        var x = unit
        var z = unit
        for (let i = 0; i < floors; i++) {
          outerFloors[i] = floorModels[i]
          floorTexture.flipY = false
          floorTexture.magFilter = THREE.NearestFilter
          floorTexture.anisotropy = 16
          outerFloors[i].traverse((o) => {
            if (o.isMesh) o.material.map = floorTexture
          })

          //console.log(i + 1)
          console.log((i + 1) % 3)

          if ((i + 1) % (floors / 3) === 1) {
            x = -unit
          }
          if ((i + 1) % (floors / 3) === 2) {
            x = 0
          }
          if ((i + 1) % (floors / 3) === 0) {
            x = unit
          }
          if (i + 1 <= floors / 3) {
            z = unit
          }
          if (i + 1 > (floors / 3) * 2) {
            z = -unit
          }
          if (i + 1 > floors / 3 && i + 1 <= (floors / 3) * 2) {
            z = 0
          }

          outerFloors[i].position.y = -0.065
          outerFloors[i].position.x = x
          outerFloors[i].position.z = z
          outerFloors[i].name = `floor${i}`
          world.add(outerFloors[i])
        }

        //world
        world.rotation.x = 0.2
        world.rotation.y = 0.77

        scene.add(world)
        animate()
      })
    }

    async function animate() {
      //rotate cube
      var rotationSpeed = 0.001
      world.rotation.x += deltaY * rotationSpeed
      world.rotation.y += deltaX * rotationSpeed

      if (world.rotation.x > 1.3) {
        world.rotation.x = 1.3
      }
      if (world.rotation.x < -0.1) {
        world.rotation.x = -0.1
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
      const minimum = 10
      const maximum = 14
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

  let raycast = async (evt) => {
    let { nativeEvent } = evt
    camera.updateProjectionMatrix()
    mouse.x = (nativeEvent.pageX / width) * 2 - 1
    mouse.y = -(nativeEvent.pageY / height) * 2 + 1
    raycaster = new THREE.Raycaster()
    scene.updateMatrixWorld()
    raycaster.setFromCamera(mouse, camera)
    var intersects = raycaster.intersectObjects(scene.children, true)
    for (var i = 0; i < intersects.length; i++) {
      //console.log(intersects[i].object)
      if (intersects[0].object.name === 'cube') {
        props.click()
      }
    }
  }

  let handlePress = (evt) => {
    let { nativeEvent } = evt
    console.log('pressed')
    raycast(evt)
  }

  function pressOut() {}

  let handlePan = async (evt) => {
    panning = true
    let { nativeEvent } = evt
    //console.log(nativeEvent)
    deltaX = Math.round(nativeEvent.translationX)
    deltaY = Math.round(nativeEvent.translationY)
  }

  let onPanOut = async (evt) => {
    console.log('pan out')
    panning = false
  }

  let handlePinch = (evt) => {
    let { nativeEvent } = evt
    scale = nativeEvent.velocity
  }

  return (
    <SafeAreaView style={styles.container}>
      <PinchGestureHandler onGestureEvent={handlePinch}>
        <PanGestureHandler
          onGestureEvent={handlePan}
          onPanResponderRelease={onPanOut}
        >
          <View style={styles.wrapper}>
            <Pressable onLongPress={longPress} onPress={handlePress}>
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
    transform: [{ scale: 4 }],
  },
  content: {
    width: width / 4,
    height: height / 4,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
})
