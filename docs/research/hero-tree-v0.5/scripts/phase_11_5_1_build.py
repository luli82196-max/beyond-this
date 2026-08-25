import bpy, bmesh, json, math, os, shutil
from mathutils import Vector

ROOT=r'D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.5'
SRC=r'D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.3\BeyondTree_v003.blend'
BLEND=os.path.join(ROOT,'BeyondTree_v005.blend')
GLB=os.path.join(ROOT,'BeyondTree_LOD0_v005.glb')
REPORT=os.path.join(ROOT,'BeyondTree_asset_report_v005.json')
for p in [ROOT,os.path.join(ROOT,'scripts'),os.path.join(ROOT,'textures'),os.path.join(ROOT,'forest_camera_test'),os.path.join(ROOT,'tree_camera_test'),os.path.join(ROOT,'tree_close_camera_test')]: os.makedirs(p,exist_ok=True)
shutil.copy2(r'D:\新的尝试\Beyond_This\docs\research\hero-tree-v0.3\textures\leaves_palette_rgba_2048x512.png',os.path.join(ROOT,'textures','leaves_palette_rgba_2048x512.png'))

# Preserve the validated leaf/material/camera scene, replace only authored woody objects.
for n in ['Trunk','Branch_Main','Branch_Secondary','Junction_01','Junction_02','Junction_03','Junction_04','Junction_05']:
    o=bpy.data.objects.get(n)
    if o: bpy.data.objects.remove(o,do_unlink=True)
barkmat=bpy.data.materials.get('MAT_Bark')

def bezier(a,b,c,d,n):
    out=[]
    for i in range(n):
        t=i/(n-1); u=1-t
        out.append(a*(u**3)+b*(3*u*u*t)+c*(3*u*t*t)+d*(t**3))
    return out

def trunk_path():
    pts=[]
    for i in range(25):
        z=8.85*i/24
        pts.append(Vector((.10*math.sin(z*.72)+.018*z, .075*math.sin(z*.93+1.1)-.012*z, z)))
    return pts

def radius_trunk(i,n):
    t=i/(n-1)
    base=.56*(1-t)**.72+.085
    pressure=.028*math.sin(i*1.31)+.018*math.sin(i*.47+1.8)
    return max(.075,base+pressure*(1-t))

paths=[]
tp=trunk_path(); paths.append(('trunk',tp,[radius_trunk(i,len(tp)) for i in range(len(tp))]))

# Deliberately sparse primary scaffold: varied azimuth, load angle, height and reach.
specs=[
 (2.55,-2.72,3.45,.27),(3.12,-1.55,3.15,.25),(3.75,-.35,3.55,.235),
 (4.25,.82,3.18,.22),(4.78,2.28,3.25,.205),(5.35,-2.15,2.85,.19),
 (5.95,-.72,2.70,.175),(6.48,1.12,2.42,.16),(6.95,2.62,2.15,.145),(7.42,-1.82,1.78,.13)]
prim=[]
for idx,(z,ang,reach,r0) in enumerate(specs):
    a=min(tp,key=lambda p:abs(p.z-z)); horiz=Vector((math.cos(ang),math.sin(ang),0))
    end=a+horiz*reach+Vector((0,0,.72+reach*.22+(idx%3)*.16))
    p=bezier(a-horiz*r0*.55,a+horiz*(reach*.26)+Vector((0,0,.08)),a+horiz*(reach*.72)+Vector((0,0,.28)),end,9)
    rs=[r0*(1-i/(len(p)-1))**.72+.035 for i in range(len(p))]
    paths.append(('primary',p,rs)); prim.append((p,rs,ang,idx))

# Two unequal secondaries per most primaries; offsets avoid uniform Y forks.
for p,rs,ang,idx in prim:
    if idx in (8,9): count=1
    else: count=2
    for j in range(count):
        k=4+j*2 if len(p)>7 else 3
        a=p[k]; side=(-1 if (idx+j)%2 else 1)
        a2=ang+side*(.48+.14*((idx+j)%3))
        length=1.05+.22*((idx*2+j)%4)
        lift=.52+.17*((idx+j)%3)
        end=a+Vector((math.cos(a2)*length,math.sin(a2)*length,lift))
        q=bezier(a,p[min(k+1,len(p)-1)],a+Vector((math.cos(a2)*length*.65,math.sin(a2)*length*.65,lift*.45)),end,6)
        r0=max(.055,rs[k]*.66); qr=[r0*(1-i/(len(q)-1))**.78+.022 for i in range(len(q))]
        paths.append(('secondary',q,qr))

def make_tube(name,pts,radii,sides):
    verts=[]; faces=[]
    for i,p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized()
        ref=Vector((0,0,1)) if abs(tangent.z)<.92 else Vector((1,0,0))
        u=tangent.cross(ref).normalized(); v=tangent.cross(u).normalized()
        phase=.17*math.sin(i*1.7)
        for s in range(sides):
            th=2*math.pi*s/sides+phase
            irregular=1+.055*math.sin(3*th+i*.71)+.025*math.sin(5*th-i*.33)
            verts.append(tuple(p+(u*math.cos(th)+v*math.sin(th))*radii[i]*irregular))
    for i in range(len(pts)-1):
        for s in range(sides):
            a=i*sides+s; b=i*sides+(s+1)%sides; c=(i+1)*sides+(s+1)%sides; d=(i+1)*sides+s
            faces.append((a,b,c,d))
    faces.append(tuple(reversed(range(sides))))
    off=(len(pts)-1)*sides; faces.append(tuple(off+s for s in range(sides)))
    me=bpy.data.meshes.new(name+'_Mesh'); me.from_pydata(verts,[],faces); me.update()
    ob=bpy.data.objects.new(name,me); bpy.context.collection.objects.link(ob)
    if barkmat: me.materials.append(barkmat)
    return ob

tubes=[]
for i,(kind,p,r) in enumerate(paths): tubes.append(make_tube('Growth_%02d_%s'%(i,kind),p,r,12 if kind=='trunk' else (10 if kind=='primary' else 8)))

# A single controlled voxel skin is used once on the sparse connected scaffold.
# All branch starts are embedded into parent volumes, avoiding disconnected fine-fragment failure.
bpy.ops.object.select_all(action='DESELECT')
for o in tubes:o.select_set(True)
bpy.context.view_layer.objects.active=tubes[0]; bpy.ops.object.join(); bark=bpy.context.object; bark.name='Bark_Growth_LOD0'; bark.data.name='Bark_Growth_LOD0_Mesh'
bark.data.remesh_voxel_size=.055; bark.data.remesh_voxel_adaptivity=.68
bpy.context.view_layer.objects.active=bark; bpy.ops.object.voxel_remesh()
for f in bark.data.polygons:f.use_smooth=True
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.uv.smart_project(angle_limit=math.radians(62),island_margin=.015); bpy.ops.object.mode_set(mode='OBJECT')

# Reuse v004 close-camera contract exactly.
def look_at(o,t):o.rotation_euler=(Vector(t)-o.location).to_track_quat('-Z','Y').to_euler()
cd=bpy.data.cameras.new('tree_close_camera_test_Camera'); cd.lens=62
cam=bpy.data.objects.new('tree_close_camera_test',cd); bpy.context.collection.objects.link(cam); cam.location=(-2.55,2.15,4.35); look_at(cam,(-.42,0,3.55))

bpy.context.scene.render.engine='BLENDER_EEVEE'; bpy.context.scene.render.resolution_x=720; bpy.context.scene.render.resolution_y=720; bpy.context.scene.render.resolution_percentage=100; bpy.context.scene.render.image_settings.file_format='PNG'
renders={'forest_human_eye':'forest_camera_test/forest_human_eye.png','forest_canopy_lift':'forest_camera_test/forest_canopy_lift.png','tree_entry_continuity':'tree_camera_test/tree_entry_continuity.png','tree_returned_silhouette':'tree_camera_test/tree_returned_silhouette.png','tree_close_camera_test':'tree_close_camera_test/tree_close_camera_test.png'}
for n,rel in renders.items(): bpy.context.scene.camera=bpy.data.objects[n]; bpy.context.scene.render.filepath=os.path.join(ROOT,rel); bpy.ops.render.render(write_still=True)
for img in bpy.data.images:
    if img.source=='FILE':
        try:img.pack()
        except:pass
bpy.ops.wm.save_as_mainfile(filepath=BLEND)

bpy.ops.object.select_all(action='DESELECT')
for n in ['Bark_Growth_LOD0','Leaves','Wind_Data','Tree_Root']:
    if bpy.data.objects.get(n):bpy.data.objects[n].select_set(True)
bpy.context.view_layer.objects.active=bark
bpy.ops.export_scene.gltf(filepath=GLB,export_format='GLB',use_selection=True,export_apply=True,export_texcoords=True,export_normals=True,export_materials='EXPORT',export_image_format='AUTO')

def tris(o):return sum(len(f.vertices)-2 for f in o.data.polygons) if o and o.type=='MESH' else 0
bm=bmesh.new();bm.from_mesh(bark.data); invalid=sum(1 for e in bm.edges if len(e.link_faces)!=2)
components=0; unseen=set(bm.verts)
while unseen:
    components+=1; stack=[unseen.pop()]
    while stack:
        v=stack.pop()
        for e in v.link_edges:
            ov=e.other_vert(v)
            if ov in unseen:unseen.remove(ov);stack.append(ov)
bm.free(); leaves=bpy.data.objects.get('Leaves')
rep={'phase':'11.5.1','source':'BeyondTree_v003.blend','method':'sparse growth-path scaffold plus one controlled connected voxel skin; no post-hoc Boolean junction stack','growth_paths':{'trunk':1,'primary':10,'secondary':sum(1 for k,_,_ in paths if k=='secondary')},'triangles_total':tris(bark)+tris(leaves),'triangles_by_object':{'Bark_Growth_LOD0':tris(bark),'Leaves':tris(leaves),'Wind_Data':0},'bark_boundary_or_nonmanifold_edges':invalid,'bark_connected_components':components,'materials':['MAT_Bark','MAT_Leaves'],'material_count':2,'texture_changes':'none; v003 bark channels and leaf atlas retained; procedural bark skin received a new UV chart','glb_size_bytes':os.path.getsize(GLB),'blend_size_bytes':os.path.getsize(BLEND),'render_files':renders,'limits':['research only','no production integration','no LOD/KTX2','no Seed/Room/Light/sound changes']}
with open(REPORT,'w',encoding='utf-8') as f:json.dump(rep,f,ensure_ascii=False,indent=2)
print('PHASE1151_REPORT='+json.dumps(rep,ensure_ascii=False))
