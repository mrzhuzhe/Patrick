import taichi as ti
import numpy as np
import meshtaichi_patcher as Patcher

ti.init(arch=ti.gpu)
vec3f = ti.types.vector(3, ti.f32)



mesh_builder = ti.TriMesh()

mesh_builder.verts.place({'x': vec3f})

mesh_builder.faces.place({'use': ti.i32	, 'area': ti.f32, 'normal': vec3f, 'incenter': vec3f })

#mesh_builder.verts.place({'x': vec3f, 'vel': vec3f, 'cn': vec3f})
#mesh_builder.faces.place({'vel': vec3f,'area': ti.f32, 'normal': vec3f, 'momentum':vec3f, 'mean_edge_length':ti.f32, 'incenter': vec3f })
#mesh_builder.edges.place({'cotan': ti.f32, 'normal':vec3f, 'momentum':vec3f})

mesh_builder.verts.link(mesh_builder.verts)
mesh_builder.edges.link(mesh_builder.verts)
mesh_builder.verts.link(mesh_builder.edges)
mesh_builder.verts.link(mesh_builder.faces)
mesh_builder.faces.link(mesh_builder.verts)
mesh_builder.edges.link(mesh_builder.faces)
mesh_builder.faces.link(mesh_builder.edges)
mesh_builder.faces.link(mesh_builder.faces)
obj_name = "geo/meshes/RD9C37-LQ-5.obj"
#obj_name = "geo/meshes/RD9C37-LQ.obj"
#obj_name = "geo/meshes/bunny.obj"

#meta = Patcher.mesh2meta(obj_name, relations=["ev", "vv", "vf", "fv", "ef", "fe", "ve", "ff"])
meta = Patcher.mesh2meta(obj_name)

model = mesh_builder.build(meta)
nv = len(model.verts)
ne = len(model.edges)
nf = len(model.faces)
indices = ti.field(dtype=ti.u32, shape = nf * 3)

print("nf", nf)
incenter_point = ti.Vector.field(3, dtype=float, shape=nf)
incenter_Upper_point = ti.Vector.field(3, dtype=float, shape=nf)

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
        #if i %2 == 0:
        #    vertex_color[i] = vec3f(0.1, 0.1, 0.1)
        #else :
        #    vertex_color[i] = vec3f(0.9, 0.1, 0.1)
        vertex_color[i] = vec3f(0.1, 0.1, 0.1)



@ti.kernel
def fill_faces_attributes():
    for f in model.faces:
        v0 = f.verts[0]
        v1 = f.verts[1]
        v2 = f.verts[2]
        A = v1.x - v0.x
        B = v2.x - v0.x
        n = ti.math.cross(A, B)
        f.area = ti.math.length(n) * 0.5
        
        f.normal = (n / ti.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2]))
        
        """
        # hardcode a test for making normal vector outwards
        # sadly only works for convex models centered at origin
        if (ti.math.dot(n, v0.x) >= 0.0 and ti.math.dot(n, v1.x) >= 0.0 and ti.math.dot(n, v2.x) >= 0.0):
            f.normal = (n / ti.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2]))
        else:
            #f.normal = -(n / ti.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2]))
            
        """
        

        # calculate face incenter 
        # (ab.norm() * c + ac.norm() * b + bc.norm() * a ) / (ab.norm() + ac.norm() + bc.norm())
        C = v2.x - v1.x
        _Cn = C.norm()
        _Bn = B.norm()
        _An = A.norm()
        f.incenter = (_Cn * v2.x + _Bn * v1.x + _An * v0.x ) / (_Cn + _Bn + _An)

        if (ti.math.dot(n, v0.x) >= 0.0 and ti.math.dot(n, v1.x) >= 0.0 and ti.math.dot(n, v2.x) >= 0.0):
            
            f.use = 0
            
        else:
            
            #"""            
            if 14 < f.incenter[0] < 14.5:
                f.use = 1
            else:
                f.use = 0
            #"""
            f.use = 1   

fill_faces_attributes()

print(model.faces.normal.shape)
#print(model.faces.verts)

win_x = 1000
win_y = 1000

window = ti.ui.Window("circle geo", (win_x, win_y))
canvas = window.get_canvas()
canvas.set_background_color((0.5, 0.5, 0.5))
scene = ti.ui.Scene()

camera = ti.ui.make_camera()
camera.position(700, 50, 0)
camera.lookat(0, 50, 0)

#model.verts.x.to_numpy() 

print(model.verts.x.to_numpy().max())
print(model.verts.x.to_numpy().min())

#_incenter = model.faces.incenter.to_numpy()
#np.save("outputs/incenter.npy", _incenter)
#print(_incenter)

@ti.kernel
def get_incenterPoint():    
    for i in ti.ndrange(nf):
        if model.faces.use[i] == 1:
            incenter_point[i] = model.faces.incenter[i]
            incenter_Upper_point[i] = model.faces.incenter[i] + model.faces.normal[i] * 5


get_incenterPoint()



while window.running:
    ti.deactivate_all_snodes()  
    camera.track_user_inputs(window, movement_speed=0.05, hold_key=ti.ui.RMB)
 
    scene.set_camera(camera)
    scene.ambient_light((0.5, 0.5, 0.5))
    scene.point_light(pos=(0.5, 1.5, 1.5), color=(1, 1, 1))

    set_vertex_color()
    scene.mesh(model.verts.x, indices, per_vertex_color = vertex_color)
    #scene.mesh(model.verts.x, indices)  # model point seems too little
    
    #scene.particles(model.verts.x, color = (0, 1, 0), radius = 1)
    
    scene.particles(incenter_point, color = (1, 0, 0), radius = 1)

    scene.particles(incenter_Upper_point, color = (0, 0, 1), radius = 1)

    canvas.scene(scene)
    window.show()
    