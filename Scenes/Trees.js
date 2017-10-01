import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';

import ThreeView from '../ThreeView';

const TWEEN = require('tween.js')
require('three/examples/js/renderers/Projector');
require('three/examples/js/shaders/FXAAShader');

import '../Three';
import '../window/domElement';
import '../window/resize';
import Touches from '../window/Touches';

const AR = false;
const dX = 5000;
const dZ = 5000;

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
        this.renderer = ExpoTHREE.createRenderer({ gl });
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


        // Projector
        this.projector = new THREE.Projector();

        // World
        var planeGeo = new THREE.PlaneGeometry(dX, dZ);
        var planeMat = new THREE.MeshPhongMaterial({
            color: 0xffffff * Math.random(),
            side: THREE.DoubleSide
        });
        plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = Math.PI / 2;
        plane.receiveShadow = true;
        this.scene.add(plane);

        var group1 = new THREE.Object3D();
        var group2 = new THREE.Object3D();
        var group3 = new THREE.Object3D();

        await createTree(group1, {
            startPoint: new THREE.Vector3(0, 0, 0),
            height: 2000,
            widthBot: 80,
            widthTop: 17,
            depth: 2,
            rotMat: new THREE.Matrix4(),
            noise: 10,
            branchNum: 15,
            branchStart: 1 / 3,
            leavesDensity: 3,
            branchSizeDecay: 1.5,
            branchDensityThreshold: 70,
            branchAngleThreshold: Math.PI / 6,
            branchAngleConst: Math.PI / 6,
            polyDetail: 20,
            leavesMove: true,
            percentLeavesMove: 0.5,
        });

        await createTree(group2, {
            startPoint: new THREE.Vector3(1000, 0, 500),
            height: 1000,
            widthBot: 50,
            widthTop: 10,
            depth: 2,
            rotMat: new THREE.Matrix4(),
            noise: 10,
            branchNum: 15,
            branchStart: 2 / 3,
            leavesDensity: 3,
            branchSizeDecay: 1.5,
            branchDensityThreshold: 70,
            branchAngleThreshold: Math.PI / 6,
            branchAngleConst: Math.PI / 6,
            polyDetail: 20,
            leavesMove: true,
            percentLeavesMove: 0.5,
            fireDensity: 3
        });

        await createTree(group3, {
            startPoint: new THREE.Vector3(-1000, 0, -250),
            height: 1000,
            widthBot: 50,
            widthTop: 10,
            depth: 2,
            rotMat: new THREE.Matrix4(),
            noise: 10,
            branchNum: 15,
            branchStart: 1,
            leavesDensity: 4,
            branchSizeDecay: 1.5,
            branchDensityThreshold: 70,
            branchAngleThreshold: Math.PI / 6,
            branchAngleConst: Math.PI / 6,
            polyDetail: 20,
            leavesMove: true,
            percentLeavesMove: 0.5
        });


        this.scene.add(group1);
        this.scene.add(group2);
        setInterval(() => { console.log('burning!!!!'); burnTreeBranch(group2) }, 50);
        this.scene.add(group3);



        var renderModel = new THREE.RenderPass(this.scene, this.camera);
        var effectBloom = new THREE.BloomPass(1, 9, 1.0, 1024);
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        this.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
        this.effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);
        effectCopy.renderToScreen = true;
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderModel);
        this.composer.addPass(this.effectFXAA);
        //composer.addPass( effectBloom );
        this.composer.addPass(effectCopy);

        this.scene.add(new THREE.GridHelper(4, 10));
    }

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

        this.renderer.clear();
        this.composer.render();

        for (var i = 0; i < explosions.length; i++) {
            explosions[i].update(1000 * delta);
        }

    }
}

// Wrap Touches Event Listener
const TouchesComponent = Touches(App);

export default TouchesComponent;



var explosions = [];

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
    // note: texture passed by reference, will be updated by the update function.

    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet. 
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

    // how long should each image be displayed?
    this.tileDisplayDuration = tileDispDuration;

    // how long has the current image been displayed?
    this.currentDisplayTime = 0;

    // which image is currently being displayed?
    this.currentTile = 0;

    this.update = function (milliSec) {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile == this.numberOfTiles)
                this.currentTile = 0;
            var currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
            texture.offset.y = currentRow / this.tilesVertical;
        }
    };
}





function burnTreeBranch(group) {
    //group.remove(stack.pop());
    //console.log(group.children[0].children[0])
    group.remove(group.children[Math.round(Math.random() * group.children.length) + 1]);
}

function rotateAroundWorldAxis(matrix, axis, radians) {
    const rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(matrix);
    return rotWorldMatrix;
  }

async function createTree(group, data) {

	/*
	startPoint, height, widthBot, widthTop, depth, rotMat, noise, branchNum
	*/

    var trunkGeo = new THREE.CylinderGeometry(data.widthTop, data.widthBot, data.height, data.polyDetail, data.polyDetail, false);
    for (var i = 0, ii = trunkGeo.vertices.length; i < ii; i++) {
        trunkGeo.vertices[i].x += (Math.random() * data.noise) - data.noise / 2;
        trunkGeo.vertices[i].y += (Math.random() * data.noise) - data.noise / 2;
        trunkGeo.vertices[i].z += (Math.random() * data.noise) - data.noise / 2;
    }

    //bark.jpg
    var trunkMat = new THREE.MeshPhongMaterial({
        map: await ExpoTHREE.createTextureAsync({
          asset: Expo.Asset.fromModule(require('../assets/tree/bark.png')),
        }),
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        anisotropy: 16
      })

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    //console.log(trunk)
    trunk.receiveShadow = true;
    trunk.castShadow = true;
    trunk.rotation.setFromRotationMatrix(data.rotMat);
    //trunk.rotation.applyMatrix4(rotMat);
    //console.log(trunk.rotation)
    var dirVec = new THREE.Vector3(0, 1, 0).applyMatrix4(data.rotMat);
    var halfHeight = dirVec.clone().multiplyScalar(data.height / 2);
    var trunkPos = new THREE.Vector3().addVectors(data.startPoint, halfHeight);
    trunk.position.copy(trunkPos);
    group.add(trunk);

    //console.log(trunk)
    if (data.depth > 0) {
        var usedVals = [];
        var usedAngles = [];
        for (var i = 0; i < data.branchNum; i++) {

            var trial = false;
            var distUpTree;
            var numLoops = 0;
            while (!trial) {
                var closeCheck = false;
                distUpTree = Math.random() * (data.height * data.branchStart);
                distUpTree += (1 - data.branchStart) * data.height;
                for (var j = 0; j < usedVals.length; j++) {
                    if (Math.abs(distUpTree - usedVals[j]) < data.branchDensityThreshold) {
                        closeCheck = true;
                    }
                }
                if (closeCheck && numLoops < 10) {
                    //do nothing and generate again
                } else {
                    trial = true;
                }
                numLoops++;
            }
            usedVals.push(distUpTree)

            trial = false;
            var rotAroundTree;
            numLoops = 0;
            while (!trial) {
                var closeCheck = false;
                rotAroundTree = Math.random() * Math.PI;
                for (var j = 0; j < usedAngles.length; j++) {
                    if (Math.abs(rotAroundTree - usedAngles[j]) < data.branchAngleThreshold) {
                        closeCheck = true;
                    }
                }
                if (closeCheck && numLoops < 10) {
                    //do nothing and generate again
                } else {
                    trial = true;
                }
                numLoops++;
            }
            usedAngles.push(rotAroundTree)

            var distUpTreeVec = dirVec.clone().normalize().multiplyScalar(distUpTree);
            //var rotAroundTree = Math.random() * Math.PI * 2;



            var newRotMat = data.rotMat.clone();
            newRotMat = rotateAroundWorldAxis(newRotMat, dirVec, rotAroundTree);// .rotateByAxis(dirVec, rotAroundTree);



            var rotVec = new THREE.Vector3().crossVectors(new THREE.Vector3(1, 0, 0), dirVec).normalize();

            var normVec = new THREE.Vector3().crossVectors(rotVec, dirVec).normalize();

            var rotTest;
            var randomNum = Math.random();
            if (randomNum < 0.5) {
                rotTest = -Math.PI / 4 + (Math.random() * data.branchAngleConst - data.branchAngleConst / 2);
            } else {
                rotTest = Math.PI / 4 - (Math.random() * data.branchAngleConst - data.branchAngleConst / 2);
            }


            newRotMat = rotateAroundWorldAxis(newRotMat, rotVec, rotTest); // rotateByAxis(rotVec, rotTest);

            var branchScalar = ((1 - distUpTree / data.height) + 0.5) / 1.5

            await createTree(group, {
                startPoint: new THREE.Vector3().addVectors(data.startPoint, distUpTreeVec),
                height: data.height / (data.branchSizeDecay + Math.random()) * branchScalar,
                widthBot: data.widthBot / (data.branchSizeDecay + Math.random()) * branchScalar,
                widthTop: data.widthTop / (data.branchSizeDecay + Math.random()) * branchScalar,
                depth: data.depth - 1,
                rotMat: newRotMat,
                noise: data.noise / (2 + Math.random()),
                branchNum: Math.floor(data.branchNum / (2 + Math.random())),
                branchStart: data.branchStart,
                leavesDensity: data.leavesDensity,
                branchSizeDecay: data.branchSizeDecay,
                branchDensityThreshold: data.branchDensityThreshold / 1.5,
                branchAngleThreshold: data.branchAngleThreshold,
                branchAngleConst: data.branchAngleConst,
                polyDetail: Math.ceil(data.polyDetail / 2),
                leavesMove: data.leavesMove,
                percentLeavesMove: data.percentLeavesMove,
                burning: data.burning,
                fireDensity: data.fireDensity
            });
        }
    } else {
        for (var i = 0; i < data.leavesDensity; i++) {
            var distUpTree = Math.random() * data.height;
            var distUpTreeVec = dirVec.clone().multiplyScalar(distUpTree);
            var leaveSize = Math.random() * data.height / 1.5 + data.height * 2;
            var leavesGeo = new THREE.PlaneGeometry(leaveSize, leaveSize);

              ///img/leaves.png
            var leavesMat = new THREE.MeshPhongMaterial({
                map: await ExpoTHREE.createTextureAsync({
                    asset: Expo.Asset.fromModule(require('../assets/tree/leaves.png')),
                  }),
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
                alphaTest: 0.5
                //blending: THREE.AdditiveBlending
            });
            var leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.rotation.x = Math.random() * Math.PI * 2;
            leaves.rotation.y = Math.random() * Math.PI * 2;
            leaves.rotation.z = Math.random() * Math.PI * 2;
            leaves.position.copy(new THREE.Vector3().addVectors(data.startPoint, distUpTreeVec));
            leaves.castShadow = true;

            // leaves.castShadow = true;
            // leaves.receiveShadow = true;
            group.add(leaves);
            if (data.leavesMove && Math.random() < data.leavesMove) {
                var moveAmount = Math.random() * Math.PI / 45;
                var timer = Math.random() * 5000;
                var tween = new TWEEN.Tween(leaves.rotation)
                    .to({ x: "+" + Math.random() * Math.PI / 45, y: "+" + Math.random() * Math.PI / 45, z: "+" + Math.random() * Math.PI / 45 }, 1000 + Math.random() * 2000)
                    .delay(Math.random() * 500)
                    //.easing(TWEEN.Easing.Quintic.InOut)
                    .start()

                var tweenBack = new TWEEN.Tween(leaves.rotation)
                    .to({ x: "-" + Math.random() * Math.PI / 45, y: "-" + Math.random() * Math.PI / 45, z: "-" + Math.random() * Math.PI / 45 }, 1000 + Math.random() * 2000)
                    .delay(Math.random() * 500)
                    //.easing(TWEEN.Easing.Quintic.InOut)
                    .start();

                tween.chain(tweenBack);
                tweenBack.chain(tween);

                setTimeout(function () {
                    tween.start();
                }, timer);
            }
        }
        if (data.fireDensity) {
            for (var i = 0; i < data.fireDensity; i = i + 1) {
                var distUpTree = data.height * 0.8 * (2 / 3) + Math.random() * 0.2 * (2 / 3);
                var distUpTreeVec = dirVec.clone().multiplyScalar(distUpTree);
                var fireSize = Math.random() * data.height / 1.5 + data.height * 2;
                var fireGeo = new THREE.PlaneGeometry(fireSize, fireSize);

                //fire2.png
                

                var explosionTexture = await ExpoTHREE.createTextureAsync({
                    asset: Expo.Asset.fromModule(require('../assets/tree/fire2.png')),
                  });
                explosions.push(new TextureAnimator(explosionTexture, 4, 4, 16, 90)); // texture, #horiz, #vert, #total, duration.
                var fireMat = new THREE.MeshPhongMaterial({
                    map: explosionTexture,
                    transparent: true,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    alphaTest: 0.5
                    //blending: THREE.AdditiveBlending
                });

                var fire = new THREE.Mesh(fireGeo, fireMat);
                fire.rotation.x = Math.random() * Math.PI * 2;
                fire.rotation.y = Math.random() * Math.PI * 2;
                fire.rotation.z = Math.random() * Math.PI * 2;
                fire.position.copy(new THREE.Vector3().addVectors(data.startPoint, distUpTreeVec));
                group.add(fire);
            }

        }
    }
}

function distFrom(p1, p2) {
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2) + Math.pow((p1.z - p2.z), 2));
}

function midPoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2 };
}
