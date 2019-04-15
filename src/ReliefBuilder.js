import GeoTIFF from 'geotiff'
import * as THREE from 'three'
import ThreeContext from './ThreeContext'
import filepuller from 'filepuller'

class ReliefBuilder {
  constructor(fileInput, threeContext) {
    let that = this

    this._threeContext = threeContext

    // create the relief container
    this._reliefContainer = new THREE.Object3D()
    this._reliefContainer.castShadow = true
    this._reliefContainer.receiveShadow = true
    this._threeContext.getScene().add(this._reliefContainer)

    fileInput.addEventListener('change', function(e) {
      let files = e.target.files;

      if( !files.length ){
        return;
      }

      for(let i=0; i<files.length; i++){
        let reader = new FileReader()

        filepuller.read( files[i], false /*readAsText*/, function(error, fileData){
          if (error) {
            console.warn(err)
            return
          }

          let imageData = {}
          GeoTIFF.fromArrayBuffer(fileData)
          .then(function(tiff){
            return tiff.getImage()
          })
          .then(function(image){
            // console.log(image)
            // imageData.width = image.getWidth()
            // imageData.height = image.getHeight()
            return image.readRasters()
          })
          .then(function(raster){
            console.log(raster)
            that.createFromRaster(raster[0], raster.width, raster.height)
          })

        })
      }
    })
  }




  createFromRaster(data, width, height) {
    let min = +Infinity
    let max = -Infinity

    for(let i=0; i<data.length; i++){
      // SRTM FIX: replacing nodata with 0
      if(data[i] < 32768 ){
        data[i] = 32768
      }

      min = Math.min(min, data[i])
      max = Math.max(max, data[i])


    }


    // let that = this
    // removing the children of the container
    this._reliefContainer.children.forEach(c => this._reliefContainer.remove(c))

    let geometry = new THREE.PlaneBufferGeometry(width-1, height-1, width-1, height-1)

    console.log(geometry)
    let vertices = geometry.attributes.position.array
    let nbPixels = width * height

    for(let i=0; i<nbPixels; i++){
      // For SRTM20
      vertices[i*3 + 2] = (data[i] - min) / 100

      // for switzerland
      // vertices[i*3 + 2] = (data[i] - min) / 2
    }

    geometry.computeVertexNormals()

    let material = new THREE.MeshBasicMaterial( {
      color: 0x000000,//0xe0e0e0, //0xe2cf95,
      side: THREE.DoubleSide,
      shininess: 150,
      // map: texture,
      wireframe: true
    })

    let plane = new THREE.Mesh( geometry, material )
    this._reliefContainer.add( plane )
    plane.rotateX(-Math.PI/2)


    /*
    let that = this
    // instantiate a loader
    var loader = new THREE.TextureLoader();

    // load a resource
    loader.load(
      // resource URL
      '../data/pk10krel_2017_gobet2.png',

      // onLoad callback
      function ( texture ) {
        // in this example we create the material when the texture is loaded


         let material = new THREE.MeshPhongMaterial( {
           color: 0xe0e0e0, //0xe2cf95,
           side: THREE.DoubleSide,
           shininess: 150,
           // map: texture,
           wireframe: true
         })


         let plane = new THREE.Mesh( geometry, material )
         that._reliefContainer.add( plane )

         // plane.castShadow = true
         // plane.receiveShadow = true

         console.log(plane)

         plane.rotateX(-Math.PI/2)



      },

      // onProgress callback currently not supported
      undefined,

      // onError callback
      function ( err ) {
        console.error( 'An error happened.' );
      }
    );
    */

  }



}

export default ReliefBuilder
