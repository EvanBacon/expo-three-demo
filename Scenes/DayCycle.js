import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';

import ThreeView from '../ThreeView';

import Touches from '../window/Touches';

class App extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const { props, state } = this;
    return false;
  }

  render = () => (
    <ThreeView
      style={{ flex: 1 }}
      onContextCreate={this._onContextCreate}
      onRender={this.animate}
    />
  );

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
    this.renderer.setClearColor(0x000000, 1.0);

    // scene
    this.scene = new THREE.Scene();

    // Standard Background
    this.scene.background = new THREE.Color(0xcccccc);
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    /// Standard Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 3000);
    this.camera.position.z = 3;
    this.camera.lookAt(new THREE.Vector3());

    // controls
    this.controls = new THREE.OrbitControls(this.camera);
    // this.controls.addEventListener('change', this._render); // remove when using animation loop

    // resize listener
    window.addEventListener('resize', this._onWindowResize, false);

    // setup custom world
    await this._setupWorld();
  };

  _setupWorld = async () => {
    this.sunAngle = -3 / 6 * Math.PI * 2;

    this.starField = new THREEx.DayNight.StarField(this.scene);

    this.sunSphere = new THREEx.DayNight.SunSphere();
    this.scene.add(this.sunSphere.object3d);

    this.sunLight = new THREEx.DayNight.SunLight();
    this.scene.add(this.sunLight.object3d);

    this.skydom = new THREEx.DayNight.Skydom();
    this.scene.add(this.skydom.object3d);

    this.mesh = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.5 - 0.15, 0.15),
      new THREE.MeshNormalMaterial()
    );
    this.scene.add(this.mesh);
  };

  _onWindowResize = () => {
    const {
      innerWidth: width,
      innerHeight: height,
      devicePixelRatio: scale,
    } = window;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  animate = delta => {
    const dayDuration = 10; // nb seconds for a full day cycle
    this.sunAngle += delta / dayDuration * Math.PI * 2;

    this.starField.update(this.sunAngle);
    this.sunSphere.update(this.sunAngle);
    this.sunLight.update(this.sunAngle);
    this.skydom.update(this.sunAngle);

    this.mesh.rotateY(delta * Math.PI * 2 * 0.2);
    this.mesh.rotateX(delta * Math.PI * 2 * 0.1);

    // Render the scene
    this._render();
  };

  _render = () => {
    this.renderer.render(this.scene, this.camera);
  };
}

// Wrap Touches Event Listener
const TouchesComponent = Touches(App);

export default TouchesComponent;
