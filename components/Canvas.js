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
import Expo, { AR } from 'expo'
import * as THREE from 'three'
import ExpoTHREE, {
  Renderer,
  TextureLoader,
  createARBackgroundTexture,
} from 'expo-three'
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl'
import * as React from 'react'
import { useState, forwardRef, useImperativeHandle } from 'react'
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler'
import * as TWEEN from '@tweenjs/tween.js'
import * as Haptics from 'expo-haptics'
import { Audio } from 'expo-av'
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
  sky,
  floors,
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
  unit = 0.065,
  currentBlock = {
    name: 'stone',
    health: 5,
    colour: 'grey',
  },
  rotationSpeed = 0.001

function Canvas(props, ref) {
  const [sound, setSound] = React.useState()

  async function playSound(type) {
    let blockHit

    if (type === 'hit') {
      blockHit = await Audio.Sound.createAsync(
        require(`../assets/sounds/hit.mp3`)
      )
    } else if (type === 'break') {
      blockHit = await Audio.Sound.createAsync(
        require(`../assets/sounds/break.mp3`)
      )
    }

    const { sound } = blockHit

    setSound(sound)
    await sound.replayAsync()
  }

  React.useEffect(() => {
    return sound
      ? () => {
          setTimeout(function () {
            console.log('Unloading Sound')
            sound.unloadAsync()
          }, 500)
        }
      : undefined
  }, [sound])

  useImperativeHandle(
    ref,
    () => ({
      setFromOutside(block) {
        currentBlock = Object.create(block)
      },
    }),
    []
  )

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

      //renderer
      renderer = new Renderer({ gl, depth: false })
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight)
      renderer.antialias = false
      renderer.setClearColor(0x000000, 0)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      //camera
      camera = new THREE.PerspectiveCamera(
        2,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      )
      camera.position.z = 1
      camera.position.y = 3.5

      mouse = new THREE.Vector2()

      //materials
      const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(),
      })

      //lights
      const light5 = new THREE.DirectionalLight(0xffffff, 1)
      light5.position.set(-100, 150, -150)
      light5.shadow.mapSize.set(8192, 8192)
      light5.castShadow = true

      const ambientLight = new THREE.AmbientLight(0xffffff, 1)

      world.add(light5)
      world.add(ambientLight)

      //assets
      const uri = Asset.fromModule(require('../assets/models/cube.glb')).uri
      const floorUri = Asset.fromModule(
        require('../assets/models/floor.glb')
      ).uri
      const tex = Asset.fromModule(require('../assets/models/cube.png')).uri
      const floorTex = Asset.fromModule(
        require('../assets/models/floor.png')
      ).uri

      //models
      let model, texture, skyModel, floorTexture
      let floorModels = []
      let ms = []

      let sizes = [0, 1, 9, 25, 49, 81, 121, 169, 225, 289]
      let levels = 1
      floors = sizes[7]
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
        ms[i] = loadModel(floorUri).then((result) => {
          floorModels[i] = result.scene.children[0]
        })
      }

      Promise.all([m1, t1, t2, m2, ms[area - 1]]).then(() => {
        //cube
        cube = model
        cube.material = new THREE.MeshLambertMaterial({ color: 'grey' })
        cube.material.metalness = 0
        cube.name = 'cube'
        cube.castShadow = true
        cube.material.transparent = true
        world.add(cube)

        //Skybox
        sky = skyModel
        sky.name = 'sky'
        sky.material = new THREE.MeshBasicMaterial({ color: 0xffffff })
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
            outerFloors[lev].material = new THREE.MeshStandardMaterial({
              color: 0xeeeeee,
            })
            outerFloors[lev].material.metalness = 0
            outerFloors[lev].material.roughness = 1
            x = map[i].slice(0, 1)
            z = map[i].slice(1)
            y = level * unit

            outerFloors[lev].position.y = y
            outerFloors[lev].position.x = x
            outerFloors[lev].position.z = z
            outerFloors[lev].name = `floor`
            if (level === -1) {
              outerFloors[lev].receiveShadow = true
            }

            outerFloors[lev].castShadow = false
            world.add(outerFloors[lev])
          }
          l++
        }

        //Particles

        //world
        world.rotation.y = 0.78
        scene.add(world)
        animate()
      })
    }

    async function animate() {
      //Rotate cube
      if (panning) {
        console.log(panning)
        world.rotation.x += deltaY * rotationSpeed
        world.rotation.y += deltaX * rotationSpeed
      }

      if (world.rotation.x > 1.15) {
        world.rotation.x = 1.15
      }
      if (world.rotation.x < -0.35) {
        world.rotation.x = -0.35
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
      const minimum = 8
      const maximum = 15 + floors
      const threshold = 0.5
      camera.position.z -= scale / 15
      if (scale > 0) {
        scale -= 0.1
      }
      if (scale < 0) {
        scale += 0.1
      }
      if (scale > 0) {
        scale -= 0.1
      }
      if (scale < 0) {
        scale += 0.1
      }

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

  function animation(type, target, reference) {
    const place = new TWEEN.Tween(target.position)
      .to(
        {
          x: reference.position.x,
          y: reference.position.y + unit,
          z: reference.position.z,
        },
        300
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Exponential.Out)

    const cancel = new TWEEN.Tween(target.position)
      .to(
        {
          x: reference.position.x,
          y: reference.position.y - unit,
          z: reference.position.z,
        },
        300
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Exponential.Out)

    const inflate = new TWEEN.Tween(target.scale)
      .to(
        {
          x: 0.035,
          y: 0.034,
          z: 0.035,
        },
        65
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Elastic.Out)

    const inflateSlow = new TWEEN.Tween(target.scale)
      .to(
        {
          x: 0.035,
          y: 0.034,
          z: 0.035,
        },
        300
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Elastic.Out)

    const shrink = new TWEEN.Tween(target.scale)
      .to(
        {
          x: 0.032499998807907104 / 2,
          y: 0.032499998807907104 / 2,
          z: 0.032499998807907104 / 2,
        },
        1
      )
      .yoyo(true)

    const deflate = new TWEEN.Tween(target.scale)
      .to(
        {
          x: 0.032499998807907104,
          y: 0.032499998807907104,
          z: 0.032499998807907104,
        },
        40
      )
      .yoyo(true)

    const rise = new TWEEN.Tween(target.position)
      .to(
        {
          x: reference.position.x,
          y: reference.position.y + unit,
          z: reference.position.z,
        },
        100
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Exponential.In)

    const destroy = new TWEEN.Tween(target.material)
      .to(
        {
          opacity: 0,
        },
        150
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Exponential.Out)
      .onUpdate(() => (target.castShadow = false))
      .onComplete(() => (target.castShadow = true))

    const create = new TWEEN.Tween(target.material)
      .to(
        {
          opacity: 100,
        },
        20
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Exponential.In)

    const returnRotation = new TWEEN.Tween(target.rotation)
      .to(
        {
          x: 0,
          y: 0.78,
          z: 0,
        },
        750
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Elastic.Out)

    if (type === 'place') {
      place.start()
    } else if (type === 'cancel') {
      cancel.start()
    } else if (type === 'rise') {
      inflate.chain(deflate)
      inflate.start()
      rise.start()
    } else if (type === 'click') {
      inflate.chain(deflate)
      inflate.start()
    } else if (type === 'destroy') {
      destroy.chain(shrink)
      shrink.chain(create)
      create.chain(inflateSlow)
      inflateSlow.chain(deflate)
      destroy.start()
    } else if (type === 'returnRotation') {
      returnRotation.start()
    }
  }

  function haptics(style) {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style)
    }
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

    //Placing cube
    if (
      intersects[0].object.name === 'floor' &&
      intersects[0].object.position.y === -unit &&
      hovering.length !== 0
    ) {
      animation('place', hovering[0], intersects[0].object)
      hovering = []
    }
    //Cancel placing cube
    if (
      hovering.length !== 0 &&
      intersects[0].object.name !== 'floor' &&
      !longPressing &&
      !longPressingOut
    ) {
      animation('cancel', hovering[0], hovering[0])
      hovering = []
    }

    if (
      (longPressing && intersects[0].object.name === 'floor') ||
      (longPressing && intersects[0].object.name === 'sky')
    ) {
      haptics(Haptics.ImpactFeedbackStyle.Medium)
      panning = true
    }

    if (intersects[0].object.name === 'cube' && hovering.length === 0) {
      //Picking up cube
      if (longPressing) {
        //animation('rise', intersects[0].object, intersects[0].object)
        //hovering.push(intersects[0].object)
      }
      //Clicking cube
      if (!longPressing) {
        if (currentBlock.health <= 0) {
          props.click(currentBlock.name)
          props.generate()
          haptics(Haptics.ImpactFeedbackStyle.Heavy)
          intersects[0].object.material = new THREE.MeshLambertMaterial({
            color: currentBlock.colour,
          })
          playSound('break')
          animation('destroy', intersects[0].object, intersects[0].object)
        } else {
          haptics(Haptics.ImpactFeedbackStyle.Light)
          playSound('hit')
          animation('click', intersects[0].object, intersects[0].object)
          currentBlock.health -= 1
        }

        //console.log(currentBlock)
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
    console.log('clicked')

    //console.log('Press')
  }

  let handlePressOut = (evt) => {
    if (longPressing) {
      console.log('LongPressOut')
    } else {
      //console.log('PressOut')
    }
  }

  let handlePan = async (evt) => {
    let { nativeEvent } = evt
    deltaX = Math.round(nativeEvent.translationX)
    deltaY = Math.round(nativeEvent.translationY)
  }

  let onPanOut = async (evt) => {
    console.log('pan out')
    let { nativeEvent } = evt

    if (nativeEvent.state === State.END) {
      panning = false
      longPressing = false
      longPressingOut = true
      animation('returnRotation', world, world)
    }
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
          onHandlerStateChange={onPanOut}
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

export default forwardRef(Canvas)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#000',
    fontSize: 24,
    justifyContent: 'center',
    zIndex: 1,
    borderWidth: 0,
    borderColor: '#000',
    padding: 10,
    marginTop: 350,
    backgroundColor: '#fff',
  },
  wrapper: {
    alignItems: 'center',
    transform: [{ scale: 2 }],
  },
  content: {
    width: width / 2,
    height: height / 2,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
})
