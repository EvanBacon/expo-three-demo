
import '../Three';

export default (urls, onLoad) => {
    // handle arguments polymorphism
    if (typeof (urls) === 'string') urls = [urls]

    // load per type
    if (urls[0].match(/\.stl$/i) && urls.length === 1) {
        this.loader = new THREE.STLLoader();
        this.loader.addEventListener('load', function (event) {
            var geometry = event.content
            var material = new THREE.MeshPhongMaterial();
            var object3d = new THREE.Mesh(geometry, material);
            onLoad(object3d)
        })
        this.loader.load(urls[0])
        return
    } else if (urls[0].match(/\.dae$/i) && urls.length === 1) {
        this.loader = new THREE.ColladaLoader();
        this.loader.options.convertUpAxis = true;
        this.loader.load(urls[0], function (collada) {
            // console.dir(arguments)
            var object3d = collada.scene
            onLoad(object3d)
        })
        return
    } else if (urls[0].match(/\.js$/i) && urls.length === 1) {
        this.loader = new THREE.JSONLoader();
        this.loader.load(urls[0], function (geometry, materials) {
            if (materials.length > 1) {
                var material = new THREE.MeshFaceMaterial(materials);
            } else {
                var material = materials[0]
            }
            var object3d = new THREE.Mesh(geometry, material)
            onLoad(object3d)
        })
        return
    } else if (urls[0].match(/\.obj$/i) && urls.length === 1) {
        this.loader = new THREE.OBJLoader();
        this.loader.load(urls[0], function (object3d) {
            onLoad(object3d)
        })
        return
    } else if (urls.length === 2 && urls[0].match(/\.mtl$/i) && urls[1].match(/\.obj$/i)) {
        this.loader = new THREE.OBJLoader();
        this.loader.load(urls[1], urls[0], function (object3d) {
            onLoad(object3d)
        })
        return
    } else if (urls.length === 2 && urls[0].match(/\.obj$/i) && urls[1].match(/\.mtl$/i)) {
        this.loader = new THREE.OBJLoader();
        this.loader.load(urls[0], urls[1], function (object3d) {
            onLoad(object3d)
        })
        return
    } else {
        console.error("Unrecognized File Type", urls[0])
    }

} 