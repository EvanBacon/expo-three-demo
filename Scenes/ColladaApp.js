import Expo from 'expo';
import React from 'react';
import { View, Text } from 'react-native';
import ExpoTHREE from 'expo-three';
import ThreeView from '../ThreeView';

import Touches from '../window/Touches';

import AnyLoader from '../utils/AnyLoader';

class App extends React.Component {

    shouldComponentUpdate = () => false;

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
        this.renderer.setClearColor(0x339ce2);

        // scene
        this.scene = new THREE.Scene();
        // camera

        this.camera = new THREE.PerspectiveCamera(25, width / height, 1, 10000);
        this.camera.position.set(15, 10, - 15);
        this.camera.lookAt(new THREE.Vector3());

        this.controls = new THREE.OrbitControls(this.camera);
        // this.controls.target.set(0, 2, 0);
        this.controls.update();
        // custom scene

        await this.setupSceneAsync();

        // resize listener

        window.addEventListener('resize', this._onWindowResize, false);
    }

    setupSceneAsync = async () => {
        const { innerWidth: width, innerHeight: height } = window;
        // Initialize Three.JS

        this.scene.add(new THREE.GridHelper(10, 20));
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, - 1);
        this.scene.add(directionalLight);

        await this.setupColladaSceneAsync();
    }


    loadRawFileAsync = async (localUri) => {
        console.log("Load local file", localUri);
        try {
            const file = await Expo.FileSystem.readAsStringAsync(localUri);
            return file;
        } catch (error) {
            console.log("Error from loadRawFileAsync");
            console.error(error);
        }
    }


    /* 
           THREE.ColladaModel
           
           animations: any[];
           kinematics: any;
           scene: Scene;
           library: any;
    */
    loadColladaAsync = async (staticResource) => {
        //Load Asset
        const asset = Expo.Asset.fromModule(staticResource);
        if (!asset.localUri) {
            await asset.downloadAsync();
        }


        const loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;
        // loader.setCrossOrigin('assets/models/stormtrooper/');

        const file = await this.loadRawFileAsync(asset.localUri);
        // Cheever method (Dire Dire Ducks)
        const collada = loader.parse(file);

        // Alt Method: has onLoad function. Error signature may be different (less useful) than loading directly from FileSystem
        // const collada = await (new Promise((res, rej) => loader.load(asset.localUri, res, () => {}, rej)));

        return collada;
    }

    setupColladaSceneAsync = async () => {
        const collada = await this.loadColladaAsync(require('../assets/models/stormtrooper/stormtrooper.dae'));

        const {
            animations,
            kinematics,
            scene,
            library
        } = collada;

        /* 
            Build a control to manage the animations
            This breaks if the model doesn't have animations - this needs to be fixed as it's probably 80% of free models
        */
        this.mixer = new THREE.AnimationMixer(scene);

        /*
            play the first animation.
            return a reference for further control.
            A more expo-esque function signature would be playAnimationAsync();
        */
        // const action = this.mixer.clipAction(animations[0]).play();

        this.scene.add(scene);

        /*
            This will help visualize the animation
        */
        this.setupSkeletonHelperForScene(scene);
    }

    setupSkeletonHelperForScene = (scene) => {
        const helper = new THREE.SkeletonHelper(scene);
        helper.material.linewidth = 3;
        this.scene.add(helper);
    }

    _onWindowResize = () => {
        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // On Orientation Change, or split screen on android.
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // Update Renderer
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
    }

    _animate = (delta) => {

        this.controls.update();

        if (this.mixer !== undefined) {
            const animationMixer = this.mixer.update(delta); //returns THREE.AnimationMixer
        }

        this._render();
    }

    _render = () => {
        // Render Scene!
        this.renderer.render(this.scene, this.camera);
    }
}

// Wrap Touches Event Listener
export default Touches(App);