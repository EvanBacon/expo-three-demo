import Expo from 'expo';
import React from 'react';
import { View } from 'react-native';
import ExpoTHREE from 'expo-three';

import ThreeView from '../ThreeView';

import Touches from '../window/Touches';

class App extends React.Component {
   
    render = () => (
        <ThreeView
            style={{ flex: 1 }}
            onContextCreate={this._onContextCreate}
            render={this._animate}
        />
    );

    _onContextCreate = async (gl) => {

        const { innerWidth: width, innerHeight: height } = window;

        // renderer

        this.renderer = ExpoTHREE.createRenderer({ gl });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000, 1.0);

        // scene

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 1, 1000);

        // camera

        this.camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
        this.camera.position.z = 400;
        this.camera.lookAt(new THREE.Vector3());

        // controls
        this.controls = new THREE.OrbitControls(this.camera);

        this._setupScene();
        // resize listener

        window.addEventListener('resize', this._onWindowResize, false);
    }

    _setupScene = () => {
        const { renderer, scene, camera, controls } = this;

        // post-processing
        this.composer = new THREE.EffectComposer(renderer);
        const renderPass = new THREE.RenderPass(scene, camera);
        const copyPass = new THREE.ShaderPass(THREE.CopyShader);
        this.composer.addPass(renderPass);

        let vh = 1.4, vl = 1.2;
        let colorCorrectionPass = new THREE.ShaderPass(THREE.ColorCorrectionShader);
        colorCorrectionPass.uniforms["powRGB"].value = new THREE.Vector3(vh, vh, vh);
        colorCorrectionPass.uniforms["mulRGB"].value = new THREE.Vector3(vl, vl, vl);
        this.composer.addPass(colorCorrectionPass);
        let vignettePass = new THREE.ShaderPass(THREE.VignetteShader);
        vignettePass.uniforms["darkness"].value = 1.0;
        this.composer.addPass(vignettePass);
        this.composer.addPass(copyPass);
        copyPass.renderToScreen = true;

        this.object = new THREE.Object3D();
        this.scene.add(this.object);
        const geometry = new THREE.SphereGeometry(1, 4, 4);
        for (var i = 0; i < 100; i++) {
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff * Math.random(), flatShading: true });
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
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        this.glitchPass = new THREE.GlitchPass();
        this.glitchPass.renderToScreen = true;
        this.composer.addPass(this.glitchPass);
        // this.glitchPass.goWild = true;


    }

    _onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    _animate = (delta) => {
        const { renderer, scene, camera } = this;

        this.object.rotation.x += 0.005;
        this.object.rotation.y += 0.01;
        this.composer.render();
    }
}

// Wrap Touches Event Listener
export default Touches(App);

