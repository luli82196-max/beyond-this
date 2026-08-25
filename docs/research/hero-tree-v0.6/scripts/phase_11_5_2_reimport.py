import bpy,bmesh,json,os
ROOT=r'D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.6'; GLB=os.path.join(ROOT,'BeyondTree_LOD0_v006.glb'); OUT=os.path.join(ROOT,'glb_reimport_camera_test'); os.makedirs(OUT,exist_ok=True)
for o in bpy.data.objects:
    if o.name in {'Bark_CurveGrowth_LOD0','Leaves','Wind_Data','Tree_Root'}: o.hide_render=True; o.hide_viewport=True
before=set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=GLB); imported=[o for o in bpy.data.objects if o not in before]; meshes=[o for o in imported if o.type=='MESH']
bark=next(o for o in meshes if o.name.startswith('Bark_CurveGrowth_LOD0')); leaf=next(o for o in meshes if o.name.startswith('Leaves'))
def tris(o): return sum(len(f.vertices)-2 for f in o.data.polygons)
bm=bmesh.new(); bm.from_mesh(bark.data); bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-6); invalid=sum(1 for e in bm.edges if len(e.link_faces)!=2); bm.free(); mats=sorted({m.name for o in meshes for m in o.data.materials if m}); result='PASS' if invalid==0 and leaf.data.uv_layers.active and len(mats)==2 else 'FAIL'
val={'imported_object_count':len(imported),'mesh_objects':[o.name for o in meshes],'triangles':{'bark':tris(bark),'leaves':tris(leaf),'total':tris(bark)+tris(leaf)},'materials':mats,'bark_boundary_or_nonmanifold_edges':invalid,'leaf_has_uv':leaf.data.uv_layers.active is not None,'result':result}
bpy.context.scene.render.engine='BLENDER_EEVEE'; bpy.context.scene.render.resolution_x=720; bpy.context.scene.render.resolution_y=720; bpy.context.scene.render.resolution_percentage=100
for n in ['forest_human_eye','forest_canopy_lift','tree_entry_continuity','tree_returned_silhouette','tree_close_camera_test']:
    bpy.context.scene.camera=bpy.data.objects[n]; bpy.context.scene.render.filepath=os.path.join(OUT,n+'_glb.png'); bpy.ops.render.render(write_still=True)
with open(os.path.join(ROOT,'glb_reimport_validation_v006.json'),'w',encoding='utf-8') as f: json.dump(val,f,ensure_ascii=False,indent=2)
print('GLB_REIMPORT='+json.dumps(val,ensure_ascii=False))
