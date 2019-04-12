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
    let avg = 


    // let that = this
    // removing the children of the container
    this._reliefContainer.children.forEach(c => this._reliefContainer.remove(c))

    let geometry = new THREE.PlaneBufferGeometry(20*(width-1), 20*(height-1), width-1, height-1)

    console.log(geometry)
    let vertices = geometry.attributes.position.array
    let nbPixels = width * height

    for(let i=0; i<nbPixels; i++){
      vertices[i*3 + 2] = (data[i] - 32768) / 5
    }

    geometry.computeVertexNormals()


    let material = new THREE.MeshPhongMaterial( {
      color: 0x6666ff,
      side: THREE.DoubleSide,
      //wireframe: true
      shadowSide: THREE.DoubleSide,
    })


    let plane = new THREE.Mesh( geometry, material )
    this._reliefContainer.add( plane )

    plane.castShadow = true
    plane.receiveShadow = true

    console.log(plane)
    // plane.scale.x = 0.1
    // plane.scale.y = 0.1
    // plane.scale.z = 0.1
  }



}

export default ReliefBuilder
