import bpy, bmesh, json, math, os, shutil
from mathutils import Vector

ROOT=r'D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.6'
SRC=r'D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.5\BeyondTree_v005.blend'
BLEND=os.path.join(ROOT,'BeyondTree_v006.blend')
GLB=os.path.join(ROOT,'BeyondTree_LOD0_v006.glb')
REPORT=os.path.join(ROOT,'BeyondTree_asset_report_v006.json')
for p in [ROOT,os.path.join(ROOT,'scripts'),os.path.join(ROOT,'textures'),os.path.join(ROOT,'forest_camera_test'),os.path.join(ROOT,'tree_camera_test'),os.path.join(ROOT,'tree_close_camera_test')]: os.makedirs(p,exist_ok=True)
shutil.copy2(r'D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.5\textures\leaves_palette_rgba_2048x512.png',os.path.join(ROOT,'textures','leaves_palette_rgba_2048x512.png'))

# v005 is opened by Blender. Remove its voxel bark and inherited crown, retaining validated scene/material/camera/export contracts.
for n in ['Bark_Growth_LOD0','Leaves']:
    o=bpy.data.objects.get(n)
    if o: bpy.data.objects.remove(o,do_unlink=True)
barkmat=bpy.data.materials.get('MAT_Bark'); leafmat=bpy.data.materials.get('MAT_Leaves')

def bezier(a,b,c,d,n):
    return [a*((1-i/(n-1))**3)+b*(3*(1-i/(n-1))**2*(i/(n-1)))+c*(3*(1-i/(n-1))*(i/(n-1))**2)+d*((i/(n-1))**3) for i in range(n)]

def trunk_point(z):
    return Vector((.105*math.sin(z*.66)+.014*z, .072*math.sin(z*.91+1.0)-.010*z, z))

tp=[trunk_point(8.9*i/17) for i in range(18)]
tr=[.59*(1-i/17)**.74+.075+.018*math.sin(i*1.17)*(1-i/17) for i in range(18)]
paths=[{'kind':'trunk','pts':tp,'r':tr,'sides':16}]
specs=[(2.45,-2.72,3.50,.275),(3.02,-1.54,3.18,.255),(3.62,-.34,3.62,.240),(4.18,.82,3.24,.225),(4.72,2.24,3.32,.210),(5.28,-2.10,2.92,.194),(5.86,-.70,2.78,.178),(6.40,1.08,2.52,.162),(6.93,2.57,2.20,.146),(7.42,-1.78,1.88,.132)]
prim=[]
for idx,(z,ang,reach,r0) in enumerate(specs):
    a=trunk_point(z); h=Vector((math.cos(ang),math.sin(ang),0)); side=Vector((-math.sin(ang),math.cos(ang),0))
    end=a+h*reach+side*(.16*math.sin(idx*1.8))+Vector((0,0,.68+reach*.22+(idx%3)*.13))
    pts=bezier(a-h*r0*.72,a+h*reach*.25+Vector((0,0,.05)),a+h*reach*.72+side*(.12*(-1 if idx%2 else 1))+Vector((0,0,.25)),end,8)
    rs=[r0*(1-i/7)**.78+.030 for i in range(8)]
    paths.append({'kind':'primary','pts':pts,'r':rs,'sides':14}); prim.append((pts,rs,ang,idx))

terminal=[]
for pts,rs,ang,idx in prim:
    count=1 if idx in (8,9) else 2
    for j in range(count):
        k=4+j
        a=pts[k]; sign=-1 if (idx+j)%2 else 1; a2=ang+sign*(.50+.12*((idx+j)%3)); length=1.08+.20*((idx*2+j)%4); lift=.50+.15*((idx+j)%3)
        direction=Vector((math.cos(a2),math.sin(a2),0))
        end=a+direction*length+Vector((0,0,lift))
        q=bezier(a,pts[min(k+1,7)],a+direction*length*.66+Vector((0,0,lift*.42)),end,6)
        r0=max(.050,rs[k]*.63); qr=[r0*(1-i/5)**.82+.018 for i in range(6)]
        paths.append({'kind':'secondary','pts':q,'r':qr,'sides':12}); terminal.append((q[-1],(q[-1]-q[-2]).normalized(),idx,j))

def curve_branch(path,index):
    # Direct sweep of the sampled Bezier growth path. Explicit shared rings and caps avoid
    # Blender curve-conversion's detached fill components while retaining continuous tangents.
    pts=path['pts']; radii=path['r']; sides=path['sides']; verts=[]; faces=[]; prev_u=None
    for i,p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized()
        if prev_u is None:
            ref=Vector((0,0,1)) if abs(tangent.z)<.92 else Vector((1,0,0)); u=tangent.cross(ref).normalized()
        else:
            u=(prev_u-tangent*prev_u.dot(tangent)).normalized()
        v=tangent.cross(u).normalized(); prev_u=u
        for s in range(sides):
            th=2*math.pi*s/sides
            # restrained 3-lobe pressure breaks the perfect pipe highlight without faceting.
            rr=radii[i]*(1+.025*math.sin(3*th+i*.37))
            verts.append(tuple(p+(u*math.cos(th)+v*math.sin(th))*rr))
    for i in range(len(pts)-1):
        for s in range(sides):
            a=i*sides+s; b=i*sides+(s+1)%sides; c=(i+1)*sides+(s+1)%sides; d=(i+1)*sides+s; faces.append((a,b,c,d))
    faces.append(tuple(reversed(range(sides)))); off=(len(pts)-1)*sides; faces.append(tuple(off+s for s in range(sides)))
    me=bpy.data.meshes.new('Woody_%02d_Mesh'%index); me.from_pydata(verts,[],faces); me.update(); ob=bpy.data.objects.new('Woody_%02d_%s'%(index,path['kind']),me); bpy.context.collection.objects.link(ob)
    if barkmat: me.materials.append(barkmat)
    for f in me.polygons: f.use_smooth=True
    return ob

woody=[]
for i,p in enumerate(paths):
    bpy.ops.object.select_all(action='DESELECT'); woody.append(curve_branch(p,i))
bpy.ops.object.select_all(action='DESELECT')
for o in woody:o.select_set(True)
bpy.context.view_layer.objects.active=woody[0]; bpy.ops.object.join(); bark=bpy.context.object; bark.name='Bark_CurveGrowth_LOD0'; bark.data.name='Bark_CurveGrowth_LOD0_Mesh'
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.012); bpy.ops.object.mode_set(mode='OBJECT')

# Crown is regenerated from terminal supports. Each cluster is anisotropic, sparse inside, and biased outward/upward.
verts=[]; faces=[]
def add_leaf(center,normal,w,h,rot):
    n=normal.normalized(); ref=Vector((0,0,1)) if abs(n.z)<.9 else Vector((1,0,0)); u=n.cross(ref).normalized(); v=n.cross(u).normalized(); u2=u*math.cos(rot)+v*math.sin(rot); v2=-u*math.sin(rot)+v*math.cos(rot)
    base=len(verts); verts.extend([tuple(center-u2*w-v2*h),tuple(center+u2*w-v2*h),tuple(center+u2*w+v2*h),tuple(center-u2*w+v2*h)]); faces.append((base,base+1,base+2,base+3))

for ti,(tip,tangent,idx,j) in enumerate(terminal):
    outward=Vector((tip.x,tip.y,.35)).normalized()
    # 42 cards per supported terminal; hollow ellipsoidal distribution avoids a spherical crown.
    for k in range(42):
        a=2*math.pi*((k*.61803398875+ti*.173)%1); ring=.24+.62*((k%7)/6); zoff=-.18+.70*((k*5)%11)/10
        radial=Vector((math.cos(a),math.sin(a),0)); center=tip+radial*(.30+.48*ring)+outward*.18+Vector((0,0,zoff))
        normal=(outward*.48+radial*.36+Vector((0,0,.42))).normalized()
        add_leaf(center,normal,.105+.020*((k+ti)%3),.205+.025*((k*2+ti)%4),a*.37)
# Add smaller leaf groups at primary tips for crown continuity, without filling the dark interior.
for idx,(pts,rs,ang,_) in enumerate(prim):
    tip=pts[-1]; outward=Vector((math.cos(ang),math.sin(ang),.28)).normalized()
    for k in range(18):
        a=2*math.pi*(k/18+.11*idx); center=tip+Vector((math.cos(a)*(.22+.18*(k%3)),math.sin(a)*(.22+.18*(k%3)),.08+.34*((k*7)%13)/12))
        add_leaf(center,(outward+Vector((math.cos(a)*.3,math.sin(a)*.3,.45))).normalized(),.105,.205,a*.31)
me=bpy.data.meshes.new('Leaves_Mesh'); me.from_pydata(verts,[],faces); me.update(); leaves=bpy.data.objects.new('Leaves',me); bpy.context.collection.objects.link(leaves)
if leafmat: me.materials.append(leafmat)
uv=me.uv_layers.new(name='UVMap')
quad_uv=((0,0),(1,0),(1,1),(0,1))
for poly in me.polygons:
    for li,co in zip(poly.loop_indices,quad_uv): uv.data[li].uv=co

# Replace close camera with an unobstructed structural stress view.
old=bpy.data.objects.get('tree_close_camera_test')
if old: bpy.data.objects.remove(old,do_unlink=True)
def look_at(o,t): o.rotation_euler=(Vector(t)-o.location).to_track_quat('-Z','Y').to_euler()
cd=bpy.data.cameras.new('tree_close_camera_test_Camera'); cd.lens=58; cam=bpy.data.objects.new('tree_close_camera_test',cd); bpy.context.collection.objects.link(cam); cam.location=(-4.8,3.8,4.35); look_at(cam,(-.05,-.05,4.05))

bpy.context.scene.render.engine='BLENDER_EEVEE'; bpy.context.scene.render.resolution_x=720; bpy.context.scene.render.resolution_y=720; bpy.context.scene.render.resolution_percentage=100; bpy.context.scene.render.image_settings.file_format='PNG'
renders={'forest_human_eye':'forest_camera_test/forest_human_eye.png','forest_canopy_lift':'forest_camera_test/forest_canopy_lift.png','tree_entry_continuity':'tree_camera_test/tree_entry_continuity.png','tree_returned_silhouette':'tree_camera_test/tree_returned_silhouette.png','tree_close_camera_test':'tree_close_camera_test/tree_close_camera_test.png'}
for n,rel in renders.items(): bpy.context.scene.camera=bpy.data.objects[n]; bpy.context.scene.render.filepath=os.path.join(ROOT,rel); bpy.ops.render.render(write_still=True)
for img in bpy.data.images:
    if img.source=='FILE':
        try: img.pack()
        except: pass
bpy.ops.wm.save_as_mainfile(filepath=BLEND)

bpy.ops.object.select_all(action='DESELECT')
for n in ['Bark_CurveGrowth_LOD0','Leaves','Wind_Data','Tree_Root']:
    if bpy.data.objects.get(n): bpy.data.objects[n].select_set(True)
bpy.context.view_layer.objects.active=bark
bpy.ops.export_scene.gltf(filepath=GLB,export_format='GLB',use_selection=True,export_apply=True,export_texcoords=True,export_normals=True,export_materials='EXPORT',export_image_format='AUTO')

def tris(o): return sum(len(f.vertices)-2 for f in o.data.polygons) if o and o.type=='MESH' else 0
bm=bmesh.new(); bm.from_mesh(bark.data); invalid=sum(1 for e in bm.edges if len(e.link_faces)!=2); components=0; unseen=set(bm.verts)
while unseen:
    components+=1; stack=[unseen.pop()]
    while stack:
        v=stack.pop()
        for e in v.link_edges:
            ov=e.other_vert(v)
            if ov in unseen: unseen.remove(ov); stack.append(ov)
bm.free()
rep={'phase':'11.5.2','source':'BeyondTree_v005.blend','method':'continuous sampled-Bezier sweeps with shared cross-section rings and explicit closed caps; no voxel remesh, decimation, or Boolean repair; leaf cards regenerated at supported branch terminals','growth_paths':{'trunk':1,'primary':10,'secondary':len(terminal)},'triangles_total':tris(bark)+tris(leaves),'triangles_by_object':{'Bark_CurveGrowth_LOD0':tris(bark),'Leaves':tris(leaves),'Wind_Data':0},'leaf_cards':len(faces),'bark_boundary_or_nonmanifold_edges':invalid,'bark_connected_components':components,'component_strategy':'29 individually closed overlapping growth segments; junction overlap is retained instead of voxel fusion to preserve smooth curvature','materials':['MAT_Bark','MAT_Leaves'],'material_count':2,'texture_changes':'none; existing 1K bark channels and initial-autumn leaf palette retained','glb_size_bytes':os.path.getsize(GLB),'blend_size_bytes':os.path.getsize(BLEND),'render_files':renders,'limits':['research only','no production integration','no Three.js','no LOD/KTX2','no Seed/Room/Light/sound changes']}
with open(REPORT,'w',encoding='utf-8') as f: json.dump(rep,f,ensure_ascii=False,indent=2)
print('PHASE1152_REPORT='+json.dumps(rep,ensure_ascii=False))
