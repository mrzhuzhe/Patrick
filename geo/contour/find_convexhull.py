# 2 demensional convexhull example
# https://github.com/mrzhuzhe/vanilla/blob/master/geometry/convexhull.jsimport 
# for simplify only use 1D

import numpy as np

def fine_one_demension_convexhull(data):
    # sort by X axies
    data = sorted(data, key=lambda x: x[0])

    # only keep element only when it is maximal an minimal on Y axies 
    _res = []
    _max = _min = data[0][2]
    for i in data:
        _cur = i[2]
        if _cur > _max:
            _max = _cur
            _res.append(i)
        elif _cur < _min:
            _min = _cur
            _res.append(i)
    _res = sorted(_res, key=lambda x: x[2])
    return np.array(_res), _min, _max