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
        <View style={{ flex: 1 }}>
            <ThreeView
                style={{ flex: 1 }}
                onContextCreate={this._onContextCreate}
                render={this._animate}
            />
            <Text style={{ color: 'white', textAlign: 'center', position: 'absolute', left: 0, right: 0, bottom: 8, backgroundColor: 'transparent' }}>Double Tap to change geometry
        </Text>
        </View>
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

        this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
        this.camera.position.z = 500;
        this.camera.lookAt(new THREE.Vector3());

        this.controls = new THREE.OrbitControls(this.camera);
        this.controls.enableDamping = true;
        // custom scene

        this._setupScene();

        // resize listener

        window.addEventListener('resize', this._onWindowResize, false);
    }

    _setupScene = () => {
        const { innerWidth: width, innerHeight: height } = window;
        // Initialize Three.JS

        const geoms = [
            new THREE.TorusKnotGeometry(),
            new THREE.BoxGeometry(200, 200, 200),
            new THREE.SphereGeometry(200, 20, 20)
        ];
        let index = 0;

        // Add lights.
        this.light1 = new THREE.PointLight(0xff0000);
        this.light1.addSphere();
        this.light1.position.set(250, 0, 0);
        this.scene.add(this.light1);

        this.light2 = new THREE.PointLight(0x00ff00);
        this.light2.addSphere();
        this.light2.position.set(0, 250, 0);
        this.scene.add(this.light2);

        const uniforms = THREE.UniformsUtils.merge(
            [THREE.UniformsLib['lights'], {
                diffuse: {
                    type: 'c',
                    value: new THREE.Color(0x0000ff)
                },
                steps: {
                    type: 'f',
                    value: 4
                },
                intensity: {
                    type: 'f',
                    value: 0.5,
                }
            }]
        )

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shaders.vertex,
            fragmentShader: shaders.fragment,
            lights: true
        });

        this.mesh = new THREE.Mesh(geoms[index], material);
        this.scene.add(this.mesh);


        // Add Touch Listener
        window.document.addEventListener('touchstart', (e) => {

            if (e.touches.length > 1) {
                index = (index + 1) % geoms.length;
                this.mesh.geometry = geoms[index];
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
    }

    _animate = (delta) => {

        const timer = Date.now() * 0.00050;
        this.light1.position.x = Math.cos(timer) * 250;
        this.light1.position.z = Math.sin(timer) * 250;
        this.light2.position.y = Math.cos(timer * 1.25) * 250;
        this.light2.position.z = Math.sin(timer * 1.25) * 250;
        this.mesh.rotation.x += 0.005;
        this.mesh.rotation.y += 0.01;

        this.controls.update();

        this._render();
    }

    _render = () => {
        // Render Scene!
        this.renderer.render(this.scene, this.camera);
    }
}

// Wrap Touches Event Listener
export default Touches(App);


// Define Shaders
const shaders = {
    vertex: `
    varying vec3 vPos;
    varying vec3 vNormal;
    void main() {
      vPos = (modelMatrix * vec4(position, 1.0 )).xyz;
      vNormal = normalMatrix * normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
    `,
    fragment: `
    uniform vec3 diffuse;
    uniform float steps;
    uniform float intensity;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform vec3 pointLightColor[1];
    uniform vec3 pointLightPosition[1];
    uniform float pointLightDistance[1];
    
    void main() {
      vec3 n = normalize(vNormal);
      float i = intensity;
      for(int l = 0; l < 1; l++) {
        vec3 lightDirection = normalize(vPos - pointLightPosition[l]);
        i += dot(vec3(-lightDirection),n);
      }
      i = ceil(i * steps)/steps;
      gl_FragColor = vec4(diffuse, 1.0) + vec4(i);
    }
    `
};



