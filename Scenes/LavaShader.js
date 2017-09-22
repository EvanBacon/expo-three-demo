//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import React from 'react';
import Expo from 'expo';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
import OrbitControls from 'expo-three-orbit-controls'

import { View } from 'react-native';


const fragmentShader = `

uniform float time;
uniform vec2 resolution;
uniform float fogDensity;
uniform vec3 fogColor;
uniform sampler2D texture1;
uniform sampler2D texture2;
varying vec2 vUv;
void main( void ) {
  vec2 position = -1.0 + 2.0 * vUv;
  vec4 noise = texture2D( texture1, vUv );
  vec2 T1 = vUv + vec2( 1.5, -1.5 ) * time  *0.02;
  vec2 T2 = vUv + vec2( -0.5, 2.0 ) * time * 0.01;
  T1.x += noise.x * 2.0;
  T1.y += noise.y * 2.0;
  T2.x -= noise.y * 0.2;
  T2.y += noise.z * 0.2;
  float p = texture2D( texture1, T1 * 2.0 ).a;
  vec4 color = texture2D( texture2, T2 * 2.0 );
  vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );
  if( temp.r > 1.0 ){ temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
  if( temp.g > 1.0 ){ temp.rb += temp.g - 1.0; }
  if( temp.b > 1.0 ){ temp.rg += temp.b - 1.0; }
  gl_FragColor = temp;
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  const float LOG2 = 1.442695;
  float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
  fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
  gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
}
`;
const vertexShader = `

uniform vec2 uvScale;
varying vec2 vUv;
void main()
{
  vUv = uvScale * uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}
`;

export default class LavaShader extends React.Component {

  setupLights = () => {
    /// General Lighting
    var ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);

    /// Directional Lighting
    var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);
  }


  state = {
    camera: null
  }

  render = () => (
    <OrbitControls
      style={{ flex: 1 }}
      camera={this.state.camera}>
      <Expo.GLView
        // onLayout={({nativeEvent:{layout:{width, height}}}) => this.onResize({width, height}) }
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}
      />
    </OrbitControls>
  );

  _onGLContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    gl.createFramebuffer = () => null;
    gl.createRenderbuffer = () => null;
    gl.bindRenderbuffer = (target, renderbuffer) => { };
    gl.renderbufferStorage = (target, internalFormat, width, height) => { };
    gl.framebufferTexture2D = (target, attachment, textarget, texture, level) => { };
    gl.framebufferRenderbuffer = (target, attachmebt, renderbuffertarget, renderbuffer) => { };

    this.scene = this.configureScene();
    const camera = this.configureCamera({ width, height });

    this.setupLights();

    var cloud = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/images/cloud.png')),
    });
    var lavatile = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/images/lavatile.jpg')),
    });

    var textureLoader = new THREE.TextureLoader();
    let uniforms = {
      fogDensity: { value: 0.45 },
      fogColor: { value: new THREE.Vector3(0, 0, 0) },
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
      uvScale: { value: new THREE.Vector2(3.0, 1.0) },
      texture1: { value: cloud },
      texture2: { value: lavatile }
    };
    uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT = THREE.RepeatWrapping;
    uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT = THREE.RepeatWrapping;
    var size = 0.65;
    let material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
    let mesh = new THREE.Mesh(new THREE.TorusGeometry(size, 0.3, 30, 30), material);
    mesh.rotation.x = 0.3;
    this.scene.add(mesh);
    //



    // this.configureLights();
    // NOTE: How to create an `Expo.GLView`-compatible THREE renderer
    this.renderer = ExpoTHREE.createRenderer({ gl, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000);
    this.renderer.autoClear = false;
    this.scene.add(camera)
    var renderModel = new THREE.RenderPass(this.scene, camera);
    var effectBloom = new THREE.BloomPass(1.25);
    var effectFilm = new THREE.FilmPass(0.35, 0.95, 2048, false);
    effectFilm.renderToScreen = true;
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(renderModel);
    this.composer.addPass(effectBloom);
    this.composer.addPass(effectFilm);


    this.setState({ camera })
    let lastFrameTime;

    const render = () => {
      this._requestAnimationFrameID = requestAnimationFrame(render);

      const now = 0.001 * global.nativePerformanceNow();
      const dt = typeof lastFrameTime !== 'undefined'
        ? now - lastFrameTime
        : 0.16666;


      var delta = 5 * dt;
      uniforms.time.value += 0.2 * delta;
      mesh.rotation.y += 0.0125 * delta;
      mesh.rotation.x += 0.05 * delta;
      this.renderer.clear();
      this.composer.render(0.01);

      // this.renderer.render( this.scene, camera );

      // NOTE: At the end of each frame, notify `Expo.GLView` with the below
      gl.endFrameEXP();
      lastFrameTime = now;
    }
    render();
  }

  componentWillUnmount() {
    if (this._requestAnimationFrameID) {
      cancelAnimationFrame(this._requestAnimationFrameID);
    }
  }

  configureScene = () => {
    // scene
    let scene = new THREE.Scene();
    return scene;
  }

  configureCamera = ({ width, height }) => {
    // camera
    let camera = new THREE.PerspectiveCamera(60, width / height, 1, 20000);
    camera.position.set(0, 100, 2000);
    return camera
  }

  onResize = ({ width, height }) => {
    if (this.state.camera) {
      this.state.camera.aspect = width / height;
      this.state.camera.updateProjectionMatrix();
    }
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }
}
