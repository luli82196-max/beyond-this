import fs from 'node:fs'
import { GLTFLoader } from 'file:///D:/新的尝试/Beyond_This/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { REVISION } from 'file:///D:/新的尝试/Beyond_This/node_modules/three/build/three.module.js'
globalThis.ProgressEvent ??= class ProgressEvent { constructor(type, init={}) { this.type=type; Object.assign(this,init) } }
globalThis.self ??= globalThis
globalThis.createImageBitmap ??= async () => ({ width: 2048, height: 512, close() {} })
const file='D:/新的尝试/Beyond_This/docs/research/hero-tree-v0.3/BeyondTree_LOD0_v003.glb'
const data=fs.readFileSync(file)
const ab=data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)
const gltf=await new Promise((resolve,reject)=>new GLTFLoader().parse(ab,'',resolve,reject))
let leaf=null
gltf.scene.traverse(o=>{ if(o.isMesh && o.name.startsWith('Leaves')) leaf=o })
if(!leaf) throw new Error('Leaves mesh not found')
const m=leaf.material
const result={threeRevision:REVISION,loader:'GLTFLoader',leafObject:leaf.name,materialType:m.type,map:!!m.map,mapSize:m.map?.source?.data?[m.map.source.data.width,m.map.source.data.height]:null,vertexColors:m.vertexColors,transparent:m.transparent,alphaTest:m.alphaTest,side:m.side,uv:!!leaf.geometry.attributes.uv,colorAttribute:!!leaf.geometry.attributes.color,triangles:leaf.geometry.index?leaf.geometry.index.count/3:leaf.geometry.attributes.position.count/3,result:(m.isMeshStandardMaterial&&!!m.map&&!m.vertexColors&&!!leaf.geometry.attributes.uv&&!leaf.geometry.attributes.color)?'PASS':'FAIL'}
const out='D:/新的尝试/Beyond_This/docs/research/hero-tree-v0.3/threejs_color_pipeline_validation_v003.json'
fs.writeFileSync(out,JSON.stringify(result,null,2))
console.log(JSON.stringify(result))
