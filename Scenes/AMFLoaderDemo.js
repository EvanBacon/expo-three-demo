import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';
import Touches from '../window/Touches';
import ThreeView from '../ThreeView';

require('../assets/components/AMFLoader.js');

class Scene extends React.Component {
  static defaultProps = {
    onLoadingUpdated: ({ loaded, total }) => {},
    onFinishedLoading: () => {},
  };

  AR = false;

  shouldComponentUpdate(nextProps, nextState) {
    const { props, state } = this;
    return false;
  }

  render() {
    return (
      <ThreeView
        style={{ flex: 1 }}
        onContextCreate={this.onContextCreateAsync}
        onRender={this.animate}
        arEnabled={this.AR}
      />
    );
  }

  onContextCreateAsync = async (gl, arSession) => {
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

    this.setupScene(arSession);

    // resize listener
    window.addEventListener('resize', this.onWindowResize, false);

    // setup custom world
    await this.setupWorldAsync();

    this.props.onFinishedLoading();
  };

  setupScene = arSession => {
    const {
      innerWidth: width,
      innerHeight: height,
      devicePixelRatio: scale,
    } = window;

    // scene
    this.scene = new THREE.Scene();

    if (this.AR) {
      // AR Background Texture
      this.scene.background = ExpoTHREE.createARBackgroundTexture(
        arSession,
        this.renderer
      );

      /// AR Camera
      this.camera = ExpoTHREE.createARCamera(
        arSession,
        width,
        height,
        0.01,
        1000
      );
    } else {
      // Standard Background
      this.scene.background = new THREE.Color(0x999999);
      this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

      /// Standard Camera
      this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 500);

      this.camera.up.set(0, 0, 1);
      this.camera.position.set(0, -12, 6);

      // controls
      this.controls = new THREE.OrbitControls(this.camera);
      this.controls.target.set(0, 1.2, 2);

      var grid = new THREE.GridHelper(50, 50, 0xffffff, 0x555555);
      grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), 90 * (Math.PI / 180));
      this.scene.add(grid);

      // this.controls.addEventListener('change', this._render); // remove when using animation loop
    }
  };

  setupLights = () => {
    // lights
    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    this.scene.add(light);

    light = new THREE.DirectionalLight(0x002288);
    light.position.set(-1, -1, -1);
    this.scene.add(light);

    light = new THREE.AmbientLight(0x222222);
    this.scene.add(light);
  };

  setupWorldAsync = async () => {
    this.setupLights();

    const modelUri = require('../assets/models/amf/rook.amf');
    const asset = Expo.Asset.fromModule(modelUri);
    if (!asset.localUri) {
      await asset.downloadAsync();
    }
    const downloadUri = asset.localUri;
    const loader = new THREE.AMFLoader();
    const object = await new Promise((res, rej) =>
      loader.load(downloadUri, res, () => {}, rej)
    );
    this.scene.add(object);
    const { x: width, y: height, z: depth } = new THREE.Box3()
      .setFromObject(object)
      .getSize();
    console.warn(width, height, depth);
  };

  onWindowResize = () => {
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
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  };
}
export default Touches(Scene);
