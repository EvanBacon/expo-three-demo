import Expo from 'expo';
import React from 'react';
import { View, Text } from 'react-native';
import ExpoTHREE from 'expo-three';
import ThreeView from '../ThreeView';

import Touches from '../window/Touches';
import DeviceMotion from '../window/DeviceMotion';

class App extends React.Component {
  render = () => (
    <ThreeView
      style={{ flex: 1 }}
      onContextCreate={this._onContextCreate}
      onRender={this._animate}
    />
  );

  _onContextCreate = async gl => {
    const {
      innerWidth: width,
      innerHeight: height,
      devicePixelRatio: scale,
    } = window;

    // renderer

    this.renderer = ExpoTHREE.createRenderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x339ce2);
    // this.effect = new THREE.StereoEffect(this.renderer);

    // scene
    this.scene = new THREE.Scene();
    // camera

    this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    this.camera.position.z = 500;
    this.camera.lookAt(new THREE.Vector3());

    this.controls = new THREE.DeviceOrientationControls(this.camera);
    // custom scene

    await this._setupScene();

    // resize listener

    window.addEventListener('resize', this._onWindowResize, false);
  };

  _setupScene = async () => {
    const { innerWidth: width, innerHeight: height } = window;

    const geometry = new THREE.SphereBufferGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
      // NOTE: How to create an Expo-compatible THREE texture
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('../assets/images/nik.png')),
      }),
    });

    const mesh = new THREE.Mesh(geometry);
    this.scene.add(mesh);

    const helperGeometry = new THREE.BoxBufferGeometry(100, 100, 100, 4, 4, 4);
    const helperMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true,
    });
    const helper = new THREE.Mesh(helperGeometry, helperMaterial);
    this.scene.add(helper);
  };

  _onWindowResize = () => {
    const {
      innerWidth: width,
      innerHeight: height,
      devicePixelRatio: scale,
    } = window;

    // On Orientation Change, or split screen on android.
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update Renderer
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  _animate = delta => {
    this.controls.update();
    this._render();
  };

  _render = () => {
    // Render Scene!
    this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };
}

// Wrap Touches Event Listener
export default DeviceMotion(Touches(App));
