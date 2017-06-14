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

  async componentWillMount() {
    let json = await this.configureApp();

    this.panResponder = new PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (({nativeEvent}, gestureState) => this.player.onDocumentTouchStart(nativeEvent)),
      onPanResponderMove: (({nativeEvent}, gestureState) => this.player.onDocumentTouchMove(nativeEvent)),
      onPanResponderRelease: (({nativeEvent}, gestureState) => this.player.onDocumentTouchEnd(nativeEvent)),
      onPanResponderTerminate: (({nativeEvent}, gestureState) => this.player.onDocumentTouchEnd(nativeEvent)),
    })
    this.setState({isReady: json})

  }

  configureApp = async () => {

    //TODO: Make this load live
    // this.loader = new THREE.FileLoader();
    // let json = await Expo.Asset.fromModule(require('../assets/meta/app.json'))

    let json = require('../assets/meta/app.json');


    //TODO: implement location
    var location = {};
    if ( location.search === '?edit' ) {
      this.url  = `https://threejs.org/editor/#file=${location.href.split( '/' ).slice( 0, - 1 ).join( '/' )}/app.json`;
    }
    //TODO: implement resize
      // window.addEventListener( 'resize', function () {
      //   player.setSize( window.innerWidth, window.innerHeight );
      // } );

      return json;
  }

  state = {
    isReady: null
  }

  render = () =>{
    if (!this.state.isReady) {
      return null;
    }
    return (
      <View style={{flex: 1}}>
      <Expo.GLView
        {...this.panResponder.panHandlers}
        // onLayout={({nativeEvent:{layout:{width, height}}}) => this.onResize({width, height}) }
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}/>

      {
        this.url &&
        <Button.Link style={{position: 'absolute', bottom: 4, right: 4, width: 48, height: 24}}>{this.url}</Button.Link>
      }

    </View>
    );
  }

  _onGLContextCreate = async (gl) => {
    const {drawingBufferWidth: width, drawingBufferHeight: height} = gl;
    const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

    let devicePixelRatio = width / screenWidth;

    this.player = new APP();
    if (typeof this.state.isReady === 'string') {
      this.player.load( gl, JSON.parse( this.state.isReady ), devicePixelRatio);
    } else {
      this.player.load( gl, this.state.isReady, devicePixelRatio);
    }

    this.player.setSize( screenWidth, screenHeight );
    this.player.play();

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
