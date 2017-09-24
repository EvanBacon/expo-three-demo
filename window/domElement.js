
import { Dimensions } from 'react-native';
import EventEmitter from 'EventEmitter';

class DOMNode {
    constructor(nodeName) {
        this.nodeName = nodeName;
    }

    get ownerDocument() {
        return window.document;
    }

    appendChild(element) {
        // unimplemented
    }
}

class DOMElement extends DOMNode {
    style = {};
    emitter = new EventEmitter();
    constructor(tagName) {
        return super(tagName.toUpperCase());
    }

    get tagName() {
        return this.nodeName;
    }

    addEventListener(eventName, listener) {
        this.emitter.addListener(eventName, listener)
    }

    removeEventListener(eventName, listener) {
        this.emitter.removeListener(eventName, listener)
    }

    get clientWidth() {
        return this.innerWidth;
    }
    get clientHeight() {
        return this.innerHeight;
    }

    get innerWidth() {
        return window.innerWidth;
    }
    get innerHeight() {
        return window.innerHeight;
    }


    getContext(contextType) {
        // if (global.canvasContext) {
        //   return global.canvasContext;
        // }
        return {
            fillRect: (_ => { }),
            drawImage: (_ => { }),
            getImageData: (_ => { }),
            getContextAttributes: (_ => ({
                stencil: true
            })),
            getExtension: (_ => ({
                loseContext: (_ => {

                })
            })),
        }
    }
}

class DOMDocument extends DOMElement {
    body = new DOMElement('BODY');

    constructor() {
        super('#document');
    }

    createElement(tagName) {
        return new DOMElement(tagName);
    }

    createElementNS(tagName) {
        const canvas = this.createElement(tagName);
        canvas.getContext = () => ({
            fillRect: (_ => ({})),
            drawImage: (_ => ({})),
            getImageData: (_ => ({})),
            getContextAttributes: (_ => ({
                stencil: true
            })),
            getExtension: (_ => ({
                loseContext: (_ => ({

                }))
            })),
        })
        canvas.toDataURL = (_ => ({}))

        return canvas;
    }

    getElementById(id) {
        return new DOMElement('div');
    }
}

process.browser = true

window.emitter = window.emitter || new EventEmitter();
window.addEventListener = window.addEventListener || ((eventName, listener) => window.emitter.addListener(eventName, listener));
window.removeEventListener = window.removeEventListener || ((eventName, listener) => window.emitter.removeListener(eventName, listener));
window.document = new DOMDocument();
window.document.body = new DOMElement('body');
global.document = window.document;

global.performance = null;

require('./DOMParser.js');
global.HTMLCanvasElement = require('./HTMLCanvasElement');



import Expo from 'expo';

import { Image } from 'react-native';
import { RGBAFormat, RGBFormat } from 'three/src/constants';
import { ImageLoader } from 'three/src/loaders/ImageLoader';
import { Texture } from 'three/src/textures/Texture';
import { DefaultLoadingManager } from 'three/src/loaders/LoadingManager';

import ExpoTHREE from 'expo-three';

THREE.TextureLoader.prototype.load = function (url, onLoad, onProgress, onError) {

    var loader = new ImageLoader(this.manager);
    loader.setCrossOrigin(this.crossOrigin);
    loader.setPath(this.path);

    // console.warn("Tickle", url,this.crossOrigin,  onLoad, this.path);

    // const img = Image.prefetch(this.path + this.crossOrigin + url);
    // console.warn("img", img);

    // const _path = '../' + this.crossOrigin + url;
    // // this.path +
    //     const asset = require(_path);

    const texture = new THREE.Texture();


    texture.minFilter = THREE.LinearFilter; // Pass-through non-power-of-two

    (async () => {
        const asset = Expo.Asset.fromModule(require("../assets/models/stormtrooper/Stormtrooper_D.jpg"));
        if (!asset.localUri) {
            await asset.downloadAsync();
        }
        texture.image = {
            data: asset,
            width: asset.width,
            height: asset.height,
        };
        texture.needsUpdate = true;
        texture.isDataTexture = true; // Forces passing to `gl.texImage2D(...)` verbatim

        if (onLoad !== undefined) {
            onLoad(texture);
        }
    })();

    return texture
    // var texture = new Texture();
    // texture.image = loader.load(url, function () {

    //     // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
    //     var isJPEG = url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data\:image\/jpeg/) === 0;

    //     texture.format = isJPEG ? RGBFormat : RGBAFormat;
    //     texture.needsUpdate = true;

    //     if (onLoad !== undefined) {

    //         onLoad(texture);

    //     }

    // }, onProgress, onError);

    // return texture;

};
