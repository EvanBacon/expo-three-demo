//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import Shader from '../assets/components/SkyShader';
import Expo from 'expo';
import React from 'react';
import { View } from 'react-native';
import ExpoTHREE from 'expo-three';

import ThreeView from '../ThreeView';

import Touches from '../window/Touches';

class App extends React.Component {
  render = () => (
    <ThreeView
      style={{ flex: 1 }}
      onContextCreate={this._onContextCreate}
      onRender={this._animate}
    />
  );
  //render={_=> {}} to disable loop

  _onContextCreate = async gl => {
    const { innerWidth: width, innerHeight: height } = window;

    // renderer

    this.renderer = ExpoTHREE.createRenderer({ gl });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 1.0);

    // scene

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    // camera

    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 200000);
    this.camera.position.set(0, 100, 2000);
    this.camera.lookAt(new THREE.Vector3());

    // controls

    this.controls = new THREE.OrbitControls(this.camera);

    // lights

    /// General Lighting
    const ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);

    /// Directional Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);

    this._setupScene();
    // resize listener

    window.addEventListener('resize', this._onWindowResize, false);
  };

  _setupScene = () => {
    this.scene.add(new THREE.GridHelper(10000, 2, 0xffffff, 0xffffff));

    // Add Sky Mesh
    let sky = new Shader();
    this.scene.add(sky.mesh);

    // Add Sun Helper
    let sunSphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(2000, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    sunSphere.position.y = -700000;
    this.scene.add(sunSphere);

    let effectController = {
      turbidity: 10,
      rayleigh: 2,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8,
      luminance: 1,
      inclination: 0.49, // elevation / inclination
      azimuth: 0.25, // Facing front,
      sun: true,
    };

    let distance = 400000;
    let uniforms = sky.uniforms;
    uniforms.turbidity.value = effectController.turbidity;
    uniforms.rayleigh.value = effectController.rayleigh;
    uniforms.luminance.value = effectController.luminance;
    uniforms.mieCoefficient.value = effectController.mieCoefficient;
    uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
    let theta = Math.PI * (effectController.inclination - 0.5);
    let phi = 2 * Math.PI * (effectController.azimuth - 0.5);
    sunSphere.position.x = distance * Math.cos(phi);
    sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
    sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
    sunSphere.visible = effectController.sun;
    sky.uniforms.sunPosition.value.copy(sunSphere.position);
  };

  _onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  _animate = delta => {
    const { renderer, scene, camera } = this;
    this._render();
  };

  _render = () => {
    this.renderer.render(this.scene, this.camera);
  };
}

// Wrap Touches Event Listener
export default Touches(App);
