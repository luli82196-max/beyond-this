import bpy, bmesh, json, os

ROOT=r"D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.4"
GLB=os.path.join(ROOT,"BeyondTree_LOD0_v004.glb")
OUT=os.path.join(ROOT,"glb_reimport_camera_test")
RESULT=os.path.join(ROOT,"glb_reimport_validation_v004.json")
os.makedirs(OUT,exist_ok=True)
for o in bpy.data.objects:
    if o.name in {'Bark_Fused_LOD0','Leaves','Wind_Data','Tree_Root'}:
        o.hide_render=True; o.hide_viewport=True
before=set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=GLB)
imported=[o for o in bpy.data.objects if o not in before]
meshes=[o for o in imported if o.type=='MESH']
leaf=next(o for o in meshes if o.name.startswith('Leaves'))
bark=next(o for o in meshes if o.name.startswith('Bark_Fused_LOD0'))
bm=bmesh.new(); bm.from_mesh(bark.data)
# glTF legitimately splits vertices at UV/normal seams; weld coincident positions on
# the validation copy before evaluating geometric watertightness.
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-6)
invalid=sum(1 for e in bm.edges if len(e.link_faces)!=2); bm.free()
def tris(o): return sum(len(p.vertices)-2 for p in o.data.polygons)
validation={
 'imported_object_count':len(imported),'mesh_objects':[o.name for o in meshes],
 'triangles':{'bark':tris(bark),'leaves':tris(leaf),'total':tris(bark)+tris(leaf)},
 'materials':sorted({m.name for o in meshes for m in o.data.materials if m}),
 'bark_boundary_or_nonmanifold_edges_after_seam_weld':invalid,'leaf_has_uv':leaf.data.uv_layers.active is not None,
 'result':'PASS' if invalid==0 and leaf.data.uv_layers.active and len({m.name for o in meshes for m in o.data.materials if m})==2 else 'FAIL'}
bpy.context.scene.render.engine='BLENDER_EEVEE'; bpy.context.scene.render.resolution_x=720; bpy.context.scene.render.resolution_y=720; bpy.context.scene.render.resolution_percentage=100
for cam in ['forest_human_eye','forest_canopy_lift','tree_entry_continuity','tree_returned_silhouette','tree_close_camera_test']:
    bpy.context.scene.camera=bpy.data.objects[cam]; bpy.context.scene.render.filepath=os.path.join(OUT,cam+'_glb.png'); bpy.ops.render.render(write_still=True)
with open(RESULT,'w',encoding='utf-8') as f: json.dump(validation,f,ensure_ascii=False,indent=2)
print('GLB_REIMPORT='+json.dumps(validation,ensure_ascii=False))
