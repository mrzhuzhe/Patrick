import numpy as np

_incenter = np.load("../outputs/incenter.npy")

_height = _incenter[:, 0]
print("max - min", _height.max() - _height.min())

print(len(np.unique(_height)))


print(_incenter[:, 0] == 14.585771)

#print(_incenter[:, 2].min())
"""
# precise 0.01 mm
if 14.58 < f.incenter[0] < 14.59:
    f.use = 1
else:
    f.use = 0
"""