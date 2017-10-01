import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';

const TWEEN = require('tween.js')
require('three/examples/js/shaders/FXAAShader');


const images = {
    trunk: require('../tree/bark.png'),
    leaves: require('../tree/leaves.png'),
    fire: require('../tree/fire2.png'),
}


function distFrom(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);
}

function midPoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2 };
}

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
    // note: texture passed by reference, will be updated by the update function.

    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet. 
    this.numberOfTiles = numTiles;
    // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
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
            const currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            const currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
            texture.offset.y = currentRow / this.tilesVertical;
        }
    };
}

function rotateAroundWorldAxis(matrix, axis, radians) {
    const rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(matrix);
    return rotWorldMatrix;
}

export default class Tree extends THREE.Object3D {
    ignite() {
        //mesh.remove(stack.pop());
        this.remove(this.children[Math.round(Math.random() * this.children.length) + 1]);
    }

    static random({ position, height, fireDensity }) {
        return new Tree({
            startPoint: position,
            height: height || 900,
            widthBot: 50,
            widthTop: 10,
            depth: 1,

            rotMat: new THREE.Matrix4(),
            noise: 10,
            branchNum: 10,
            branchStart: 2 / 3,
            leavesDensity: 2,
            branchSizeDecay: 1.5,
            branchDensityThreshold: 70,
            branchAngleThreshold: Math.PI / 6,
            branchAngleConst: Math.PI / 6,
            polyDetail: 10,
            // leavesMove: true,
            // percentLeavesMove: 0.5,
            fireDensity
        });
    }

    explosions = [];
    trees = [];
    constructor(data) {
        super();
        this._setup(data);
    }

    _setup = async (data) => {

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
        var trunkMat = new THREE.MeshBasicMaterial({
            map: await ExpoTHREE.createTextureAsync({
                asset: Expo.Asset.fromModule(images.trunk),
            }),
            // wrapS: THREE.RepeatWrapping,
            // wrapT: THREE.RepeatWrapping,
            // anisotropy: 16
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
        this.add(trunk);

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


                const tree = new Tree({
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
                })
                this.trees.push(tree);
                this.add(tree);
            }
        } else {
            for (var i = 0; i < data.leavesDensity; i++) {
                var distUpTree = Math.random() * data.height;
                var distUpTreeVec = dirVec.clone().multiplyScalar(distUpTree);
                var leaveSize = Math.random() * data.height / 1.5 + data.height * 2;
                var leavesGeo = new THREE.PlaneGeometry(leaveSize, leaveSize);

                ///img/leaves.png
                var leavesMat = new THREE.MeshBasicMaterial({
                    map: await ExpoTHREE.createTextureAsync({
                        asset: Expo.Asset.fromModule(images.leaves),
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
                this.add(leaves);
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
                        asset: Expo.Asset.fromModule(images.fire),
                    });
                    this.explosions.push(new TextureAnimator(explosionTexture, 4, 4, 16, 90)); // texture, #horiz, #vert, #total, duration.
                    var fireMat = new THREE.MeshBasicMaterial({
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
                    this.add(fire);
                }

            }
        }
    }

    update = (delta) => {
        for (var i = 0; i < this.explosions.length; i++) {
            this.explosions[i].update(1000 * delta);
        }

        for (let i = 0; i < this.trees.length; i++) {
            this.trees[i].update(delta);
        }
    }
}

