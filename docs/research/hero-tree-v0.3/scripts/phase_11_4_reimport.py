import bpy, json, os

ROOT=r"D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.3"
GLB=os.path.join(ROOT,"BeyondTree_LOD0_v003.glb")
OUT=os.path.join(ROOT,"hero-tree-test","glb-import")
RESULT=os.path.join(ROOT,"glb_reimport_validation_v003.json")
os.makedirs(OUT,exist_ok=True)
asset_names={'Trunk','Branch_Main','Branch_Secondary','Leaves','Junction_01','Junction_02','Junction_03','Junction_04','Junction_05','Wind_Data','Tree_Root'}
for o in bpy.data.objects:
    if o.name in asset_names: o.hide_render=True; o.hide_viewport=True
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=GLB)
imported=[o for o in bpy.data.objects if o not in before]
leaf=next(o for o in imported if o.type=='MESH' and o.name.startswith('Leaves'))
mat=leaf.data.materials[0]
tex_nodes=[n for n in mat.node_tree.nodes if n.bl_idname=='ShaderNodeTexImage']
uv=leaf.data.uv_layers.active
uvs=[tuple(x.uv) for x in uv.data]
validation={
 'imported_object_count':len(imported),'leaf_object':leaf.name,'leaf_vertices':len(leaf.data.vertices),'leaf_triangles':sum(len(p.vertices)-2 for p in leaf.data.polygons),
 'leaf_attributes':[a.name for a in leaf.data.attributes], 'has_color_attribute':any(a.data_type in {'BYTE_COLOR','FLOAT_COLOR'} for a in leaf.data.attributes),
 'has_uv':uv is not None,'uv_range':{'u':[min(x[0] for x in uvs),max(x[0] for x in uvs)],'v':[min(x[1] for x in uvs),max(x[1] for x in uvs)]},
 'material':mat.name,'image_textures':[{'node':n.name,'image':n.image.name if n.image else None,'size':list(n.image.size) if n.image else None} for n in tex_nodes],
 'result':'PASS' if uv and tex_nodes and not any(a.data_type in {'BYTE_COLOR','FLOAT_COLOR'} for a in leaf.data.attributes) else 'FAIL'
}
bpy.context.scene.render.engine='BLENDER_EEVEE'; bpy.context.scene.render.resolution_x=640; bpy.context.scene.render.resolution_y=640; bpy.context.scene.render.resolution_percentage=100
for cam in ['forest_human_eye','forest_canopy_lift','tree_entry_continuity','tree_returned_silhouette']:
    bpy.context.scene.camera=bpy.data.objects[cam]; bpy.context.scene.render.filepath=os.path.join(OUT,cam+'_glb.png'); bpy.ops.render.render(write_still=True)
with open(RESULT,'w',encoding='utf-8') as f: json.dump(validation,f,ensure_ascii=False,indent=2)
print('GLB_REIMPORT='+json.dumps(validation,ensure_ascii=False))
