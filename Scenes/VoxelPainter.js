//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//

import React from 'react';
import Expo from 'expo';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
import { Text, View, PanResponder } from 'react-native';
import { Button } from '../components';

export default class VoxelPainter extends React.Component {

  plane;
  cube;
  raycaster;
  rollOverMesh;
  rollOverMaterial;
  cubeGeo;
  cubeMaterial;
  objects = [];
  isDeleting = false;
  state = {
    camera: null
  }
  width = 0;
  height = 0;

  castPoint = ({ locationX: x, locationY: y }) => {
    let touch = new THREE.Vector2();
    // touch.set( x, y);
    touch.set(((x / this.width) * 2) - 1, - (y / this.height) * 2 + 1);

    return touch;
  }

  buildGestures = () => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    onPanResponderGrant: ((event, gestureState) => {
      let touch = this.castPoint(event.nativeEvent)
      this.raycaster.setFromCamera(touch, this.state.camera);
      var intersects = this.raycaster.intersectObjects(this.scene.children);

      if (intersects.length > 0) {

        var intersect = intersects[0];
        // delete cube
        if (this.isDeleting) {
          if (intersect.object != this.plane) {
            this.scene.remove(intersect.object);
            this.objects.splice(this.objects.indexOf(intersect.object), 1);
          }
          // create cube
        } else {
          var voxel = new THREE.Mesh(this.cubeGeo, this.cubeMaterial);
          voxel.position.copy(intersect.point).add(intersect.face.normal);
          voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
          this.scene.add(voxel);
          this.objects.push(voxel);
        }
        // render();
      }

    }),
    onPanResponderMove: ((event, gestureState) => {
      let touch = this.castPoint(event.nativeEvent)
      this.raycaster.setFromCamera(touch, this.state.camera);

      var intersects = this.raycaster.intersectObjects(this.objects);
      if (intersects.length > 0) {
        var intersect = intersects[0];
        this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      }

    }),
    onPanResponderRelease: ((event, gestureState) => {

    }),
    onPanResponderTerminate: ((event, gestureState) => {
    }),
  })

  componentWillMount() {
    this.panResponder = this.buildGestures();
  }


  button = ({ text, onPress }) => (
    <Button.Link style={{ backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4, paddingVertical: 12, margin: 4 }} onPress={onPress}>{text}
    </Button.Link>
  )

  renderScene = () => (
    <Expo.GLView
      {...this.panResponder.panHandlers}
      onLayout={({ nativeEvent: { layout: { width, height } } }) => this.onResize({ width, height })}
      style={{ flex: 1 }}
      onContextCreate={this._onGLContextCreate} />
  )

  render = () => (
    <View style={{ flex: 1 }}>
      {this.renderScene()}
    </View>
  );

  _onGLContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    this.scene = this.configureScene();
    const camera = this.configureCamera({ width, height });

    // roll-over helpers
    this.rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
    this.rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    this.rollOverMesh = new THREE.Mesh(this.rollOverGeo, this.rollOverMaterial);
    this.scene.add(this.rollOverMesh);
    // cubes
    this.cubeGeo = new THREE.BoxGeometry(50, 50, 50);

    var cubeTex = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/images/square-outline-textured.png')),
    });


    this.cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: cubeTex });
    // grid
    var size = 500, step = 50;
    var geometry = new THREE.Geometry();
    for (var i = - size; i <= size; i += step) {
      geometry.vertices.push(new THREE.Vector3(- size, 0, i));
      geometry.vertices.push(new THREE.Vector3(size, 0, i));
      geometry.vertices.push(new THREE.Vector3(i, 0, - size));
      geometry.vertices.push(new THREE.Vector3(i, 0, size));
    }
    var material = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true });
    var line = new THREE.LineSegments(geometry, material);
    this.scene.add(line);
    //
    this.raycaster = new THREE.Raycaster();

    var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    geometry.rotateX(- Math.PI / 2);
    this.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    this.scene.add(this.plane);
    this.objects.push(this.plane);
    // Lights
    var ambientLight = new THREE.AmbientLight(0x606060);
    this.scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    this.scene.add(directionalLight);


    // this.configureLights();
    // NOTE: How to create an `Expo.GLView`-compatible THREE renderer
    this.renderer = ExpoTHREE.createRenderer({ gl, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xf0f0f0);


    this.setState({ camera })
    let lastFrameTime;

    const render = () => {
      this._requestAnimationFrameID = requestAnimationFrame(render);

      const now = 0.001 * global.nativePerformanceNow();
      const dt = typeof lastFrameTime !== 'undefined'
        ? now - lastFrameTime
        : 0.16666;

      this.renderer.render(this.scene, camera);

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
    let camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(500, 800, 1300);
    camera.lookAt(new THREE.Vector3());
    return camera
  }

  onResize = ({ width, height }) => {
    this.width = width;
    this.height = height;
    if (this.state.camera) {
      this.state.camera.aspect = width / height;
      this.state.camera.updateProjectionMatrix();
    }
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }
}
