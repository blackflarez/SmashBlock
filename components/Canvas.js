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
  toolVisible = false,
  oresDestruction = [],
  cubeDestruction = [],
  particles = [],
  lastParticle,
  sky,
  floors,
  plane,
  shadowPlane,
  planeTexture,
  planeColour,
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
  particleContainer = [],
  smokeContainer = [],
  lastDestruction,
  lastOreDestruction,
  light

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

        console.log(config)
      },
      setFromOutside(block) {
        currentBlock = Object.create(block)
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
        pickaxe.material = new THREE.MeshStandardMaterial({
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
      blockContainer = new THREE.Group()
      blockContainer.name = 'blockContainer'
      toolContainer = new THREE.Group()

      scene.background = new THREE.Color(0xbde0fe)

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
      camera.position.z = 10
      camera.position.y = 3

      mouse = new THREE.Vector2()

      //lights
      light = new THREE.DirectionalLight(0xffffff, 2.5)
      light.position.set(-120, 350, 150)
      light.shadow.mapSize.set(shadowSize, shadowSize)
      light.castShadow = true
      const d = 0.3
      light.shadow.camera.left = -d
      light.shadow.camera.right = d
      light.shadow.camera.top = d
      light.shadow.camera.bottom = -d

      const light2 = new THREE.DirectionalLight(0xb3eeff, 1)
      light2.position.set(120, 350, -400)
      light2.shadow.mapSize.set(shadowSize, shadowSize)
      light2.castShadow = false

      const ambientLight = new THREE.AmbientLight(0xffffff, 2.5)

      world.add(light)
      world.add(light2)
      world.add(ambientLight)

      //assets
      const uri = Asset.fromModule(require('../assets/models/rock.glb')).uri
      const cubeUri = Asset.fromModule(require('../assets/models/cube.glb')).uri
      const stoneUri = Asset.fromModule(
        require('../assets/models/stone.glb')
      ).uri
      const woodUri = Asset.fromModule(require('../assets/models/wood.glb')).uri
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
        pickaxe.position.z = 0.08
        toolContainer.add(pickaxe)

        //shadowPlane
        sandTexture.flipY = false
        sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping
        sandTexture.offset.set(0, 0)
        sandTexture.repeat.set(8, 8)

        planeColour = 0xa1a1a1
        shadowPlane.material = new THREE.MeshStandardMaterial({
          color: planeColour,
          transparent: true,
        })
        shadowPlane.material.map = planeTexture
        shadowPlane.receiveShadow = false
        shadowPlane.material.polygonOffset = true
        shadowPlane.material.polygonOffsetFactor = -0.1
        scene.add(shadowPlane)

        //plane
        plane.material = new THREE.MeshStandardMaterial({
          color: planeColour,
          map: sandTexture,
        })
        plane.receiveShadow = true
        world.add(plane)

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
        rock.castShadow = false
        rock.receiveShadow = true
        rock.material.transparent = true
        rock.scale.x = 0.032499998807907104
        rock.scale.y = 0.032499998807907104
        rock.scale.z = 0.032499998807907104

        //stone
        stone.material = new THREE.MeshStandardMaterial({
          color: 'grey',
          normalMap: blankNormalMap,
          normalScale: new Vector2(0, 0),
          map: cubeTexture,
        })

        stone.material.metalness = 0
        stone.name = 'cube'
        stone.castShadow = false
        stone.receiveShadow = true
        stone.material.transparent = true
        stone.scale.x = 0.032499998807907104
        stone.scale.y = 0.032499998807907104
        stone.scale.z = 0.032499998807907104

        cube = Object.create(stone)
        blockContainer.add(cube)

        //wood
        woodTexture.flipY = false
        wood.material = new THREE.MeshStandardMaterial({
          color: 'grey',
          normalMap: blankNormalMap,
          normalScale: new Vector2(0, 0),
          map: woodTexture,
        })

        wood.material.metalness = 0
        wood.name = 'cube'
        wood.castShadow = false
        wood.receiveShadow = true
        wood.material.transparent = true
        wood.scale.x = 0.032499998807907104
        wood.scale.y = 0.032499998807907104
        wood.scale.z = 0.032499998807907104

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
        ores.scale.x = 0.032499998807907104
        ores.scale.y = 0.032499998807907104
        ores.scale.z = 0.032499998807907104
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
          cubeDestruction[i].scale.x = 0.032499998807907104
          cubeDestruction[i].scale.y = 0.032499998807907104
          cubeDestruction[i].scale.z = 0.032499998807907104
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
          particles[i].scale.x = 0.032499998807907104
          particles[i].scale.y = 0.032499998807907104
          particles[i].scale.z = 0.032499998807907104
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
          oresDestruction[i].scale.x = 0.032499998807907104
          oresDestruction[i].scale.y = 0.032499998807907104
          oresDestruction[i].scale.z = 0.032499998807907104
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
              o.material = new THREE.MeshLambertMaterial({
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
      //Rotate scene
      if (panning) {
        scene.rotation.x += deltaY * rotationSpeed
        scene.rotation.y += deltaX * rotationSpeed
      }

      if (scene.rotation.x > 0.6) {
        scene.rotation.x = 0.6
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

      //Scale scene
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
      camera.lookAt(0, 0, 0)
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      gl.endFrameEXP()
    }

    init()
    props.setLoading()
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
            x: 0.1,
            y: 0.1,
            z: 0.1,
          },
          65
        )
        .yoyo(true)
        .easing(TWEEN.Easing.Elastic.Out)

      const deflateShadow = new TWEEN.Tween(shadowPlane.scale)
        .to(
          {
            x: 0.09736721962690353,
            y: 0.09736721962690353,
            z: 0.09736721962690353,
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
          750
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
      material = new THREE.MeshStandardMaterial({
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
          o.material = new THREE.MeshStandardMaterial({
            color: 'grey',
            map: woodTexture,
          })
        } else {
          o.material = new THREE.MeshStandardMaterial({
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
              y: intersects.point.y - 0.01,
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
        if (intersects.object.name === 'ores') {
          o.material = new THREE.MeshStandardMaterial({
            color: currentBlock.colour,
            transparent: true,
          })
        } else {
          o.material = new THREE.MeshStandardMaterial({
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
          y: intersects.point.x * 10 + 0.8,
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
              y: intersects.point.y + 0.04,
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
          y: intersects.point.x * 6 + 0.8,
        },
        500
      )
      .easing(TWEEN.Easing.Exponential.Out)
      .start()
  }

  async function raycast(evt) {
    let { nativeEvent } = evt
    mouse.x = (nativeEvent.absoluteX / width) * 2 - 1
    mouse.y = -(nativeEvent.absoluteY / height) * 2 + 1
    raycaster = new THREE.Raycaster()
    scene.updateMatrixWorld()
    raycaster.setFromCamera(mouse, camera)
    var intersects = raycaster.intersectObjects(world.children, true)
    return intersects[0]
  }

  function updateMaterial(block) {
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
      let block = await raycast(evt)
      if (block.object.parent.name === 'blockContainer') {
        hitBlock(block, { x: nativeEvent.absoluteX, y: nativeEvent.absoluteY })
      }
    }
  }

  let handleDoublePress = async (evt) => {}

  let handleLongPress = async (evt) => {
    let { nativeEvent } = evt
    let block = await raycast(evt)
    if (nativeEvent.state === State.ACTIVE) {
      if (block.object.parent.name === 'blockContainer') {
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
      animation('returnRotation', scene, scene)
    }
  }

  let handlePinch = (evt) => {
    let { nativeEvent } = evt
    //scale = nativeEvent.velocity
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
