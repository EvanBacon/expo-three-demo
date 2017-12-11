import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';
import Touches from '../window/Touches';
import ThreeView from '../ThreeView';

// require('../assets/components/VTKLoader');

require('three/examples/js/loaders/sea3d/SEA3D');
require('three/examples/js/loaders/sea3d/SEA3DLZMA');
require('three/examples/js/loaders/sea3d/SEA3DLoader');

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
        render={this.animate}
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
      this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
      this.camera.position.set(1000, -300, 1000);

      // controls
      // this.controls = new THREE.OrbitControls(this.camera);
      // this.controls.target.set(0, 1.2, 2);

      // var grid = new THREE.GridHelper(50, 50, 0xffffff, 0x555555);
      // this.scene.add(grid);

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

  loadMesh = async resource => {
    const modelUri = resource;
    const asset = Expo.Asset.fromModule(modelUri);
    if (!asset.localUri) {
      await asset.downloadAsync();
    }
    const downloadUri = asset.localUri;
    const loader = new THREE.VTKLoader();
    const object = await new Promise((res, rej) =>
      loader.load(downloadUri, res, () => {}, rej)
    );
    return object;
  };

  setupWorldAsync = async () => {
    this.setupLights();

    const loader = new THREE.SEA3D({
      autoPlay: true, // Auto play animations
      container: this.scene, // Container to add models
    });
    loader.onComplete = e => {
      // Get camera from SEA3D Studio
      // use loader.get... to get others objects
      var cam = loader.getCamera('Camera007');
      this.camera.position.copy(cam.position);
      this.camera.rotation.copy(cam.rotation);
      this.controls = new THREE.OrbitControls(this.camera);
      // animate();
    };

    const modelUri = resource;
    const asset = Expo.Asset.fromModule(
      require('../assets/models/sea3d/mascot.tjs.sea')
    );
    if (!asset.localUri) {
      await asset.downloadAsync();
    }
    const downloadUri = asset.localUri;

    loader.load(downloadUri);

    this.composer = new THREE.EffectComposer(this.renderer);
    var renderPass = new THREE.RenderPass(this.scene, this.camera);
    var copyPass = new THREE.ShaderPass(THREE.CopyShader);
    this.composer.addPass(renderPass);
    var vh = 1.4,
      vl = 1.2;
    var colorCorrectionPass = new THREE.ShaderPass(THREE.ColorCorrectionShader);
    colorCorrectionPass.uniforms['powRGB'].value = new THREE.Vector3(
      vh,
      vh,
      vh
    );
    colorCorrectionPass.uniforms['mulRGB'].value = new THREE.Vector3(
      vl,
      vl,
      vl
    );
    this.composer.addPass(colorCorrectionPass);
    var vignettePass = new THREE.ShaderPass(THREE.VignetteShader);
    vignettePass.uniforms['darkness'].value = 1.0;
    this.composer.addPass(vignettePass);
    this.composer.addPass(copyPass);
    copyPass.renderToScreen = true;

    // var material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    // var geometry = await this.loadMesh(require("../assets/models/vtk/bunny.vtk"));
    // geometry.center();
    // geometry.computeVertexNormals();
    // var mesh = new THREE.Mesh(geometry, material);
    // mesh.position.set(- 0.075, 0.005, 0);
    // mesh.scale.multiplyScalar(0.2);
    // this.scene.add(mesh);

    // geometry = await this.loadMesh(require("../assets/models/vtk/cube_ascii.vtp"));

    // geometry.computeVertexNormals();
    // geometry.center();
    // var material = new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    // var mesh = new THREE.Mesh(geometry, material);
    // mesh.position.set(- 0.025, 0, 0);
    // mesh.scale.multiplyScalar(0.01);
    // this.scene.add(mesh);

    // geometry = await this.loadMesh(require("../assets/models/vtk/cube_binary.vtp"));

    // geometry.computeVertexNormals();
    // geometry.center();
    // var material = new THREE.MeshLambertMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
    // var mesh = new THREE.Mesh(geometry, material);
    // mesh.position.set(0.025, 0, 0);
    // mesh.scale.multiplyScalar(0.01);
    // this.scene.add(mesh);

    // geometry = await this.loadMesh(require("../assets/models/vtk/cube_no_compression.vtp"));

    // geometry.computeVertexNormals();
    // geometry.center();
    // var material = new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    // var mesh = new THREE.Mesh(geometry, material);
    // mesh.position.set(0.075, 0, 0);
    // mesh.scale.multiplyScalar(0.01);
    // this.scene.add(mesh);
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
    THREE.SEA3D.AnimationHandler.update(delta);
    this.composer.render(delta);
  };
}
export default Touches(Scene);
