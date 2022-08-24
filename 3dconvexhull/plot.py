#! /usr/bin/python

import numpy as np
#from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt
import hull

fig = plt.figure() # For plotting
ax = fig.add_subplot(111, projection='3d')

for point in hull.points:
	ax.scatter(point.x, point.y, point.z, c='g', marker='x')

#for point in hull.final_vertices:
#	ax.scatter(point.x, point.y, point.z, c='b', marker='o')

i = 1 
_res = hull.final_faces
while i < len(_res)-1:
	_prepoint = _res[i-1]
	_curPoint = _res[i]
	_aftPoint = _res[i + 1]
	ax.plot([_prepoint.x, _curPoint.x, _aftPoint.x, _prepoint.x,], 
	[_prepoint.y,_curPoint.y, _aftPoint.y, _prepoint.y], 
	[_prepoint.z, _curPoint.z, _aftPoint.z, _prepoint.z], c='b', marker='o')
	i += 3

ax.set_xlabel('X Label')
ax.set_ylabel('Y Label')
ax.set_zlabel('Z Label')

#plt.savefig('image.jpg', bbox_inches='tight')
plt.show()
