import taichi as ti
import numpy as np
ti.init(arch=ti.gpu)  # Alternatively, ti.init(arch=ti.cpu)

n = 128
dt = 1e-3
ball_radius = 0.1
substeps = int(1 / 60 // dt)
print(substeps)
x = ti.Vector.field(3, dtype=float, shape=n)
v = ti.Vector.field(3, dtype=float, shape=n)

@ti.kernel
def initialize_points():    
    for i in x:
        #random_offset = ti.Vector([ti.random() - 0.5, ti.random() - 0.5, ti.random() - 0.5])
        random_offset = ti.Vector([ti.random() - 0.5, ti.random() - 0.5, ti.random() - 0.5])
        random_v = ti.Vector([ti.random() - 0.5, ti.random() - 0.5, ti.random() - 0.5])
        x[i] = [
            random_offset[0], 
            random_offset[1],
            random_offset[2]
        ]
        v[i] = [
            random_v[0], 
            random_v[1],
            random_v[2]
        ]


@ti.kernel
def substep():   
    for i in ti.ndrange(n):
        for j in ti.ndrange(n):
            if i == j:
                continue                        
            offset_to_center_now = (x[i] - x[j]).norm()
            # for intersect case
            offset_delta = (x[i] - x[j]).dot(v[i] - v[j])
            if offset_to_center_now - ball_radius * 2 <=  0:
                #normal = (v[i] - v[j]).normalized()
                #v[i] -= (v[i] - v[j]).dot(normal) * normal
                if offset_delta < 0:
                    tmp = v[i]
                    v[i] = v[j]
                    v[j] = tmp
        # four conner
        for d in ti.static(range(3)):
            if x[i][d] >= 1 or x[i][d] <= -1:
                v[i][d] = -v[i][d]
        x[i] += dt * v[i]
        
window = ti.ui.Window("Taichi Cloth Simulation on GGUI", (1024, 1024),
                      vsync=True)
canvas = window.get_canvas()
canvas.set_background_color((1, 1, 1))
scene = ti.ui.Scene()
camera = ti.ui.make_camera()

initialize_points()

while window.running:

    for i in range(substeps):
        substep()

    camera.position(0.0, 0.0, 3)
    camera.lookat(0.0, 0.0, 0)
    scene.set_camera(camera)

    scene.point_light(pos=(0, 1, 2), color=(1, 1, 1))
    #scene.ambient_light((0.5, 0.5, 0.5))

    # Draw a smaller ball to avoid visual penetration
    scene.particles(x, radius=ball_radius, color=(0.5, 0.42, 0.8))

    canvas.scene(scene)
    window.show()