import Expo from 'expo';
import React from 'react';
import { View, Text } from 'react-native';
import ExpoTHREE from 'expo-three';
import ThreeView from '../ThreeView';

import '../Three';
import '../window/domElement';
import '../window/resize';
import Touches from '../window/Touches';

THREE.PointLight.prototype.addSphere = function () {
    this.sphere = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), new THREE.MeshBasicMaterial({
        color: this.color
    }))
    this.add(this.sphere);
}
THREE.PointLight.prototype.changeColor = function (value) {
    this.color.setRGB(value[0] / 255, value[1] / 255, value[2] / 255);
    this.sphere.material.color.setRGB(value[0] / 255, value[1] / 255, value[2] / 255);
}

class App extends React.Component {

    render = () => (
        <ThreeView
            style={{ flex: 1 }}
            onContextCreate={this._onContextCreate}
            render={this._animate}
        />

    );

    _onContextCreate = async (gl) => {

        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // renderer

        this.renderer = ExpoTHREE.createRenderer({ gl });
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
        this.renderer.setFaceCulling(THREE.CullFaceNone);

        this.renderer.setClearColor(0x339ce2);
        // scene
        this.scene = new THREE.Scene();
        // camera
        this.scene.fog = new THREE.Fog(0x000000, 1, 1000);

        // camera
        this.camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
        this.camera.position.z = 400;
        this.camera.lookAt(new THREE.Vector3());

        this.controls = new THREE.OrbitControls(this.camera);
        // custom scene

        await this._setupScene();

        this.effect = new THREE.ParallaxBarrierEffect(this.renderer);
        this.effect.setSize(width, height);
        // resize listener

        window.addEventListener('resize', this._onWindowResize, false);
    }

    _setupScene = async () => {
        const { innerWidth: width, innerHeight: height } = window;
        // Initialize Three.JS

        const material = new THREE.MeshBasicMaterial({
            // NOTE: How to create an Expo-compatible THREE texture
            map: await ExpoTHREE.createTextureAsync({
                asset: Expo.Asset.fromModule(require('../assets/images/nik.png')),
            }),
        });


        this.object = new THREE.Object3D();
        this.scene.add(this.object);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        for (var i = 0; i < 100; i++) {
            //   const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random(), flatShading: true });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            mesh.position.multiplyScalar(Math.random() * 400);
            mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
            mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
            this.object.add(mesh);
        }
        this.scene.add(new THREE.AmbientLight(0x222222));
        this.light = new THREE.DirectionalLight(0xffffff);
        this.light.position.set(1, 1, 1);
        this.scene.add(this.light);
        // postprocessing


        this.render3D = true;
        // Add Touch Listener
        window.document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 2) {
                this.render3D = !this.render3D;
            }
        });

    }

    _onWindowResize = () => {
        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // On Orientation Change, or split screen on android.
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // Update Renderer
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);

        this.effect.setSize(width, height);
    }

    _animate = (delta) => {
        this._render();
    }

    _render = () => {
        // Render Scene!
        if (this.render3D) {
            this.effect.render(this.scene, this.camera);
        } else {
            this.renderer.render(this.scene, this.camera);
        }

    }
}

// Wrap Touches Event Listener
export default Touches(App);