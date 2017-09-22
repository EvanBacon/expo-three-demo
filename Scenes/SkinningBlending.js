//
// Copyright (c) 2017-present, by Evan Bacon. All Rights Reserved.
// @author Evan Bacon / https://github.com/EvanBacon
//


import React from 'react';
import Expo from 'expo';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';

import OrbitControls from 'expo-three-orbit-controls'

import { Text, View, Dimensions } from 'react-native';

import { Button } from '../components';

const model = require('../assets/meta/marine_anims_core.json');
export default class SkinningBlending extends React.Component {


	mesh;
	skeleton;
	mixer;
	crossFadeControls = [];
	idleAction;
	walkAction;
	runAction;
	idleWeight;
	walkWeight;
	runWeight;
	actions;
	settings;
	singleStepMode = false;
	sizeOfNextStep = 0;


	state = {
		camera: null
	}

	button = ({ text, onPress }) => (
		<Button.Link style={{ backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4, paddingVertical: 12, margin: 4 }} onPress={onPress}>{text}
		</Button.Link>
	)

	renderScene = () => (
		<OrbitControls
			maxPolarAngle={Math.PI * 0.5}
			minDistance={1000}
			maxDistance={7500}
			style={{ flex: 1 }}
			camera={this.state.camera}>
			<Expo.GLView
				// onLayout={({nativeEvent:{layout:{width, height}}}) => this.onResize({width, height}) }
				style={{ flex: 1 }}
				onContextCreate={this._onGLContextCreate}
			/>
		</OrbitControls>
	)

	renderInfo = () => (
		<View style={{ position: 'absolute', padding: 24, top: 20, left: 0, right: 0, justifyContent: 'space-around', }}>
			{/*<Text style={{textAlign: 'center', marginBottom: 8, backgroundColor: 'transparent'}}>
        Simple Cloth Simulation Verlet integration with relaxed constraints
      </Text>
      <View style={{justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>

        {this.button({text: "Wind", onPress: (_=> {
          wind = !wind
        })})}
        {this.button({text: "Ball", onPress: (_=> {
          this.sphere.visible = !this.sphere.visible;
        })})}
        {this.button({text: "Pins", onPress: (_=> {
          this.togglePins();
        })})}
      </View>*/}
		</View>
	)

	render = () => (
		<View style={{ flex: 1 }}>
			{this.renderScene()}
			{this.renderInfo()}
		</View>
	);

	componentWillUnmount() {
		if (this._requestAnimationFrameID) {
			cancelAnimationFrame(this._requestAnimationFrameID);
		}
	}


	modifyTimeScale = (speed) => this.mixer.timeScale = speed;

	deactivateAllActions = () => this.actions.forEach(action => action.stop());

	setWeight = (action, weight) => {
		action.enabled = true;
		action.setEffectiveTimeScale(1);
		action.setEffectiveWeight(weight);
	}

	activateAllActions = () => {
		this.setWeight(this.idleAction, this.settings['modify idle weight']);
		this.setWeight(this.walkAction, this.settings['modify walk weight']);
		this.setWeight(this.runAction, this.settings['modify run weight']);
		this.actions.forEach(action => {
			action.play();
		});
	}


	_onGLContextCreate = async (gl) => {
		const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
		const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

		this.scene = this.configureScene();
		// const camera = this.configureCamera({width, height});

		// this.configureLights();
		// NOTE: How to create an `Expo.GLView`-compatible THREE renderer
		this.renderer = ExpoTHREE.createRenderer({ gl, antialias: true });
		this.renderer.setSize(width, height);
		this.renderer.setClearColor(this.scene.fog.color);
		this.renderer.setPixelRatio(width / screenWidth);
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		this.renderer.shadowMap.enabled = true;





		let lastFrameTime;

		const render = () => {
			this._requestAnimationFrameID = requestAnimationFrame(render);

			const now = 0.001 * global.nativePerformanceNow();
			const dt = typeof lastFrameTime !== 'undefined'
				? now - lastFrameTime
				: 0.16666;


			this.idleWeight = this.idleAction.getEffectiveWeight();
			this.walkWeight = this.walkAction.getEffectiveWeight();
			this.runWeight = this.runAction.getEffectiveWeight();
			// Update the panel values if weights are modified from "outside" (by crossfadings)
			// updateWeightSliders();
			// Enable/disable crossfade controls according to current weight values
			// updateCrossFadeControls();
			// Get the time elapsed since the last frame, used for mixer update (if not in single step mode)
			// let mixerUpdateDelta = clock.getDelta();
			// If in single step mode, make one step and then do nothing (until the user clicks again)
			if (this.singleStepMode) {
				this.mixerUpdateDelta = this.sizeOfNextStep;
				this.sizeOfNextStep = 0;
			}
			// Update the animation mixer, the skeleton and the stats panel, and render this frame
			this.mixer.update(dt);
			this.skeleton.update();

			this.renderer.render(this.scene, camera)

			gl.endFrameEXP();
			lastFrameTime = now;
		}


		const loader = new THREE.ObjectLoader();
		// Load skinned mesh
		let loadedObject;
		try {
			loadedObject = loader.parse(model)
		} catch (error) {
			console.error(error);
		}


		loadedObject.traverse(child => {
			if (child instanceof THREE.SkinnedMesh) {
				mesh = child;
			}
		});
		if (mesh === undefined) {
			alert(`Unable to find a SkinnedMesh in this place:\n\n$\n\n`);
			return;
		}
		// Add mesh and skeleton helper to scene
		mesh.rotation.y = - 135 * Math.PI / 180;
		this.scene.add(mesh);
		this.skeleton = new THREE.SkeletonHelper(mesh);
		this.skeleton.visible = false;
		this.scene.add(this.skeleton);
		// Initialize camera and camera controls
		const radius = mesh.geometry.boundingSphere.radius;
		const aspect = screenWidth / screenHeight;
		camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
		camera.position.set(0.0, radius, radius * 3.5);
		this.setState({ camera })

		// Create the control panel
		// createPanel();
		// Initialize mixer and clip actions
		this.mixer = new THREE.AnimationMixer(mesh);
		this.idleAction = this.mixer.clipAction('idle');
		this.walkAction = this.mixer.clipAction('walk');
		this.runAction = this.mixer.clipAction('run');
		this.actions = [this.idleAction, this.walkAction, this.runAction];

		this.settings = {
			'show model': true,
			'show skeleton': false,
			'deactivate all': this.deactivateAllActions,
			'activate all': this.activateAllActions,
			'pause/continue': this.pauseContinue,
			'make single step': this.toSingleStepMode,
			'modify step size': 0.05,
			'from walk to idle'() { this.prepareCrossFade(this.walkAction, this.idleAction, 1.0) },
			'from idle to walk'() { this.prepareCrossFade(this.idleAction, this.walkAction, 0.5) },
			'from walk to run'() { this.prepareCrossFade(this.walkAction, this.runAction, 2.5) },
			'from run to walk'() { this.prepareCrossFade(this.runAction, this.walkAction, 5.0) },
			'use default duration': true,
			'set custom duration': 3.5,
			'modify idle weight': 0.0,
			'modify walk weight': 1.0,
			'modify run weight': 0.0,
			'modify time scale': 1.0
		};

		this.activateAllActions();
		// Listen on window resizing and start the render loop
		// window.addEventListener( 'resize', onWindowResize, false );
		// animate();
		render();

	}




	configureScene = () => {
		// scene
		let scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);
		return scene
	}

	configureCamera = ({ width, height }) => {
		// camera
		let camera = new THREE.PerspectiveCamera(30, width / height, 1, 10000);
		camera.position.x = 1000;
		camera.position.y = 50;
		camera.position.z = 1500;
		return camera
	}

	onResize = ({ width, height }) => {
		// if (this.state.camera) {
		//   this.state.camera.aspect = width / height;
		//   this.state.camera.updateProjectionMatrix();
		// }
		// if (this.renderer) {
		//   this.renderer.setSize( width, height );
		// }
	}

}

            // let scene;
            // let renderer;
            // let camera;
            // let controls;
            // let mesh;
            // let skeleton;
            // let mixer;
            // const crossFadeControls = [];
            // let idleAction;
            // let walkAction;
            // let runAction;
            // let idleWeight;
            // let walkWeight;
            // let runWeight;
            // let actions;
            // let settings;
            // const clock = new THREE.Clock();
            // let singleStepMode = false;
            // let sizeOfNextStep = 0;
            // const url = require('../assets/meta/marine_anims_core.json');
            // // Initialize scene, light and renderer
            // scene = new THREE.Scene();
            // scene.add( new THREE.AmbientLight( 0xffffff ) );
            // renderer = new THREE.WebGLRenderer( { antialias: true } );
            // renderer.setClearColor( 0x333333 );
            // renderer.setPixelRatio( window.devicePixelRatio );
            // renderer.setSize( window.innerWidth, window.innerHeight );
            // container.appendChild( renderer.domElement );


            // function createPanel() {
			// 	const panel = new dat.GUI( { width: 310 } );
			// 	const folder1 = panel.addFolder( 'Visibility' );
			// 	const folder2 = panel.addFolder( 'Activation/Deactivation' );
			// 	const folder3 = panel.addFolder( 'Pausing/Stepping' );
			// 	const folder4 = panel.addFolder( 'Crossfading' );
			// 	const folder5 = panel.addFolder( 'Blend Weights' );
			// 	const folder6 = panel.addFolder( 'General Speed' );
			// 	settings = {
			// 		'show model':            true,
			// 		'show skeleton':         false,
			// 		'deactivate all':        deactivateAllActions,
			// 		'activate all':          activateAllActions,
			// 		'pause/continue':        pauseContinue,
			// 		'make single step':      toSingleStepMode,
			// 		'modify step size':      0.05,
			// 		'from walk to idle'() { prepareCrossFade( walkAction, idleAction, 1.0 ) },
			// 		'from idle to walk'() { prepareCrossFade( idleAction, walkAction, 0.5 ) },
			// 		'from walk to run'() { prepareCrossFade( walkAction, runAction, 2.5 ) },
			// 		'from run to walk'() { prepareCrossFade( runAction, walkAction, 5.0 ) },
			// 		'use default duration':  true,
			// 		'set custom duration':   3.5,
			// 		'modify idle weight':    0.0,
			// 		'modify walk weight':    1.0,
			// 		'modify run weight':     0.0,
			// 		'modify time scale':     1.0
			// 	};
			// 	folder1.add( settings, 'show model' ).onChange( showModel );
			// 	folder1.add( settings, 'show skeleton' ).onChange( showSkeleton );
			// 	folder2.add( settings, 'deactivate all' );
			// 	folder2.add( settings, 'activate all' );
			// 	folder3.add( settings, 'pause/continue' );
			// 	folder3.add( settings, 'make single step' );
			// 	folder3.add( settings, 'modify step size', 0.01, 0.1, 0.001 );
			// 	crossFadeControls.push( folder4.add( settings, 'from walk to idle' ) );
			// 	crossFadeControls.push( folder4.add( settings, 'from idle to walk' ) );
			// 	crossFadeControls.push( folder4.add( settings, 'from walk to run' ) );
			// 	crossFadeControls.push( folder4.add( settings, 'from run to walk' ) );
			// 	folder4.add( settings, 'use default duration' );
			// 	folder4.add( settings, 'set custom duration', 0, 10, 0.01 );
			// 	folder5.add( settings, 'modify idle weight', 0.0, 1.0, 0.01 ).listen().onChange( weight => { setWeight( idleAction, weight ) } );
			// 	folder5.add( settings, 'modify walk weight', 0.0, 1.0, 0.01 ).listen().onChange( weight => { setWeight( walkAction, weight ) } );
			// 	folder5.add( settings, 'modify run weight', 0.0, 1.0, 0.01 ).listen().onChange( weight => { setWeight( runAction, weight ) } );
			// 	folder6.add( settings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );
			// 	folder1.open();
			// 	folder2.open();
			// 	folder3.open();
			// 	folder4.open();
			// 	folder5.open();
			// 	folder6.open();
			// 	crossFadeControls.forEach( control => {
			// 		control.classList1 = control.domElement.parentElement.parentElement.classList;
			// 		control.classList2 = control.domElement.previousElementSibling.classList;
			// 		control.setDisabled = () => {
			// 			control.classList1.add( 'no-pointer-events' );
			// 			control.classList2.add( 'control-disabled' );
			// 		};
			// 		control.setEnabled = () => {
			// 			control.classList1.remove( 'no-pointer-events' );
			// 			control.classList2.remove( 'control-disabled' );
			// 		};
			// 	} );
			// }
            // function showModel( visibility ) {
			// 	mesh.visible = visibility;
			// }
            // function showSkeleton( visibility ) {
			// 	skeleton.visible = visibility;
			// }
            // function modifyTimeScale( speed ) {
			// 	mixer.timeScale = speed;
			// }
            // function deactivateAllActions() {
			// 	actions.forEach( action => {
			// 		action.stop();
			// 	} );
			// }
            // function activateAllActions() {
			// 	setWeight( idleAction, settings[ 'modify idle weight' ] );
			// 	setWeight( walkAction, settings[ 'modify walk weight' ] );
			// 	setWeight( runAction, settings[ 'modify run weight' ] );
			// 	actions.forEach( action => {
			// 		action.play();
			// 	} );
			// }
            // function pauseContinue() {
			// 	if ( singleStepMode ) {
			// 		singleStepMode = false;
			// 		unPauseAllActions();
			// 	} else {
			// 		if ( idleAction.paused ) {
			// 			unPauseAllActions();
			// 		} else {
			// 			pauseAllActions();
			// 		}
			// 	}
			// }
            // function pauseAllActions() {
			// 	actions.forEach( action => {
			// 		action.paused = true;
			// 	} );
			// }
            // function unPauseAllActions() {
			// 	actions.forEach( action => {
			// 		action.paused = false;
			// 	} );
			// }
            // function toSingleStepMode() {
			// 	unPauseAllActions();
			// 	singleStepMode = true;
			// 	sizeOfNextStep = settings[ 'modify step size' ];
			// }
            // function prepareCrossFade( startAction, endAction, defaultDuration ) {
			// 	// Switch default / custom crossfade duration (according to the user's choice)
			// 	const duration = setCrossFadeDuration( defaultDuration );
			// 	// Make sure that we don't go on in singleStepMode, and that all actions are unpaused
			// 	singleStepMode = false;
			// 	unPauseAllActions();
			// 	// If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
			// 	// else wait until the current action has finished its current loop
			// 	if ( startAction === idleAction ) {
			// 		executeCrossFade( startAction, endAction, duration );
			// 	} else {
			// 		synchronizeCrossFade( startAction, endAction, duration );
			// 	}
			// }
            // function setCrossFadeDuration( defaultDuration ) {
			// 	// Switch default crossfade duration <-> custom crossfade duration
			// 	if ( settings[ 'use default duration' ] ) {
			// 		return defaultDuration;
			// 	} else {
			// 		return settings[ 'set custom duration' ];
			// 	}
			// }
            // function synchronizeCrossFade( startAction, endAction, duration ) {
			// 	mixer.addEventListener( 'loop', onLoopFinished );
			// 	function onLoopFinished( event ) {
			// 		if ( event.action === startAction ) {
			// 			mixer.removeEventListener( 'loop', onLoopFinished );
			// 			executeCrossFade( startAction, endAction, duration );
			// 		}
			// 	}
			// }
            // function executeCrossFade( startAction, endAction, duration ) {
			// 	// Not only the start action, but also the end action must get a weight of 1 before fading
			// 	// (concerning the start action this is already guaranteed in this place)
			// 	setWeight( endAction, 1 );
			// 	endAction.time = 0;
			// 	// Crossfade with warping - you can also try without warping by setting the third parameter to false
			// 	startAction.crossFadeTo( endAction, duration, true );
			// }
            // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
            // the start action's timeScale to ((start animation's duration) / (end animation's duration))
            // function setWeight( action, weight ) {
			// 	action.enabled = true;
			// 	action.setEffectiveTimeScale( 1 );
			// 	action.setEffectiveWeight( weight );
			// }
            // // Called by the render loop
            // function updateWeightSliders() {
			// 	settings[ 'modify idle weight' ] = idleWeight;
			// 	settings[ 'modify walk weight' ] = walkWeight;
			// 	settings[ 'modify run weight' ] = runWeight;
			// }
            // // Called by the render loop
            // function updateCrossFadeControls() {
			// 	crossFadeControls.forEach( control => {
			// 		control.setDisabled();
			// 	} );
			// 	if ( idleWeight === 1 && walkWeight === 0 && runWeight === 0 ) {
			// 		crossFadeControls[ 1 ].setEnabled();
			// 	}
			// 	if ( idleWeight === 0 && walkWeight === 1 && runWeight === 0 ) {
			// 		crossFadeControls[ 0 ].setEnabled();
			// 		crossFadeControls[ 2 ].setEnabled();
			// 	}
			// 	if ( idleWeight === 0 && walkWeight === 0 && runWeight === 1 ) {
			// 		crossFadeControls[ 3 ].setEnabled();
			// 	}
			// }
            // function onWindowResize() {
			// 	camera.aspect = window.innerWidth / window.innerHeight;
			// 	camera.updateProjectionMatrix();
			// 	renderer.setSize( window.innerWidth, window.innerHeight );
			// }
            // function animate() {
			// 	// Render loop
			// 	requestAnimationFrame( animate );
			// 	idleWeight = idleAction.getEffectiveWeight();
			// 	walkWeight = walkAction.getEffectiveWeight();
			// 	runWeight = runAction.getEffectiveWeight();
			// 	// Update the panel values if weights are modified from "outside" (by crossfadings)
			// 	updateWeightSliders();
			// 	// Enable/disable crossfade controls according to current weight values
			// 	updateCrossFadeControls();
			// 	// Get the time elapsed since the last frame, used for mixer update (if not in single step mode)
			// 	let mixerUpdateDelta = clock.getDelta();
			// 	// If in single step mode, make one step and then do nothing (until the user clicks again)
			// 	if ( singleStepMode ) {
			// 		mixerUpdateDelta = sizeOfNextStep;
			// 		sizeOfNextStep = 0;
			// 	}
			// 	// Update the animation mixer, the skeleton and the stats panel, and render this frame
			// 	mixer.update( mixerUpdateDelta );
			// 	skeleton.update();
			// 	renderer.render( scene, camera );
			// }