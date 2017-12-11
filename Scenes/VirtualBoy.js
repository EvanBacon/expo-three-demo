import Expo from 'expo';
import React from 'react';
import { View, StyleSheet, TouchableHighlight, Text } from 'react-native';
import ExpoTHREE from 'expo-three';
import ThreeView from '../ThreeView';
require('../assets/components/VirtualBoyEffect');
class App extends React.Component {
  shouldComponentUpdate = () => false;
  render = () => {
    return (
      <ThreeView
        style={{ flex: 1 }}
        onContextCreate={this._onContextCreate}
        onRender={this._animate}
        arEnabled={true}
      />
    );
  };

  componentWillMount() {
    // Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.LANDSCAPE);
  }
  componentWillUnmount() {
    Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.ALL);
  }

  _onContextCreate = async (gl, arSession) => {
    const {
      innerWidth: width,
      innerHeight: height,
      devicePixelRatio: scale,
    } = window;

    // renderer

    this.renderer = ExpoTHREE.createRenderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    // this.renderer.setClearColor(0x000000, 1.0);

    // scene
    this.scene = new THREE.Scene();
    this.scene.background = ExpoTHREE.createARBackgroundTexture(
      arSession,
      this.renderer
    );

    // camera

    this.camera = ExpoTHREE.createARCamera(
      arSession,
      width,
      height,
      0.01,
      1000
    );
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var material = new THREE.MeshLambertMaterial({ color: 0xffccff });
    var geometry = new THREE.TorusKnotGeometry(0.1, 0.02, 200, 20, 4, 5);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.set(0.1, 0.1, 0.1);
    this.mesh.position.z = -1;
    this.scene.add(this.mesh);

    var light = new THREE.DirectionalLight();
    light.position.set(1, 2, 3);
    this.scene.add(light);

    light = new THREE.DirectionalLight();
    light.position.set(-1, -2, -3);
    this.scene.add(light);

    // custom scene

    this._setupScene();

    // resize listener

    window.addEventListener('resize', this._onWindowResize, false);
  };

  _setupScene = () => {
    const {
      innerWidth: width,
      innerHeight: height,
      devicePixelRatio: scale,
    } = window;
    // Initialize Three.JS
    this.virtualBoyEffect = new THREE.VirtualBoyEffect(this.renderer);
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
    this.virtualBoyEffect.setSize(width, height);
  };

  _animate = delta => {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.01;
    this.virtualBoyEffect.render(this.scene, this.camera, delta);
  };
}

// Wrap Touches Event Listener
export default App;
