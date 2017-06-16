//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import Shader from '../assets/components/SkyShader';
import React from 'react';
import Expo from 'expo';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';

import OrbitControls from 'expo-three-orbit-controls'

import {Text, View } from 'react-native';

import {Button} from '../components';

export default class OceanShader extends React.Component {
  static navigationOptions = {
    title: 'Ocean Shader',
  }

  setupSky = () => {
    // Add Sky Mesh
    let sky = new Shader();
    this.scene.add( sky.mesh );

    // Add Sun Helper
    let sunSphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry( 2000, 16, 8 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff } )
    );
    sunSphere.position.y = - 700000;
    this.scene.add( sunSphere );

    var effectController  = {
      turbidity: 10,
      rayleigh: 2,
      mieCoefficient: 0.004,
      mieDirectionalG: 0.8,
      luminance: 1,
      inclination: 0.4315, // elevation / inclination
      azimuth: 0.25, // Facing front,
      sun: true
    };

    var distance = 400000;
    var uniforms = sky.uniforms;
    uniforms.turbidity.value = effectController.turbidity;
    uniforms.rayleigh.value = effectController.rayleigh;
    uniforms.luminance.value = effectController.luminance;
    uniforms.mieCoefficient.value = effectController.mieCoefficient;
    uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
    var theta = Math.PI * ( effectController.inclination - 0.5 );
    var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
    sunSphere.position.x = distance * Math.cos( phi );
    sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
    sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
    sunSphere.visible = effectController.sun;
    sky.uniforms.sunPosition.value.copy( sunSphere.position );
  }


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

  state = {
    camera: null
  }

  button = ({text, onPress}) => (
    <Button.Link style={{backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4, paddingVertical:12, margin: 4}} onPress={onPress}>{text}
    </Button.Link>
  )

  renderScene = () => (
    <OrbitControls
      style={{flex: 1}}
      camera={this.state.camera}>
      <Expo.GLView
        // onLayout={({nativeEvent:{layout:{width, height}}}) => this.onResize({width, height}) }
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}
      />
    </OrbitControls>
  )

  render = () => (
    <View style={{flex: 1}}>
      {this.renderScene()}
    </View>
  );

  _onGLContextCreate = async (gl) => {
    const {drawingBufferWidth: width, drawingBufferHeight: height} = gl;

    this.scene = this.configureScene();
    const camera = this.configureCamera({width, height});
    this.setupSky();

    // this.configureLights();
    // NOTE: How to create an `Expo.GLView`-compatible THREE renderer
    this.renderer = ExpoTHREE.createRenderer({ gl, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor( 0x000000 );


    this.setState({camera})
    let lastFrameTime;

    const render = () => {
      this._requestAnimationFrameID = requestAnimationFrame(render);

const now = 0.001 * global.nativePerformanceNow();
const dt = typeof lastFrameTime !== 'undefined'
  ? now - lastFrameTime
  : 0.16666;


      this.renderer.render( this.scene, camera );

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

  configureCamera = ({width, height}) => {
    // camera
    let camera = new THREE.PerspectiveCamera( 28, width / height, 1, 10000 );
    camera.position.z = 150;
    return camera
  }

  onResize = ({width, height}) => {
    if (this.state.camera) {
      this.state.camera.aspect = width / height;
      this.state.camera.updateProjectionMatrix();
    }
    if (this.renderer) {
      this.renderer.setSize( width, height );
    }
  }
}
