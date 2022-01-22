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
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import {
  LongPressGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler'
import * as TWEEN from '@tweenjs/tween.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Asset } from 'expo-asset'
import { Items, Config } from '../components'
import { decode, encode } from 'base-64'
import { Vector2 } from 'three'

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
  rock,
  stone,
  ores,
  wood,
  tree,
  grass,
  foggyForestGroup,
  flowers,
  mapOverlay,
  flowerTexture,
  grassTexture,
  dirtTexture,
  woodTexture,
  blankNormalMap,
  cubeNormalMap,
  cubeTexture,
  sandTexture,
  skyTexture,
  pickaxe,
  pickaxeTexture,
  glassPickaxeTexture,
  oresTexture,
  mapOverlayTexture,
  toolVisible = false,
  oresDestruction = [],
  cubeDestruction = [],
  particles = [],
  lastParticle,
  worldMap,
  worldMapTexture,
  sky,
  skyColour,
  clouds,
  cloudsTexture,
  cloudOffset = 0,
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
  rotationSpeed = 0.0002,
  destructionMixer = [],
  destructionClips = [],
  particleMixer = [],
  particleClips = [],
  oresDestructionMixer = [],
  oresDestructionClips = [],
  smokeTexture,
  smoke = [],
  clock = new THREE.Clock(),
  timer,
  holdSpeed = 200,
  strength = 1,
  lastClicked = new Date().getTime(),
  tbc = 0, //Time Between Clicks
  blockContainer,
  toolContainer,
  mapGroup,
  mapButtonGroup,
  mapButtons,
  particleContainer = [],
  smokeContainer = [],
  lastDestruction,
  lastOreDestruction,
  light,
  mapMode = false,
  mapModePending = false,
  currentLocation = 'foggyforest',
  loaded = false

//Graphics Settings
var shadowSize = 256,
  shadowEnabled = true,
  destructionEnabled = true,
  particlesEnabled = true

function Canvas(props, ref) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const doubleTapRef = useRef(null)
  const [renderScale, setRenderScale] = useState(1)
  const [renderDimentions, setRenderDimentions] = useState({
    width: width,
    height: height,
  })

  useImperativeHandle(
    ref,
    () => ({
      updateEnvironmentFromOutside(location) {
        updateEnvironment(location)
      },
      toggleMapFromOutside() {
        animateMap()
      },
      setConfigFromOutside(config) {
        if (config.shadowEnabled) {
          renderer.shadowMapAutoUpdate = true
          light.shadow.mapSize.set(config.shadowSize, config.shadowSize)
          light.shadow.map.dispose()
          light.shadow.map = null
        } else if (config.shadowEnabled === false) {
          light.shadow.mapSize.set(2, 2)
          light.shadow.map.dispose()
          light.shadow.map = null
        }
        if (config.destructionEnabled) {
          destructionEnabled = config.destructionEnabled
        } else if (config.destructionEnabled === false) {
          destructionEnabled = false
        }
        if (config.particlesEnabled) {
          particlesEnabled = config.particlesEnabled
        } else if (config.particlesEnabled === false) {
          particlesEnabled = false
        }
        if (config.renderScale) {
          if (config.renderScale === 0.5) {
            renderer.setPixelRatio(0.5)
            setRenderDimentions({ width: width / 2, height: height / 2 })
            setRenderScale(2)
          } else if (config.renderScale === 0.25) {
            renderer.setPixelRatio(0.25)
            setRenderDimentions({ width: width / 4, height: height / 4 })
            setRenderScale(4)
          } else {
            renderer.setPixelRatio(1)
            setRenderDimentions({ width: width, height: height })
            setRenderScale(1)
          }
        }
      },
      setFromOutside(block) {
        currentBlock = Object.create(block)
        updateMaterial(block)
      },
      setTool(tool) {
        if (tool.category === 'pickaxe') {
          try {
            toolVisible = true
            setToolMaterial(tool)
          } catch (error) {}
        } else {
          toolVisible = false
        }

        strength = tool.strength
      },
    }),
    []
  )

  function setToolMaterial(tool) {
    try {
      if (tool.material === 'glass') {
        pickaxe.material = new THREE.MeshPhongMaterial({
          color: tool.colour,
          map: glassPickaxeTexture,
          transparent: true,
          opacity: 0,
          visible: false,
        })
      } else {
        pickaxe.material = new THREE.MeshLambertMaterial({
          color: tool.colour,
          map: pickaxeTexture,
          transparent: true,
          opacity: 0,
          visible: false,
        })
      }
    } catch (error) {}
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
      mapGroup = new THREE.Group()
      foggyForestGroup = new THREE.Group()
      mapButtonGroup = new THREE.Group()
      blockContainer = new THREE.Group()
      blockContainer.name = 'blockContainer'
      toolContainer = new THREE.Group()
      skyColour = 0xbde0fe
      scene.background = new THREE.Color(skyColour)
      scene.fog = new THREE.Fog(skyColour, 2, 15)

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
        60,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        1.2,
        60
      )

      camera.position.z = 3
      camera.position.y = 1.25
      camera.lookAt(0, 0.25, 0)
      mouse = new THREE.Vector2()

      //lights
      light = new THREE.DirectionalLight(0xffffff, 3.5)
      light.position.set(-120, 350, 150)
      light.shadow.mapSize.set(shadowSize, shadowSize)
      light.castShadow = true
      const d = 3
      light.shadow.camera.left = -d
      light.shadow.camera.right = d
      light.shadow.camera.top = d
      light.shadow.camera.bottom = -d

      const ambientLight = new THREE.HemisphereLight(0xffffff, 0xfff3e8, 2.5)

      world.add(light)
      world.add(ambientLight)

      //assets
      const uri = Asset.fromModule(require('../assets/models/rock.glb')).uri
      const cubeUri = Asset.fromModule(require('../assets/models/cube.glb')).uri
      const stoneUri = Asset.fromModule(
        require('../assets/models/stone.glb')
      ).uri
      const woodUri = Asset.fromModule(require('../assets/models/wood.glb')).uri
      const treeUri = Asset.fromModule(require('../assets/models/tree.glb')).uri
      const grassUri = Asset.fromModule(
        require('../assets/models/grass.glb')
      ).uri
      const flowersUri = Asset.fromModule(
        require('../assets/models/flowers.glb')
      ).uri
      const mapUri = Asset.fromModule(require('../assets/models/map.glb')).uri
      const cloudsUri = Asset.fromModule(
        require('../assets/models/clouds.glb')
      ).uri
      const oresUri = Asset.fromModule(require('../assets/models/ores.glb')).uri
      const destructionUri = Asset.fromModule(
        require('../assets/models/rockdestruction.glb')
      ).uri
      const destruction2Uri = Asset.fromModule(
        require('../assets/models/rockdestruction2.glb')
      ).uri
      const destruction3Uri = Asset.fromModule(
        require('../assets/models/rockdestruction3.glb')
      ).uri
      const destruction4Uri = Asset.fromModule(
        require('../assets/models/wooddestruction.glb')
      ).uri
      const destruction5Uri = Asset.fromModule(
        require('../assets/models/wooddestruction.glb')
      ).uri
      const destruction6Uri = Asset.fromModule(
        require('../assets/models/wooddestruction.glb')
      ).uri
      const oresDestructionUri = Asset.fromModule(
        require('../assets/models/oresdestruction.glb')
      ).uri
      const oresDestruction2Uri = Asset.fromModule(
        require('../assets/models/oresdestruction2.glb')
      ).uri
      const oresDestruction3Uri = Asset.fromModule(
        require('../assets/models/oresdestruction3.glb')
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
      const glassPickTex = Asset.fromModule(
        require('../assets/models/pickaxe.png')
      ).uri
      const planeUri = Asset.fromModule(
        require('../assets/models/plane.glb')
      ).uri
      const particlesUri = Asset.fromModule(
        require('../assets/models/particles.glb')
      ).uri
      const particles2Uri = Asset.fromModule(
        require('../assets/models/particles2.glb')
      ).uri
      const particles3Uri = Asset.fromModule(
        require('../assets/models/particles3.glb')
      ).uri
      const particles4Uri = Asset.fromModule(
        require('../assets/models/particles4.glb')
      ).uri
      const shadowPlaneUri = Asset.fromModule(
        require('../assets/models/shadowplane.glb')
      ).uri
      const mapOverlayUri = Asset.fromModule(
        require('../assets/models/mapoverlay.glb')
      ).uri
      const mapButtonsUri = Asset.fromModule(
        require('../assets/models/mapbuttons.glb')
      ).uri

      const planeTexUri = Asset.fromModule(
        require('../assets/models/planebake.png')
      ).uri
      const blankNormalMapUri = Asset.fromModule(
        require('../assets/models/blanknormalmap.png')
      ).uri
      const cubeNormalMapUri = Asset.fromModule(
        require('../assets/models/cubenormalmap.png')
      ).uri
      const smokeTexUri = Asset.fromModule(
        require('../assets/models/smoke.png')
      ).uri
      const smokeUri = Asset.fromModule(
        require('../assets/models/smoke.glb')
      ).uri
      const cubeTex = Asset.fromModule(
        require('../assets/models/cubetexture.png')
      ).uri
      const sandTex = Asset.fromModule(
        require('../assets/models/sandtexture.png')
      ).uri
      const oresTex = Asset.fromModule(
        require('../assets/models/orestexture.png')
      ).uri
      const skyTex = Asset.fromModule(
        require('../assets/models/skytexture.png')
      ).uri
      const woodTex = Asset.fromModule(
        require('../assets/models/woodtexture.png')
      ).uri
      const dirtTex = Asset.fromModule(
        require('../assets/models/dirttexture.png')
      ).uri
      const grassTex = Asset.fromModule(
        require('../assets/models/grasstexture.png')
      ).uri
      const flowerTex = Asset.fromModule(
        require('../assets/models/flowertexture.png')
      ).uri
      const worldMapTex = Asset.fromModule(
        require('../assets/models/maptexture.png')
      ).uri
      const cloudsTex = Asset.fromModule(
        require('../assets/models/cloudstexture.png')
      ).uri
      const mapOverlayTex = Asset.fromModule(
        require('../assets/models/mapoverlaytexture.png')
      ).uri

      let m1 = loadModel(uri).then((result) => {
        rock = result.scene.children[0]
      })

      let m2 = loadModel(cubeUri).then((result) => {
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

      let m12 = loadModel(particlesUri).then((result) => {
        particles[0] = result.scene
        particles[0].animations = result.animations
      })

      let m13 = loadModel(particles2Uri).then((result) => {
        particles[1] = result.scene
        particles[1].animations = result.animations
      })

      let m14 = loadModel(particles3Uri).then((result) => {
        particles[2] = result.scene
        particles[2].animations = result.animations
      })

      let m15 = loadModel(particles4Uri).then((result) => {
        particles[3] = result.scene
        particles[3].animations = result.animations
      })

      let m16 = loadModel(oresUri).then((result) => {
        ores = result.scene.children[0]
      })

      let m17 = loadModel(oresDestructionUri).then((result) => {
        oresDestruction[0] = result.scene
        oresDestruction[0].animations = result.animations
      })

      let m18 = loadModel(oresDestruction2Uri).then((result) => {
        oresDestruction[1] = result.scene
        oresDestruction[1].animations = result.animations
      })

      let m19 = loadModel(oresDestruction3Uri).then((result) => {
        oresDestruction[2] = result.scene
        oresDestruction[2].animations = result.animations
      })

      let m20 = loadModel(stoneUri).then((result) => {
        stone = result.scene.children[0]
      })

      let m21 = loadModel(woodUri).then((result) => {
        wood = result.scene.children[0]
      })

      let m22 = loadModel(treeUri).then((result) => {
        tree = result.scene
      })
      let m23 = loadModel(grassUri).then((result) => {
        grass = result.scene
      })
      let m24 = loadModel(flowersUri).then((result) => {
        flowers = result.scene
      })
      let m25 = loadModel(mapUri).then((result) => {
        worldMap = result.scene
      })
      let m26 = loadModel(cloudsUri).then((result) => {
        clouds = result.scene.children[0]
      })
      let m27 = loadModel(mapOverlayUri).then((result) => {
        mapOverlay = result.scene.children[0]
      })
      let m28 = loadModel(mapButtonsUri).then((result) => {
        mapButtons = result.scene
      })

      let t1 = loadTexture(pickTexUri).then((result) => {
        pickaxeTexture = result
      })
      let t2 = loadTexture(planeTexUri).then((result) => {
        planeTexture = result
      })
      let t3 = loadTexture(blankNormalMapUri).then((result) => {
        blankNormalMap = result
      })
      let t4 = loadTexture(cubeNormalMapUri).then((result) => {
        cubeNormalMap = result
      })
      let t5 = loadTexture(smokeTexUri).then((result) => {
        smokeTexture = result
      })
      let t6 = loadTexture(cubeTex).then((result) => {
        cubeTexture = result
      })
      let t7 = loadTexture(glassPickTex).then((result) => {
        glassPickaxeTexture = result
      })
      let t8 = loadTexture(sandTex).then((result) => {
        sandTexture = result
      })
      let t9 = loadTexture(oresTex).then((result) => {
        oresTexture = result
      })
      let t10 = loadTexture(skyTex).then((result) => {
        skyTexture = result
      })
      let t11 = loadTexture(woodTex).then((result) => {
        woodTexture = result
      })
      let t12 = loadTexture(dirtTex).then((result) => {
        dirtTexture = result
      })
      let t13 = loadTexture(grassTex).then((result) => {
        grassTexture = result
      })
      let t14 = loadTexture(flowerTex).then((result) => {
        flowerTexture = result
      })
      let t15 = loadTexture(worldMapTex).then((result) => {
        worldMapTexture = result
      })
      let t16 = loadTexture(cloudsTex).then((result) => {
        cloudsTexture = result
      })
      let t17 = loadTexture(mapOverlayTex).then((result) => {
        mapOverlayTexture = result
      })

      let msmoke = []
      let smokeParticlesLength = 50
      for (let i = 0; i < smokeParticlesLength; i++) {
        msmoke[i] = loadModel(smokeUri).then((result) => {
          smoke[i] = result.scene
        })
      }

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
        m12,
        m13,
        m14,
        m15,
        m16,
        m17,
        m18,
        m19,
        m20,
        m21,
        m22,
        m23,
        m24,
        m25,
        m26,
        m27,
        m28,
        msmoke[smokeParticlesLength - 1],
        t1,
        t2,
        t3,
        t4,
        t5,
        t6,
        t7,
        t8,
        t9,
        t10,
        t11,
        t12,
        t13,
        t14,
        t15,
        t16,
        t17,
        ms[area - 1],
      ]).then(() => {
        //Pick
        pickaxeTexture.flipY = false
        glassPickaxeTexture.flipY = false
        pickaxeTexture.magFilter = THREE.NearestFilter
        pickaxeTexture.anisotropy = 16
        setToolMaterial(props.equipped)
        strength = props.equipped.strength
        pickaxe.castShadow = false
        pickaxe.receiveShadow = false
        pickaxe.position.z = 0.8
        toolContainer.add(pickaxe)

        //shadowPlane
        shadowPlane.material = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          transparent: true,
        })
        shadowPlane.material.map = planeTexture
        shadowPlane.receiveShadow = false
        shadowPlane.material.polygonOffset = true
        shadowPlane.material.polygonOffsetFactor = -0.1
        scene.add(shadowPlane)

        //plane
        sandTexture.flipY = false
        sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping
        sandTexture.offset.set(0, 0)
        sandTexture.repeat.set(8, 8)

        dirtTexture.flipY = false
        dirtTexture.wrapS = dirtTexture.wrapT = THREE.RepeatWrapping
        dirtTexture.offset.set(0, 0)
        dirtTexture.repeat.set(8, 8)

        plane.material = new THREE.MeshLambertMaterial({
          color: 0xa1a1a1,
          map: dirtTexture,
        })
        plane.receiveShadow = true
        world.add(plane)

        //trees
        tree.castShadow = false
        foggyForestGroup.add(tree)

        //map
        worldMapTexture.flipY = false
        worldMap.children[0].material = new THREE.MeshLambertMaterial({
          color: 0x808080,
          map: worldMapTexture,
        })
        worldMap.visible = false
        mapGroup.add(worldMap)

        //map overlay
        mapOverlayTexture.flipY = false
        mapOverlay.material = new THREE.MeshBasicMaterial({
          map: mapOverlayTexture,
          transparent: true,
          opacity: 0,
        })
        mapGroup.add(mapOverlay)

        //map buttons
        mapButtons.visible = false
        mapButtonGroup.add(mapButtons)

        //clouds
        cloudsTexture.flipY = false
        cloudsTexture.wrapS = cloudsTexture.wrapT = THREE.RepeatWrapping
        cloudsTexture.offset.set(0, 0)
        cloudsTexture.repeat.set(8, 8)
        clouds.material = new THREE.MeshLambertMaterial({
          map: cloudsTexture,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.1,
        })
        mapGroup.add(clouds)

        //grass
        grassTexture.flipY = false
        for (let i = 0; i < grass.children.length; i++) {
          grass.children[i].material = new THREE.MeshBasicMaterial({
            map: grassTexture,
            transparent: 1,
            side: THREE.DoubleSide,
            alphaTest: 0.5,
          })
          grass.children[i].receiveShadow = true
          foggyForestGroup.add(grass.children[i])
          scene.add(foggyForestGroup)
        }

        //flowers
        flowerTexture.flipY = false
        for (let i = 0; i < flowers.children.length; i++) {
          flowers.children[i].material = new THREE.MeshBasicMaterial({
            map: flowerTexture,
            transparent: 1,
            side: THREE.DoubleSide,
            alphaTest: 0.5,
          })
          flowers.children[i].receiveShadow = false
          foggyForestGroup.add(flowers.children[i])
        }

        //rock
        cubeNormalMap.flipY = false

        blankNormalMap.flipY = false
        cubeTexture.flipY = false
        rock.material = new THREE.MeshStandardMaterial({
          color: 'grey',
          normalMap: blankNormalMap,
          normalScale: new Vector2(0, 0),
          map: cubeTexture,
        })
        rock.visible = false
        rock.material.metalness = 0
        rock.name = 'cube'
        rock.castshadow = false
        rock.receiveShadow = true
        rock.material.transparent = true
        rock.scale.x = 0.32499998807907104
        rock.scale.y = 0.32499998807907104
        rock.scale.z = 0.32499998807907104

        //stone
        stone.material = new THREE.MeshStandardMaterial({
          color: 'grey',
          normalMap: blankNormalMap,
          normalScale: new Vector2(0, 0),
          map: cubeTexture,
        })

        stone.material.metalness = 0
        stone.name = 'cube'
        stone.castshadow = false
        stone.receiveShadow = true
        stone.material.transparent = true
        stone.scale.x = 0.32499998807907104
        stone.scale.y = 0.32499998807907104
        stone.scale.z = 0.32499998807907104

        cube = Object.create(stone)
        blockContainer.add(cube)
        updateMaterial(currentBlock)

        //wood
        woodTexture.flipY = false
        wood.material = new THREE.MeshStandardMaterial({
          color: '#5e4328',
          normalMap: blankNormalMap,
          normalScale: new Vector2(0, 0),
          map: woodTexture,
        })

        wood.material.metalness = 0
        wood.name = 'cube'
        wood.castshadow = false
        wood.receiveShadow = true
        wood.material.transparent = true
        wood.scale.x = 0.32499998807907104
        wood.scale.y = 0.32499998807907104
        wood.scale.z = 0.32499998807907104

        //ores
        oresTexture.flipY = false
        ores.material = new THREE.MeshPhongMaterial({
          color: 'grey',
          transparent: true,
          opacity: 1,
          map: oresTexture,
        })
        ores.visible = false
        ores.name = 'ores'
        ores.castShadow = false
        ores.receiveShadow = false
        ores.scale.x = 0.32499998807907104
        ores.scale.y = 0.32499998807907104
        ores.scale.z = 0.32499998807907104
        blockContainer.add(ores)
        world.add(blockContainer)

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
          cubeDestruction[i].scale.x = 0.32499998807907104
          cubeDestruction[i].scale.y = 0.32499998807907104
          cubeDestruction[i].scale.z = 0.32499998807907104
          cubeDestruction[i].position.y = 0.002

          destructionMixer[i] = new THREE.AnimationMixer(cubeDestruction[i])
          destructionClips[i] = cubeDestruction[i].animations

          scene.add(cubeDestruction[i])
        }

        //Particles
        for (let i = 0; i < particles.length; i++) {
          particles[i].material = new THREE.MeshBasicMaterial({
            color: 'grey',
          })

          particles[i].name = 'particles'
          particles[i].visible = false
          particles[i].scale.x = 0.32499998807907104
          particles[i].scale.y = 0.32499998807907104
          particles[i].scale.z = 0.32499998807907104
          particleMixer[i] = new THREE.AnimationMixer(particles[i])
          particleClips[i] = particles[i].animations
          particleContainer[i] = new THREE.Group()
          particleContainer[i].add(particles[i])
          scene.add(particleContainer[i])
        }

        //Ores Destruction
        for (let i = 0; i < oresDestruction.length; i++) {
          oresDestruction[i].traverse((o) => {
            if (o.isMesh) {
              o.material = new THREE.MeshLambertMaterial({
                color: currentBlock.colour,
                map: oresTexture,
              })
              o.castShadow = false
              o.material.transparent = true
            }
          })

          oresDestruction[i].name = 'oresDestruction'
          oresDestruction[i].visible = false
          oresDestruction[i].scale.x = 0.32499998807907104
          oresDestruction[i].scale.y = 0.32499998807907104
          oresDestruction[i].scale.z = 0.32499998807907104
          oresDestruction[i].position.y = -0.002

          oresDestructionMixer[i] = new THREE.AnimationMixer(oresDestruction[i])
          oresDestructionClips[i] = oresDestruction[i].animations

          scene.add(oresDestruction[i])
        }

        //Smoke
        smokeTexture.flipY = false
        for (let i = 0; i < smoke.length; i++) {
          smoke[i].traverse((o) => {
            if (o.isMesh) {
              o.material = new THREE.MeshBasicMaterial({
                color: 'grey',
                transparent: true,
                side: THREE.DoubleSide,
                map: smokeTexture,
                blending: THREE.AdditiveBlending,
                opacity: 10,
                visible: false,
                depthWrite: false,
              })
            }
          })
          smoke[i].scale.x = 0
          smoke[i].scale.y = 0
          smoke[i].scale.z = 0
          smoke[i].rotation.z = Math.random() * 360

          smokeContainer[i] = new THREE.Group()
          smokeContainer[i].add(smoke[i])

          scene.add(smokeContainer[i])
        }

        //Skybox
        skyTexture.flipY = false
        sky.name = 'sky'
        sky.material = new THREE.MeshBasicMaterial({
          map: skyTexture,
        })
        sky.material.side = THREE.BackSide
        sky.scale.x = 4
        sky.scale.z = 4
        sky.scale.y = 4
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
            outerFloors[lev].material = new THREE.MeshLambertMaterial({
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
            outerFloors[lev].scale.x = 0.32499998807907104
            outerFloors[lev].scale.y = 0.32499998807907104
            outerFloors[lev].scale.z = 0.32499998807907104
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
        mapGroup.add(mapButtonGroup)
        scene.add(mapGroup)
        props.setLoading()

        animate()
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start()
      })
    }

    async function animate() {
      if (mapMode) {
        cloudsTexture.offset.set(cloudOffset, cloudOffset)
        cloudOffset += 0.0005
      }

      //panning
      if (panning) {
        if (mapMode && !mapModePending) {
          mapGroup.position.z += deltaY * 0.003
          mapGroup.position.x += deltaX * 0.003
        } else if (!mapMode) {
          scene.rotation.x += deltaY * rotationSpeed
          scene.rotation.y += deltaX * rotationSpeed
        }
      }

      if (scene.rotation.x > 0.2) {
        scene.rotation.x = 0.2
      }
      if (scene.rotation.x < -0.1) {
        scene.rotation.x = -0.1
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

      //scale
      const minimum = 60
      const maximum = 100
      camera.fov -= scale / 2
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

      if (camera.fov < minimum) {
        camera.fov = minimum
      }
      if (camera.fov > maximum) {
        camera.fov = maximum
      }

      //animate
      var dt = clock.getDelta()
      for (let i = 0; i < destructionMixer.length; i++) {
        destructionMixer[i].update(dt)
      }
      for (let i = 0; i < particleMixer.length; i++) {
        particleMixer[i].update(dt)
      }
      for (let i = 0; i < oresDestructionMixer.length; i++) {
        oresDestructionMixer[i].update(dt)
      }

      TWEEN.update()

      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      gl.endFrameEXP()
    }

    init()
  }

  function animation(type, target, reference) {
    if (type === 'click') {
      const inflate = new TWEEN.Tween(blockContainer.scale)
        .to(
          {
            x: 1.01,
            y: 1.01,
            z: 1.01,
          },
          65
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Elastic.Out)
      const deflate = new TWEEN.Tween(blockContainer.scale)
        .to(
          {
            x: 1,
            y: 1,
            z: 1,
          },
          40
        )
        .yoyo(true)
      const inflateShadow = new TWEEN.Tween(shadowPlane.scale)
        .to(
          {
            x: 1,
            y: 1,
            z: 1,
          },
          65
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Elastic.Out)

      const deflateShadow = new TWEEN.Tween(shadowPlane.scale)
        .to(
          {
            x: 0.9736721962690353,
            y: 0.9736721962690353,
            z: 0.9736721962690353,
          },
          40
        )
        .yoyo(true)
      inflate.chain(deflate)
      inflate.start()
      inflateShadow.chain(deflateShadow)
      inflateShadow.start()
      return
    } else if (type === 'destroy') {
      var fadeOut
      var fadeIn
      for (let i of blockContainer.children) {
        fadeOut = new TWEEN.Tween(i.material)
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
            blockContainer.visible = false
          })
          .onComplete(
            () => ((target.castShadow = false), (shadowPlane.visible = true))
          )

        fadeIn = new TWEEN.Tween(i.material)
          .to(
            {
              opacity: 1,
            },
            50
          )
          .yoyo(true)
          .easing(TWEEN.Easing.Exponential.In)
          .onComplete(() => {
            blockContainer.visible = true
          })
      }

      const shrink = new TWEEN.Tween(blockContainer.scale)
        .to(
          {
            x: 1 / 2,
            y: 1 / 2,
            z: 1 / 2,
          },
          1
        )
        .yoyo(true)
      const inflateSlow = new TWEEN.Tween(blockContainer.scale)
        .to(
          {
            x: 1.02,
            y: 1.02,
            z: 1.02,
          },
          300
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Elastic.Out)
      const deflate = new TWEEN.Tween(blockContainer.scale)
        .to(
          {
            x: 1,
            y: 1,
            z: 1,
          },
          40
        )
        .yoyo(true)
      fadeOut.chain(shrink)
      shrink.chain(fadeIn)
      fadeIn.chain(inflateSlow)
      inflateSlow.chain(deflate)
      fadeOut.start()
      return
    } else if (type === 'returnRotation') {
      const returnRotation = new TWEEN.Tween(target.rotation)
        .to(
          {
            x: 0,
            y: -0.78,
            z: 0,
          },
          1000
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Elastic.Out)

      returnRotation.start()
      return
    } else if (type === 'swing') {
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
            opacity: 10,
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

      const hide = new TWEEN.Tween(target.material)
        .to({}, 400)
        .onUpdate(() => (target.material.visible = toolVisible))
        .onComplete(() => (target.material.visible = false))

      fadeInInverse.chain(fadeOutInverse)
      fadeInInverse.start()
      swingIn.chain(swingOut)
      swingIn.start()
      hide.start()
      return
    }
  }

  async function destruction() {
    let index
    let oreIndex = Math.floor(Math.random() * oresDestruction.length)
    if (currentBlock.name === 'Wood') {
      index = Math.floor(Math.random() * (6 - 3) + 3)
    } else {
      index = Math.floor(Math.random() * 3)
    }

    if (
      cubeDestruction[index] === lastDestruction ||
      oresDestruction[oreIndex] === lastOreDestruction
    ) {
      destruction()
      return
    } else {
      lastDestruction = cubeDestruction[index]
      lastOreDestruction = oresDestruction[oreIndex]
    }

    let targets = [cubeDestruction[index]]

    oresDestruction[oreIndex].rotation.y +=
      (Math.PI / 2) * Math.floor(Math.random() * 4)
    cubeDestruction[index].rotation.y +=
      (Math.PI / 2) * Math.floor(Math.random() * 4)
    let material
    let opacity = 1
    if (currentBlock.material === 'shiny') {
      material = new THREE.MeshPhongMaterial({
        color: currentBlock.colour,
        map: oresTexture,
      })
    } else if (currentBlock.material === 'matte') {
      material = new THREE.MeshLambertMaterial({
        color: currentBlock.colour,
        map: oresTexture,
      })
    } else if (currentBlock.material === 'glass') {
      material = new THREE.MeshPhongMaterial({
        color: currentBlock.colour,
        map: oresTexture,
      })
      opacity = 0.8
    }

    if (currentBlock.model === 'rock') {
      targets.push(oresDestruction[oreIndex])
      oresDestruction[oreIndex].traverse((o) => {
        if (o.isMesh) {
          o.material = material
        }
      })
    }

    cubeDestruction[index].traverse((o) => {
      if (o.isMesh) {
        if (currentBlock.name === 'Wood') {
          o.material = new THREE.MeshLambertMaterial({
            color: 'grey',
            map: woodTexture,
          })
        } else {
          o.material = new THREE.MeshLambertMaterial({
            color: 'grey',
            map: cubeTexture,
          })
        }
      }
    })

    for (let target of targets) {
      target.traverse((o) => {
        if (o.isMesh) {
          o.material.transparent = true
          o.material.opacity = opacity

          const opaque = new TWEEN.Tween(o.material)
            .to(
              {
                opacity: opacity,
              },
              1000
            )
            .easing(TWEEN.Easing.Exponential.Out)
            .onUpdate(() =>
              o.parent.name === 'cubeDestruction' ? (o.castShadow = true) : null
            )

          const fadeOut = new TWEEN.Tween(o.material)
            .to(
              {
                opacity: 0,
              },
              1000
            )
            .easing(TWEEN.Easing.Cubic.Out)
            .onUpdate(() => (o.castShadow = false))

          const hide = new TWEEN.Tween(o.material)
            .to({}, 2000)
            .onUpdate(() => (target.visible = true))
            .onComplete(() => (target.visible = false))

          opaque.chain(fadeOut)
          opaque.start()
          hide.start()
        }
      })
    }

    destructionClips[index].forEach(function (clip) {
      destructionMixer[index].clipAction(clip).setLoop(THREE.LoopOnce)
      destructionMixer[index].clipAction(clip).clampWhenFinished = true
      destructionMixer[index].clipAction(clip).play().reset()
    })

    oresDestructionClips[oreIndex].forEach(function (clip) {
      oresDestructionMixer[oreIndex].clipAction(clip).setLoop(THREE.LoopOnce)
      oresDestructionMixer[oreIndex].clipAction(clip).clampWhenFinished = true
      oresDestructionMixer[oreIndex].clipAction(clip).play().reset()
    })
  }

  function animateParticle(intersects, animateY) {
    let index = Math.floor(Math.random() * particles.length)
    if (index === lastParticle) {
      animateParticle(intersects, animateY)
      return
    } else {
      lastParticle = index
    }

    animateY
      ? new TWEEN.Tween(particles[index].position)
          .to(
            {
              x: intersects.point.x,
              y: intersects.point.y - 0.15,
            },
            1
          )
          .easing(TWEEN.Easing.Exponential.Out)
          .start()
      : new TWEEN.Tween(particles[index].position)
          .to(
            {
              x: intersects.point.x,
            },
            1
          )
          .easing(TWEEN.Easing.Exponential.Out)
          .start()

    particles[index].traverse((o) => {
      if (o.isMesh) {
        if (
          intersects.object.name === 'ores' ||
          currentBlock.model !== 'rock'
        ) {
          o.material = new THREE.MeshBasicMaterial({
            color: currentBlock.colour,
            transparent: true,
          })
        } else {
          o.material = new THREE.MeshBasicMaterial({
            color: 'grey',
            transparent: true,
          })
        }

        const opaque = new TWEEN.Tween(o.material)
          .to(
            {
              opacity: 100,
            },
            50
          )
          .easing(TWEEN.Easing.Exponential.Out)

        const fadeOut = new TWEEN.Tween(o.material)
          .to(
            {
              opacity: 0,
            },
            900
          )
          .easing(TWEEN.Easing.Cubic.Out)

        const hide = new TWEEN.Tween(o.material)
          .to({}, 950)
          .onUpdate(() => (particles[index].visible = true))
          .onComplete(() => (particles[index].visible = false))

        opaque.chain(fadeOut)
        opaque.start()
        hide.start()
      }
    })

    new TWEEN.Tween(particleContainer[index].rotation)
      .to(
        {
          y: intersects.point.x * 0.5 + 0.8,
        },
        1
      )
      .easing(TWEEN.Easing.Exponential.Out)
      .start()

    particleClips[index].forEach(function (clip) {
      particleMixer[index].clipAction(clip).setLoop(THREE.LoopOnce)
      particleMixer[index].clipAction(clip).clampWhenFinished = true
      particleMixer[index].clipAction(clip).play().reset()
    })
  }

  function animateSmoke(intersects, animateY) {
    let index = Math.floor(Math.random() * smoke.length)

    smoke[index].scale.set(0, 0, 0)
    smoke[index].traverse((o) => {
      if (o.isMesh) {
        o.material = new THREE.MeshBasicMaterial({
          color: currentBlock.colour,
          transparent: true,
          map: smokeTexture,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        const scaleUp = new TWEEN.Tween(smoke[index].scale)
          .to(
            {
              x: 1.55,
              y: 1.55,
              z: 1.55,
            },
            700
          )
          .easing(TWEEN.Easing.Exponential.Out)

        new TWEEN.Tween(o.rotation)
          .to(
            {
              y: 100,
            },
            200000
          )
          .easing(TWEEN.Easing.Linear.None)
          .start()
        const opaque = new TWEEN.Tween(o.material)
          .to(
            {
              opacity: 0.9,
            },
            50
          )
          .easing(TWEEN.Easing.Exponential.Out)

        const fadeOut = new TWEEN.Tween(o.material)
          .to(
            {
              opacity: 0,
            },
            700
          )
          .easing(TWEEN.Easing.Cubic.Out)
        const hide = new TWEEN.Tween(o.material)
          .to({}, 750)
          .onUpdate(() => (o.visible = true))
          .onComplete(() => (o.visible = false))

        scaleUp.start()
        hide.start()
        opaque.chain(fadeOut)
        opaque.start()
      }
    })
  }

  function animateTool(intersects, animateY) {
    animateY
      ? new TWEEN.Tween(pickaxe.position)
          .to(
            {
              x: intersects.point.x,
              y: intersects.point.y + 0.5,
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
          y: intersects.point.x * 0.1 + 0.8,
        },
        500
      )
      .easing(TWEEN.Easing.Exponential.Out)
      .start()
  }

  function animateMap(position) {
    if (position && !mapModePending) {
      new TWEEN.Tween(mapGroup.position)
        .to(
          {
            x: -position.x,
            z: -position.z,
          },
          500
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
    }
    if (!mapMode && !mapModePending) {
      //world
      props.setMapMode()
      skyColour = 0xbde0fe
      console.log(currentLocation)
      let position = mapButtons.children.filter(
        (o) => o.name === currentLocation
      )[0].position

      new TWEEN.Tween(scene)
        .to(
          {
            background: new THREE.Color(skyColour),
          },
          2500
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()

      new TWEEN.Tween(mapOverlay.material)
        .to(
          {
            opacity: 1,
          },
          3500
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()

      new TWEEN.Tween(mapGroup.position)
        .to(
          {
            x: -position.x,
            z: -position.z,
          },
          500
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
      mapModePending = true
      new TWEEN.Tween(worldMap)
        .to({}, 1100)
        .onComplete(() => (worldMap.visible = true))
        .start()

      new TWEEN.Tween(scene.rotation)
        .to(
          {
            y: 0,
          },
          1500
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
      new TWEEN.Tween(scene.fog)
        .to(
          {
            far: 70,
            color: new THREE.Color(skyColour),
          },
          2500
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onComplete(() => {
          mapModePending = false
        })
        .start()
      new TWEEN.Tween(camera.position)
        .to(
          {
            y: 150,
          },
          1500
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
      new TWEEN.Tween(camera.rotation)
        .to(
          {
            x: -1.4,
          },
          2000
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)

        .start()
      new TWEEN.Tween(camera)
        .to(
          {
            fov: 80,
          },
          1750
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
          camera.updateProjectionMatrix()
        })
        .start()
      mapMode = true
    } else if (mapMode && !mapModePending) {
      //scene
      props.setSceneMode(currentLocation)
      mapModePending = true

      new TWEEN.Tween(mapOverlay.material)
        .to(
          {
            opacity: 0,
          },
          500
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
      new TWEEN.Tween(worldMap)
        .to({}, 400)
        .onComplete(() => (worldMap.visible = false))
        .start()
      new TWEEN.Tween(scene.rotation)
        .to(
          {
            y: -0.78,
          },
          2000
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
      new TWEEN.Tween(scene.fog)
        .to(
          {
            far: 15,
          },
          500
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()

      new TWEEN.Tween(camera.position)
        .to(
          {
            y: 1.25,
          },
          2000
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onComplete(() => {
          mapModePending = false
        })
        .start()
      new TWEEN.Tween(camera.rotation)
        .to(
          {
            x: -0.32175055439664224,
          },
          1750
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onComplete(() => {})
        .start()

      new TWEEN.Tween(camera)
        .to(
          {
            fov: 60,
          },
          1750
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
          camera.updateProjectionMatrix()
        })
        .start()
      mapMode = false
    }
  }

  async function raycast(evt, group) {
    try {
      let { nativeEvent } = evt
      mouse.x = (nativeEvent.absoluteX / width) * 2 - 1
      mouse.y = -(nativeEvent.absoluteY / height) * 2 + 1
      raycaster = new THREE.Raycaster()
      scene.updateMatrixWorld()
      raycaster.setFromCamera(mouse, camera)
      var intersects = raycaster.intersectObjects(group.children, true)
      return intersects[0]
    } catch (error) {
      return null
    }
  }

  function updateEnvironment(location) {
    currentLocation = location
    if (location === 'sandybeach') {
      foggyForestGroup.visible = false
      plane.material.map = sandTexture
      skyColour = 0x87ceeb

      new TWEEN.Tween(scene)
        .to(
          {
            background: new THREE.Color(skyColour),
          },
          2000
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
      new TWEEN.Tween(scene.fog)
        .to(
          {
            color: new THREE.Color(skyColour),
            far: 80,
          },
          2000
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
    } else if (location === 'foggyforest') {
      foggyForestGroup.visible = true
      plane.material.map = dirtTexture
      skyColour = 0xbde0fe

      new TWEEN.Tween(scene)
        .to(
          {
            background: new THREE.Color(skyColour),
          },
          2000
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
      new TWEEN.Tween(scene.fog)
        .to(
          {
            color: new THREE.Color(skyColour),
            far: 15,
          },
          2000
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
    }
  }

  function updateMaterial() {
    blockContainer.rotation.x += (Math.PI / 2) * Math.floor(Math.random() * 4)
    blockContainer.rotation.y += (Math.PI / 2) * Math.floor(Math.random() * 4)
    blockContainer.rotation.z += (Math.PI / 2) * Math.floor(Math.random() * 4)

    if (currentBlock.model === 'rock') {
      ores.visible = true
      cube.geometry = rock.geometry
      cube.material = new THREE.MeshStandardMaterial({
        color: 'grey',
        normalMap: blankNormalMap,
        normalScale: new Vector2(0, 0),
        map: cubeTexture,
      })
    } else if (currentBlock.model === 'stone') {
      ores.visible = false
      cube.geometry = stone.geometry
      cube.material = new THREE.MeshStandardMaterial({
        color: 'grey',
        normalMap: blankNormalMap,
        normalScale: new Vector2(0, 0),
        map: cubeTexture,
      })
    } else if (currentBlock.model === 'wood') {
      blockContainer.rotation.x = 0

      blockContainer.rotation.z = 0
      ores.visible = false
      cube.geometry = wood.geometry
      cube.material = new THREE.MeshStandardMaterial({
        color: 'grey',
        normalMap: blankNormalMap,
        normalScale: new Vector2(0, 0),
        map: woodTexture,
      })
    }

    let material
    if (currentBlock.material === 'shiny') {
      material = new THREE.MeshPhongMaterial({
        color: currentBlock.colour,
        map: oresTexture,
      })
    } else if (currentBlock.material === 'matte') {
      material = new THREE.MeshStandardMaterial({
        color: currentBlock.colour,
        map: oresTexture,
      })
    } else if (currentBlock.material === 'glass') {
      material = new THREE.MeshStandardMaterial({
        color: currentBlock.colour,
        transparent: true,
        opacity: 0.95,
        map: oresTexture,
      })
    }
    cube.material.normalMap = blankNormalMap
    cube.material.normalScale = new Vector2(0, 0)
    ores.material = material
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

  async function hitBlock(block, coordinates, longPress) {
    animation('swing', pickaxe, pickaxe)
    let damage = strength
    if (longPress) {
      damage = strength + Math.log(longPress)
    }
    if (currentBlock.health <= 0 || damage > currentBlock.health) {
      animateTool(block, false)
      if (particlesEnabled) {
        animateParticle(block, false)
      }

      animateSmoke(block, false)
      props.updateBalance(currentBlock, true, coordinates, damage)
      if (destructionEnabled) {
        destruction()
      }
      props.generateBlock()
      animation('destroy', block.object, block.object)
      updateMaterial(block)
    } else {
      cube.material.normalMap = cubeNormalMap
      cube.material.normalScale = new Vector2(
        5 / currentBlock.health,
        5 / currentBlock.health
      )

      animateTool(block, true)
      if (particlesEnabled) {
        animateParticle(block, true)
      }

      props.updateBalance(currentBlock, false, coordinates, damage)

      animation('click', block.object, block.object)
      currentBlock.health -= strength
    }
  }

  let handlePress = async (evt) => {
    let { nativeEvent } = evt
    if (nativeEvent.state === State.BEGAN) {
      try {
        if (!mapMode) {
          let block = await raycast(evt, world)
          if (block.object.parent.name === 'blockContainer') {
            hitBlock(block, {
              x: nativeEvent.absoluteX,
              y: nativeEvent.absoluteY,
            })
          }
        }
      } catch (error) {}
    }
    if (nativeEvent.state === State.END) {
      try {
        if (mapMode && !mapModePending) {
          let target = await raycast(evt, mapButtonGroup)
          currentLocation = target.object.name
          animateMap(target.object.position)
        }
      } catch (error) {}
    }
  }

  let handleDoublePress = async (evt) => {}

  let handleLongPress = async (evt) => {
    let { nativeEvent } = evt
    let block = await raycast(evt, world)
    if (nativeEvent.state === State.ACTIVE) {
      if (block.object.parent.name === 'blockContainer' && !mapMode) {
        timer = setInterval(async () => {
          hitBlock(block, {
            x: nativeEvent.absoluteX,
            y: nativeEvent.absoluteY,
          })
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
      panning = false
      if (!mapMode) {
        animation('returnRotation', scene, scene)
      }
    }
  }

  let handlePinch = (evt) => {
    let { nativeEvent } = evt
    if (mapMode && !mapModePending) {
      scale = nativeEvent.velocity
      camera.updateProjectionMatrix()
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scaleX: renderScale }, { scaleY: renderScale }],
      }}
    >
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
                      style={{
                        width: renderDimentions.width,
                        height: renderDimentions.height,
                      }}
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
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
})
