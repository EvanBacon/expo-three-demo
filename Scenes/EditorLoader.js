//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
// @author mrdoob / http://mrdoob.com/
//

import React from 'react';
import Expo from 'expo';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';

import OrbitControls from 'expo-three-orbit-controls'

import {Text,Dimensions, View, PanResponder } from 'react-native';
import {Button} from '../components';
import APP from '../assets/components/Loader';

export default class EditorLoader extends React.Component {
  static navigationOptions = {
    title: 'Editor Loader',
  }

  componentWillMount() {
    this.configureApp();

    this.panResponder = new PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (({nativeEvent}, gestureState) => this.loader.onDocumentTouchStart(nativeEvent)),
      onPanResponderMove: (({nativeEvent}, gestureState) => this.loader.onDocumentTouchMove(nativeEvent)),
      onPanResponderRelease: (({nativeEvent}, gestureState) => this.loader.onDocumentTouchEnd(nativeEvent)),
      onPanResponderTerminate: (({nativeEvent}, gestureState) => this.loader.onDocumentTouchEnd(nativeEvent)),
    })

  }

  configureApp = async () => {
    this.loader = new THREE.FileLoader();
    console.warn("load App")
    let json = require('../assets/meta/app.json');
    // let json = await Expo.Asset.fromModule(require('../assets/meta/app.json'))
    console.warn("JSON", JSON.stringify(json));
    // this.loader.load( json, function ( text ) {
      console.warn("Is Ready")
      this.setState({isReady: json})
      // document.body.appendChild( player.dom );

      // window.addEventListener( 'resize', function () {
      //   player.setSize( window.innerWidth, window.innerHeight );
      // } );

      // if ( location.search === '?edit' ) {
      //   var button = document.createElement( 'a' );
      //   button.id = 'edit';
      //   button.href = 'https://threejs.org/editor/#file=' + location.href.split( '/' ).slice( 0, - 1 ).join( '/' ) + '/app.json';
      //   button.target = '_blank';
      //   button.textContent = 'EDIT';
      //   document.body.appendChild( button );
      // }
    // });

  }

  state = {
    isReady: null

  }

  render = () =>{
    if (!this.state.isReady) {
      return null;
    }
    return (
      <Expo.GLView
        // onLayout={({nativeEvent:{layout:{width, height}}}) => this.onResize({width, height}) }
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}/>
    );
  }
  _onGLContextCreate = async (gl) => {
    const {drawingBufferWidth: width, drawingBufferHeight: height} = gl;

    var player = new APP();
    if (typeof this.state.isReady === 'string') {
      player.load( gl, JSON.parse( this.state.isReady ) );
    } else {
      player.load( gl, this.state.isReady);
    }

    player.setSize( width, height );
    player.play();

    //
    // this.scene = this.configureScene();
    // const camera = this.configureCamera({width, height});
    //
    // this.configureLights();
    // // NOTE: How to create an `Expo.GLView`-compatible THREE renderer
    // this.renderer = ExpoTHREE.createRenderer({ gl, antialias: true });
    // this.renderer.setSize(width, height);
    // this.renderer.setClearColor( this.scene.fog.color );
    // this.renderer.gammaInput = true;
    // this.renderer.gammaOutput = true;
    // this.renderer.shadowMap.enabled = true;
    //
    // this.configurePins();
    //
    // this.setState({camera})
    // await this.configureCloth()
    //
    // const render = () => {
    //   requestAnimationFrame(render);
    //   var time = Date.now();
    //   windStrength = Math.cos( time / 7000 ) * 20 + 40;
    //   windForce.set( Math.sin( time / 2000 ), Math.cos( time / 3000 ), Math.sin( time / 1000 ) ).normalize().multiplyScalar( windStrength );
    //   simulate( time, this.clothGeometry, this.sphere, pins, wind, windForce );
    //   this.animate();
    //
    //   // NOTE: At the end of each frame, notify `Expo.GLView` with the below
    //   gl.endFrameEXP();
    // }
    // render();
  }

  onResize = ({width, height}) => {
    // if (this.state.camera) {
    //   this.state.camera.aspect = width / height;
    //   this.state.camera.updateProjectionMatrix();
    // }
    // if (this.renderer) {
    //   this.renderer.setSize( width, height );
    // }
  }
}
