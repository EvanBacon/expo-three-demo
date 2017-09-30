//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import React from 'react';
import Expo from 'expo';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';


import { Text, View } from 'react-native';

import { Button } from '../components';
require('../assets/components/GPUParticleSystem');

export default class ParticleSystem extends React.Component {

  // options passed during each spawned
  options = {
    position: new THREE.Vector3(),
    positionRandomness: .3,
    velocity: new THREE.Vector3(),
    velocityRandomness: 1.5,
    color: 0xaa88ff,
    colorRandomness: .2,
    turbulence: .5,
    lifetime: 2,
    size: 50, //5
    sizeRandomness: 1
  };
  spawnerOptions = {
    spawnRate: 1500,
    horizontalSpeed: 1.0,
    verticalSpeed: 1.33,
    timeScale: 1
  };

  tick = 0;
  clock = new THREE.Clock();

  button = ({ text, onPress }) => (
    <Button.Link style={{ backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4, paddingVertical: 12, margin: 4 }} onPress={onPress}>{text}
    </Button.Link>
  )

  renderScene = () => (
      <Expo.GLView
        // onLayout={({nativeEvent:{layout:{width, height}}}) => this.onResize({width, height}) }
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}
      />
  )

  // renderInfo = () => (
  //   <View style={{position: 'absolute',padding: 24, top: 20, left: 0, right: 0, justifyContent: 'space-around',}}>
  //     <Text style={{textAlign: 'center', marginBottom: 8, backgroundColor: 'transparent'}}>
  //       Simple Cloth Simulation Verlet integration with relaxed constraints
  //     </Text>
  //     <View style={{justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
  //
  //       {this.button({text: "Wind", onPress: (_=> {
  //         wind = !wind
  //       })})}
  //       {this.button({text: "Ball", onPress: (_=> {
  //         this.sphere.visible = !this.sphere.visible;
  //       })})}
  //       {this.button({text: "Pins", onPress: (_=> {
  //         this.togglePins();
  //       })})}
  //     </View>
  //   </View>
  // )

  render = () => (
    <View style={{ flex: 1 }}>
      {this.renderScene()}
      {/* {this.renderInfo()} */}
    </View>
  );

  _onGLContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    this.scene = this.configureScene();
    this.camera = this.configureCamera({ width, height });
    this.controls = new THREE.OrbitControls(this.camera);
    await this.configureParticles();

    // this.configureLights();
    // NOTE: How to create an `Expo.GLView`-compatible THREE renderer
    this.renderer = ExpoTHREE.createRenderer({ gl, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000);

    let lastFrameTime;

    const render = () => {
      this._requestAnimationFrameID = requestAnimationFrame(render);

      const now = 0.001 * global.nativePerformanceNow();
      const dt = typeof lastFrameTime !== 'undefined'
        ? now - lastFrameTime
        : 0.16666;



      let { spawnerOptions, clock } = this;
      var delta = dt * spawnerOptions.timeScale;
      this.tick += delta;


      if (this.tick < 0) this.tick = 0;
      if (delta > 0) {
        this.options.position.x = Math.sin(this.tick * spawnerOptions.horizontalSpeed) * 20;
        this.options.position.y = Math.sin(this.tick * spawnerOptions.verticalSpeed) * 10;
        this.options.position.z = Math.sin(this.tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed) * 5;
        for (var x = 0; x < spawnerOptions.spawnRate * delta; x++) {
          // Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
          // their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
          this.particleSystem.spawnParticle(this.options);
        }
      }
      this.particleSystem.update(this.tick);

      // stats.update();

      this.camera.lookAt(this.scene.position);
      this.renderer.render(this.scene, this.camera);

      // NOTE: At the end of each frame, notify `Expo.GLView` with the below
      gl.endFrameEXP();
      lastFrameTime = now;

    }

    render();
  }

  componentWillUnmount() {
    if (this._requestAnimationFrameID) {
      cancelAnimationFrame(this._requestAnimationFrameID);
    }
  }


  configureScene = () => {
    // scene
    let scene = new THREE.Scene();
    return scene;
  }

  configureCamera = ({ width, height }) => {
    // camera
    let camera = new THREE.PerspectiveCamera(28, width / height, 1, 10000);
    camera.position.z = 150;
    return camera
  }

  configureParticles = async () => {

    var particleNoiseTex = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/images/perlin-512.png')),
    });
    var particleSpriteTex = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/images/particle2.png')),
    });
    // The GPU Particle system extends THREE.Object3D, and so you can use it
    // as you would any other scene graph component.	Particle positions will be
    // relative to the position of the particle system, but you will probably only need one
    // system for your whole scene
    this.particleSystem = new THREE.GPUParticleSystem({
      maxParticles: 500,
      particleNoiseTex,
      particleSpriteTex,
    });
    this.scene.add(this.particleSystem);
  }

  ///TODO: Build Options componnet
  configureStats = () => {
    // gui.add( options, "velocityRandomness", 0, 3 );
    // 	gui.add( options, "positionRandomness", 0, 3 );
    // 	gui.add( options, "size", 1, 20 );
    // 	gui.add( options, "sizeRandomness", 0, 25 );
    // 	gui.add( options, "colorRandomness", 0, 1 );
    // 	gui.add( options, "lifetime", .1, 10 );
    // 	gui.add( options, "turbulence", 0, 1 );
    // 	gui.add( spawnerOptions, "spawnRate", 10, 30000 );
    // 	gui.add( spawnerOptions, "timeScale", -1, 1 );

  }

  onResize = ({ width, height }) => {
    
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }
}
