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

    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    this.camera.position.z = 500;
    this.camera.lookAt(new THREE.Vector3());

    // controls

    this.controls = new THREE.OrbitControls(this.camera);
    // this.controls.addEventListener('change', this._render); // remove when using animation loop

    // world

    const geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      flatShading: true,
    });

    for (var i = 0; i < 500; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (Math.random() - 0.5) * 1000;
      mesh.position.y = (Math.random() - 0.5) * 1000;
      mesh.position.z = (Math.random() - 0.5) * 1000;
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      this.scene.add(mesh);
    }

    // lights

    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    this.scene.add(light);

    light = new THREE.DirectionalLight(0x002288);
    light.position.set(-1, -1, -1);
    this.scene.add(light);

    light = new THREE.AmbientLight(0x222222);
    this.scene.add(light);

    // resize listener

    window.addEventListener('resize', this._onWindowResize, false);
  };

  _onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  _animate = delta => {
    const { renderer, scene, camera } = this;
    //const { width, height } = this.renderer.getSize();

    // this.controls.update();  // required if controls.enableDamping = true, or if controls.autoRotate = true
    this._render();
  };

  _render = () => {
    this.renderer.render(this.scene, this.camera);
  };
}

// Wrap Touches Event Listener
export default Touches(App);
