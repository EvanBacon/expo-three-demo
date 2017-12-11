import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';
import Touches from '../window/Touches';
import ThreeView from '../ThreeView';

require('three/examples/js/loaders/STLLoader');

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

    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.renderReverseSided = false;

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
      this.camera = new THREE.PerspectiveCamera(35, width / height, 1, 15);
      this.camera.position.set(3, 0.15, 3);

      // controls
      this.controls = new THREE.OrbitControls(this.camera);
      // this.controls.target.set( 0, 1.2, 2 );
      // this.controls.addEventListener('change', this._render); // remove when using animation loop
    }
  };

  addShadowedLight = (x, y, z, color, intensity) => {
    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    this.scene.add(directionalLight);
    directionalLight.castShadow = true;
    var d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.bias = -0.005;
  };

  loadMesh = async resource => {
    const modelUri = resource;
    const asset = Expo.Asset.fromModule(modelUri);
    if (!asset.localUri) {
      await asset.downloadAsync();
    }
    const downloadUri = asset.localUri;
    const loader = new THREE.STLLoader();
    const object = await new Promise((res, rej) =>
      loader.load(downloadUri, res, () => {}, rej)
    );
    return object;
  };
  setupWorldAsync = async () => {
    var plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(40, 40),
      new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    this.scene.add(plane);
    plane.receiveShadow = true;

    var material = new THREE.MeshPhongMaterial({
      color: 0xff5533,
      specular: 0x111111,
      shininess: 200,
    });
    const slotted_disk = await this.loadMesh(
      require('../assets/models/stl/ascii/slotted_disk.stl')
    );
    var mesh = new THREE.Mesh(slotted_disk, material);
    mesh.position.set(0, -0.25, 0.6);
    mesh.rotation.set(0, -Math.PI / 2, 0);
    mesh.scale.set(0.5, 0.5, 0.5);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    material = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      specular: 0x111111,
      shininess: 200,
    });
    const headpan = await this.loadMesh(
      require('../assets/models/stl/binary/pr2_head_pan.stl')
    );
    mesh = new THREE.Mesh(headpan, material);
    mesh.position.set(0, -0.37, -0.6);
    mesh.rotation.set(-Math.PI / 2, 0, 0);
    mesh.scale.set(2, 2, 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const tilt = await this.loadMesh(
      require('../assets/models/stl/binary/pr2_head_tilt.stl')
    );
    mesh = new THREE.Mesh(tilt, material);
    mesh.position.set(0.136, -0.37, -0.6);
    mesh.rotation.set(-Math.PI / 2, 0.3, 0);
    mesh.scale.set(2, 2, 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const colored = await this.loadMesh(
      require('../assets/models/stl/binary/colored.stl')
    );
    var meshMaterial = material;
    if (colored.hasColors) {
      meshMaterial = new THREE.MeshPhongMaterial({
        opacity: colored.alpha,
        vertexColors: THREE.VertexColors,
      });
    }
    mesh = new THREE.Mesh(colored, meshMaterial);
    mesh.position.set(0.5, 0.2, 0);
    mesh.rotation.set(-Math.PI / 2, Math.PI / 2, 0);
    mesh.scale.set(0.3, 0.3, 0.3);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    this.scene.add(new THREE.HemisphereLight(0x443333, 0x111122));

    this.addShadowedLight(1, 1, 1, 0xffffff, 1.35);
    this.addShadowedLight(0.5, 1, -1, 0xffaa00, 1);
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
