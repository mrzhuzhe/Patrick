import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D


ascii_grid = np.loadtxt("ply/rd9c37-lq-Points-1mm.asc", skiprows=1)

#   only need one side  for better plot
ascii_grid = ascii_grid[ascii_grid[:,2]>=0]

#ascii_grid = ascii_grid[-10:]
"""
fig = plt.figure()
ax = fig.add_subplot("3d", projection='3d')
ax.scatter(ascii_grid[:,0], ascii_grid[:,1], ascii_grid[:,2])
"""

fig = plt.figure(figsize=(8, 8))
ax = fig.add_subplot()

x = ascii_grid[:, 0]
y = ascii_grid[:, 2]
# z = 0

# for better plot rotate 90 degree
ax.scatter(y, x)
ax.plot(y, x, color="green")



# this seems still need to calculate contour for make sure get the most out side contour
i = 1
middlepointX = []
middlepointY = []
middlepointNoral = []
while i<len(x):
    _y = (y[i]+y[i-1])/2
    _x = (x[i]+x[i-1])/2
    middlepointX.append(_x)
    middlepointY.append(_y)
    norm = np.sqrt((x[i]-x[i-1])* (x[i]-x[i-1]) + (y[i]-y[i-1]) *(y[i]-y[i-1]))

    if float(norm) == 0.0:
        norm = 1
    
    degree = 90
    if y[i]-y[i-1] == 0:
        pass
    else:
        degree = int(np.arctan(- (x[i]-x[i-1]) / (y[i]-y[i-1]))* 180 / np.pi)
        middlepointNoral.append(degree)

    ax.text(0.1 + _y, _x, degree, fontsize=12)
    ax.plot([_y, _y +  (x[i]-x[i-1])/ norm], [_x, _x - (y[i]-y[i-1])/ norm], color="black")
    i+=1

ax.scatter(middlepointY, middlepointX, color="red")

plt.show()