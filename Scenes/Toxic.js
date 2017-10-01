import Expo from 'expo';
import React from 'react';
import { View, StyleSheet, TouchableHighlight, Text } from 'react-native';
import ExpoTHREE from 'expo-three';
import ThreeView from '../ThreeView';

const ToxicTypes = {
    buzzed: 'buzzed',
    drunk: 'drunk',
    high: 'high',
    wasted: 'wasted',
}
class App extends React.Component {
    selectedToxin = ToxicTypes.drunk;
    _renderSelector = () => (
        <View style={{ position: 'absolute', flexDirection: 'row', bottom: 8, left: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4, borderColor: 'white', borderWidth: StyleSheet.hairlineWidth }}>
            {
                Object.keys(ToxicTypes).map((toxin, index) => {
                    return (
                        <View key={index} style={{ flex: 1 }}>
                            <TouchableHighlight style={{ flex: 1, padding: 8, justifyContent: 'center', alignItems: 'center', }} onPress={_ => this._setToxin(toxin)}>
                                <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>{toxin}</Text>
                            </TouchableHighlight>
                        </View>
                    )
                })
            }
        </View>
    )
    _setToxin = toxin => {
        if (this.selectedToxin === toxin) { return }
        this.selectedToxin = toxin;
        this.toxicPasses.setPreset && this.toxicPasses.setPreset(toxin);

    }
    shouldComponentUpdate = () => false
    render = () => {
        return (
            <View style={{ flex: 1 }}>
                <ThreeView
                    style={{ flex: 1 }}
                    onContextCreate={this._onContextCreate}
                    render={this._animate}
                    enableAR={true}

                />

                {this._renderSelector()}
            </View>
        );
    }

    _onContextCreate = async (gl, arSession) => {

        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // renderer


        this.renderer = ExpoTHREE.createRenderer({ gl });
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000, 1.0);

        // scene
        this.scene = new THREE.Scene();
        this.scene.background = ExpoTHREE.createARBackgroundTexture(arSession, this.renderer);

        // camera

        this.camera = ExpoTHREE.createARCamera(arSession, width, height, 0.01, 1000);

        // custom scene

        this._setupScene();

        // resize listener

        window.addEventListener('resize', this._onWindowResize, false);
    }

    _setupScene = () => {
        const { innerWidth: width, innerHeight: height } = window;
        // Initialize Three.JS

        // composer
        this.composer = new THREE.EffectComposer(this.renderer);
        this.renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.copyPass = new THREE.ShaderPass(THREE.CopyShader);
        this.composer.addPass(this.renderPass);

        this.toxicPasses = new THREEx.ToxicPproc.Passes(this.selectedToxin);

        this.composer = new THREE.EffectComposer(this.renderer);
        var renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        // add toxicPasses to composer	
        this.toxicPasses.addPassesTo(this.composer)
        this.composer.passes[this.composer.passes.length - 1].renderToScreen = true;

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
        const now = Date.now();

        this.toxicPasses.update(delta, now);
        this.composer.render(delta);
    }
}

// Wrap Touches Event Listener
export default App;
