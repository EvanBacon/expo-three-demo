import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';

import ThreeView from '../ThreeView';

const TWEEN = require('tween.js')

require('three/examples/js/shaders/FXAAShader');

import '../Three';
import '../window/domElement';
import '../window/resize';
import Touches from '../window/Touches';


const dX = 5000;
const dZ = 5000;


const AR = false;

import Tree from '../assets/components/Tree';

class App extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        const { props, state } = this;
        return false;
    }

    render = () => (
        <ThreeView
            style={{ flex: 1 }}
            onContextCreate={this._onContextCreate}
            render={this._animate}
            enableAR={AR}
        />
    );

    _onContextCreate = async (gl, arSession) => {

        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // renderer
        this.renderer = ExpoTHREE.createRenderer({ gl, antialias: false });
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000, 1.0);

        // scene
        this.scene = new THREE.Scene();

        if (AR) {
            // AR Background Texture
            this.scene.background = ExpoTHREE.createARBackgroundTexture(arSession, this.renderer);

            /// AR Camera
            this.camera = ExpoTHREE.createARCamera(arSession, width, height, 0.01, 1000);
        } else {
            // Standard Background
            this.scene.background = new THREE.Color(0xcccccc);
            this.scene.fog = new THREE.FogExp2(0x222222, 0.0001);

            /// Standard Camera
            this.camera = new THREE.PerspectiveCamera(80, width / height, 50, 10000);

            this.camera.position.x = 2500;
            this.camera.position.y = 2500;
            this.camera.position.z = 2500;
            this.camera.lookAt(new THREE.Vector3());

            // controls    
            this.controls = new THREE.OrbitControls(this.camera);
            // this.controls.addEventListener('change', this._render); // remove when using animation loop
        }

        // resize listener
        window.addEventListener('resize', this._onWindowResize, false);

        // setup custom world
        await this._setupWorld();
    }

    _setupLights = () => {

        // Lights
        const light = new THREE.DirectionalLight(0xffffff, 1, 20000);
        light.position.set(0, 3000, 0);
        light.castShadow = true;
        // light.shadowMapBias = 0.001
        light.shadowMapWidth = light.shadowMapHeight = 512;
        light.shadowCameraVisible = true;
        light.shadowCameraLeft = light.shadowCameraBottom = -2000;
        light.shadowCameraRight = light.shadowCameraTop = 2000;
        // light.shadowMapDarkness = .6;
        this.scene.add(light);

    }

    _setupWorld = async () => {
        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        this._setupLights();

        const count = 3;
        const size = dX;
        const half = size * -0.5
        const interval = size / count;

        for (let x = 1; x < count + 1; x++) {
            for (let z = 1; z < count + 1; z++) {
                this.trees.push(Tree.random({
                    position: new THREE.Vector3(half + (interval * x), 0, half + (interval * z)),
                }));
            }
        }

        this.trees.map(tree => this.scene.add(tree));

        const renderModel = new THREE.RenderPass(this.scene, this.camera);
        const effectBloom = new THREE.BloomPass(1, 9, 1.0, 1024);
        const effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        this.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
        this.effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);
        effectCopy.renderToScreen = true;
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderModel);
        this.composer.addPass(this.effectFXAA);
        composer.addPass(effectBloom);
        this.composer.addPass(effectCopy);

        // this.scene.add(new THREE.GridHelper(4, 10));
    }
    trees = [];
    _onWindowResize = () => {
        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);

        this.effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);
        this.composer.reset();
    }

    _animate = (delta) => {
        this.trees.map(tree => tree.update(delta));

        this.renderer.clear();
        this.composer.render();
    }
}

// Wrap Touches Event Listener
const TouchesComponent = Touches(App);

export default TouchesComponent;