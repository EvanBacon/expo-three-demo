//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import '../assets/components/Ocean';
import '../assets/components/OceanShaders';
import React from 'react';
import Expo from 'expo';
import ExpoTHREE from 'expo-three';

import { View } from 'react-native';

export default class OceanShader extends React.Component {

  setupOcean = (camera) => {

    var gsize = 512;
    var res = 1024;
    var gres = res / 2;
    var origx = -gsize / 2;
    var origz = -gsize / 2;
    this.ms_Ocean = new THREE.Ocean(this.renderer, camera, this.scene,
      {
        USE_HALF_FLOAT: false,
        INITIAL_SIZE: 256.0,
        INITIAL_WIND: [10.0, 10.0],
        INITIAL_CHOPPINESS: 1.5,
        CLEAR_COLOR: [1.0, 1.0, 1.0, 0.0],
        GEOMETRY_ORIGIN: [origx, origz],
        SUN_DIRECTION: [-1.0, 1.0, 1.0],
        OCEAN_COLOR: new THREE.Vector3(0.004, 0.016, 0.047),
        SKY_COLOR: new THREE.Vector3(3.2, 9.6, 12.8),
        EXPOSURE: 0.35,
        GEOMETRY_RESOLUTION: gres,
        GEOMETRY_SIZE: gsize,
        RESOLUTION: res
      });
    this.ms_Ocean.materialOcean.uniforms.u_projectionMatrix = { value: camera.projectionMatrix };
    this.ms_Ocean.materialOcean.uniforms.u_viewMatrix = { value: camera.matrixWorldInverse };
    this.ms_Ocean.materialOcean.uniforms.u_cameraPosition = { value: camera.position };
    this.scene.add(this.ms_Ocean.oceanMesh);


  }
  setupLights = () => {
    /// General Lighting
    var ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);

    /// Directional Lighting
    var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);
  }


  render = () => (

      <Expo.GLView
        // onLayout={({nativeEvent:{layout:{width, height}}}) => this.onResize({width, height}) }
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}
      />
  );

  _onGLContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;


    this.scene = this.configureScene();

    this.camera = new THREE.OrthographicCamera(); //camera.clone();
    this.camera.position.z = 1;

    this.renderer = ExpoTHREE.createRenderer({ gl, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000);
    this.setupOcean(this.camera);

    this.controls = new THREE.OrbitControls(this.camera);
    let lastFrameTime;

    const render = () => {
      this._requestAnimationFrameID = requestAnimationFrame(render);

      const now = 0.001 * global.nativePerformanceNow();
      const dt = typeof lastFrameTime !== 'undefined'
        ? now - lastFrameTime
        : 0.16666;



      this.ms_Ocean.deltaTime = dt;
      this.ms_Ocean.render(this.ms_Ocean.dt);
      // this.ms_Ocean.overrideMaterial = this.ms_Ocean.materialOcean;
      // if (this.ms_Ocean.changed) {
      // 	this.ms_Ocean.materialOcean.uniforms.u_size.value = this.ms_Ocean.size;
      // 	this.ms_Ocean.materialOcean.uniforms.u_sunDirection.value.set( this.ms_Ocean.sunDirectionX, this.ms_Ocean.sunDirectionY, this.ms_Ocean.sunDirectionZ );
      // 	this.ms_Ocean.materialOcean.uniforms.u_exposure.value = this.ms_Ocean.exposure;
      // 	this.ms_Ocean.changed = false;
      // }
      // this.ms_Ocean.materialOcean.uniforms.u_normalMap.value = this.ms_Ocean.normalMapFramebuffer.texture;
      // this.ms_Ocean.materialOcean.uniforms.u_displacementMap.value = this.ms_Ocean.displacementMapFramebuffer.texture;
      // this.ms_Ocean.materialOcean.uniforms.u_projectionMatrix.value = this.camera.projectionMatrix;
      // this.ms_Ocean.materialOcean.uniforms.u_viewMatrix.value = this.camera.matrixWorldInverse;
      // this.ms_Ocean.materialOcean.uniforms.u_cameraPosition.value = this.camera.position;
      // this.ms_Ocean.materialOcean.depthTest = true;


      // this.renderer.render( this.scene, camera );

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

  onResize = ({ width, height }) => {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
  }
}
