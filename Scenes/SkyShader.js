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

import {View} from 'react-native';

export default class SkyShader extends React.Component {
  static navigationOptions = {
    title: 'Sky Shader',
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
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8,
      luminance: 1,
      inclination: 0.49, // elevation / inclination
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
  setupLights = () => {
  /// General Lighting
  var ambientLight = new THREE.AmbientLight( 0xcccccc );
  this.scene.add( ambientLight );

  /// Directional Lighting
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
  directionalLight.position.set( 1, 1, 0.5 ).normalize();
  this.scene.add( directionalLight );
}


  state = {
    camera: null
  }

  render = () => (
    <OrbitControls
      style={{flex: 1}}
      camera={this.state.camera}>
      <Expo.GLView
        // onLayout={({nativeEvent:{layout:{width, height}}}) => this.onResize({width, height}) }
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}
      />
    </OrbitControls>
  );

  _onGLContextCreate = async (gl) => {
    const {drawingBufferWidth: width, drawingBufferHeight: height} = gl;


    this.scene = this.configureScene();
    const camera = this.configureCamera({width, height});
    this.setupSky();
    this.setupLights();

    var helper = new THREE.GridHelper( 10000, 2, 0xffffff, 0xffffff );
    this.scene.add( helper );


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
    let camera = new THREE.PerspectiveCamera( 60, width / height, 1, 20000 );
    camera.position.set( 0, 100, 2000 );
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
