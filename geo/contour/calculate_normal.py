import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from find_convexhull import fine_one_demension_convexhull

#ascii_grid = np.loadtxt("ply/rd9c37-lq-Points-1mm.asc", skiprows=1)
ascii_grid = np.loadtxt("ply/ar35-point-Points.asc", skiprows=1)

#   only need one side  for better plot
ascii_grid = ascii_grid[ascii_grid[:,0]>=0]

#ascii_grid = ascii_grid[-10:]
print("radius: ", ascii_grid[0:].max())


"""
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.scatter(ascii_grid[:,0], ascii_grid[:,1], ascii_grid[:,2])
"""

fig = plt.figure(figsize=(8, 8))
ax = fig.add_subplot()

x = ascii_grid[:, 0]
# y = 0
z = ascii_grid[:, 2]

# for better plot rotate 90 degree
ax.scatter(x, z)
ax.plot(x, z, color="green")




# this seems still need to calculate convex contour for make sure get the most out side contour
one_demension_convexhull, _min, _max = fine_one_demension_convexhull(ascii_grid)
print("_min, _max ", _min, _max)
ch_x = one_demension_convexhull[:, 0]
ch_z = one_demension_convexhull[:, 2]

# TCP length is 15mm
_TCPLengh_ = 170
 
i = 1
middlepointX = []   
middlepointZ = []   
middlepointNoralDegree = []  # 注意：此处为仰角(俯视为负数)
TCPpositionX = []
TCPpositionZ = []

# only loop points convexhull
while i<len(ch_x):
    
    _x = (ch_x[i]+ch_x[i-1])/2
    _z = (ch_z[i]+ch_z[i-1])/2

    middlepointX.append(_x)
    middlepointZ.append(_z)
    norm = np.sqrt(np.power(ch_x[i]-ch_x[i-1], 2) + np.power(ch_z[i]-ch_z[i-1], 2))

    if float(norm) == 0.0:
        norm = 1

    degree = 0
    if ch_x[i]-ch_x[i-1] == 0:
        pass
    else:
        degree = np.arctan(- (ch_x[i]-ch_x[i-1]) / (ch_z[i]-ch_z[i-1]))* 180 / np.pi

    if degree < 0:
        _TCP_X = _x - (ch_z[i]-ch_z[i-1])/ norm * _TCPLengh_
        _TCP_Z = _z +  (ch_x[i]-ch_x[i-1])/ norm * _TCPLengh_
        TCPpositionX.append(_TCP_X)
        TCPpositionZ.append(_TCP_Z)
        middlepointNoralDegree.append(degree)

        ax.text(_x, 0.1 + _z, "x:" + str(int(_x)) + " z:" +  str(int(_z)) , fontsize=12)
        ax.text(_TCP_X, _TCP_Z, "x:" + str(int(_TCP_X)) + " z:" +  str(int(_TCP_Z)) + " deg:" + str(int(degree)), fontsize=12)
        #print("TCP Norm", np.dot([_TCP_X-_x, _TCP_Z-_z], [_TCP_X-_x, _TCP_Z - _z]))    
        ax.plot([_x, _TCP_X], [_z, _TCP_Z], color="black")
    i+=1

ax.scatter(middlepointX, middlepointZ, color="red")

print("len(TCPpositionX), len(TCPpositionZ), len(middlepointNoralDegree)", len(TCPpositionX), len(TCPpositionZ), len(middlepointNoralDegree))
# absolute value for Z axie
_waypoints = np.stack([TCPpositionX, TCPpositionZ - _min, middlepointNoralDegree], axis=1)
print("_waypoints \n", _waypoints)
np.save("./ply/waypoints-ar35", _waypoints)
plt.show()