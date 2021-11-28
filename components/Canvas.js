import {
  StyleSheet,
  Animated,
  View,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native'
import * as THREE from 'three'
import ExpoTHREE, { Renderer, TextureLoader } from 'expo-three'
import { GLView } from 'expo-gl'
import * as React from 'react'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import {
  LongPressGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler'
import * as TWEEN from '@tweenjs/tween.js'
import * as Haptics from 'expo-haptics'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Asset } from 'expo-asset'
import Items from './Items'
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
  pickaxe,
  pickaxeTexture,
  cubeDestruction = [],
  sky,
  floors,
  plane,
  shadowPlane,
  planeTexture,
  outerFloors = [],
  world,
  renderer,
  scene,
  camera,
  raycaster,
  mouse,
  width = Dimensions.get('window').width,
  height = Dimensions.get('window').height,
  panning = false,
  hovering = [],
  unit = 0.065,
  currentBlock = Object.create(Items[1]),
  rotationSpeed = 0.0005,
  mixer = [],
  clips = [],
  clock = new THREE.Clock(),
  timer,
  holdSpeed = 200,
  strength = 1,
  lastClicked = new Date().getTime(),
  tbc = 0, //Time Between Clicks
  toolContainer,
  lastDestruction

//Graphics Settings
var renderWidth = width,
  renderHeight = height,
  renderScale = 1,
  shadowSize = 4096,
  shadowEnabled = true

if (Platform.OS === 'android') {
  renderWidth = width / 3
  renderHeight = height / 3
  renderScale = 3
  shadowEnabled = false
}

function Canvas(props, ref) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const doubleTapRef = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      setFromOutside(block) {
        currentBlock = Object.create(block)
      },

      setTool(tool) {
        pickaxe.material = new THREE.MeshLambertMaterial({
          color: tool.colour,
          map: pickaxeTexture,
          transparent: true,
          opacity: 0,
        })
        strength = tool.strength
      },
    }),
    []
  )

  function haptics(style) {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(style)
    }
  }

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
      toolContainer = new THREE.Group()

      //renderer
      renderer = new Renderer({
        gl,
        depth: false,
        stencil: false,
        alpha: false,
      })
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight)
      renderer.antialias = false
      renderer.setClearColor(0x000000, 0)
      renderer.shadowMap.enabled = shadowEnabled
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.physicallyCorrectLights = true

      //camera
      camera = new THREE.PerspectiveCamera(
        2,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        1,
        12
      )
      camera.position.z = 1
      camera.position.y = 3.5

      mouse = new THREE.Vector2()

      //lights
      const light = new THREE.DirectionalLight(0xffffff, 2.5)
      light.position.set(-200, 300, 150)
      light.shadow.mapSize.set(shadowSize, shadowSize)
      light.castShadow = true

      const ambientLight = new THREE.AmbientLight(0xffffff, 3)

      world.add(light)
      world.add(ambientLight)

      //assets
      const uri = Asset.fromModule(
        require('../assets/models/cubescaled.glb')
      ).uri
      const destructionUri = Asset.fromModule(
        require('../assets/models/cubedestruction.glb')
      ).uri
      const destruction2Uri = Asset.fromModule(
        require('../assets/models/cubedestruction2.glb')
      ).uri
      const destruction3Uri = Asset.fromModule(
        require('../assets/models/cubedestruction3.glb')
      ).uri
      const destruction4Uri = Asset.fromModule(
        require('../assets/models/wooddestruction.glb')
      ).uri
      const destruction5Uri = Asset.fromModule(
        require('../assets/models/wooddestruction2.glb')
      ).uri
      const destruction6Uri = Asset.fromModule(
        require('../assets/models/wooddestruction3.glb')
      ).uri
      const floorUri = Asset.fromModule(
        require('../assets/models/floorscaled.glb')
      ).uri
      const pickUri = Asset.fromModule(
        require('../assets/models/pickaxe.glb')
      ).uri
      const pickTexUri = Asset.fromModule(
        require('../assets/models/pickaxe.png')
      ).uri
      const planeUri = Asset.fromModule(
        require('../assets/models/plane.glb')
      ).uri
      const shadowPlaneUri = Asset.fromModule(
        require('../assets/models/shadowplane.glb')
      ).uri
      const planeTexUri = Asset.fromModule(
        require('../assets/models/planebake.png')
      ).uri

      let m1 = loadModel(uri).then((result) => {
        cube = result.scene.children[0]
      })

      let m2 = loadModel(uri).then((result) => {
        sky = result.scene.children[0]
      })

      let m3 = loadModel(destructionUri).then((result) => {
        cubeDestruction[0] = result.scene
        cubeDestruction[0].animations = result.animations
      })

      let m4 = loadModel(destruction2Uri).then((result) => {
        cubeDestruction[1] = result.scene
        cubeDestruction[1].animations = result.animations
      })

      let m5 = loadModel(destruction3Uri).then((result) => {
        cubeDestruction[2] = result.scene
        cubeDestruction[2].animations = result.animations
      })

      let m6 = loadModel(destruction4Uri).then((result) => {
        cubeDestruction[3] = result.scene
        cubeDestruction[3].animations = result.animations
      })
      let m7 = loadModel(destruction5Uri).then((result) => {
        cubeDestruction[4] = result.scene
        cubeDestruction[4].animations = result.animations
      })
      let m8 = loadModel(destruction6Uri).then((result) => {
        cubeDestruction[5] = result.scene
        cubeDestruction[5].animations = result.animations
      })
      let m9 = loadModel(pickUri).then((result) => {
        pickaxe = result.scene.children[0]
      })

      let m10 = loadModel(planeUri).then((result) => {
        plane = result.scene.children[0]
      })

      let m11 = loadModel(shadowPlaneUri).then((result) => {
        shadowPlane = result.scene.children[0]
      })

      let t1 = loadTexture(pickTexUri).then((result) => {
        pickaxeTexture = result
      })

      let t2 = loadTexture(planeTexUri).then((result) => {
        planeTexture = result
      })

      let floorModels = []
      let ms = []
      let sizes = [0, 1, 9, 25, 49, 81, 121, 169, 225, 289]
      let levels = 1
      floors = sizes[7]
      let area = levels * floors

      for (let i = 0; i < area; i++) {
        ms[i] = loadModel(floorUri).then((result) => {
          floorModels[i] = result.scene.children[0]
        })
      }

      Promise.all([
        m1,
        m2,
        m3,
        m4,
        m5,
        m6,
        m7,
        m8,
        m9,
        m10,
        m11,
        t1,
        t2,
        ms[area - 1],
      ]).then(() => {
        //Pick
        pickaxeTexture.flipY = false
        pickaxeTexture.magFilter = THREE.NearestFilter
        pickaxeTexture.anisotropy = 16
        pickaxe.material = new THREE.MeshLambertMaterial({
          color: props.equipped.colour,
          map: pickaxeTexture,
          transparent: true,
          opacity: 0,
        })
        strength = props.equipped.strength
        pickaxe.castShadow = false
        pickaxe.receiveShadow = false
        pickaxe.position.z = 0.08
        toolContainer.add(pickaxe)

        //shadowPlane
        shadowPlane.material = new THREE.MeshStandardMaterial({
          color: 0xeeeeee,
        })
        shadowPlane.material.map = planeTexture
        shadowPlane.receiveShadow = true
        shadowPlane.material.polygonOffset = true
        shadowPlane.material.polygonOffsetFactor = -0.12
        scene.add(shadowPlane)

        //plane
        plane.material = new THREE.MeshStandardMaterial({
          color: 0xeeeeee,
        })
        plane.receiveShadow = true
        world.add(plane)

        //cube
        cube.material = new THREE.MeshLambertMaterial({ color: 'grey' })
        cube.material.metalness = 0
        cube.name = 'cube'
        cube.castShadow = false
        cube.receiveShadow = true
        cube.material.transparent = true
        cube.scale.x = 0.032499998807907104
        cube.scale.y = 0.032499998807907104
        cube.scale.z = 0.032499998807907104
        world.add(cube)

        //cubeDestruction
        for (let i = 0; i < cubeDestruction.length; i++) {
          cubeDestruction[i].material = new THREE.MeshLambertMaterial({
            color: 'grey',
          })

          cubeDestruction[i].traverse((o) => {
            if (o.isMesh) {
              o.material = new THREE.MeshLambertMaterial({
                color: currentBlock.colour,
              })
              o.castShadow = true
              o.material.transparent = true
              o.material.metalness = 0
            }
          })

          cubeDestruction[i].name = 'cubeDestruction'
          cubeDestruction[i].visible = false
          cubeDestruction[i].scale.x = 0.032499998807907104
          cubeDestruction[i].scale.y = 0.032499998807907104
          cubeDestruction[i].scale.z = 0.032499998807907104

          mixer[i] = new THREE.AnimationMixer(cubeDestruction[i])
          clips[i] = cubeDestruction[i].animations

          scene.add(cubeDestruction[i])
        }

        //Skybox
        sky.name = 'sky'
        sky.material = new THREE.MeshBasicMaterial({ color: 0xffffff })
        sky.material.side = THREE.BackSide
        sky.scale.x = 600
        sky.scale.z = 600
        sky.scale.y = 600
        //scene.add(sky)

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
            outerFloors[lev].scale.x = 0.032499998807907104
            outerFloors[lev].scale.y = 0.032499998807907104
            outerFloors[lev].scale.z = 0.032499998807907104
            outerFloors[lev].name = `floor`
            if (level === -1) {
              outerFloors[lev].receiveShadow = true
            }

            outerFloors[lev].castShadow = false
            // world.add(outerFloors[lev])
          }
          l++
        }

        //world
        scene.rotation.y = -0.78
        scene.add(world)
        scene.add(toolContainer)

        animate()
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start()
      })
    }

    async function animate() {
      //Rotate cube
      if (panning) {
        scene.rotation.x += deltaY * rotationSpeed
        scene.rotation.y += deltaX * rotationSpeed
      }

      if (scene.rotation.x > 0.6) {
        scene.rotation.x = 0.6
      }
      if (scene.rotation.x < -0.35) {
        scene.rotation.x = -0.35
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
      const minimum = 9
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

      //Animation
      var dt = clock.getDelta()
      for (let i = 0; i < mixer.length; i++) {
        mixer[i].update(dt)
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
          x: 0.0335,
          y: 0.033,
          z: 0.0335,
        },
        65
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Elastic.Out)

    const inflateShadow = new TWEEN.Tween(shadowPlane.scale)
      .to(
        {
          x: 0.3,
          y: 0.3,
          z: 0.3,
        },
        65
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Elastic.Out)

    const deflateShadow = new TWEEN.Tween(shadowPlane.scale)
      .to(
        {
          x: 0.28713423013687134,
          y: 0.28713423013687134,
          z: 0.28713423013687134,
        },
        40
      )
      .yoyo(true)

    const inflateSlow = new TWEEN.Tween(target.scale)
      .to(
        {
          x: 0.0335,
          y: 0.033,
          z: 0.0335,
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

    const fadeOut = new TWEEN.Tween(target.material)
      .to(
        {
          opacity: 0,
        },
        150
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Exponential.Out)
      .onUpdate(() => {
        target.castShadow = false
        shadowPlane.visible = false
        target.visible = false
      })
      .onComplete(
        () => ((target.castShadow = false), (shadowPlane.visible = true))
      )

    const fadeIn = new TWEEN.Tween(target.material)
      .to(
        {
          opacity: 100,
        },
        50
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Exponential.In)
      .onComplete(() => {
        target.visible = true
      })

    const fadeOutInverse = new TWEEN.Tween(target.material)
      .to(
        {
          opacity: 0,
        },
        300
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Exponential.Out)
      .onComplete(() => (target.castShadow = false))

    const fadeInInverse = new TWEEN.Tween(target.material)
      .to(
        {
          opacity: 100,
        },
        100
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Exponential.In)
      .onUpdate(() => (target.castShadow = true))

    const swingIn = new TWEEN.Tween(target.rotation)
      .to(
        {
          x: 0.5,
        },
        50
      )
      .easing(TWEEN.Easing.Elastic.Out)

    const swingOut = new TWEEN.Tween(target.rotation)
      .to(
        {
          x: -1,
        },
        400
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Elastic.Out)

    const returnRotation = new TWEEN.Tween(target.rotation)
      .to(
        {
          x: 0,
          y: -0.78,
          z: 0,
        },
        750
      )
      .yoyo(true)
      .easing(TWEEN.Easing.Elastic.Out)

    if (type === 'place') {
      place.start()
      return
    } else if (type === 'cancel') {
      cancel.start()
      return
    } else if (type === 'rise') {
      inflate.chain(deflate)
      inflate.start()
      rise.start()
      return
    } else if (type === 'click') {
      inflate.chain(deflate)
      inflate.start()
      inflateShadow.chain(deflateShadow)
      inflateShadow.start()
      return
    } else if (type === 'destroy') {
      fadeOut.chain(shrink)
      shrink.chain(fadeIn)
      fadeIn.chain(inflateSlow)
      inflateSlow.chain(deflate)
      fadeOut.start()
      return
    } else if (type === 'returnRotation') {
      returnRotation.start()
      return
    } else if (type === 'swing') {
      fadeInInverse.chain(fadeOutInverse)
      fadeInInverse.start()
      swingIn.chain(swingOut)
      swingIn.start()
    }
  }

  function destruction() {
    let target
    let reference
    if (currentBlock.name === 'Wood') {
      reference = Math.floor(Math.random() * (6 - 3) + 3)
    } else {
      reference = Math.floor(Math.random() * 3)
    }

    target = cubeDestruction[reference]
    if (target === lastDestruction) {
      destruction()
      return
    } else {
      lastDestruction = target
    }

    target.rotation.y += (Math.PI / 2) * Math.floor(Math.random() * 4)
    let material
    if (currentBlock.metal) {
      material = new THREE.MeshPhongMaterial({
        color: currentBlock.colour,
      })
    } else {
      material = new THREE.MeshLambertMaterial({
        color: currentBlock.colour,
      })
    }

    target.traverse((o) => {
      if (o.isMesh) {
        o.material = material
        o.material.transparent = true

        const opaque = new TWEEN.Tween(o.material)
          .to(
            {
              opacity: 100,
            },
            2000
          )
          .easing(TWEEN.Easing.Exponential.Out)
          .onUpdate(() => (o.castShadow = true))

        const fadeOut = new TWEEN.Tween(o.material)
          .to(
            {
              opacity: 0,
            },
            1000
          )
          .easing(TWEEN.Easing.Cubic.Out)
          .onComplete(() => (o.castShadow = false))

        const hide = new TWEEN.Tween(o.material)
          .to({}, 4000)
          .onUpdate(() => (target.visible = true))
          .onComplete(() => (target.visible = false))

        opaque.chain(fadeOut)
        opaque.start()
        hide.start()
      }
    })
    clips[reference].forEach(function (clip) {
      mixer[reference].clipAction(clip).setLoop(THREE.LoopOnce)
      mixer[reference].clipAction(clip).clampWhenFinished = true
      mixer[reference].clipAction(clip).play().reset()
    })
  }

  function animateTool(intersects, animateY) {
    animateY
      ? new TWEEN.Tween(pickaxe.position)
          .to(
            {
              x: intersects.point.x,
              y: intersects.point.y + 0.02,
            },
            500
          )
          .easing(TWEEN.Easing.Exponential.Out)
          .start()
      : new TWEEN.Tween(pickaxe.position)
          .to(
            {
              x: intersects.point.x,
            },
            500
          )
          .easing(TWEEN.Easing.Exponential.Out)
          .start()

    new TWEEN.Tween(toolContainer.rotation)
      .to(
        {
          y: intersects.point.x * 10 + 0.8,
        },
        500
      )
      .easing(TWEEN.Easing.Exponential.Out)
      .start()
  }

  async function raycast(evt) {
    let { nativeEvent } = evt
    //camera.updateProjectionMatrix()
    mouse.x = (nativeEvent.absoluteX / width) * 2 - 1
    mouse.y = -(nativeEvent.absoluteY / height) * 2 + 1
    raycaster = new THREE.Raycaster()
    scene.updateMatrixWorld()
    raycaster.setFromCamera(mouse, camera)
    var intersects = raycaster.intersectObjects(world.children, true)
    return intersects[0]
  }

  function updateMaterial(block) {
    let material
    if (currentBlock.metal) {
      material = new THREE.MeshPhongMaterial({
        color: currentBlock.colour,
      })
    } else {
      material = new THREE.MeshLambertMaterial({
        color: currentBlock.colour,
      })
    }
    block.object.material = material
  }

  function calculateBonus(currentBlock, tbc) {
    var bonus = 1
    if (tbc < 100) {
      bonus = 1.5
    }
    return bonus
  }

  function calculateTBC() {
    var timeNow = new Date().getTime()
    var tbc = timeNow - lastClicked
    lastClicked = timeNow
    return tbc
  }

  async function hitBlock(block) {
    animation('swing', pickaxe, pickaxe)
    tbc = calculateTBC()
    var bonus = calculateBonus(currentBlock, tbc)

    if (currentBlock.health <= 0) {
      animateTool(block, false)
      props.click(currentBlock, bonus)
      destruction()
      await props.generate()
      haptics(Haptics.ImpactFeedbackStyle.Heavy)
      animation('destroy', block.object, block.object)
      updateMaterial(block)
    } else {
      animateTool(block, true)
      haptics(Haptics.ImpactFeedbackStyle.Light)
      animation('click', block.object, block.object)
      currentBlock.health -= strength
    }
  }

  let handlePress = async (evt) => {
    let { nativeEvent } = evt
    if (nativeEvent.state === State.BEGAN) {
      let block = await raycast(evt)
      if (block.object.name === 'cube') {
        hitBlock(block)
      }
    }
  }

  let handleDoublePress = async (evt) => {}

  let handleLongPress = async (evt) => {
    let { nativeEvent } = evt
    let block = await raycast(evt)
    if (nativeEvent.state === State.ACTIVE) {
      if (block.object.name === 'cube') {
        timer = setInterval(async () => {
          hitBlock(block)
        }, holdSpeed)
      }
    } else {
      clearInterval(timer)
      timer = null
    }
  }

  let handlePan = async (evt) => {
    let { nativeEvent } = evt
    panning = true
    deltaX = Math.round(nativeEvent.translationX)
    deltaY = Math.round(nativeEvent.translationY)
  }

  let handlePanOut = async (evt) => {
    let { nativeEvent } = evt
    if (nativeEvent.state === State.END) {
      haptics(Haptics.ImpactFeedbackStyle.Light)
      panning = false
      animation('returnRotation', scene, scene)
    }
  }

  let handlePinch = (evt) => {
    let { nativeEvent } = evt
    //scale = nativeEvent.velocity
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={{
          ...props.style,
          opacity: fadeAnim,
        }}
      >
        <PinchGestureHandler onGestureEvent={handlePinch}>
          <PanGestureHandler
            onGestureEvent={handlePan}
            onHandlerStateChange={handlePanOut}
          >
            <View style={styles.wrapper}>
              <LongPressGestureHandler onHandlerStateChange={handleLongPress}>
                <TapGestureHandler onHandlerStateChange={handlePress}>
                  <TapGestureHandler
                    ref={doubleTapRef}
                    onHandlerStateChange={handleDoublePress}
                    numberOfTaps={2}
                  >
                    <GLView
                      onContextCreate={onContextCreate}
                      style={styles.content}
                    />
                  </TapGestureHandler>
                </TapGestureHandler>
              </LongPressGestureHandler>
            </View>
          </PanGestureHandler>
        </PinchGestureHandler>
      </Animated.View>
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
    transform: [{ scaleX: renderScale }, { scaleY: renderScale }],
  },
  content: {
    width: renderWidth,
    height: renderHeight,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
})
