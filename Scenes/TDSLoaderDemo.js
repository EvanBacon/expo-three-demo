import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';
import Touches from '../window/Touches';
import ThreeView from '../ThreeView';

// require('../assets/components/AMFLoader.js');
require('three/examples/js/loaders/TDSLoader.js');
class Scene extends React.Component {
    static defaultProps = {
        onLoadingUpdated: (({ loaded, total }) => { }),
        onFinishedLoading: (() => { }),
    }

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
                enableAR={this.AR}
            />
        );
    }

    onContextCreateAsync = async (gl, arSession) => {

        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // renderer
        this.renderer = ExpoTHREE.createRenderer({ gl });
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000, 1.0);

        this.setupScene(arSession);

        // resize listener
        window.addEventListener('resize', this.onWindowResize, false);

        // setup custom world
        await this.setupWorldAsync();

        this.props.onFinishedLoading();
    }

    setupScene = (arSession) => {
        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // scene
        this.scene = new THREE.Scene();

        if (this.AR) {
            // AR Background Texture
            this.scene.background = ExpoTHREE.createARBackgroundTexture(arSession, this.renderer);

            /// AR Camera
            this.camera = ExpoTHREE.createARCamera(arSession, width, height, 0.01, 1000);
        } else {
            // Standard Background
            this.scene.background = new THREE.Color(0x999999);
            this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

            /// Standard Camera
            this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10);
            this.camera.position.set( 0, 0, 2 );

            // controls    
            this.controls = new THREE.OrbitControls(this.camera);
            // this.controls.target.set( 0, 1.2, 2 );
            
            var grid = new THREE.GridHelper( 50, 50, 0xffffff, 0x555555 );
            grid.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90 * ( Math.PI/180 ) );
            this.scene.add( grid );

            // this.controls.addEventListener('change', this._render); // remove when using animation loop
        }
    }

    setupLights = () => {
        // lights
        // let light = new THREE.DirectionalLight(0xffffff);
        // light.position.set(1, 1, 1);
        // this.scene.add(light);
        this.scene.add( new THREE.HemisphereLight() );
        
        const directionalLight = new THREE.DirectionalLight( 0xffeedd );
        directionalLight.position.set( 0, 0, 2 );
        this.scene.add( directionalLight );

       

        // light = new THREE.AmbientLight(0x222222);
        // this.scene.add(light);
    }

    setupWorldAsync = async () => {

        this.setupLights();


        const normalModelUri = require('../assets/models/3ds/portalgun/textures/normal.jpg');
        const normalAsset = Expo.Asset.fromModule(normalModelUri);
        if (!normalAsset.localUri) {
            await normalAsset.downloadAsync();
        }
        const normalDownloadUri = normalAsset.localUri;

        //3ds files dont store normal maps
        const textureLoader = new THREE.TextureLoader();
        const normal = textureLoader.load( normalDownloadUri );



        const modelUri = require('../assets/models/3ds/portalgun/portalgun.3ds');
        const asset = Expo.Asset.fromModule(modelUri);
        if (!asset.localUri) {
            await asset.downloadAsync();
        }
        const downloadUri = asset.localUri;
        const loader = new THREE.TDSLoader();
        loader.setPath( '../assets/models/3ds/portalgun/textures/' );  /// CANT LOAD FROM NAME 😭
        const object = await (new Promise((res, rej) => loader.load(downloadUri, res, () => {}, rej) ));

        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material.normalMap = normal;
            }
        });

        this.scene.add(object);
        const { x: width, y: height, z: depth } = new THREE.Box3().setFromObject(object).getSize();
        console.warn(width, height, depth);
        
    }

    onWindowResize = () => {
        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
    }

    animate = (delta) => {

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}
export default Touches(Scene);