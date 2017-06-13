//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//



import React from 'react';
import Expo from 'expo';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';

import OrbitControls from 'expo-three-orbit-controls'

import {Text, View } from 'react-native';

import {Button} from '../components';

let {
  cloth,
  ballPosition,
  simulate,
  ballSize,
  clothFunction
} = require('../assets/components/Cloth');

export var wind = true;
export var windStrength = 2;
export var windForce = new THREE.Vector3( 0, 0, 0 );


var pins = [];
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
  static navigationOptions = {
    title: 'Cloth',
  }

  state = {
    camera: null
  }

  button = ({text, onPress}) => (
    <Button.Link style={{backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4, paddingVertical:12, margin: 4}} onPress={onPress}>{text}
    </Button.Link>
  )

  renderScene = () => (
    <OrbitControls
      maxPolarAngle={Math.PI * 0.5}
      minDistance={1000}
      maxDistance={7500}
      style={{flex: 1}}
      camera={this.state.camera}>
      <Expo.GLView
        // onLayout={({nativeEvent:{layout:{width, height}}}) => this.onResize({width, height}) }
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}
      />
    </OrbitControls>
  )

  renderInfo = () => (
    <View style={{position: 'absolute',padding: 24, top: 20, left: 0, right: 0, justifyContent: 'space-around',}}>
      <Text style={{textAlign: 'center', marginBottom: 8, backgroundColor: 'transparent'}}>
        Simple Cloth Simulation Verlet integration with relaxed constraints
      </Text>
      <View style={{justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>

        {this.button({text: "Wind", onPress: (_=> {
          wind = !wind
        })})}
        {this.button({text: "Ball", onPress: (_=> {
          this.sphere.visible = !this.sphere.visible;
        })})}
        {this.button({text: "Pins", onPress: (_=> {
          this.togglePins();
        })})}
      </View>
    </View>
  )

  render = () => (
    <View style={{flex: 1}}>
      {this.renderScene()}
      {this.renderInfo()}
    </View>
  );

  _onGLContextCreate = async (gl) => {
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

    const render = () => {
      requestAnimationFrame(render);
      var time = Date.now();
      windStrength = Math.cos( time / 7000 ) * 20 + 40;
      windForce.set( Math.sin( time / 2000 ), Math.cos( time / 3000 ), Math.sin( time / 1000 ) ).normalize().multiplyScalar( windStrength );
      simulate( time, this.clothGeometry, this.sphere, pins, wind, windForce );
      this.animate();

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
    this.scene.add( new THREE.AmbientLight( 0x666666 ) );

    let light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
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
  }

  clothTexture = async () => {
    // cloth material
    var clothTexture = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/images/circuit_pattern.png')),
    });

    clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
    clothTexture.anisotropy = 16;
    return clothTexture;
  }

  configureSphere = () => {
    var ballGeo = new THREE.SphereBufferGeometry( ballSize, 20, 20 );
    var ballMaterial = new THREE.MeshPhongMaterial( { color: 0xaaaaaa } );
    this.sphere = new THREE.Mesh( ballGeo, ballMaterial );
    this.sphere.castShadow = true;
    this.sphere.receiveShadow = true;
    this.scene.add( this.sphere );
  }

  configureCloth = async () => {

    const clothTexture = await this.clothTexture();
    var clothMaterial = new THREE.MeshPhongMaterial( {
      specular: 0x030303,
      map: clothTexture,
      side: THREE.DoubleSide,
      alphaTest: 0.5
    });
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

    this.configureSphere();
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
