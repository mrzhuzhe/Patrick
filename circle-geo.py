import taichi as ti
import meshtaichi_patcher as Patcher

ti.init(arch=ti.gpu)
vec3f = ti.types.vector(3, ti.f32)

mesh_builder =ti.TriMesh()
mesh_builder.verts.place({'x': vec3f, 'vel': vec3f, 'cn': vec3f})
mesh_builder.faces.place({'vel': vec3f,'area': ti.f32, 'normal': vec3f, 'momentum':vec3f, 'mean_edge_length':ti.f32})
mesh_builder.edges.place({'cotan': ti.f32, 'normal':vec3f, 'momentum':vec3f})

mesh_builder.verts.link(mesh_builder.verts)
mesh_builder.edges.link(mesh_builder.verts)
mesh_builder.verts.link(mesh_builder.edges)
mesh_builder.verts.link(mesh_builder.faces)
mesh_builder.faces.link(mesh_builder.verts)
mesh_builder.edges.link(mesh_builder.faces)
mesh_builder.faces.link(mesh_builder.edges)
mesh_builder.faces.link(mesh_builder.faces)
obj_name = "geo/meshes/RD9C37-LQ.obj"
#obj_name = "geo/meshes/bunny.obj"

meta = Patcher.mesh2meta(obj_name, relations=["ev", "vv", "vf", "fv", "ef", "fe", "ve", "ff"])

model = mesh_builder.build(meta)
nv = len(model.verts)
ne = len(model.edges)
nf = len(model.faces)
indices = ti.field(dtype=ti.u32, shape = nf * 3)

@ti.kernel
def get_indices():
    for f in model.faces:
        for j in ti.static(range(3)):
            indices[f.id * 3 + j] = f.verts[j].id
get_indices()

vertex_color = ti.Vector.field(n=3, dtype=ti.f32, shape=nv)
@ti.kernel
def set_vertex_color():
    for i in range (nv):
        #vertex_color[i] = ()
        if i % 2 == 0:
            vertex_color[i] = (0.22, 0.72, 0.52)
        else:
            vertex_color[i] = (1, 0.334, 0.52)


win_x = 1000
win_y = 1000

window = ti.ui.Window("circle geo", (win_x, win_y))
canvas = window.get_canvas()
scene = ti.ui.Scene()

camera = ti.ui.make_camera()
camera.position(700, 50, 0)
camera.lookat(0, 50, 0)
#amera.up(0, 1, 0)
#camera.fov(45)

#model.verts.x.to_numpy() 

while True:    
    ti.deactivate_all_snodes()
  
    camera.track_user_inputs(window, movement_speed=0.05, hold_key=ti.ui.RMB)
    #scene.point_light(pos=(0, 1, 2), color=(1, 1, 1))
    #scene.ambient_light((0.5, 0.5, 0.5))
 
    scene.set_camera(camera)
    scene.ambient_light((0.5, 0.5, 0.5))
    scene.point_light(pos=(0.5, 1.5, 1.5), color=(1, 1, 1))
    scene.point_light(pos=(0.5, 1.5, -1.5), color=(1, 1, 1))
    scene.point_light(pos=(0.5, 1.5, -0.5), color=(1, 1, 1))
    scene.point_light(pos=(0.5, 1.5, 0.5), color=(1, 1, 1))
    set_vertex_color()
    scene.mesh(model.verts.x, indices, per_vertex_color = vertex_color)
    
    canvas.scene(scene)
    window.show()
    