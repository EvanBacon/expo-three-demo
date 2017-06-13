import Expo from 'expo';
import React from 'react';
import { StyleSheet,TouchableOpacity, Text, View } from 'react-native';
let {cloth,wind,pins,windStrength, simulate,ballSize, clothFunction, windForce} = require('../assets/components/Cloth');
const THREE = require('three');
import ExpoTHREE from 'expo-three';
import OrbitControls from 'expo-three-orbit-controls'
// THREE warns us about some GL extensions that `Expo.GLView` doesn't support
// yet. This is ok, most things will still work, and we'll support those
// extensions hopefully soon.
// console.disableYellowBox = true;
console.ignoredYellowBox = ['THREE.WebGLRenderer'];


const fragmentShader = `
#include <packing>
uniform sampler2D texture;
varying vec2 vUV;
void main() {
  vec4 pixel = texture2D( texture, vUV );
  if ( pixel.a < 0.5 ) discard;
  gl_FragData[ 0 ] = packDepthToRGBA( gl_FragCoord.z );
}
`;
const vertexShader = `
varying vec2 vUV;
void main() {
  vUV = 0.75 * uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}
`;

export default class AnimationCloth extends React.Component {
  state = {
    camera: null
  }
  render() {
    // Create an `Expo.GLView` covering the whole screen, tell it to call our
    // `_onGLContextCreate` function once it's initialized.
    return (
      <View style={{flex: 1}}>
      <OrbitControls
        maxPolarAngle={Math.PI * 0.5}
        minDistance={1000}
        maxDistance={7500}
        style={{flex: 1}}
        camera={this.state.camera}>
        <Expo.GLView
          // onLayout={({nativeEvent:{layout:{width, height}}}) => this.onResize({width, height}) }
          style={{ flex: 1, backgroundColor: 'red' }}
          onContextCreate={this._onGLContextCreate}
        />

      </OrbitControls>
      <View style={{position: 'absolute', top: 20, left: 0, right: 0, height: 48, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
        <TouchableOpacity style={{}} onPress={_=> {
            wind = !wind
          }}>
          <Text>Wind</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{}} onPress={_=> {
this.sphere.visible = !this.sphere.visible;
          }}>
          <Text>Ball</Text>
        </TouchableOpacity>
      <TouchableOpacity style={{}} onPress={_=> {
          this.togglePins();
        }}>
        <Text>Pins</Text>
      </TouchableOpacity>
    </View>
  </View>
    );
  }

  // This is called by the `Expo.GLView` once it's initialized
  _onGLContextCreate = async (gl) => {
    // Based on https://threejs.org/docs/#manual/introduction/Creating-a-scene
    // In this case we instead use a texture for the material (because textures
    // are cool!). All differences from the normal THREE.js example are
    // indicated with a `NOTE:` comment.
    const {drawingBufferWidth: width, drawingBufferHeight: height} = gl;
    this.scene = this.configureScene();
    const camera = this.configureCamera({width, height});
    this.configureLights();
    // NOTE: How to create an `Expo.GLView`-compatible THREE renderer
    this.renderer = ExpoTHREE.createRenderer({ gl, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor( this.scene.fog.color );
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;

    this.configurePins();

    this.setState({camera})
    await this.configureCloth()


    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      // NOTE: How to create an Expo-compatible THREE texture
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('../assets/icons/app.png')),
      }),
    });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);
    //
    // camera.position.z = 5;

    const render = () => {
      requestAnimationFrame(render);

      this.animate();

      // this.renderer.render(scene, camera);
      // NOTE: At the end of each frame, notify `Expo.GLView` with the below
      gl.endFrameEXP();
    }

      render();


  }

  configureScene = () => {
    // scene
    let scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );
    return scene
  }
  configureCamera = ({width, height}) => {
    // camera
    let camera = new THREE.PerspectiveCamera( 30, width / height, 1, 10000 );
    camera.position.x = 1000;
    camera.position.y = 50;
    camera.position.z = 1500;
    return camera
  }
  configureLights = () => {
    var light;
    this.scene.add( new THREE.AmbientLight( 0x666666 ) );
    light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
    light.position.set( 50, 200, 100 );
    light.position.multiplyScalar( 1.3 );
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    var d = 300;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;
    light.shadow.camera.far = 1000;
    this.scene.add( light );

  }


  configurePins = () => {
    /* testing cloth simulation */
    this.pinsFormation = [];
    pins = [ 6 ];
    this.pinsFormation.push( pins );
    pins = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    this.pinsFormation.push( pins );
    pins = [ 0 ];
    this.pinsFormation.push( pins );
    pins = []; // cut the rope ;)
    this.pinsFormation.push( pins );
    pins = [ 0, cloth.w ]; // classic 2 pins
    this.pinsFormation.push( pins );
    pins = this.pinsFormation[ 1 ];
  }
  togglePins = () => {
    let index =  ~~ ( Math.random() * this.pinsFormation.length )
    pins = this.pinsFormation[index];
    console.warn(index)
  }

  configureCloth = async () => {
    // cloth material
    var loader = new THREE.TextureLoader();
    var clothTexture = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/images/circuit_pattern.png')),
    })
    clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
    clothTexture.anisotropy = 16;
    var clothMaterial = new THREE.MeshPhongMaterial( {
      specular: 0x030303,
      map: clothTexture,
      side: THREE.DoubleSide,
      alphaTest: 0.5
    } );
    // cloth geometry
    this.clothGeometry = new THREE.ParametricGeometry( clothFunction, cloth.w, cloth.h );
    this.clothGeometry.dynamic = true;
    var uniforms = { texture:  { value: clothTexture } };
    // cloth mesh
    let object = new THREE.Mesh( this.clothGeometry, clothMaterial );
    object.position.set( 0, 0, 0 );
    object.castShadow = true;
    this.scene.add( object );
    object.customDepthMaterial = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide
    } );
    // this.sphere
    var ballGeo = new THREE.SphereBufferGeometry( ballSize, 20, 20 );
    var ballMaterial = new THREE.MeshPhongMaterial( { color: 0xaaaaaa } );
    this.sphere = new THREE.Mesh( ballGeo, ballMaterial );
    this.sphere.castShadow = true;
    this.sphere.receiveShadow = true;
    this.scene.add( this.sphere );
    // ground

    var groundTexture = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/images/grasslight-big.jpg')),
    })
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 25, 25 );
    groundTexture.anisotropy = 16;
    var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, map: groundTexture } );
    var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20000, 20000 ), groundMaterial );
    mesh.position.y = - 250;
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add( mesh );
    // poles
    var poleGeo = new THREE.BoxGeometry( 5, 375, 5 );
    var poleMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 100 } );
    var mesh = new THREE.Mesh( poleGeo, poleMat );
    mesh.position.x = - 125;
    mesh.position.y = - 62;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add( mesh );
    var mesh = new THREE.Mesh( poleGeo, poleMat );
    mesh.position.x = 125;
    mesh.position.y = - 62;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add( mesh );
    var mesh = new THREE.Mesh( new THREE.BoxGeometry( 255, 5, 5 ), poleMat );
    mesh.position.y = - 250 + ( 750 / 2 );
    mesh.position.x = 0;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add( mesh );
    var gg = new THREE.BoxGeometry( 10, 10, 10 );
    var mesh = new THREE.Mesh( gg, poleMat );
    mesh.position.y = - 250;
    mesh.position.x = 125;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add( mesh );
    var mesh = new THREE.Mesh( gg, poleMat );
    mesh.position.y = - 250;
    mesh.position.x = - 125;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add( mesh );
  }

  /// Start stubby

  onResize = ({width, height}) => {
    if (this.state.camera) {
      this.state.camera.aspect = width / height;
      this.state.camera.updateProjectionMatrix();
    }
    if (this.renderer) {
      this.renderer.setSize( width, height );
    }
  }

  animate = () => {
    var time = Date.now();
    windStrength = Math.cos( time / 7000 ) * 20 + 40;
    windForce.set( Math.sin( time / 2000 ), Math.cos( time / 3000 ), Math.sin( time / 1000 ) ).normalize().multiplyScalar( windStrength );
    simulate( time, this.clothGeometry, this.sphere );
    this._render();
  }
  _render = () => {
    // if (!this.clothGeometry) {
    //   return
    // }
    var p = cloth.particles;
    for ( var i = 0, il = p.length; i < il; i ++ ) {
      this.clothGeometry.vertices[ i ].copy( p[ i ].position );
    }
    this.clothGeometry.computeFaceNormals();
    this.clothGeometry.computeVertexNormals();
    this.clothGeometry.normalsNeedUpdate = true;
    this.clothGeometry.verticesNeedUpdate = true;
    this.sphere.position.copy( ballPosition );
    this.state.camera.lookAt( this.scene.position );
    this.renderer.render( this.scene, this.state.camera );
  }

}