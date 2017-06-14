
export default class APP {
  loader = new THREE.ObjectLoader();

  camera;
  scene;
  renderer;
  controls;
  effect;
  cameraVR;
  isVR;
  events = {};

  constructor() {
    this.width = 500;
    this.height = 500;
  }

  load = ( gl, json ) => {
    this.gl = gl;
    this.isVR = json.project.vr;

    this.renderer = new THREE.WebGLRenderer( {
      canvas: {
     width: gl.drawingBufferWidth,
     height: gl.drawingBufferHeight,
     style: {},
     addEventListener: () => {},
        removeEventListener: () => {},
        clientHeight: gl.drawingBufferHeight,
      },
      context: gl,
      antialias: true
    } );
    this.renderer.setClearColor( 0x000000 );

    if ( json.project.gammaInput ) this.renderer.gammaInput = true;
    if ( json.project.gammaOutput ) this.renderer.gammaOutput = true;

    if ( json.project.shadows ) {
      this.renderer.shadowMap.enabled = true;
      // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.setScene( this.loader.parse( json.scene ) );
    this.setCamera( this.loader.parse( json.camera ) );

    this.events = {
      init: [],
      start: [],
      stop: [],
      keydown: [],
      keyup: [],
      mousedown: [],
      mouseup: [],
      mousemove: [],
      touchstart: [],
      touchend: [],
      touchmove: [],
      update: []
    };

    var scriptWrapParams = 'player,renderer,scene,camera';
    var scriptWrapResultObj = {};

    for ( var eventKey in this.events ) {

      scriptWrapParams += ',' + eventKey;
      scriptWrapResultObj[ eventKey ] = eventKey;

    }

    var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

    for ( var uuid in json.scripts ) {
      var object = this.scene.getObjectByProperty( 'uuid', uuid, true );
      if ( object === undefined ) {
        console.warn( 'APP.Player: Script without object.', uuid );
        continue;
      }
      var scripts = json.scripts[ uuid ];
      for ( var i = 0; i < scripts.length; i ++ ) {
        var script = scripts[ i ];
        var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, this.renderer, this.scene, this.camera );
        for ( var name in functions ) {
          if ( functions[ name ] === undefined ) continue;
          if ( this.events[ name ] === undefined ) {
            console.warn( 'APP.Player: Event type not supported (', name, ')' );
            continue;
          }
          this.events[ name ].push( functions[ name ].bind( object ) );
        }
      }
    }
    this.dispatch( this.events.init, arguments );
  }

  setCamera = ( value ) => {
    this.camera = value;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    if ( this.isVR === true ) {

      this.cameraVR = new THREE.PerspectiveCamera();
      this.cameraVR.projectionMatrix = this.camera.projectionMatrix;
      this.camera.add( this.cameraVR );

      this.controls = new THREE.VRControls( this.cameraVR );
      this.effect = new THREE.VREffect( this.renderer );

      if ( WEBVR.isAvailable() === true ) {
        ///TODO: Add WebVR
        ///this.dom.appendChild( WEBVR.getButton( effect ) );
      }
      if ( WEBVR.isLatestAvailable() === false ) {
        // this.dom.appendChild( WEBVR.getMessage() );
      }
    }
  }

  setScene = ( value ) => {
    this.scene = value;
  }

  setSize = ( width, height ) => {

    this.width = width;
    this.height = height;

    if ( this.camera ) {

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    }

    if ( this.renderer ) {
      this.renderer.setSize( this.width, this.height );
    }
  }

  dispatch = ( array, event ) => {
    for ( var i = 0, l = array.length; i < l; i ++ ) {
      array[ i ]( event );
    }
  }

  prevTime;
  request;

  animate = ( time ) => {

    this.request = requestAnimationFrame( this.animate );

    try {

      this.dispatch( this.events.update, { time: time, delta: time - this.prevTime } );

    } catch ( e ) {
      console.error( ( e.message || e ), ( e.stack || "" ) );
    }

    if ( this.isVR === true ) {

      this.camera.updateMatrixWorld();

      this.controls.update();
      this.effect.render( this.scene, this.cameraVR );
    } else {
      this.renderer.render( this.scene, this.camera );
    }
    this.gl.endFrameEXP();
    this.prevTime = time;
  }

  play = () => {
    this.dispatch( this.events.start, arguments );

    this.request = requestAnimationFrame( this.animate );
    this.prevTime = global.nativePerformanceNow();

  };

  stop = () => {
    this.dispatch( this.events.stop, arguments );

    cancelAnimationFrame( this.request );
  }

  dispose = () => {

    this.renderer.dispose();

    this.camera = undefined;
    this.scene = undefined;
    this.renderer = undefined;

  };

  //

  onDocumentKeyDown = ( event ) => {
    this.dispatch( this.events.keydown, event );
  }

  onDocumentKeyUp = ( event ) => {
    this.dispatch( this.events.keyup, event );
  }

  onDocumentMouseDown = ( event ) => {
    this.dispatch( this.events.mousedown, event );
  }

  onDocumentMouseUp = ( event ) => {
    this.dispatch( this.events.mouseup, event );
  }

  onDocumentMouseMove = ( event ) => {
    this.dispatch( this.events.mousemove, event );
  }

  onDocumentTouchStart = ( event ) => {
    this.dispatch( this.events.touchstart, event );
  }

  onDocumentTouchEnd = ( event ) => {
    this.dispatch( this.events.touchend, event );
  }

  onDocumentTouchMove = ( event ) => {
    this.dispatch( this.events.touchmove, event );
  }
};
