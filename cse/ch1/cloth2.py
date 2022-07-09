import ijcai2022nmmo
import taichi as ti
ti.init(arch=ti.gpu)  # Alternatively, ti.init(arch=ti.cpu)

n = 128
quad_size = 2.0 / n
dt = 4e-2 / n
substeps = int(1 / 60 // dt)
#substeps = 1

gravity = ti.Vector([0, -9.8, 0])
spring_Y = 3e4
dashpot_damping = 1e3
drag_damping = 1

ball_radius = 0.3
ball_center = ti.Vector.field(3, dtype=float, shape=(3, ))
ball_center[0] = [0, 0, 0]
#ball_center[1] = [-0.6, -0.5, 0]
#ball_center[2] = [0.6, -0.5, 0]
_ball_center_num_ = 1

slices = 3
x = ti.Vector.field(3, dtype=float, shape=(slices, n, n))
v = ti.Vector.field(3, dtype=float, shape=(slices, n, n))

#num_triangles = slices * (n - 1) * (n - 1) * 2
num_triangles = 2 * (n - 1) * (n - 1) * 2  * 3
face_triangles = (slices - 1) * (n - 1) * 6 * 4
indices = ti.field(int, shape=(num_triangles + face_triangles))
vertices = ti.Vector.field(3, dtype=float, shape=slices * n * n)
colors = ti.Vector.field(3, dtype=float, shape=slices * n * n)

cloth_start_point_x = 1
cloth_start_point_y = 0.6
cloth_start_point_z = 1


@ti.kernel
def initialize_mass_points():
    random_offset = ti.Vector([ti.random() - 0.5, ti.random() - 0.5])
    #random_offset = ti.Vector([0, 0])
    for z, i, j in x:
        x[z, i, j] = [
            i* quad_size - cloth_start_point_x + random_offset[0], cloth_start_point_y + quad_size * z,
            j * quad_size - cloth_start_point_z + random_offset[1]
        ]
        v[z, i, j] = [0, 0, 0]


spring_offsets = []
for z in range(-1, 2):
    for i in range(-1, 2):
        for j in range(-1, 2):
            if (z, i, j) != (0, 0, 0):
                spring_offsets.append(ti.Vector([z, i, j]))


@ti.kernel
def substep():
    for i in ti.grouped(x):
        v[i] += gravity * dt

    for i in ti.grouped(x):
        force = ti.Vector([0.0, 0.0, 0.0])
        for spring_offset in ti.static(spring_offsets):
            j = i + spring_offset
            if 0 <= j[0] < slices and  0 <= j[1] < n and 0 <= j[2] < n:
                x_ij = x[i] - x[j]
                v_ij = v[i] - v[j]
                d = x_ij.normalized()
                current_dist = x_ij.norm()
                original_dist = quad_size * float(i - j).norm()
                # Spring force
                force += -spring_Y * d * (current_dist / original_dist - 1)
                # Dashpot damping
                force += -v_ij.dot(d) * d * dashpot_damping * quad_size
        
        # four conner
        for d in ti.static(range(3)):
            if x[i][d] >= 1 or x[i][d] <= -1:
                v[i][d] = 0
        v[i] += force * dt

    for i in ti.grouped(x):
        v[i] *= ti.exp(-drag_damping * dt)
        for _ball_num in ti.static(range(_ball_center_num_)): 
            offset_to_center = x[i] - ball_center[_ball_num]
            if (offset_to_center + v[i]*dt).norm() <= ball_radius:
                normal = offset_to_center.normalized()
                v[i] -= min(v[i].dot(normal), 0) * normal
        x[i] += dt * v[i]



@ti.kernel
def update_vertices():
    for z, i, j in ti.ndrange(slices, n, n):
        vertices[z*n*n + i * n + j] = x[z, i, j]


window = ti.ui.Window("Taichi Cloth Simulation on GGUI", (1024, 1024),
                      vsync=True)
canvas = window.get_canvas()
canvas.set_background_color((1, 1, 1))
scene = ti.ui.Scene()
camera = ti.ui.make_camera()

current_t = 0
initialize_mass_points()

while window.running:
    #"""
    if current_t > 3:
        # Reset
        initialize_mass_points()
        current_t = 0

    for i in range(substeps):
        substep()
        current_t += dt
    #"""
    update_vertices()

    camera.position(0.0, 0.0, 3)
    camera.lookat(0.0, 0.0, 0)
    scene.set_camera(camera)

    scene.point_light(pos=(0, 1, 2), color=(1, 1, 1))
    scene.ambient_light((0.5, 0.5, 0.5))
    
    """
    scene.mesh(vertices,
            indices=indices,
            per_vertex_color=colors,
            two_sided=True
            )
    """

    scene.particles(vertices, radius=0.005, color=(0.5, 0.42, 0.8))

    # Draw a smaller ball to avoid visual penetration
    scene.particles(ball_center, radius=ball_radius * 0.95, color=(0.5, 0.42, 0.8))

    canvas.scene(scene)
    window.show()

