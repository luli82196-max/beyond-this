import bpy, bmesh, json, math, os, shutil
from mathutils import Vector

ROOT = r"D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.4"
SRC = r"D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.3\BeyondTree_v003.blend"
BLEND = os.path.join(ROOT, "BeyondTree_v004.blend")
GLB = os.path.join(ROOT, "BeyondTree_LOD0_v004.glb")
REPORT = os.path.join(ROOT, "BeyondTree_asset_report_v004.json")
FOREST = os.path.join(ROOT, "forest_camera_test")
TREE = os.path.join(ROOT, "tree_camera_test")
CLOSE = os.path.join(ROOT, "tree_close_camera_test")
TEX = os.path.join(ROOT, "textures")
for p in [ROOT, FOREST, TREE, CLOSE, TEX, os.path.join(ROOT, 'scripts')]: os.makedirs(p, exist_ok=True)

# Keep texture payload identical to v003.
src_tex = r"D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.3\textures\leaves_palette_rgba_2048x512.png"
shutil.copy2(src_tex, os.path.join(TEX, os.path.basename(src_tex)))

bark_names=['Trunk','Branch_Main','Branch_Secondary','Junction_01','Junction_02','Junction_03','Junction_04','Junction_05']
objs=[bpy.data.objects[n] for n in bark_names]
for o in objs:
    bpy.context.view_layer.objects.active=o; o.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    o.select_set(False)
bark=objs[0]; bark.name='Bark_Fused_LOD0'; bark.data.name='Bark_Fused_LOD0_Mesh'

# Exact surface unions retain the authored branch silhouettes and remove interior
# overlap surfaces only where source volumes actually intersect.
boolean_failures=[]
for operand in objs[1:]:
    mod=bark.modifiers.new('Exact_Union_'+operand.name,'BOOLEAN'); mod.operation='UNION'; mod.solver='EXACT'; mod.object=operand
    bpy.context.view_layer.objects.active=bark
    try:
        bpy.ops.object.modifier_apply(modifier=mod.name)
        bpy.data.objects.remove(operand,do_unlink=True)
    except Exception as e:
        boolean_failures.append({'object':operand.name,'error':str(e)})

# Restrained pressure variation only on the lower trunk; no ancient-tree buttress language.
for v in bark.data.vertices:
    co=v.co
    if co.z < 5.0:
        radial=Vector((co.x,co.y,0.0))
        if radial.length > 1e-5:
            influence=max(0.0,1.0-abs(co.z-2.7)/3.0)
            delta=0.014*math.sin(co.z*2.35 + math.atan2(co.y,co.x)*3.0)*influence
            co += radial.normalized()*delta

# Smooth shading and a restrained angle-limited bevel soften mechanical radial facets
# without globally subdividing or turning the tree into a smooth CG tube.
for p in bark.data.polygons: p.use_smooth=True
bev=bark.modifiers.new('Silhouette_Micro_Bevel','BEVEL'); bev.width=.018; bev.segments=2; bev.limit_method='ANGLE'; bev.angle_limit=.48
bpy.context.view_layer.objects.active=bark; bpy.ops.object.modifier_apply(modifier=bev.name)
geo=bark.modifiers.new('Weighted_Normal_Response','WEIGHTED_NORMAL'); geo.keep_sharp=True; geo.weight=35
bpy.ops.object.modifier_apply(modifier=geo.name)

# New unified topology requires a fresh UV chart. Texture images/material channels are unchanged.
bpy.context.view_layer.objects.active=bark; bark.select_set(True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(58), island_margin=0.018)
bpy.ops.object.mode_set(mode='OBJECT')

# Add close stress camera, looking directly through both target junction elevations.
def look_at(obj, target): obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
cam_data=bpy.data.cameras.new('tree_close_camera_test_Camera'); cam_data.lens=62
cam=bpy.data.objects.new('tree_close_camera_test',cam_data); bpy.context.collection.objects.link(cam)
cam.location=(-2.55,2.15,4.35); look_at(cam,(-0.42,0.0,3.55))

bpy.context.scene.render.engine='BLENDER_EEVEE'
bpy.context.scene.render.resolution_x=720; bpy.context.scene.render.resolution_y=720; bpy.context.scene.render.resolution_percentage=100
bpy.context.scene.render.image_settings.file_format='PNG'; bpy.context.scene.render.film_transparent=False

renders={
  'forest_human_eye':os.path.join(FOREST,'forest_human_eye.png'),
  'forest_canopy_lift':os.path.join(FOREST,'forest_canopy_lift.png'),
  'tree_entry_continuity':os.path.join(TREE,'tree_entry_continuity.png'),
  'tree_returned_silhouette':os.path.join(TREE,'tree_returned_silhouette.png'),
  'tree_close_camera_test':os.path.join(CLOSE,'tree_close_camera_test.png')}
for n,p in renders.items():
    bpy.context.scene.camera=bpy.data.objects[n]; bpy.context.scene.render.filepath=p; bpy.ops.render.render(write_still=True)

for img in bpy.data.images:
    if img.source=='FILE':
        try: img.pack()
        except Exception: pass
bpy.ops.wm.save_as_mainfile(filepath=BLEND)

asset_names=['Bark_Fused_LOD0','Leaves','Wind_Data','Tree_Root']
bpy.ops.object.select_all(action='DESELECT')
for n in asset_names:
    if bpy.data.objects.get(n): bpy.data.objects[n].select_set(True)
bpy.context.view_layer.objects.active=bark
bpy.ops.export_scene.gltf(filepath=GLB,export_format='GLB',use_selection=True,export_apply=True,export_texcoords=True,export_normals=True,export_materials='EXPORT',export_image_format='AUTO')

def tris(o): return sum(len(p.vertices)-2 for p in o.data.polygons) if o and o.type=='MESH' else 0
bm=bmesh.new(); bm.from_mesh(bark.data)
boundary=sum(1 for e in bm.edges if len(e.link_faces)!=2)
components=0; unseen=set(bm.verts)
while unseen:
    components+=1; stack=[unseen.pop()]
    while stack:
        for e in stack.pop().link_edges:
            ov=e.other_vert(e.verts[0]) if e.verts[0] not in unseen else e.verts[0]
            if ov in unseen: unseen.remove(ov); stack.append(ov)
bm.free()
report={
 'phase':'11.5','source':'BeyondTree_v003.blend','method':'sequential exact boolean unions on authored bark volumes + restrained angle bevel + unified UV unwrap',
 'target_junctions':['trunk_to_primary','primary_to_secondary'],'true_shared_topology':boundary==0,
 'bark_boundary_or_nonmanifold_edges':boundary,'bark_connected_components':components,'boolean_failures':boolean_failures,
 'triangles_total':tris(bark)+tris(bpy.data.objects.get('Leaves')),
 'triangles_by_object':{'Bark_Fused_LOD0':tris(bark),'Leaves':tris(bpy.data.objects.get('Leaves')),'Wind_Data':tris(bpy.data.objects.get('Wind_Data'))},
 'materials':['MAT_Bark','MAT_Leaves'],'material_count':2,
 'texture_changes':'none; v003 bark 1K channels and 2048x512 leaf atlas retained; bark UV re-unwrapped for fused topology',
 'textures':['bark_basecolor_1k.png','bark_normal_1k.png','bark_roughness_1k.png','leaves_palette_rgba_2048x512.png'],
 'glb_size_bytes':os.path.getsize(GLB),'blend_size_bytes':os.path.getsize(BLEND),
 'mesh_changes':['intersecting bark volumes combined by exact surface union','two target forks share topology where their source volumes intersect','angle-limited micro-bevel reduces mechanical radial facets without subdivision','restrained lower-trunk pressure variation','new unified bark UV chart'],
 'render_files':{k:os.path.relpath(v,ROOT) for k,v in renders.items()},
 'limits':['no LOD1/LOD2','no KTX2','no production integration','no Seed/Room/Light/sound changes']}
with open(REPORT,'w',encoding='utf-8') as f: json.dump(report,f,ensure_ascii=False,indent=2)
print('PHASE115_REPORT='+json.dumps(report,ensure_ascii=False))
