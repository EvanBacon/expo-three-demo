import Expo from 'expo';
import React from 'react';
import { View, Text } from 'react-native';
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

        const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

        // renderer

        this.renderer = ExpoTHREE.createRenderer({ gl });
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000);

        // scene
        this.scene = new THREE.Scene();
        // camera

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(100, 0, -100);
        this.camera.lookAt(new THREE.Vector3());

        // custom scene

        await this._setupScene();

        // resize listener

        window.addEventListener('resize', this._onWindowResize, false);
    }

    _setupScene = async () => {
        const { innerWidth: width, innerHeight: height } = window;
        // Initialize Three.JS

        const texture = await ExpoTHREE.createTextureAsync({
            asset: Expo.Asset.fromModule(require('../assets/images/particle.png')),
        });

        const flame = new Flame(texture);
        const scale = 100;
        flame.scale.set(scale, scale, scale);
        scene.add(flame);

        const speed = 0.002;

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
        // Update Shader
        const time = Date.now();
        if (flame) {
            flame.update(time * speed);
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


const shader = {
    defines: {
        ITERATIONS: "6", //20
        OCTIVES: "3"
    },
    uniforms: {
        flameTex: { type: "t", value: null },
        color: { type: "c", value: null },
        time: { type: "f", value: 0.0 },
        seed: { type: "f", value: 0.0 },
        invModelMatrix: { type: "m4", value: null },
        scale: { type: "v3", value: null },
        noiseScale: { type: "v4", value: new THREE.Vector4(1, 2, 1, 0.3) },
        magnitude: { type: "f", value: 1.3 },
        lacunarity: { type: "f", value: 2.0 },
        gain: { type: "f", value: 0.5 }
    },

    vertexShader: `
        varying vec3 vWorldPos;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        }
		`,

    fragmentShader: `
uniform vec3 color;
uniform float time;
uniform float seed;
uniform mat4 invModelMatrix;
uniform vec3 scale;
uniform vec4 noiseScale;
uniform float magnitude;
uniform float lacunarity;
uniform float gain;
uniform sampler2D flameTex;
varying vec3 vWorldPos;
vec3 mod289(vec3 x) {
return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
return mod289(((x * 34.0) + 1.0) * x);
}
vec4 taylorInvSqrt(vec4 r) {
return 1.79284291400159 - 0.85373472095314 * r;
}
float snoise(vec3 v) {
const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
vec3 i  = floor(v + dot(v, C.yyy));
vec3 x0 = v - i + dot(i, C.xxx);
vec3 g = step(x0.yzx, x0.xyz);
vec3 l = 1.0 - g;
vec3 i1 = min(g.xyz, l.zxy);
vec3 i2 = max(g.xyz, l.zxy);
vec3 x1 = x0 - i1 + C.xxx;
vec3 x2 = x0 - i2 + C.yyy;
vec3 x3 = x0 - D.yyy;
i = mod289(i); 
vec4 p = permute(permute(permute( 
i.z + vec4(0.0, i1.z, i2.z, 1.0))
+ i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
+ i.x + vec4(0.0, i1.x, i2.x, 1.0));
float n_ = 0.142857142857;
vec3  ns = n_ * D.wyz - D.xzx;
vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
vec4 x_ = floor(j * ns.z);
vec4 y_ = floor(j - 7.0 * x_);
vec4 x = x_ * ns.x + ns.yyyy;
vec4 y = y_ * ns.x + ns.yyyy;
vec4 h = 1.0 - abs(x) - abs(y);
vec4 b0 = vec4(x.xy, y.xy);
vec4 b1 = vec4(x.zw, y.zw);
vec4 s0 = floor(b0) * 2.0 + 1.0;
vec4 s1 = floor(b1) * 2.0 + 1.0;
vec4 sh = -step(h, vec4(0.0));
vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
vec3 p0 = vec3(a0.xy, h.x);
vec3 p1 = vec3(a0.zw, h.y);
vec3 p2 = vec3(a1.xy, h.z);
vec3 p3 = vec3(a1.zw, h.w);
vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
p0 *= norm.x;
p1 *= norm.y;
p2 *= norm.z;
p3 *= norm.w;
vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
m = m * m;
return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
float turbulence(vec3 p) {
float sum = 0.0;
float freq = 1.0;
float amp = 1.0;
for(int i = 0; i < OCTIVES; i++) {
sum += abs(snoise(p * freq)) * amp;
freq *= lacunarity;
amp *= gain;
}
return sum;
}
vec4 samplerFlame (vec3 p, vec4 scale) {
vec2 st = vec2(sqrt(dot(p.xz, p.xz)), p.y);
if(st.x <= 0.0 || st.x >= 1.0 || st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);
p.y -= (seed + time) * scale.w;
p *= scale.xyz;
st.y += sqrt(st.y) * magnitude * turbulence(p);
if(st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);
return texture2D(flameTex, st);
}
vec3 localize(vec3 p) {
return (invModelMatrix * vec4(p, 1.0)).xyz;
}
void main() {
vec3 rayPos = vWorldPos;
vec3 rayDir = normalize(rayPos - cameraPosition);
float rayLen = 0.0288 * length(scale.xyz);
vec4 col = vec4(0.0);
for(int i = 0; i < ITERATIONS; i++) {
rayPos += rayDir * rayLen;
vec3 lp = localize(rayPos);
lp.y += 0.5;
lp.xz *= 2.0;
col += samplerFlame(lp, noiseScale);
}
col.a = col.r;
gl_FragColor = col;
}
`
}
class Flame extends THREE.Mesh {

    constructor(flameTex, color) {
        const flameMaterial = new THREE.ShaderMaterial({
            defines: shader.defines,
            uniforms: THREE.UniformsUtils.clone(shader.uniforms),
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: false
        });

        flameTex.magFilter = flameTex.minFilter = THREE.LinearFilter;
        flameTex.wrapS = THREE.wrapT = THREE.ClampToEdgeWrapping;

        flameMaterial.uniforms.flameTex.value = flameTex;
        flameMaterial.uniforms.color.value = color || new THREE.Color(0xeeeeee);
        flameMaterial.uniforms.invModelMatrix.value = new THREE.Matrix4();
        flameMaterial.uniforms.scale.value = new THREE.Vector3(1, 1, 1);
        flameMaterial.uniforms.seed.value = Math.random() * 19.19;

        super(new THREE.BoxGeometry(1.0, 1.0, 1.0), flameMaterial);
    }

    update(time) {

        const invModelMatrix = this.material.uniforms.invModelMatrix.value;

        this.updateMatrix();
        invModelMatrix.getInverse(this.matrix);

        if (time !== undefined) {
            this.material.uniforms.time.value = time;
        }
        this.material.uniforms.invModelMatrix.value = invModelMatrix;
        this.material.uniforms.scale.value = this.scale;

    }
}
