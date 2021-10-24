import { StatusBar } from 'expo-status-bar'
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  SafeAreaView,
  Platform,
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
import * as TWEEN from '@tweenjs/tween.js'
import * as Haptics from 'expo-haptics'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Asset } from 'expo-asset'
import { decode, encode } from 'base-64'
import { MeshBasicMaterial } from 'three'

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
  sky,
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
  panning = false,
  longPressing = false,
  longPressingOut = false,
  hovering = [],
  unit = 0.065

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
      world = new THREE.Group()
      //scene.background = new THREE.Color(0xffffff)

      //renderer
      renderer = new Renderer({ gl, depth: false })

      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight)
      renderer.antialias = false
      renderer.setClearColor(0x000000, 0)
      renderer.shadowMap.enabled = true

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

      mouse = new THREE.Vector2()

      //materials
      const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(),
      })

      //lights
      const light5 = new THREE.DirectionalLight(0xffffff, 1.5)
      light5.position.set(-100, 150, 150)
      light5.shadow.mapSize.set(8192, 8192)
      light5.castShadow = true

      const ambientLight = new THREE.AmbientLight(0xffffff, 1)

      world.add(light5)
      world.add(ambientLight)

      //assets
      const uri = Asset.fromModule(require('../assets/models/cube.glb')).uri
      const tex = Asset.fromModule(require('../assets/models/cube.png')).uri
      const floorTex = Asset.fromModule(
        require('../assets/models/floor.png')
      ).uri

      //models
      let model, texture, skyModel, floorTexture
      let floorModels = []
      let ms = []

      let sizes = [1, 9, 25, 49, 81, 121, 169, 225, 289]
      let levels = 3
      let floors = sizes[4]
      let area = levels * floors

      let m1 = loadModel(uri).then((result) => {
        model = result.scene.children[0]
      })

      let m2 = loadModel(uri).then((result) => {
        skyModel = result.scene.children[0]
      })

      let t1 = loadTexture(tex).then((result) => {
        texture = result
      })
      let t2 = loadTexture(floorTex).then((result) => {
        floorTexture = result
      })

      for (let i = 0; i < area; i++) {
        ms[i] = loadModel(uri).then((result) => {
          floorModels[i] = result.scene.children[0]
        })
      }

      Promise.all([m1, t1, t2, m2, ms[area]]).then(() => {
        //cube
        cube = model
        texture.flipY = false
        texture.magFilter = THREE.NearestFilter
        texture.anisotropy = 16
        cube.traverse((o) => {
          if (o.isMesh) o.material.map = texture
          o.material.metalness = 0
        })
        cube.name = 'cube'
        cube.castShadow = true
        world.add(cube)

        //Skybox
        sky = skyModel
        sky.name = 'sky'
        sky.material = new THREE.MeshBasicMaterial({ color: 0x78a7f1 })
        sky.material.side = THREE.BackSide
        sky.scale.x = 600
        sky.scale.z = 600
        sky.scale.y = 600
        scene.add(sky)

        //Floors
        var x = unit
        var z = unit
        var y = unit
        let length = Math.sqrt(floors)
        let map = []

        function addCell(x, z) {
          map.push([x * unit, z * unit])
        }

        function createMap(rowCount, columnCount) {
          for (
            let x = -Math.floor(length / 2);
            x < rowCount - Math.floor(length / 2);
            x++
          ) {
            for (
              let z = -Math.floor(length / 2);
              z < columnCount - Math.floor(length / 2);
              z++
            ) {
              addCell(x, z)
            }
          }
        }

        createMap(length, length)
        let l = 0
        for (let level = -levels; level < 0; level++) {
          for (let i = 0; i < floors; i++) {
            let lev = i + l * floors
            outerFloors[lev] = floorModels[lev]
            floorTexture.flipY = false
            floorTexture.magFilter = THREE.NearestFilter
            floorTexture.anisotropy = 16
            outerFloors[lev].traverse((o) => {
              if (o.isMesh) o.material.map = floorTexture
              o.material.metalness = 0
            })

            x = map[i].slice(0, 1)
            z = map[i].slice(1)
            y = level * unit

            outerFloors[lev].position.y = y
            outerFloors[lev].position.x = x
            outerFloors[lev].position.z = z
            outerFloors[lev].name = `floor`
            outerFloors[lev].receiveShadow = true
            outerFloors[lev].castShadow = false
            world.add(outerFloors[lev])
          }
          l++
        }

        //world
        world.rotation.x = 0.2
        world.rotation.y = 0.77
        scene.add(world)
        animate()
      })
    }

    async function animate() {
      //Rotate cube
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

      //Scale cube
      const minimum = 10
      const maximum = 18
      const threshold = 0.5

      camera.position.z -= scale / 10

      if (camera.position.z < minimum) {
        camera.position.z = minimum
      }
      if (camera.position.z > maximum) {
        camera.position.z = maximum
      }

      TWEEN.update()
      camera.lookAt(0, 0, 0)
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      gl.endFrameEXP()
    }

    init()
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
      //Placing cube
      if (
        intersects[0].object.name === 'floor' &&
        intersects[0].object.position.y === -unit &&
        hovering.length !== 0
      ) {
        const place = new TWEEN.Tween(hovering[0].position)
          .to(
            {
              x: intersects[0].object.position.x,
              y: intersects[0].object.position.y + unit,
              z: intersects[0].object.position.z,
            },
            300
          )
          .yoyo(true)
          .easing(TWEEN.Easing.Exponential.Out)

        place.start()
        hovering = []
      }
      //Cancel placing cube
      if (
        hovering.length !== 0 &&
        intersects[0].object.name !== 'floor' &&
        !longPressing &&
        !longPressingOut
      ) {
        const place = new TWEEN.Tween(hovering[0].position)
          .to(
            {
              x: hovering[0].position.x,
              y: hovering[0].position.y - unit,
              z: hovering[0].position.z,
            },
            300
          )
          .yoyo(true)
          .easing(TWEEN.Easing.Exponential.Out)

        place.start()
        hovering = []
      }

      function haptics(style) {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(style)
        }
      }

      if (intersects[0].object.name === 'cube' && hovering.length === 0) {
        //Picking up cube
        if (longPressing) {
          haptics(Haptics.ImpactFeedbackStyle.Light)
          const rise = new TWEEN.Tween(cube.position)
            .to(
              {
                x: intersects[0].object.position.x,
                y: intersects[0].object.position.y + unit,
                z: intersects[0].object.position.z,
              },
              100
            )
            .yoyo(true)
            .easing(TWEEN.Easing.Exponential.In)

          const inflate = new TWEEN.Tween(cube.scale)
            .to(
              {
                x: 0.037,
                y: 0.032,
                z: 0.037,
              },
              100
            )
            .yoyo(true)
            .easing(TWEEN.Easing.Elastic.Out)

          const deflate = new TWEEN.Tween(cube.scale)
            .to(
              {
                x: 0.032499998807907104,
                y: 0.032499998807907104,
                z: 0.032499998807907104,
              },
              25
            )
            .yoyo(true)

          inflate.chain(deflate)
          inflate.start()

          rise.start()
          hovering.push(intersects[0].object)
        }
        //Clicking cube
        else if (hovering.length === 0) {
          const inflate = new TWEEN.Tween(cube.scale)
            .to(
              {
                x: 0.037,
                y: 0.032,
                z: 0.037,
              },
              100
            )
            .yoyo(true)
            .easing(TWEEN.Easing.Elastic.Out)

          const deflate = new TWEEN.Tween(cube.scale)
            .to(
              {
                x: 0.032499998807907104,
                y: 0.032499998807907104,
                z: 0.032499998807907104,
              },
              25
            )
            .yoyo(true)

          inflate.chain(deflate)
          inflate.start()

          props.click()
        }
      }
    }
  }

  let handleLongPress = (evt) => {
    longPressing = true
    raycast(evt)
    console.log('LongPress')
  }

  let handlePress = (evt) => {
    let { nativeEvent } = evt
    raycast(evt)
    console.log('Press')
  }

  let handlePressOut = (evt) => {
    if (longPressing) {
      console.log('LongPressOut')
      longPressing = false
      //longPressingOut = true
      //raycast(evt)
    } else {
      console.log('PressOut')
    }
  }

  let handlePan = async (evt) => {
    panning = true
    let { nativeEvent } = evt
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
            <Pressable
              onLongPress={handleLongPress}
              onPressOut={handlePressOut}
              onPress={handlePress}
            >
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
    backgroundColor: '#000',
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
    transform: [{ scale: 3 }],
  },
  content: {
    width: width / 3,
    height: height / 3,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
})
