import bpy, json, math, os, struct
from mathutils import Vector

SRC = r"D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.2\BeyondTree_v002.blend"
ROOT = r"D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.3"
TEX = os.path.join(ROOT, "textures")
TEST = os.path.join(ROOT, "hero-tree-test")
BLEND = os.path.join(ROOT, "BeyondTree_v003.blend")
GLB = os.path.join(ROOT, "BeyondTree_LOD0_v003.glb")
REPORT = os.path.join(ROOT, "BeyondTree_asset_report_v003.json")
os.makedirs(TEX, exist_ok=True); os.makedirs(TEST, exist_ok=True)

def make_palette_atlas():
    src = bpy.data.images.get("Leaves_RGBA_512")
    w, h = src.size
    pixels = list(src.pixels[:])
    palette = [(0.50,0.62,0.24),(0.67,0.66,0.25),(0.72,0.48,0.16),(0.38,0.48,0.18)]
    out = [0.0] * (w * 4 * h * 4)
    for p, tint in enumerate(palette):
        for y in range(h):
            for x in range(w):
                si=(y*w+x)*4; di=(y*(w*4)+p*w+x)*4
                # Preserve the authored leaf luminance/alpha while baking stable palette variation.
                lum=max(0.25, (pixels[si]+pixels[si+1]+pixels[si+2])/3.0)
                out[di:di+4]=[min(1,tint[0]*(.62+lum*.65)),min(1,tint[1]*(.62+lum*.65)),min(1,tint[2]*(.62+lum*.65)),pixels[si+3]]
    img=bpy.data.images.new("Leaves_Palette_RGBA_2048x512", width=w*4, height=h, alpha=True)
    img.pixels.foreach_set(out); img.filepath_raw=os.path.join(TEX,"leaves_palette_rgba_2048x512.png"); img.file_format='PNG'; img.save()
    return img

def rebuild_leaves(atlas):
    obj=bpy.data.objects['Leaves']; me=obj.data
    assert len(me.vertices)==7440 and len(me.polygons)==4960, "Unexpected v002 foliage topology"
    clusters=[]
    for ci in range(620):
        ids=range(ci*12,(ci+1)*12)
        c=sum((me.vertices[i].co for i in ids),Vector())/12
        r=math.hypot(c.x,c.y)
        # Central priority plus deterministic modulation produces internal air, not a spherical trim.
        score=r + .18*abs(c.z-5.65) + .13*math.sin(ci*2.399) + .08*math.cos(ci*.731)
        clusters.append((score,ci,c))
    removed={ci for _,ci,_ in sorted(clusters)[:124]}
    verts=[]; faces=[]; uvs=[]; palette_counts=[0,0,0,0]
    uv_layer=me.uv_layers.active.data
    for ci in range(620):
        if ci in removed: continue
        base=len(verts); first=ci*12
        verts.extend([me.vertices[first+j].co[:] for j in range(12)])
        band=(ci*7 + int(abs(me.vertices[first].co.z)*11)) % 4; palette_counts[band]+=1
        for pi in range(ci*8,(ci+1)*8):
            poly=me.polygons[pi]; faces.append([base+(vi-first) for vi in poly.vertices])
            face_uv=[]
            for li in poly.loop_indices:
                uv=uv_layer[li].uv
                face_uv.append(((uv.x + band)/4.0, uv.y))
            uvs.append(face_uv)
    new=bpy.data.meshes.new('Leaves_v003_Mesh'); new.from_pydata(verts,[],faces); new.update()
    layer=new.uv_layers.new(name='UVMap')
    for poly, face_uv in zip(new.polygons,uvs):
        for li,uv in zip(poly.loop_indices,face_uv): layer.data[li].uv=uv
    old=me; obj.data=new; bpy.data.meshes.remove(old)
    mat=bpy.data.materials['MAT_Leaves']; new.materials.append(mat); nodes=mat.node_tree.nodes; links=mat.node_tree.links
    nodes.clear(); out=nodes.new('ShaderNodeOutputMaterial'); bsdf=nodes.new('ShaderNodeBsdfPrincipled'); tex=nodes.new('ShaderNodeTexImage'); tex.image=atlas
    bsdf.inputs['Roughness'].default_value=.88
    links.new(tex.outputs['Color'],bsdf.inputs['Base Color']); links.new(tex.outputs['Alpha'],bsdf.inputs['Alpha']); links.new(bsdf.outputs['BSDF'],out.inputs['Surface'])
    mat.surface_render_method='DITHERED'; mat.use_transparency_overlap=False
    return sorted(removed), palette_counts

def organic_bridge(name, center, direction, radii, rings=6, seg=12):
    old=bpy.data.objects.get(name)
    if old: bpy.data.objects.remove(old,do_unlink=True)
    d=Vector(direction).normalized(); up=Vector((0,0,1))
    if abs(d.dot(up))>.92: up=Vector((0,1,0))
    u=d.cross(up).normalized(); v=d.cross(u).normalized(); verts=[]; faces=[]
    for ri in range(rings):
        t=ri/(rings-1); axial=(t-.5)*radii[2]
        ru=radii[0]*(1-.16*abs(2*t-1))*(1+.055*math.sin(t*7.1))
        rv=radii[1]*(1-.12*abs(2*t-1))
        for s in range(seg):
            a=2*math.pi*s/seg; wobble=1+.045*math.sin(a*3+ri*.8)
            verts.append(Vector(center)+d*axial+(u*math.cos(a)*ru+v*math.sin(a)*rv)*wobble)
    for r in range(rings-1):
        for s in range(seg):
            a=r*seg+s; b=r*seg+(s+1)%seg; c=(r+1)*seg+(s+1)%seg; e=(r+1)*seg+s
            faces.extend([(a,b,c),(a,c,e)])
    faces.append(tuple(range(seg-1,-1,-1))); faces.append(tuple((rings-1)*seg+s for s in range(seg)))
    mesh=bpy.data.meshes.new(name+'_Mesh'); mesh.from_pydata(verts,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj); obj.data.materials.append(bpy.data.materials['MAT_Bark'])
    for p in mesh.polygons: p.use_smooth=True
    return obj

atlas=make_palette_atlas(); removed,palette_counts=rebuild_leaves(atlas)
# Only the two requested high-visibility unions: trunk->primary and primary->secondary.
organic_bridge('Junction_01',(-.34,.015,3.08),(-.74,.03,.67),(.36,.31,1.02))
organic_bridge('Junction_03',(-.80,-.055,4.04),(-.73,-.03,.68),(.255,.22,.72))

# Pack all source and new textures so the .blend remains self-contained.
for img in bpy.data.images:
    if img.source=='FILE':
        try: img.pack()
        except Exception: pass
bpy.context.scene.render.engine='BLENDER_EEVEE'; bpy.context.scene.render.resolution_x=640; bpy.context.scene.render.resolution_y=640; bpy.context.scene.render.resolution_percentage=100
bpy.context.scene.render.image_settings.file_format='PNG'; bpy.context.scene.render.film_transparent=False
bpy.ops.wm.save_as_mainfile(filepath=BLEND)

for cam_name in ['forest_human_eye','forest_canopy_lift','tree_entry_continuity','tree_returned_silhouette']:
    bpy.context.scene.camera=bpy.data.objects[cam_name]; bpy.context.scene.render.filepath=os.path.join(TEST,cam_name+'.png'); bpy.ops.render.render(write_still=True)

# Export only the asset contract, excluding review ground, lights and cameras.
bpy.ops.object.select_all(action='DESELECT')
asset_names=['Trunk','Branch_Main','Branch_Secondary','Leaves','Junction_01','Junction_02','Junction_03','Junction_04','Junction_05','Wind_Data','Tree_Root']
for n in asset_names:
    if bpy.data.objects.get(n): bpy.data.objects[n].select_set(True)
bpy.context.view_layer.objects.active=bpy.data.objects['Trunk']
bpy.ops.export_scene.gltf(filepath=GLB, export_format='GLB', use_selection=True, export_apply=True, export_texcoords=True, export_normals=True, export_materials='EXPORT', export_image_format='AUTO')

def tri_count(names):
    return sum(sum(len(p.vertices)-2 for p in bpy.data.objects[n].data.polygons) for n in names if bpy.data.objects.get(n) and bpy.data.objects[n].type=='MESH')
report={
  'phase':'11.4','source':'BeyondTree_v002.blend','leaf_color_pipeline':'baked RGBA palette atlas + per-cluster UV band; no vertex color dependency',
  'leaf_clusters_v002':620,'leaf_clusters_v003':496,'removed_clusters':124,'central_reduction_percent':20.0,'palette_cluster_counts':palette_counts,
  'triangles_total':tri_count(asset_names),'triangles_by_object':{n:tri_count([n]) for n in asset_names if bpy.data.objects.get(n) and bpy.data.objects[n].type=='MESH'},
  'materials':['MAT_Bark','MAT_Leaves'],'textures':['bark_basecolor_1k.png','bark_normal_1k.png','bark_roughness_1k.png','leaves_palette_rgba_2048x512.png'],
  'glb_size_bytes':os.path.getsize(GLB),'blend_size_bytes':os.path.getsize(BLEND),
  'render_files':[cam+'.png' for cam in ['forest_human_eye','forest_canopy_lift','tree_entry_continuity','tree_returned_silhouette']],
  'threejs_contract':{'leaf_material_expected':'MeshStandardMaterial','map':True,'vertexColors':False,'alphaMode_expected':'BLEND','side_note':'Three.js runtime should set DoubleSide and alphaTest 0.5 for research integration test'},
  'removed_cluster_indices':removed
}
with open(REPORT,'w',encoding='utf-8') as f: json.dump(report,f,ensure_ascii=False,indent=2)
print('PHASE114_REPORT='+json.dumps(report,ensure_ascii=False))
